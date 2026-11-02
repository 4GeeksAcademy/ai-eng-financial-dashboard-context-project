"""Load stage — idempotent upsert into the reporting destination table.

Writes go **only** to ``reporting.monthly_clinic_supply_performance``. The source
table ``telemetry_events`` is never written by this pipeline.

Idempotency strategy (PIPELINE_DESIGN.md §4–§5): every row is upserted on the
business grain ``(clinic_id, month_start)``, backed by the UNIQUE constraint
created in migration 002. Re-running the pipeline for the same clinic-month
replaces the existing values instead of appending duplicates.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Sequence

from data.pipelines.config import EVAL_DIR, TARGET_TABLE_FQN
from data.pipelines.db import acquire_connection

logger = logging.getLogger(__name__)

_UPSERT_SQL = f"""
    INSERT INTO {TARGET_TABLE_FQN} (
        clinic_id,
        country,
        month_start,
        total_supply_cost,
        supply_consumption_count,
        critical_stockout_count,
        expiry_risk_count,
        currency,
        computed_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (clinic_id, month_start) DO UPDATE SET
        country                   = EXCLUDED.country,
        total_supply_cost         = EXCLUDED.total_supply_cost,
        supply_consumption_count  = EXCLUDED.supply_consumption_count,
        critical_stockout_count   = EXCLUDED.critical_stockout_count,
        expiry_risk_count         = EXCLUDED.expiry_risk_count,
        currency                  = EXCLUDED.currency,
        computed_at               = EXCLUDED.computed_at
"""

_RUN_INSERT_SQL = """
    INSERT INTO reporting.pipeline_runs (
        run_id,
        status,
        watermark_from,
        watermark_to,
        rows_extracted,
        rows_loaded,
        error_summary,
        pipeline_version,
        started_at
    )
    VALUES ($1::uuid, 'running', $2, $3, 0, 0, NULL, $4, $5)
"""

_RUN_FINISH_SQL = """
    UPDATE reporting.pipeline_runs
       SET status         = $2,
           rows_extracted = $3,
           rows_loaded    = $4,
           error_summary  = $5,
           finished_at    = $6
     WHERE run_id = $1::uuid
"""


def _to_date(value: Any) -> Any:
    """Convert an ISO ``YYYY-MM-DD`` string to ``datetime.date`` for asyncpg."""
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, str):
        return datetime.fromisoformat(value[:10]).date()
    return value


async def load_monthly_clinic_supply_performance(
    rows: Sequence[dict[str, Any]],
    dsn: str | None = None,
) -> int:
    """Upsert KPI rows into the reporting table inside one transaction.

    Both statements of a single row (and all rows of the batch) run in one
    transaction: a crash either leaves the table untouched or fully updated,
    never half-written. Combined with ``ON CONFLICT DO UPDATE`` this makes the
    load idempotent across retries.

    Args:
        rows: KPI rows produced by the transform stage.
        dsn: Optional database DSN override.

    Returns:
        Number of rows upserted.
    """
    if not rows:
        logger.info("Load skipped: no rows to upsert")
        return 0

    computed_at = datetime.now(timezone.utc)
    payload = [
        (
            row["clinic_id"],
            row["country"],
            _to_date(row["month_start"]),
            float(row["total_supply_cost"]),
            int(row["supply_consumption_count"]),
            int(row["critical_stockout_count"]),
            int(row["expiry_risk_count"]),
            row["currency"],
            computed_at,
        )
        for row in rows
    ]

    async with acquire_connection(dsn) as conn:
        async with conn.transaction():
            await conn.executemany(_UPSERT_SQL, payload)

    logger.info("Upserted %d row(s) into %s", len(payload), TARGET_TABLE_FQN)
    return len(payload)


# ---------------------------------------------------------------------------
# Execution log (reporting.pipeline_runs)
# ---------------------------------------------------------------------------
async def start_pipeline_run(
    run_id: str,
    window_from: datetime,
    window_to: datetime,
    pipeline_version: str,
    started_at: datetime,
    dsn: str | None = None,
) -> None:
    """Insert the ``running`` record that opens the run's audit trail."""
    async with acquire_connection(dsn) as conn:
        await conn.execute(
            _RUN_INSERT_SQL, run_id, window_from, window_to, pipeline_version, started_at
        )


async def finish_pipeline_run(
    run_id: str,
    status: str,
    rows_extracted: int,
    rows_loaded: int,
    error_summary: str | None,
    finished_at: datetime,
    dsn: str | None = None,
) -> None:
    """Close the run record with its final status, counts and error summary.

    Status is one of ``success`` / ``failed`` / ``partial``. Only ``success``
    advances the watermark used by the next run.
    """
    async with acquire_connection(dsn) as conn:
        await conn.execute(
            _RUN_FINISH_SQL,
            run_id,
            status,
            rows_extracted,
            rows_loaded,
            error_summary,
            finished_at,
        )


async def save_eval_artifact(payload: dict[str, Any]) -> Path:
    """Persist a structured run summary to ``data/eval/``.

    Complements ``reporting.pipeline_runs`` with the validation counters and
    per-currency totals, so the pipeline's output can be reviewed without a
    database connection.
    """
    EVAL_DIR.mkdir(parents=True, exist_ok=True)
    run_id = str(payload.get("run_id", "unknown"))
    target = EVAL_DIR / f"pipeline_run_{run_id}.json"
    target.write_text(json.dumps(payload, indent=2, default=str) + "\n", encoding="utf-8")
    return target
