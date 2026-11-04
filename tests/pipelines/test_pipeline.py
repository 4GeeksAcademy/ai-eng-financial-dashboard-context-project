"""Unit tests for the business performance pipeline transform helpers.

Validates the pure transformation functions in ``data/process/kpi_aggregation.py``
against hand-calculated values from the HealthCore BRIEFING KPIs.

Requirements (Part 3 of the milestone):
  * ≥3 KPI transform tests
  * ≥1 defensive test against malformed/invalid input
  * ≥1 test verifies a KPI definition against BRIEFING with hand-calculated data
  * Tests use in-memory fixtures, never the real database
"""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any

import pytest

from data.process import kpi_aggregation as kpi


# ---------------------------------------------------------------------------
# Test data factories
# ---------------------------------------------------------------------------

def _inbound(
    clinic_id: str = "clinic_01",
    country: str = "US",
    total_cost: float | None = 500.0,
    quantity: int | None = None,
    unit_cost: float | None = None,
) -> dict[str, Any]:
    """Build an inbound_order_created event for testing."""
    tags: dict[str, Any] = {"clinic_id": clinic_id, "country": country}
    if total_cost is not None:
        tags["total_cost"] = total_cost
    if quantity is not None:
        tags["quantity"] = quantity
    if unit_cost is not None:
        tags["unit_cost"] = unit_cost
    return {
        "event_type": kpi.INBOUND,
        "timestamp": "2026-06-15T10:00:00Z",
        "tags": tags,
    }


def _outbound(
    clinic_id: str = "clinic_01",
    country: str = "US",
) -> dict[str, Any]:
    """Build an outbound_order_created event for testing."""
    return {
        "event_type": kpi.OUTBOUND,
        "timestamp": "2026-06-15T11:00:00Z",
        "tags": {"clinic_id": clinic_id, "country": country},
    }


def _stockout(
    clinic_id: str = "clinic_01",
    country: str = "US",
) -> dict[str, Any]:
    """Build a stock_threshold_triggered event for testing."""
    return {
        "event_type": kpi.STOCKOUT,
        "timestamp": "2026-06-15T12:00:00Z",
        "tags": {"clinic_id": clinic_id, "country": country},
    }


def _expiry(
    clinic_id: str = "clinic_01",
    country: str = "US",
) -> dict[str, Any]:
    """Build a supply_expiry_flagged event for testing."""
    return {
        "event_type": kpi.EXPIRY,
        "timestamp": "2026-06-15T13:00:00Z",
        "tags": {"clinic_id": clinic_id, "country": country},
    }


# ---------------------------------------------------------------------------
# 1. KPI transform test: total_supply_cost aggregation
# ---------------------------------------------------------------------------

class TestAggregateMonthlyKpis:
    """Tests for the core aggregation function ``aggregate_monthly_kpis``."""

    def test_single_clinic_single_month(self) -> None:
        """Hand-calculated: 2 inbound events = total_supply_cost 1500."""
        events = [
            _inbound(clinic_id="clinic_01", total_cost=1000.0),
            _inbound(clinic_id="clinic_01", total_cost=500.0),
        ]
        result = kpi.aggregate_monthly_kpis(events)
        rows = result["rows"]
        assert len(rows) == 1
        assert rows[0]["clinic_id"] == "clinic_01"
        assert rows[0]["total_supply_cost"] == 1500.0

    def test_multiple_clinics_separate_rows(self) -> None:
        """Two clinics produce two separate rows with independent costs."""
        events = [
            _inbound(clinic_id="clinic_01", total_cost=1000.0),
            _inbound(clinic_id="clinic_02", total_cost=2000.0),
        ]
        rows = kpi.aggregate_monthly_kpis(events)["rows"]
        assert len(rows) == 2
        by_clinic = {r["clinic_id"]: r for r in rows}
        assert by_clinic["clinic_01"]["total_supply_cost"] == 1000.0
        assert by_clinic["clinic_02"]["total_supply_cost"] == 2000.0

# ---------------------------------------------------------------------------
# 2. KPI transform test: supply_consumption_count
# ---------------------------------------------------------------------------

    def test_consumption_count_per_clinic(self) -> None:
        """3 outbound events for clinic_01 = consumption count of 3.

        BRIEFING definition: supply_consumption_count tracks the number of
        outbound_order_created events (each represents a supply dispensation).
        """
        events = [
            _outbound(clinic_id="clinic_01"),
            _outbound(clinic_id="clinic_01"),
            _outbound(clinic_id="clinic_01"),
            _outbound(clinic_id="clinic_02"),
        ]
        rows = kpi.aggregate_monthly_kpis(events)["rows"]
        by_clinic = {r["clinic_id"]: r for r in rows}
        assert by_clinic["clinic_01"]["supply_consumption_count"] == 3
        assert by_clinic["clinic_02"]["supply_consumption_count"] == 1

