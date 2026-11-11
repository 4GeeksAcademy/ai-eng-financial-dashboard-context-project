"""Shared data shapes for the business performance pipeline.

Plain type aliases and TypedDicts only — no runtime dependencies — so the
extract/transform/load stages (and the HTTP service layer) can describe their
contracts without importing Prefect.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, TypedDict


class TelemetryEventRow(TypedDict):
    """One row read from ``public.telemetry_events`` (read-only)."""

    id: str
    timestamp: datetime
    event_type: str
    value: float | None
    tags: dict[str, Any]


class KpiRow(TypedDict):
    """One row written to ``reporting.monthly_clinic_supply_performance``."""

    clinic_id: str
    country: str
    month_start: str  # ISO date, YYYY-MM-DD
    total_supply_cost: float
    supply_consumption_count: int
    critical_stockout_count: int
    expiry_risk_count: int
    currency: str


class PipelineRunRecord(TypedDict, total=False):
    """Metadata persisted per run in ``reporting.pipeline_runs``."""

    run_id: str
    status: str
    watermark_from: datetime
    watermark_to: datetime
    rows_extracted: int
    rows_loaded: int
    error_summary: str | None
    pipeline_version: str
    started_at: datetime
    finished_at: datetime | None
