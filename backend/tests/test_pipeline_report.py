"""Tests for the resilient business performance pipeline (Part 2).

Covers:
  * the pure KPI aggregation math (``data/process/kpi_aggregation.py``) —
    inbound cost formula, per-clinic/per-month grouping, currency and the
    cross-currency guarantee,
  * the window-resolution and cache-key logic (sub-flow input,
    ``data/pipelines/transform.py``), which implements the "don't re-run in
    the last hour" rule,
  * the reporting service response shape via the OpenAPI routes registered on
    the API app (no database needed — only route registration and schema).
"""

from __future__ import annotations

import datetime as dt
import sys
from pathlib import Path

import pytest

# --- repo layout -----------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))
BACKEND = REPO_ROOT / "backend"
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from data.process import kpi_aggregation as kpi  # noqa: E402


# ---------------------------------------------------------------------------
# Pure aggregation math
# ---------------------------------------------------------------------------
def _inbound(tags: dict, timestamp: str = "2026-06-15T09:00:00Z") -> dict:
    return {
        "event_type": "inbound_order_created",
        "timestamp": timestamp,
        "tags": tags,
    }


def _inbound_full(**kwargs: object) -> dict:
    timestamp = str(kwargs.pop("timestamp", "2026-06-15T09:00:00Z"))
    base = {"clinic_id": "c1", "country": "US", "quantity": 10, "unit_cost": 2.0}
    base.update(kwargs)
    return _inbound(base, timestamp=timestamp)


INSTANT_2026_06 = "2026-06-15T09:00:00Z"
INSTANT_2026_07 = "2026-07-02T09:00:00Z"


def test_event_cost_prefers_explicit_total_cost():
    # total_cost wins over quantity*unit_cost (PIPELINE_DESIGN §2 priority 1)
    cost, missing = kpi.event_cost({"quantity": 10, "unit_cost": 2.0, "total_cost": 100.0})
    assert cost == 100.0
    assert missing is False


def test_event_cost_falls_back_to_quantity_times_unit_cost():
    cost, missing = kpi.event_cost({"quantity": 10, "unit_cost": 2.5})
    assert cost == 25.0
    assert missing is False


def test_event_cost_reports_missing_when_incomplete():
    cost, missing = kpi.event_cost({"quantity": 5})
    assert cost == 0.0
    assert missing is True


def test_aggregate_monthly_kpis_groups_by_month_and_clinic():
    events = [
        _inbound_full(clinic_id="c1", country="US", quantity=10, unit_cost=2.0, timestamp=INSTANT_2026_06),
        _inbound_full(clinic_id="c1", country="US", quantity=20, unit_cost=1.0, timestamp="2026-06-20T09:00:00Z"),
        _inbound_full(clinic_id="c2", country="UK", quantity=5, unit_cost=4.0, timestamp=INSTANT_2026_07),
        # consumption (outbound) increments supply_consumption_count only
        {
            "event_type": "outbound_order_created",
            "timestamp": "2026-06-21T09:00:00Z",
            "tags": {"clinic_id": "c1", "country": "US"},
        },
        {
            "event_type": "outbound_order_created",
            "timestamp": "2026-06-24T09:00:00Z",
            "tags": {"clinic_id": "c1", "country": "US"},
        },
    ]
    result = kpi.aggregate_monthly_kpis(events)
    rows = result["rows"]
    assert len(rows) == 2
    by_clinic = {(r["clinic_id"], str(r["month_start"])): r for r in rows}
    c1 = by_clinic[("c1", "2026-06-01")]
    c2 = by_clinic[("c2", "2026-07-01")]
    assert c1["total_supply_cost"] == 40.0  # 10*2 + 20*1
    assert c1["supply_consumption_count"] == 2  # two outbound events
    assert c1["country"] == "US" and c1["currency"] == "USD"
    assert c2["country"] == "UK" and c2["currency"] == "GBP"


def test_aggregate_ignores_unknown_event_types():
    events = [
        _inbound_full(clinic_id="c1", country="US", timestamp="2026-06-01T09:00:00Z"),
        {"event_type": "login_failed", "timestamp": "2026-06-01T09:00:00Z", "tags": {"clinic_id": "c1"}},
        {"event_type": "stock_threshold_triggered", "timestamp": "2026-06-01T09:00:00Z", "tags": {"clinic_id": "c2", "country": "UK"}},
    ]
    result = kpi.aggregate_monthly_kpis(events)
    by_id = {r["clinic_id"]: r for r in result["rows"]}
    assert "c1" in by_id
    c2 = by_id["c2"]
    assert c2["critical_stockout_count"] == 1
    assert c2["supply_consumption_count"] == 0
    assert result["stats"]["events_read"] == 3


