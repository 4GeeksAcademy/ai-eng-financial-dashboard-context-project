"""Read-only queries over the reporting schema.

Used by ``services/reporting`` to expose KPI rows and run metadata, and by the
pipeline itself to resolve its watermark before extracting.

All statements are ``SELECT``s over ``reporting.*``; nothing here writes.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any

from data.pipelines.config import REPROCESS_WINDOW_DAYS, RUNS_TABLE_FQN, TARGET_TABLE_FQN
from data.pipelines.db import acquire_connection

_LATEST_RUN_SQL = f"""
    SELECT run_id, status, watermark_from, watermark_to, rows_extracted,
           rows_loaded, error_summary, pipeline_version, started_at, finished_at
      FROM {RUNS_TABLE_FQN}
     ORDER BY started_at DESC
     LIMIT 1
"""

_LAST_SUCCESSFUL_WATERMARK_SQL = f"""
    SELECT watermark_to
      FROM {RUNS_TABLE_FQN}
     WHERE status = 'success'
     ORDER BY watermark_to DESC
     LIMIT 1
"""

_KPI_SQL = f"""
    SELECT clinic_id, country, month_start, total_supply_cost,
           supply_consumption_count, critical_stockout_count,
           expiry_risk_count, currency, computed_at
      FROM {TARGET_TABLE_FQN}
     WHERE month_start = $1
     ORDER BY country ASC, clinic_id ASC
"""

_LATEST_MONTH_SQL = f"""
    SELECT MAX(month_start) AS month_start FROM {TARGET_TABLE_FQN}
"""


def _serialize(value: Any) -> Any:
    """Make datetimes JSON-ready (UTC, ``Z`` suffix)."""
    if isinstance(value, datetime):
        return value.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    if isinstance(value, date):
        return value.isoformat()
    return value


async def get_latest_pipeline_run(dsn: str | None = None) -> dict[str, Any] | None:
    """Return metadata of the most recent run, or None when none exists."""
    async with acquire_connection(dsn) as conn:
        row = await conn.fetchrow(_LATEST_RUN_SQL)

    if row is None:
        return None

    record = dict(row)
    record["run_id"] = str(record["run_id"])
    for field in ("started_at", "finished_at", "watermark_from", "watermark_to"):
        record[field] = _serialize(record.get(field))
    return record


async def get_last_successful_watermark(dsn: str | None = None) -> datetime | None:
    """Return the watermark of the last successful run.

    The watermark only advances on ``status = 'success'`` (design §5 invariant
    #2), so a failed run is automatically reprocessed next time.
    """
    async with acquire_connection(dsn) as conn:
        return await conn.fetchval(_LAST_SUCCESSFUL_WATERMARK_SQL)


async def get_monthly_clinic_supply_performance(
    month_start: date | None = None,
    dsn: str | None = None,
) -> tuple[date | None, list[dict[str, Any]]]:
    """Return KPI rows for one month (defaults to the most recent month).

    Returns:
        ``(month_start, rows)`` — ``month_start`` is None when the table is empty.
    """
    async with acquire_connection(dsn) as conn:
        if month_start is None:
            target_month = await conn.fetchval(_LATEST_MONTH_SQL)
            if target_month is None:
                return None, []
        else:
            target_month = month_start

        rows = await conn.fetch(_KPI_SQL, target_month)

    serialized: list[dict[str, Any]] = []
    for row in rows:
        record = dict(row)
        record["month_start"] = _serialize(record["month_start"])
        record["computed_at"] = _serialize(record["computed_at"])
        record["total_supply_cost"] = float(record["total_supply_cost"])
        serialized.append(record)

    return target_month, serialized


def compute_window(
    last_watermark: datetime | None,
    now: datetime,
    *,
    initial_lookback_days: int,
    reprocess_window_days: int = REPROCESS_WINDOW_DAYS,
) -> tuple[datetime, datetime]:
    """Compute the ``[from, to)`` window for a run.

    Rules from PIPELINE_DESIGN.md §4:
      * First ever run (no successful watermark): look back a fixed number of
        days so a fresh deployment still backfills recent history.
      * Subsequent runs: resume from the last successful watermark, stepped
        back by the safety window so late-arriving events are re-aggregated.
        Because the load is an upsert, re-reading overlapping days is harmless.
    """
    window_to = now.astimezone(timezone.utc).replace(microsecond=0)

    if last_watermark is None:
        window_from = window_to - timedelta(days=initial_lookback_days)
    else:
        window_from = (
            last_watermark.astimezone(timezone.utc).replace(microsecond=0)
            - timedelta(days=reprocess_window_days)
        )

    return window_from, window_to


def month_window(first_day: date) -> tuple[datetime, datetime]:
    """Return the ``[start, end)`` UTC datetimes of a calendar month."""
    start = datetime(first_day.year, first_day.month, 1, tzinfo=timezone.utc)
    if first_day.month == 12:
        following = datetime(first_day.year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        following = datetime(first_day.year, first_day.month + 1, 1, tzinfo=timezone.utc)
    return start, following
