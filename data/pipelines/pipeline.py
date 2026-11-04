"""Business performance pipeline — Prefect flows and tasks (Part 2 entry point).

Run it from the command line::

    python data/pipelines/pipeline.py
    python data/pipelines/pipeline.py --month 2026-10-01   # targeted re-run
    python data/pipelines/pipeline.py --dry-run            # extract+transform only

Resilience patterns implemented here (see PIPELINE_DESIGN.md §7):

* **Retries on external I/O** — every task that talks to PostgreSQL declares
  ``retries`` + ``retry_delay_seconds`` so transient blips are absorbed.
* **Partial-failure tolerance** — optional tasks (notification, CSV export) are
  invoked with ``return_state=True``; their failure is logged and the flow
  continues.
* **Result caching** — ``transform_business_kpis`` is cached by processing
  window for one hour so a repeat run inside that window does not recompute.
* **Idempotent load** — upsert on ``(clinic_id, month_start)``.
* **Execution log** — every run writes >= 5 metadata fields to
  ``reporting.pipeline_runs`` and to a JSON artefact in ``data/eval/``.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Allow `python data/pipelines/pipeline.py` (script mode) to import the
# `data.*` and `services.*` packages from the repository root.
if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import asyncio  # noqa: E402
import logging  # noqa: E402
import uuid  # noqa: E402
from datetime import date, datetime, timezone  # noqa: E402
from typing import Any  # noqa: E402

from prefect import flow, task  # noqa: E402
from prefect.logging import get_run_logger  # noqa: E402

from data.pipelines.config import (  # noqa: E402
    DB_RETRIES,
    DB_RETRY_DELAY_SECONDS,
    INITIAL_LOOKBACK_DAYS,
    PIPELINE_VERSION,
    get_settings,
)
from data.pipelines.extract import extract_telemetry_events as _extract_events
from data.pipelines.load import (  # noqa: E402
    finish_pipeline_run as _finish_run,
    load_monthly_clinic_supply_performance as _load_rows,
    save_eval_artifact as _save_eval_artifact,
    start_pipeline_run as _start_run,
)
from data.pipelines.queries import (  # noqa: E402
    compute_window,
    get_last_successful_watermark,
    month_window,
)
from data.pipelines.transform import transform_business_kpis  # noqa: E402
from data.process import kpi_aggregation as kpi  # noqa: E402

logger = logging.getLogger(__name__)

FLOW_NAME = "business-performance-etl"


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------
@task(name="record-pipeline-run-start", retries=2, retry_delay_seconds=2)
async def record_pipeline_run_start(
    run_id: str,
    window_from: datetime,
    window_to: datetime,
    started_at: datetime,
    dsn: str | None = None,
) -> None:
    """Open the audit trail before any data is read.

    Retried because it writes to PostgreSQL: a missed run record would hide the
    execution from ``GET /reporting/pipeline-runs/latest``.
    """
    await _start_run(
        run_id=run_id,
        window_from=window_from,
        window_to=window_to,
        pipeline_version=PIPELINE_VERSION,
        started_at=started_at,
        dsn=dsn,
    )


@task(name="extract-telemetry-events", retries=DB_RETRIES, retry_delay_seconds=DB_RETRY_DELAY_SECONDS)
async def extract_telemetry_events(
    watermark_from: datetime,
    watermark_to: datetime,
    dsn: str | None = None,
) -> list[dict[str, Any]]:
    """Read source events for the window (read-only on ``telemetry_events``).

    3 retries / 5 s backoff absorb transient PostgreSQL connection resets
    without paging on-call, per the ticket's resilience requirement.
    """
    return await _extract_events(watermark_from, watermark_to, dsn=dsn)


@task(name="load-monthly-clinic-supply-performance", retries=DB_RETRIES, retry_delay_seconds=DB_RETRY_DELAY_SECONDS)
async def load_monthly_clinic_supply_performance(
    rows: list[dict[str, Any]],
    dsn: str | None = None,
) -> int:
    """Upsert KPI rows into ``reporting.monthly_clinic_supply_performance``.

    Retried on transient DB errors; safe to retry because the upsert is
    idempotent on the business grain.
    """
    return await _load_rows(rows, dsn=dsn)


@task(name="notify-ops", retries=2, retry_delay_seconds=5)
async def notify_ops_optional(summary: dict[str, Any]) -> dict[str, Any]:
    """Optional notification hook (webhook). Failure must not stop the flow.

    Invoked with ``return_state=True`` by the flow: when no webhook is
    configured or the call fails, the flow logs a warning and continues.
    """
    import os

    import httpx

    webhook_url = os.getenv("PIPELINE_NOTIFY_WEBHOOK_URL")
    if not webhook_url:
        raise RuntimeError("PIPELINE_NOTIFY_WEBHOOK_URL not configured")

    async with httpx.AsyncClient(timeout=5) as client:
        response = await client.post(webhook_url, json=summary)
        response.raise_for_status()
    return {"delivered": True, "status_code": response.status_code}


@task(name="export-kpi-csv")
async def export_csv_optional(rows: list[dict[str, Any]], run_id: str) -> str | None:
    """Optional CSV export for the board pack. Failure is non-fatal."""
    import csv

    from data.pipelines.config import EVAL_DIR

    if not rows:
        return None

    EVAL_DIR.mkdir(parents=True, exist_ok=True)
    target = EVAL_DIR / f"monthly_clinic_supply_performance_{run_id}.csv"
    fieldnames = list(rows[0].keys())
    with target.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    return str(target)


@task(name="record-pipeline-run-finish", retries=2, retry_delay_seconds=2)
async def record_pipeline_run_finish(
    run_id: str,
    status: str,
    rows_extracted: int,
    rows_loaded: int,
    error_summary: str | None,
    finished_at: datetime,
    dsn: str | None = None,
) -> None:
    """Close the run record with its final status and counts."""
    await _finish_run(
        run_id=run_id,
        status=status,
        rows_extracted=rows_extracted,
        rows_loaded=rows_loaded,
        error_summary=error_summary,
        finished_at=finished_at,
        dsn=dsn,
    )


# ---------------------------------------------------------------------------
# Flows
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Sub-flows — ETL phases (Part 3 requirement: each phase is an independent
# sub-flow with explicit I/O, testable and reusable).
# ---------------------------------------------------------------------------
@flow(name="extract-telemetry-subflow", log_prints=True)
async def extract_telemetry_subflow(
    watermark_from: datetime,
    watermark_to: datetime,
    dsn: str | None = None,
) -> list[dict[str, Any]]:
    """Sub-flow: extract source telemetry events for the window (read-only)."""
    return await extract_telemetry_events(watermark_from, watermark_to, dsn=dsn)


@flow(name="transform-business-kpis-subflow", log_prints=True)
async def transform_business_kpis_subflow(
    rows: list[dict[str, Any]],
    window_from: datetime,
    window_to: datetime,
) -> list[dict[str, Any]]:
    """Sub-flow: transform extracted events into clinic-month KPI rows.

    The heavy lifting is delegated to data/process/kpi_aggregation.py
    which is a pure module with no Prefect dependency — this sub-flow only
    wraps the task so the orchestration graph shows an explicit stage.
    """
    return transform_business_kpis(rows, window_from, window_to)


@flow(name="load-monthly-clinic-supply-subflow", log_prints=True)
async def load_monthly_clinic_supply_subflow(
    rows: list[dict[str, Any]],
    dsn: str | None = None,
) -> int:
    """Sub-flow: idempotent upsert of KPI rows into the reporting table."""
    return await load_monthly_clinic_supply_performance(rows, dsn=dsn)


@flow(name="resolve-run-window", log_prints=True)
async def resolve_run_window_flow(
    run_id: str,
    month_start: date | str | None,
    started_at: datetime,
) -> tuple[date | None, datetime, datetime]:
    """Sub-flow: resolve the processing window.

    Either the requested calendar month (``month_start``) or the incremental
    window resumed from the last successful watermark (with a short reprocess
    lookback). Isolated as a sub-flow so the window logic is observable in the
    Prefect run graph and reusable by the backfill flow.
    """
    target_month = _coerce_month(month_start)
    if target_month is not None:
        window_from, window_to = month_window(target_month)
    else:
        settings = get_settings()
        watermark = await get_last_successful_watermark()
        window_from, window_to = compute_window(
            watermark,
            started_at,
            initial_lookback_days=INITIAL_LOOKBACK_DAYS,
            reprocess_window_days=settings.reprocess_window_days,
        )
    return target_month, window_from, window_to


@flow(name="emit-optional-artifacts", log_prints=True)
async def emit_optional_artifacts_flow(
    kpi_rows: list[dict[str, Any]],
    run_id: str,
    rows_extracted: int,
    rows_loaded: int,
    window_from: datetime,
    window_to: datetime,
) -> list[str]:
    """Sub-flow: run the non-critical side effects (CSV export + webhook).

    Both optional steps are invoked with ``return_state=True``: if one fails
    (e.g. no webhook configured) the failure is logged and collected instead of
    aborting the run. The caller folds the returned failures into the
    ``partial`` run status. This is the partial-failure tolerance pattern.
    """
    run_logger = get_run_logger()
    failures: list[str] = []

    export_state = await export_csv_optional(kpi_rows, run_id, return_state=True)
    if export_state.is_failed():
        failures.append(
            f"export_csv_optional: {export_state.result(raise_on_failure=False)}"
        )
        run_logger.warning("CSV export skipped — non-critical step failed")

    summary = {
        "run_id": run_id,
        "pipeline_version": PIPELINE_VERSION,
        "window": {"from": window_from.isoformat(), "to": window_to.isoformat()},
        "rows_extracted": rows_extracted,
        "rows_loaded": rows_loaded,
        "totals_by_currency": kpi.summarise(kpi_rows),
    }
    notify_state = await notify_ops_optional(summary, return_state=True)
    if notify_state.is_failed():
        failures.append("notify_ops_optional: webhook unavailable")
        run_logger.warning("Ops notification skipped — non-critical step failed")

    return failures



@flow(name=FLOW_NAME, log_prints=True)
async def business_performance_etl_flow(
    run_id: str | None = None,
    month_start: date | str | None = None,
    skip_write: bool = False,
) -> dict[str, Any]:
    """Monthly clinic supply performance ETL: extract → transform → load.

    Args:
        run_id: Optional caller-supplied id (the HTTP trigger passes one so it
            can return it as ``flow_run_id``).
        month_start: When given, reprocess exactly that calendar month
            (backfill). Otherwise the window resumes from the last successful
            watermark.
        skip_write: Extract + transform only; nothing is written to
            ``reporting.*``. Useful for a dry run.

    Returns:
        Run summary: run id, status, window, row counts, per-currency totals.
    """
    run_logger = get_run_logger()
    settings = get_settings()

    resolved_run_id = run_id or str(uuid.uuid4())
    started_at = datetime.now(timezone.utc)

    # Delegate window resolution to a sub-flow (explicit graph node).
    target_month, window_from, window_to = await resolve_run_window_flow(
        resolved_run_id, month_start, started_at
    )

    run_logger.info(
        "Run %s | version=%s | window=[%s, %s) | month=%s | skip_write=%s",
        resolved_run_id,
        PIPELINE_VERSION,
        window_from.isoformat(),
        window_to.isoformat(),
        target_month.isoformat() if target_month else "auto",
        skip_write,
    )

    rows_extracted = 0
    rows_loaded = 0
    optional_failures: list[str] = []

    if not skip_write:
        await record_pipeline_run_start(
            run_id=resolved_run_id,
            window_from=window_from,
            window_to=window_to,
            started_at=started_at,
        )

    try:
        # --- EXTRACT -----------------------------------------------------
        # --- EXTRACT SUB-FLOW ------------------------------------------------
        events = await extract_telemetry_subflow(window_from, window_to)
        rows_extracted = len(events)
        run_logger.info("Extracted %d source event(s)", rows_extracted)

        # --- TRANSFORM SUB-FLOW (cached for 1h per window) ---------------
        kpi_rows = await transform_business_kpis_subflow(events, window_from, window_to)
        run_logger.info("Produced %d clinic-month row(s)", len(kpi_rows))

        # --- LOAD SUB-FLOW (idempotent upsert) ---------------------------
        if skip_write:
            run_logger.warning("skip_write=True — load stage skipped (dry run)")
        else:
            rows_loaded = await load_monthly_clinic_supply_subflow(kpi_rows)

        # --- OPTIONAL ARTIFACTS (sub-flow): CSV export + webhook ----------
        # Partial-failure tolerance: failures here are collected, not raised.
        optional_failures = await emit_optional_artifacts_flow(
            kpi_rows,
            resolved_run_id,
            rows_extracted,
            rows_loaded,
            window_from,
            window_to,
        )

        # A run that wrote its rows but lost a non-critical step is "partial":
        # the data is usable, but the run deserves an operator's attention.
        status = "partial" if optional_failures else "success"
        error_summary = "; ".join(optional_failures) or None

    except Exception as exc:  # noqa: BLE001 — critical failure boundary
        finished_at = datetime.now(timezone.utc)
        error_summary = f"{type(exc).__name__}: {exc}"
        run_logger.error("Pipeline failed: %s", error_summary)

        if not skip_write:
            # Watermark does NOT advance: no 'success' row is written, so the
            # next run re-processes the same window idempotently.
            await record_pipeline_run_finish(
                run_id=resolved_run_id,
                status="failed",
                rows_extracted=rows_extracted,
                rows_loaded=rows_loaded,
                error_summary=error_summary,
                finished_at=finished_at,
            )
        raise

    finished_at = datetime.now(timezone.utc)
    result = {
        "run_id": resolved_run_id,
        "status": status,
        "started_at": started_at.isoformat(),
        "finished_at": finished_at.isoformat(),
        "watermark_from": window_from.isoformat(),
        "watermark_to": window_to.isoformat(),
        "rows_extracted": rows_extracted,
        "rows_loaded": rows_loaded,
        "error_summary": error_summary,
        "pipeline_version": PIPELINE_VERSION,
        "totals_by_currency": kpi.summarise(kpi_rows),
    }

    if not skip_write:
        await record_pipeline_run_finish(
            run_id=resolved_run_id,
            status=status,
            rows_extracted=rows_extracted,
            rows_loaded=rows_loaded,
            error_summary=error_summary,
            finished_at=finished_at,
        )
        await _save_eval_artifact(result)

    run_logger.info("Run %s finished with status=%s (%d rows)", resolved_run_id, status, rows_loaded)
    return result


@flow(name="business-performance-backfill", log_prints=True)
async def backfill_monthly_clinic_supply_performance_flow(
    target_month: date | str,
    run_id: str | None = None,
) -> dict[str, Any]:
    """Re-run the ETL for one historical month (design §7.4).

    All idempotency guarantees of the main flow apply, so backfills never
    duplicate rows.
    """
    month = _coerce_month(target_month)
    if month is None:
        raise ValueError("target_month is required for a backfill run")
    return await business_performance_etl_flow(run_id=run_id, month_start=month)


# ---------------------------------------------------------------------------
# Helpers / CLI
# ---------------------------------------------------------------------------
def _coerce_month(value: date | str | None) -> date | None:
    """Normalise a month selector to the first day of that month."""
    if value is None:
        return None
    if isinstance(value, datetime):
        value = value.date()
    if isinstance(value, str):
        # Support "YYYY-MM" and "YYYY-MM-DD" selectors.
        parts = value[:10].split("-")
        if len(parts) == 2:
            value = date(int(parts[0]), int(parts[1]), 1)
        else:
            value = date.fromisoformat(value[:10])
    return date(value.year, value.month, 1)


def trigger_run(month_start: date | str | None = None) -> str:
    """Run the pipeline synchronously and return the pipeline run id."""
    result = asyncio.run(business_performance_etl_flow(month_start=month_start))
    return str(result["run_id"])


def parse_args(argv: list[str] | None = None) -> Any:
    import argparse

    parser = argparse.ArgumentParser(
        description="HealthCore business performance pipeline (monthly clinic supply KPIs).",
    )
    parser.add_argument(
        "--month",
        help="Reprocess a single calendar month (YYYY-MM or YYYY-MM-DD). "
        "Omit to resume from the last successful watermark.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Extract and transform only; write nothing to the reporting schema.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    """CLI entry point: ``python data/pipelines/pipeline.py``."""
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    args = parse_args(argv)

    result = asyncio.run(business_performance_etl_flow(month_start=args.month, skip_write=args.dry_run))

    print(
        f"\nstatus={result['status']} run_id={result['run_id']} "
        f"extracted={result['rows_extracted']} loaded={result['rows_loaded']} "
        f"window=[{result['watermark_from']}, {result['watermark_to']})"
    )
    if result["error_summary"]:
        print(f"error_summary={result['error_summary']}")

    return 0 if result["status"] in {"success", "partial"} else 1


if __name__ == "__main__":
    raise SystemExit(main())