# ---------------------------------------------------------------------------
# 3. KPI transform test: critical_stockout_count
# ---------------------------------------------------------------------------

    def test_stockout_count(self) -> None:
        """2 stockout events = critical_stockout_count of 2.

        BRIEFING definition: critical_stockout_frequency counts
        stock_threshold_triggered events.
        """
        events = [
            _stockout(clinic_id="clinic_01"),
            _stockout(clinic_id="clinic_01"),
        ]
        rows = kpi.aggregate_monthly_kpis(events)["rows"]
        assert len(rows) == 1
        assert rows[0]["critical_stockout_count"] == 2

# ---------------------------------------------------------------------------
# 4. KPI transform test: expiry_risk_count
# ---------------------------------------------------------------------------

    def test_expiry_count(self) -> None:
        """1 expiry event = expiry_risk_count of 1."""
        events = [_expiry(clinic_id="clinic_01")]
        rows = kpi.aggregate_monthly_kpis(events)["rows"]
        assert len(rows) == 1
        assert rows[0]["expiry_risk_count"] == 1

# ---------------------------------------------------------------------------
# 5. Defensive test: malformed input
# ---------------------------------------------------------------------------

    def test_ignores_unknown_event_type(self) -> None:
        """Events with unrecognised event_type are counted in stats but excluded from KPI rows."""
        events = [
            {"event_type": "unknown_type", "timestamp": "2026-06-15T10:00:00Z", "tags": {"clinic_id": "clinic_01"}},
            _inbound(clinic_id="clinic_01", total_cost=100.0),
        ]
        result = kpi.aggregate_monthly_kpis(events)
        assert len(result["rows"]) == 1  # Only the inbound produced a row
        assert result["stats"]["events_ignored_type"] == 1

    def test_drops_event_with_none_timestamp(self) -> None:
        """Events with None timestamp are dropped and counted."""
        events = [
            {"event_type": kpi.INBOUND, "timestamp": None, "tags": {"clinic_id": "clinic_01"}},
        ]
        result = kpi.aggregate_monthly_kpis(events)
        assert len(result["rows"]) == 0
        assert result["stats"]["events_dropped_bad_timestamp"] == 1

    def test_drops_event_without_clinic_id(self) -> None:
        """Events without clinic_id in tags are dropped."""
        events = [
            {"event_type": kpi.INBOUND, "timestamp": "2026-06-15T10:00:00Z", "tags": {"country": "US"}},
        ]
        result = kpi.aggregate_monthly_kpis(events)
        assert len(result["rows"]) == 0
        assert result["stats"]["events_dropped_no_clinic"] == 1

# ---------------------------------------------------------------------------
# 6. Hand-calculated KPI against BRIEFING definition
# ---------------------------------------------------------------------------

    def test_hand_calculated_kpis_against_briefing(self) -> None:
        """Verify all four KPIs with a manual calculation against BRIEFING.

        Scenario (June 2026):
          - clinic_01:
            2 inbound  events (cost 1000 + 500 = 1500)
            3 outbound events (consumption = 3)
            1 stockout event   (stockout = 1)
            2 expiry   events  (expiry = 2)
          - clinic_02:
            1 inbound  event   (cost 750)
            0 outbound, 0 stockout, 1 expiry

        Hand-calculated expected values per BRIEFING definitions.
        """
        events = [
            # clinic_01: June
            _inbound(clinic_id="clinic_01", total_cost=1000.0),
            _inbound(clinic_id="clinic_01", total_cost=500.0),
            _outbound(clinic_id="clinic_01"),
            _outbound(clinic_id="clinic_01"),
            _outbound(clinic_id="clinic_01"),
            _stockout(clinic_id="clinic_01"),
            _expiry(clinic_id="clinic_01"),
            _expiry(clinic_id="clinic_01"),
            # clinic_02: June
            _inbound(clinic_id="clinic_02", total_cost=750.0),
            _expiry(clinic_id="clinic_02"),
        ]
        result = kpi.aggregate_monthly_kpis(events)
        rows = result["rows"]
        assert len(rows) == 2, f"Expected 2 clinic-months, got {len(rows)}"

        by_clinic = {r["clinic_id"]: r for r in rows}

        # clinic_01 checks
        c1 = by_clinic["clinic_01"]
        assert c1["total_supply_cost"] == 1500.0, f"Expected 1500, got {c1['total_supply_cost']}"
        assert c1["supply_consumption_count"] == 3, f"Expected 3, got {c1['supply_consumption_count']}"
        assert c1["critical_stockout_count"] == 1, f"Expected 1, got {c1['critical_stockout_count']}"
        assert c1["expiry_risk_count"] == 2, f"Expected 2, got {c1['expiry_risk_count']}"
        assert c1["currency"] == "USD", f"Expected USD, got {c1['currency']}"
        assert c1["country"] == "US"

        # clinic_02 checks
        c2 = by_clinic["clinic_02"]
        assert c2["total_supply_cost"] == 750.0
        assert c2["supply_consumption_count"] == 0
        assert c2["critical_stockout_count"] == 0
        assert c2["expiry_risk_count"] == 1
        assert c2["country"] == "US"

    def test_stats_are_present(self) -> None:
        """Result includes a stats dictionary with quality counters."""
        events = [_inbound()]
        result = kpi.aggregate_monthly_kpis(events)
        assert "stats" in result
        assert result["stats"]["events_read"] == 1
        assert result["stats"]["clinic_months_produced"] == 1