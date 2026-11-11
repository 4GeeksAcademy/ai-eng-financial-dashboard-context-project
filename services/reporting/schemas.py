"""Pydantic schemas for the reporting service HTTP contract.

The field names mirror the columns of the destination table in the
data-pipelines BRIEFING (KPIs: total_supply_cost, supply_consumption_count,
critical_stockout_count, expiry_risk_count) so the Part 3 dashboard can
consume the response without remapping.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field


class PipelineRunMetadata(BaseModel):
    """Metadata of one pipeline run (>= 5 fields per the milestone rubric)."""

    run_id: str
    status: str
    started_at: str
    finished_at: str | None = None
    watermark_from: str
    watermark_to: str
    rows_extracted: int
    rows_loaded: int
    error_summary: str | None = None
    pipeline_version: str


class TriggerResponse(BaseModel):
    """Response of the manual-trigger endpoint."""

    message: str = "Pipeline run submitted"
    flow_run_id: str = Field(..., description="Pipeline run id (uuid)")


class ClinicKpi(BaseModel):
    """One row of the monthly clinic supply performance report."""

    clinic_id: str
    country: str
    month_start: date
    total_supply_cost: float
    supply_consumption_count: int
    critical_stockout_count: int
    expiry_risk_count: int
    currency: str
    computed_at: str | None = None


class ClinicKpiResponse(BaseModel):
    """The board-ready monthly report for one month."""

    month_start: date
    clinics: list[ClinicKpi]


class PipelineNotReady(BaseModel):
    """Returned when the reporting tables have not been populated yet."""

    detail: str
    month_start: date | None = None
    clinics: list[Any] = []