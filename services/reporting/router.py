"""FastAPI router for the reporting service.

Three endpoints, per PIPELINE_DESIGN.md §8:

  * ``GET /reporting/pipeline-runs/latest``  — run metadata
  * ``POST /reporting/pipeline-runs``        — manual trigger (imports the flow)
  * ``GET /reporting/monthly-clinic-supply-performance`` — KPI rows (Part 3)

The handlers only call functions from ``data/pipelines``; no ETL logic lives
here. Register this router in ``app.main`` after the telemetry routers.
"""

from __future__ import annotations

import logging
import uuid
from datetime import date

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query

from data.pipelines.pipeline import business_performance_etl_flow
from data.pipelines.queries import (
    get_latest_pipeline_run,
    get_monthly_clinic_supply_performance,
)
from services.reporting.schemas import (
    ClinicKpi,
    ClinicKpiResponse,
    PipelineRunMetadata,
    TriggerResponse,
)

logger = logging.getLogger("api.reporting")

router = APIRouter(prefix="/reporting")


@router.get(
    "/pipeline-runs/latest",
    response_model=PipelineRunMetadata | None,
    summary="Metadata of the latest pipeline run",
)
async def latest_pipeline_run() -> PipelineRunMetadata | None:
    """Return run metadata, or 404-ish null when the pipeline never ran."""
    record = await get_latest_pipeline_run()
    if record is None:
        return None
    return PipelineRunMetadata(**record)


@router.post(
    "/pipeline-runs",
    response_model=TriggerResponse,
    status_code=202,
    summary="Trigger a business performance pipeline run",
)
async def trigger_pipeline_run(
    background_tasks: BackgroundTasks,
    month: date | None = Query(
        default=None,
        description="Reprocess a single calendar month (backfill). "
        "Defaults to incremental from the last successful watermark.",
    ),
) -> TriggerResponse:
    """Kick off the ETL flow in background.

    The flow is imported from ``data/pipelines/pipeline`` — this endpoint does
    NOT re-implement extraction, transformation or load.
    """
    run_id = str(uuid.uuid4())

    def _run() -> None:
        import asyncio

        asyncio.run(
            business_performance_etl_flow(run_id=run_id, month_start=month)
        )

    background_tasks.add_task(_run)
    logger.info("Pipeline run %s submitted (month=%s)", run_id, month)
    return TriggerResponse(message="Pipeline run submitted", flow_run_id=run_id)


@router.get(
    "/monthly-clinic-supply-performance",
    response_model=ClinicKpiResponse,
    summary="Monthly per-clinic supply KPIs (board report)",
)
async def monthly_clinic_supply_performance(
    month: date | None = Query(
        default=None,
        description="Month to read (YYYY-MM-DD). Defaults to the most recent "
        "month present in the reporting table.",
    ),
) -> ClinicKpiResponse:
    """Read-only query over the destination table for the Part 3 dashboard."""
    target_month, rows = await get_monthly_clinic_supply_performance(month)

    if target_month is None:
        raise HTTPException(
            status_code=404,
            detail="No reporting data yet. Trigger the pipeline first: "
            "POST /reporting/pipeline-runs",
        )

    return ClinicKpiResponse(
        month_start=target_month,
        clinics=[ClinicKpi(**row) for row in rows],
    )