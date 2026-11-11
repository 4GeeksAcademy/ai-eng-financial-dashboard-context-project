"""
Telemetry operational report endpoint.

Exposes ``GET /telemetry/report`` which serves the metrics computed by the
analysis pipeline in ``app.analysis`` as a single JSON document, ready to be
consumed by any technical dashboard or internal monitoring tool.

Separation of concerns (non-negotiable):

- All Pandas/latency analysis lives in ``app.analysis`` — never inside this
  endpoint handler.
- The endpoint only resolves the default date window, computes the cache key,
  calls the metric functions once, and serves the result.
- The result is cached in memory for 60 seconds indexed by the normalized
  period string; on a cache hit the pipeline is not re-executed.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Query

from app import analysis
from app.core.cache import cache_get, cache_set

logger = logging.getLogger("api.telemetry_report")

router = APIRouter()

CACHE_TTL_SECONDS = 60
DEFAULT_WINDOW_DAYS = 7


def _resolve_period(
    start_date: datetime | None,
    end_date: datetime | None,
) -> tuple[datetime, datetime]:
    """Resolve the analysis window with defaults.

    Defaults to the last ``DEFAULT_WINDOW_DAYS`` days up to now (UTC).
    Independence note: the endpoint owns the default window; the metric
    functions only receive the resolved boundaries and apply them once in
    SQL — they never re-derive a "last 7 days" filter in Pandas.
    """
    now = datetime.now(timezone.utc)
    end = end_date or now
    start = start_date or (end - timedelta(days=DEFAULT_WINDOW_DAYS))
    return start, end


def _iso(value: datetime) -> str:
    """Render an aware datetime as ISO 8601 UTC (Z suffix)."""
    return value.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


@router.get("/telemetry/report")
async def get_telemetry_report(
    start_date: datetime | None = Query(
        default=None,
        description="Inclusive start of the analysis window (ISO 8601, UTC). "
        "Defaults to now − 7 days.",
    ),
    end_date: datetime | None = Query(
        default=None,
        description="Exclusive end of the analysis window (ISO 8601, UTC). "
        "Defaults to now.",
    ),
) -> dict:
    """Operational report: volume, errors, latency and auth failures.

    The response has the shape ``{"period": {"from", "to"}, "metrics": {...}}``.
    Every metric is grouped by day (temporal dimension) and returned as a
    list of dicts that is directly JSON-serializable.
    """
    start, end = _resolve_period(start_date, end_date)
    period_key = f"{start.isoformat()}|{end.isoformat()}"

    cache_key = f"telemetry_report:{period_key}"
    cached = cache_get(cache_key)
    if cached is not None:
        logger.info("Telemetry report cache hit for %s", period_key)
        return cached

    logger.info("Computing telemetry report for %s", period_key)
    metrics = {
        "events_per_day": await analysis.events_per_day(start, end),
        "error_rate": await analysis.error_rate(start, end),
        "latency_per_day": await analysis.latency_per_day(start, end),
        "auth_failure_rate": await analysis.auth_failure_rate(start, end),
    }

    result = {
        "period": {
            "from": _iso(start),
            "to": _iso(end),
        },
        "metrics": metrics,
    }

    cache_set(cache_key, result, ttl_seconds=CACHE_TTL_SECONDS)
    return result