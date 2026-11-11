"""Transform stage — aggregate telemetry events into business KPI rows.

The heavy lifting lives in the pure, dependency-free module
``data/process/kpi_aggregation.py`` so it can be unit-tested and reused without
Prefect. This module wraps it in a Prefect task that adds the
``cache_key_fn`` + ``cache_expiration`` resilience pattern: reprocessing the
same window within the TTL reuses the previous result instead of recomputing.

Side artefact: the extracted window is written to ``data/raw/`` so any KPI row
can be traced back to the exact source events that produced it.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from prefect import task

from data.pipelines.config import RAW_DIR, TRANSFORM_CACHE_TTL_HOURS, WRITE_RAW_SNAPSHOT
from data.process import kpi_aggregation as kpi

logger = logging.getLogger(__name__)


def transform_cache_key(_ctx: Any, parameters: dict[str, Any]) -> str:
    """Derive the cache key from the calendar month of the window.

    The aggregation result for a window depends only on which calendar months
    the window touches, not on the exact second it was run. Keying on the month
    range makes a re-run minutes later (same TTL hour) reuse the cache, which
    implements the ticket rule *"if a task already ran successfully in the last
    hour, do not repeat it"* — the wall-clock ``window_to`` changes every run,
    so it must not be part of the key.
    """
    window_from: datetime = parameters["window_from"]
    window_to: datetime = parameters["window_to"]
    months = f"{window_from.year:04d}-{window_from.month:02d}" + (
        "+"
        f"{window_to.year:04d}-{window_to.month:02d}"
        if (window_to.year, window_to.month)
        != (window_from.year, window_from.month)
        else ""
    )
    return f"kpi-transform:{months}"


@task(
    name="transform-business-kpis",
    cache_key_fn=transform_cache_key,
    # Expensive aggregation -> 1h result cache (PIPELINE_DESIGN.md §7).
    cache_expiration=timedelta(hours=TRANSFORM_CACHE_TTL_HOURS),
)
def transform_business_kpis(
    rows: list[dict[str, Any]],
    window_from: datetime,
    window_to: datetime,
) -> list[dict[str, Any]]:
    """Group source events by ``(clinic_id, month_start)`` and compute KPIs.

    This is a pure computation over already-extracted rows — no external
    services involved — which is why it needs no retries but does need caching.

    Args:
        rows: Events returned by ``extract_telemetry_events``.
        window_from: Inclusive window start (also part of the cache key).
        window_to: Exclusive window end (also part of the cache key).

    Returns:
        KPI rows ordered by ``(month_start, clinic_id)``.
    """
    result = kpi.aggregate_monthly_kpis(rows)

    if WRITE_RAW_SNAPSHOT:
        write_raw_snapshot(rows, window_from, window_to)

    logger.info(
        "Transform: %d event(s) -> %d clinic-month row(s) | %s",
        len(rows),
        len(result["rows"]),
        result["stats"],
    )
    return result["rows"]


def write_raw_snapshot(
    rows: list[dict[str, Any]],
    window_from: datetime,
    window_to: datetime,
) -> Path:
    """Persist the extracted window to ``data/raw/`` as JSONL (audit input)."""
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    snapshot = RAW_DIR / (
        f"telemetry_events_{window_from:%Y%m%dT%H%M%S}_{window_to:%Y%m%dT%H%M%S}.jsonl"
    )
    if snapshot.exists():
        return snapshot

    with snapshot.open("w", encoding="utf-8") as handle:
        for row in rows:
            payload = {
                "id": str(row.get("id") or ""),
                "timestamp": row.get("timestamp"),
                "event_type": row.get("event_type"),
                "value": row.get("value"),
                "tags": row.get("tags"),
            }
            handle.write(json.dumps(payload, default=str) + "\n")

    logger.info("Extract snapshot written: %s", snapshot)
    return snapshot
