"""
Tests for the operational telemetry report pipeline.

Two layers are covered:

1. Pure metric functions (…_from_rows) fed with hand-built row dicts.  These
   mirror the rows returned by ``fetch_events`` and let us assert grouping,
   type conversion and aggregation without a live database.
2. The ``GET /telemetry/report`` endpoint shape (period + metrics structure)
   using the FastAPI TestClient.
"""

from __future__ import annotations

from datetime import datetime, timezone

import pandas as pd
from fastapi.testclient import TestClient

from app import analysis
from app.main import app
from app.routers.telemetry_report import _resolve_period

client = TestClient(app)


def _row(
    event_type: str,
    timestamp: str,
    level: str = "info",
    value: float | None = None,
    tags: dict | None = None,
) -> dict:
    """Build a row dict shaped like a fetch_events() result."""
    return {
        "id": event_type + timestamp,
        "timestamp": pd.to_datetime(timestamp, utc=True),
        "service": "backoffice",
        "event_type": event_type,
        "level": level,
        "value": value,
        "message": None,
        "tags": tags or {},
    }


def test_events_per_day_groups_by_date_and_event_type():
    rows = [
        _row("outbound_order_created", "2026-10-20T10:00:00Z", level="info"),
        _row("outbound_order_created", "2026-10-20T11:00:00Z", level="info"),
        _row("inbound_order_created", "2026-10-20T12:00:00Z", level="info"),
        _row("outbound_order_created", "2026-10-21T09:00:00Z", level="info"),
    ]

    result = analysis.events_per_day_from_rows(rows)

    assert result == [
        {"date": "2026-10-20", "event_type": "inbound_order_created", "event_count": 1},
        {"date": "2026-10-20", "event_type": "outbound_order_created", "event_count": 2},
        {"date": "2026-10-21", "event_type": "outbound_order_created", "event_count": 1},
    ]


def test_events_per_day_returns_empty_for_no_rows():
    assert analysis.events_per_day_from_rows([]) == []


def test_error_rate_computes_share_of_error_events_per_day():
    rows = [
        _row("order_created", "2026-10-20T10:00:00Z", level="info"),
        _row("order_created", "2026-10-20T11:00:00Z", level="info"),
        _row("ordering_failed", "2026-10-20T12:00:00Z", level="error"),
        _row("ordering_failed", "2026-10-20T13:00:00Z", level="error"),
        _row("order_created", "2026-10-21T09:00:00Z", level="info"),
    ]

    result = analysis.error_rate_from_rows(rows)

    assert result == [
        {"date": "2026-10-20", "error_rate": 0.5},
        {"date": "2026-10-21", "error_rate": 0.0},
    ]


def test_error_rate_returns_empty_for_no_rows():
    assert analysis.error_rate_from_rows([]) == []


def test_latency_per_day_averages_duration_per_day():
    rows = [
        _row("api_latency_recorded", "2026-10-20T10:00:00Z", value=120.0),
        _row("api_latency_recorded", "2026-10-20T11:00:00Z", value=180.0),
        _row("api_latency_recorded", "2026-10-20T12:00:00Z", value=300.0),
        _row("api_latency_recorded", "2026-10-21T09:00:00Z", value=200.0),
    ]

    result = analysis.latency_per_day_from_rows(rows)

    assert result == [
        {"date": "2026-10-20", "avg_ms": 200.0},
        {"date": "2026-10-21", "avg_ms": 200.0},
    ]


def test_latency_per_day_ignores_rows_without_value():
    rows = [
        _row("api_latency_recorded", "2026-10-20T10:00:00Z", value=100.0),
        _row("api_latency_recorded", "2026-10-20T11:00:00Z", value=None),
        _row("order_created", "2026-10-20T12:00:00Z", level="info"),
    ]

    result = analysis.latency_per_day_from_rows(rows)

    assert result == [{"date": "2026-10-20", "avg_ms": 100.0}]


def test_auth_failure_rate_is_bounded_between_zero_and_one():
    rows = [
        _row("login_failed", "2026-10-20T10:00:00Z", level="error"),
        _row("login_failed", "2026-10-20T11:00:00Z", level="error"),
        _row("login_succeeded", "2026-10-20T12:00:00Z", level="info"),
        _row("login_succeeded", "2026-10-20T13:00:00Z", level="info"),
    ]

    result = analysis.auth_failure_rate_from_rows(rows)

    assert result == [{"date": "2026-10-20", "auth_failure_rate": 0.5}]
    assert 0.0 <= result[0]["auth_failure_rate"] <= 1.0


def test_auth_failure_rate_handles_only_successes():
    rows = [
        _row("login_succeeded", "2026-10-20T10:00:00Z", level="info"),
        _row("login_succeeded", "2026-10-20T11:00:00Z", level="info"),
    ]

    result = analysis.auth_failure_rate_from_rows(rows)

    assert result == [{"date": "2026-10-20", "auth_failure_rate": 0.0}]


def test_resolve_period_defaults_to_seven_days():
    start, end = _resolve_period(None, None)
    now = datetime.now(timezone.utc)

    # Inclusivo del inicio, exclusivo del fin
    assert start <= now
    assert 0 <= (now - end).total_seconds() < 1
    assert (end - start).days == 7


def test_resolve_period_uses_provided_boundaries():
    start = datetime(2026, 10, 1, tzinfo=timezone.utc)
    end = datetime(2026, 10, 8, tzinfo=timezone.utc)

    resolved_start, resolved_end = _resolve_period(start, end)

    assert resolved_start == start
    assert resolved_end == end


def test_telemetry_report_endpoint_returns_period_and_metrics_shape(monkeypatch):
    async def fake_fetch_events(**kwargs):
        # No database in tests: raise after the app starts, never reached
        # because the endpoint only computes with the rows it gets (empty
        # rows → empty metrics lists, per the reviewer notes).
        return []

    monkeypatch.setattr(analysis, "fetch_events", fake_fetch_events)

    response = client.get(
        "/telemetry/report",
        params={
            "start_date": "2026-10-01T00:00:00Z",
            "end_date": "2026-10-08T00:00:00Z",
        },
    )

    assert response.status_code == 200
    payload = response.json()

    assert set(payload.keys()) == {"period", "metrics"}
    assert set(payload["period"].keys()) == {"from", "to"}
    assert set(payload["metrics"].keys()) == {
        "events_per_day",
        "error_rate",
        "latency_per_day",
        "auth_failure_rate",
    }
    # Períodos vacíos devuelven listas [], no errores
    for key, metric in payload["metrics"].items():
        assert isinstance(metric, list)
        assert metric == []