def test_currency_is_never_mixed_between_clinics_subflows_cross_currency():
    """Network totals are kept per-currency and clinics never mix currencies."""
    events = [
        _inbound_full(clinic_id="c1", country="US", quantity=10, unit_cost=2.0, timestamp="2026-06-01T09:00:00Z"),
        _inbound_full(clinic_id="c2", country="UK", quantity=5, unit_cost=4.0, timestamp="2026-06-02T09:00:00Z"),
    ]
    result = kpi.aggregate_monthly_kpis(events)
    totals = kpi.summarise(result["rows"])
    # USD row only counts US clinic
    assert totals["USD"]["total_supply_cost"] == 20.0
    assert totals["USD"]["clinics"] == 1
    assert totals["GBP"]["total_supply_cost"] == 20.0
    assert totals["GBP"]["clinics"] == 1


# ---------------------------------------------------------------------------
# Cache key -> "don't re-run within the hour" rule
# ---------------------------------------------------------------------------
def test_transform_cache_key_is_stable_within_the_same_month():
    from data.pipelines.transform import transform_cache_key

    key1 = transform_cache_key(
        None,
        {
            "window_from": dt.datetime(2026, 6, 1, 12, 0, 0),
            "window_to": dt.datetime(2026, 6, 1, 13, 0, 0),
        },
    )
    key2 = transform_cache_key(
        None,
        {
            "window_from": dt.datetime(2026, 6, 1, 12, 30, 0),
            "window_to": dt.datetime(2026, 6, 2, 0, 0, 0),
        },
    )
    assert key1 == key2


def test_transform_cache_key_differs_across_months():
    from data.pipelines.transform import transform_cache_key

    june_key = transform_cache_key(
        None,
        {
            "window_from": dt.datetime(2026, 6, 1, 0, 0, 0),
            "window_to": dt.datetime(2026, 7, 1, 0, 0, 0),
        },
    )
    oct_key = transform_cache_key(
        None,
        {
            "window_from": dt.datetime(2026, 10, 1, 0, 0, 0),
            "window_to": dt.datetime(2026, 11, 1, 0, 0, 0),
        },
    )
    assert june_key != oct_key


# ---------------------------------------------------------------------------
# Reporting service: routes + schema registration (no DB required)
# ---------------------------------------------------------------------------
def test_coerce_month_accepts_yyyy_mm_selector():
    from data.pipelines.pipeline import _coerce_month

    assert _coerce_month("2026-06") == dt.date(2026, 6, 1)
    assert _coerce_month("2026-10") == dt.date(2026, 10, 1)


def test_coerce_month_accepts_full_date_and_keeps_month():
    from data.pipelines.pipeline import _coerce_month

    # A mid-month date is normalised to the first day of that month.
    assert _coerce_month("2026-06-15") == dt.date(2026, 6, 1)


def test_coerce_month_none_returns_none():
    from data.pipelines.pipeline import _coerce_month

    assert _coerce_month(None) is None


def test_reporting_endpoints_registered_on_app(monkeypatch):
    """The 3 reporting endpoints are part of the API's OpenAPI surface."""
    # Ensure no DB connection is attempted just by importing the app.
    monkeypatch.setattr("app.core.database.init_db", lambda: None)
    import app.main  # noqa: F401

    # FastAPI defers router expansion to _IncludedRouter wrappers; unwrap them.
    from fastapi.routing import _IncludedRouter

    registered: set[str] = set()
    for route in app.main.app.routes:
        if isinstance(route, _IncludedRouter):
            for sub in route.original_router.routes:
                registered.add(getattr(sub, "path", ""))
        else:
            registered.add(getattr(route, "path", ""))

    expected = {
        "/reporting/pipeline-runs/latest",
        "/reporting/pipeline-runs",
        "/reporting/monthly-clinic-supply-performance",
    }
    assert expected <= registered


def test_reporting_schemas_match_expected_fields():
    from services.reporting.schemas import ClinicKpi, PipelineRunMetadata, TriggerResponse

    metadata = PipelineRunMetadata(
        run_id="abc",
        status="success",
        started_at="2026-10-01T00:00:00Z",
        finished_at="2026-10-01T00:05:00Z",
        watermark_from="2026-09-01T00:00:00Z",
        watermark_to="2026-10-01T00:00:00Z",
        rows_extracted=10,
        rows_loaded=4,
        error_summary=None,
        pipeline_version="business-performance-pipeline/2.0.0",
    )
    assert metadata.status == "success"
    assert metadata.rows_loaded == 4

    kpi_row = ClinicKpi(
        clinic_id="c1",
        country="US",
        month_start="2026-06-01",
        total_supply_cost=40.0,
        supply_consumption_count=2,
        critical_stockout_count=0,
        expiry_risk_count=0,
        currency="USD",
        computed_at="2026-11-02T00:00:00Z",
    )
    assert kpi_row.currency == "USD"
    assert TriggerResponse(message="Pipeline run submitted", flow_run_id="xyz").flow_run_id == "xyz"