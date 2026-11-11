"""Reusable transformation helpers for the business performance pipeline.

This module is intentionally free of Prefect, database and HTTP concerns: it
receives plain event dicts (the shape produced by the extract stage) and
returns plain dicts ready for the load stage and for JSON serialisation.

Keeping the aggregation pure means it can be unit-tested without a database
and reused by any orchestration layer.
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import date, datetime, timezone
from typing import Any, Iterable, Mapping

MONTH_FORMAT = "%Y-%m"

#: Country → currency. A single row never mixes currencies (design §9).
COUNTRY_CURRENCY: dict[str, str] = {"US": "USD", "UK": "GBP"}
UNKNOWN_COUNTRY = "UNKNOWN"
UNKNOWN_CURRENCY = "UNKNOWN"

INBOUND = "inbound_order_created"
OUTBOUND = "outbound_order_created"
STOCKOUT = "stock_threshold_triggered"
EXPIRY = "supply_expiry_flagged"


# ---------------------------------------------------------------------------
# Normalisation helpers
# ---------------------------------------------------------------------------
def _as_datetime(value: Any) -> datetime | None:
    """Coerce a timestamp (datetime or ISO string) to an aware UTC datetime."""
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if isinstance(value, str):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    return None


def _as_mapping(value: Any) -> Mapping[str, Any]:
    """Coerce the ``tags`` column (dict or JSON text) into a mapping."""
    if isinstance(value, Mapping):
        return value
    if isinstance(value, (str, bytes)):
        try:
            decoded = json.loads(value)
        except (ValueError, TypeError):
            return {}
        return decoded if isinstance(decoded, Mapping) else {}
    return {}


def _as_number(value: Any) -> float | None:
    """Return *value* as a finite float, or None when it is not numeric."""
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            return None
    return None


def month_start(moment: datetime | date) -> date:
    """First day of the calendar month containing *moment*."""
    if isinstance(moment, datetime):
        return date(moment.year, moment.month, 1)
    return date(moment.year, moment.month, 1)


def next_month(first_day: date) -> date:
    """First day of the month after *first_day* (expects a month start)."""
    if first_day.month == 12:
        return date(first_day.year + 1, 1, 1)
    return date(first_day.year, first_day.month + 1, 1)


def month_bounds(first_day: date) -> tuple[datetime, datetime]:
    """Return the UTC ``[start, end)`` datetimes of a calendar month."""
    start = datetime(first_day.year, first_day.month, 1, tzinfo=timezone.utc)
    following = next_month(first_day)
    end = datetime(following.year, following.month, 1, tzinfo=timezone.utc)
    return start, end


def currency_for(country: str | None) -> str:
    """Map a clinic country to its reporting currency."""
    if not country:
        return UNKNOWN_CURRENCY
    return COUNTRY_CURRENCY.get(country.upper(), UNKNOWN_CURRENCY)


def event_cost(tags: Mapping[str, Any]) -> tuple[float, bool]:
    """Compute the monetary cost carried by one inbound event.

    Priority:
      1. explicit ``total_cost`` recorded by the clinic,
      2. ``quantity * unit_cost`` (the formula in PIPELINE_DESIGN.md §2).

    Returns:
        ``(cost, missing_cost)`` where ``missing_cost`` is True when neither
        input was available — such events still count as activity but
        contribute 0 to the monetary KPI.
    """
    total_cost = _as_number(tags.get("total_cost"))
    if total_cost is not None:
        return max(total_cost, 0.0), False

    quantity = _as_number(tags.get("quantity"))
    unit_cost = _as_number(tags.get("unit_cost"))
    if quantity is None or unit_cost is None:
        return 0.0, True
    return max(quantity * unit_cost, 0.0), False


# ---------------------------------------------------------------------------
# Aggregation
# ---------------------------------------------------------------------------
def aggregate_monthly_kpis(events: Iterable[Mapping[str, Any]]) -> dict[str, Any]:
    """Aggregate raw telemetry events into one KPI row per clinic-month.

    The grain matches the destination table
    ``reporting.monthly_clinic_supply_performance``: one row per
    ``(clinic_id, month_start)``.

    Args:
        events: Raw event dicts with at least ``event_type``, ``timestamp``
            and ``tags``.

    Returns:
        ``{"rows": [...], "stats": {...}}`` where ``rows`` is sorted by
        ``(month_start, clinic_id)`` for deterministic output and ``stats``
        carries data-quality counters used by the eval artefact.
    """
    buckets: dict[tuple[str, date], dict[str, Any]] = {}
    countries: dict[tuple[str, date], Counter[str]] = defaultdict(Counter)

    stats: Counter[str] = Counter()

    for raw in events:
        stats["events_read"] += 1

        event_type = raw.get("event_type")
        if event_type not in {INBOUND, OUTBOUND, STOCKOUT, EXPIRY}:
            stats["events_ignored_type"] += 1
            continue

        timestamp = _as_datetime(raw.get("timestamp"))
        if timestamp is None:
            stats["events_dropped_bad_timestamp"] += 1
            continue

        tags = _as_mapping(raw.get("tags"))
        clinic_id = tags.get("clinic_id")
        clinic_id = str(clinic_id).strip() if clinic_id not in (None, "") else ""
        if not clinic_id:
            # Cannot attribute to a clinic: excluded from the board report.
            stats["events_dropped_no_clinic"] += 1
            continue

        start = month_start(timestamp)
        key = (clinic_id, start)
        bucket = buckets.get(key)
        if bucket is None:
            bucket = {
                "clinic_id": clinic_id,
                "month_start": start,
                "total_supply_cost": 0.0,
                "supply_consumption_count": 0,
                "critical_stockout_count": 0,
                "expiry_risk_count": 0,
            }
            buckets[key] = bucket

        country = tags.get("country")
        if country not in (None, ""):
            countries[key][str(country).upper()] += 1
        else:
            stats["events_missing_country"] += 1

        if event_type == INBOUND:
            cost, missing_cost = event_cost(tags)
            if missing_cost:
                stats["inbound_events_missing_cost"] += 1
            bucket["total_supply_cost"] += cost
        elif event_type == OUTBOUND:
            bucket["supply_consumption_count"] += 1
        elif event_type == STOCKOUT:
            bucket["critical_stockout_count"] += 1
        elif event_type == EXPIRY:
            bucket["expiry_risk_count"] += 1

    rows: list[dict[str, Any]] = []
    for (clinic_id, start), bucket in buckets.items():
        counter = countries.get((clinic_id, start), Counter())
        if counter:
            country = counter.most_common(1)[0][0]
            if len(counter) > 1:
                stats["clinic_months_with_country_conflict"] += 1
        else:
            country = UNKNOWN_COUNTRY

        bucket["country"] = country
        bucket["currency"] = currency_for(country)
        bucket["total_supply_cost"] = round(bucket["total_supply_cost"], 2)
        bucket["month_start"] = start.isoformat()
        rows.append(bucket)

    rows.sort(key=lambda row: (row["month_start"], row["clinic_id"]))

    stats["clinic_months_produced"] = len(rows)
    stats["months_covered"] = len({row["month_start"] for row in rows})
    return {"rows": rows, "stats": dict(sorted(stats.items()))}


def summarise(rows: Iterable[Mapping[str, Any]]) -> dict[str, Any]:
    """Network-wide totals per currency, for run summaries and notifications.

    Totals are grouped by currency so USD and GBP are never summed together.
    """
    totals: dict[str, dict[str, float]] = {}
    for row in rows:
        currency = str(row.get("currency") or UNKNOWN_CURRENCY)
        bucket = totals.setdefault(
            currency,
            {
                "total_supply_cost": 0.0,
                "supply_consumption_count": 0.0,
                "critical_stockout_count": 0.0,
                "expiry_risk_count": 0.0,
                "clinics": 0.0,
            },
        )
        bucket["total_supply_cost"] += float(row.get("total_supply_cost") or 0.0)
        bucket["supply_consumption_count"] += float(row.get("supply_consumption_count") or 0)
        bucket["critical_stockout_count"] += float(row.get("critical_stockout_count") or 0)
        bucket["expiry_risk_count"] += float(row.get("expiry_risk_count") or 0)
        bucket["clinics"] += 1

    for bucket in totals.values():
        bucket["total_supply_cost"] = round(bucket["total_supply_cost"], 2)
        bucket["supply_consumption_count"] = int(bucket["supply_consumption_count"])
        bucket["critical_stockout_count"] = int(bucket["critical_stockout_count"])
        bucket["expiry_risk_count"] = int(bucket["expiry_risk_count"])
        bucket["clinics"] = int(bucket["clinics"])

    return totals
