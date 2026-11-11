"""
Operational metrics computed from the ``telemetry_events`` table.

This module implements the analysis pipeline for the technical telemetry
report.  It does **not** compute business KPIs (sales, conversion, revenue):
those belong to the Data Pipelines milestone.  Every question answered here
is *operational* — volume, errors, latency, availability.

Pipeline used by every metric function, in this exact order:

    load (SQL push-down) → refine (Pandas) → convert types →
    groupby → aggregate → to_dict records

Where each concern lives:

- **SQL push-down (mandatory).** ``event_type`` (including ``IN (...)`` for
  ratio metrics) and the ``timestamp`` range (``>= start``, ``< end``, UTC)
  are filtered in the query through ``fetch_events``.  None of the metrics
  re-apply the date window in Pandas, and none loads the full table.
- **Pandas refine.** After loading, metrics extract ``tags`` dimensions,
  drop rows where a dimension is null, and build derived columns such as
  ``is_error``.
- **Type conversion (mandatory before temporal groupby).** Timestamps arrive
  from the database as strings/aware datetimes; ``pd.to_datetime(..., utc=True)``
  is applied *before* any ``groupby`` on the date so buckets are correct.
- **Aggregate.** Pandas ``groupby`` + ``count``/``sum``/``mean`` only — never
  Python ``for`` loops over rows to compute counts.

All functions are pure with respect to their DataFrame inputs: they return
`list[dict]` (directly JSON-serializable) and never write to the database.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

import pandas as pd

from app.core.database import fetch_events

# --------------------------------------------------------------------------- #
# Shared DataFrame helpers (type conversion + date bucket)
# --------------------------------------------------------------------------- #


def _prepare(df: pd.DataFrame) -> pd.DataFrame | None:
    """Return None for empty input; otherwise parse timestamps and date bucket.

    Timestamps must be converted with ``utc=True`` before any temporal
    ``groupby`` — grouping on strings that look like dates produces silently
    wrong buckets.
    """
    if df is None or df.empty:
        return None
    df = df.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True)
    df["date"] = df["timestamp"].dt.date.astype(str)
    return df


def _records(series: pd.Series, value_col: str) -> list[dict[str, Any]]:
    """Convert a grouped Series (index = date) into list[dict]."""
    return (
        series.reset_index(name=value_col)
        .sort_values("date")
        .to_dict(orient="records")
    )


# --------------------------------------------------------------------------- #
# Metric 1 — events_per_day
# --------------------------------------------------------------------------- #
# Operational question: "Which events occur, and how often, per day?"
# Groups by date AND event_type, aggregating with count().


async def events_per_day(
    start_date: datetime,
    end_date: datetime,
) -> list[dict[str, Any]]:
    """Count events per day and event type inside [start_date, end_date)."""
    rows = await fetch_events(start_date=start_date, end_date=end_date)
    return events_per_day_from_rows(rows)


def events_per_day_from_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Pure version of :func:`events_per_day` over loaded rows."""
    prepared = _prepare(pd.DataFrame(rows))
    if prepared is None:
        return []
    return (
        prepared.groupby(["date", "event_type"])["id"]
        .count()
        .reset_index(name="event_count")
        .sort_values(["date", "event_type"])
        .to_dict(orient="records")
    )


# --------------------------------------------------------------------------- #
# Metric 2 — error_rate
# --------------------------------------------------------------------------- #
# Operational question: "What percentage of events fail each day?"
# Builds a derived `is_error` column in Pandas (level == 'error'), then
# aggregates errors / total per day.  Ratio metrics load all event types in
# a single query (no event_type filter) because the denominator is total
# events.


async def error_rate(
    start_date: datetime,
    end_date: datetime,
) -> list[dict[str, Any]]:
    """Daily error rate: share of events with level='error' per day."""
    rows = await fetch_events(start_date=start_date, end_date=end_date)
    return error_rate_from_rows(rows)


def error_rate_from_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Pure version of :func:`error_rate` over loaded rows."""
    prepared = _prepare(pd.DataFrame(rows))
    if prepared is None:
        return []

    prepared["is_error"] = prepared["level"] == "error"
    grouped = prepared.groupby("date").agg(
        total_count=("id", "count"),
        error_count=("is_error", "sum"),
    )
    grouped["error_rate"] = (grouped["error_count"] / grouped["total_count"]).round(4)
    return (
        grouped.reset_index()[["date", "error_rate"]]
        .to_dict(orient="records")
    )


# --------------------------------------------------------------------------- #
# Metric 3 — latency_per_day
# --------------------------------------------------------------------------- #
# Operational question: "How fast does an API call respond, on average, per day?"
# Loads ONLY api_latency_recorded events, uses the numeric `value` column
# (duration_ms) and aggregates with mean() per day.


async def latency_per_day(
    start_date: datetime,
    end_date: datetime,
) -> list[dict[str, Any]]:
    """Daily average API latency (ms) for api_latency_recorded events."""
    rows = await fetch_events(
        event_types=["api_latency_recorded"],
        start_date=start_date,
        end_date=end_date,
    )
    return latency_per_day_from_rows(rows)


def latency_per_day_from_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Pure version of :func:`latency_per_day` over loaded rows."""
    prepared = _prepare(pd.DataFrame(rows))
    if prepared is None:
        return []

    prepared["duration_ms"] = pd.to_numeric(prepared["value"], errors="coerce")
    latency = prepared.dropna(subset=["duration_ms"])

    if latency.empty:
        return []

    result = (
        latency.groupby("date")["duration_ms"]
        .mean()
        .round(2)
        .reset_index(name="avg_ms")
        .to_dict(orient="records")
    )
    return result


# --------------------------------------------------------------------------- #
# Additional activity — auth_failure_rate
# --------------------------------------------------------------------------- #
# Operational question: "What fraction of login attempts fail each day?"
# Loads login_failed AND login_succeeded with event_type IN (...) in SQL,
# then computes failed / (failed + succeeded) per day in Pandas, with values
# in [0.0, 1.0].


async def auth_failure_rate(
    start_date: datetime,
    end_date: datetime,
) -> list[dict[str, Any]]:
    """Daily login failure rate for auth events inside the window."""
    rows = await fetch_events(
        event_types=["login_failed", "login_succeeded"],
        start_date=start_date,
        end_date=end_date,
    )
    return auth_failure_rate_from_rows(rows)


def auth_failure_rate_from_rows(
    rows: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Pure version of :func:`auth_failure_rate` over loaded rows."""
    prepared = _prepare(pd.DataFrame(rows))
    if prepared is None:
        return []

    prepared["is_failure"] = prepared["event_type"] == "login_failed"
    grouped = prepared.groupby("date").agg(
        failed=("is_failure", "sum"),
        total=("id", "count"),
    )
    grouped["auth_failure_rate"] = (
        grouped["failed"] / grouped["total"]
    ).round(4)
    return (
        grouped.reset_index()[["date", "auth_failure_rate"]]
        .to_dict(orient="records")
    )