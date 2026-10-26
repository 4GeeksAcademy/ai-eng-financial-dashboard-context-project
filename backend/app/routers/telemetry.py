"""
Telemetry event ingestion endpoint for HealthCore.

Receives batches of telemetry events from the frontend capture service,
validates each event individually using the TelemetryEvent Pydantic model
(unchanged from Phase 2), persists valid events via a single bulk INSERT,
and reports how many were stored vs rejected.

Design invariant: same URL, same 200 success code as the Phase 2 stub.
The frontend TelemetryService does not need to change.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter
from pydantic import ValidationError

from app.core.database import _map_event_to_row, bulk_insert_telemetry
from app.schemas.telemetry import TelemetryBatch, TelemetryBatchResponse, TelemetryEvent

logger = logging.getLogger("api.telemetry")

router = APIRouter()


@router.post("/telemetry/events", response_model=TelemetryBatchResponse)
async def ingest_telemetry_events(batch: TelemetryBatch) -> TelemetryBatchResponse:
    """Receive a batch of telemetry events, validate per-event, and bulk-insert.

    Events are validated individually using TelemetryEvent.model_validate().
    Valid events are persisted in a single bulk INSERT.  Invalid events are
    counted in `rejected` but do NOT cause the entire batch to fail.

    Args:
        batch: A TelemetryBatch containing a raw list of event dicts.

    Returns:
        TelemetryBatchResponse with received, stored, and rejected counts.
    """
    raw_events = batch.events
    total = len(raw_events)

    logger.info(
        "Telemetry batch received: %d event(s)",
        total,
    )

    valid_rows: list[dict] = []
    rejected = 0

    for raw in raw_events:
        try:
            event = TelemetryEvent.model_validate(raw)
            valid_rows.append(_map_event_to_row(event.model_dump()))
        except ValidationError as exc:
            rejected += 1
            logger.debug(
                "Rejected event: %s — errors: %s",
                raw.get("eventId", "<no eventId>"),
                exc.errors(),
            )

    stored = 0
    if valid_rows:
        stored = await bulk_insert_telemetry(valid_rows)

    logger.info(
        "Telemetry batch processed: received=%d stored=%d rejected=%d",
        total,
        stored,
        rejected,
    )

    return TelemetryBatchResponse(
        received=total,
        stored=stored,
        rejected=rejected,
    )