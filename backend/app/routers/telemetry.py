"""
Telemetry ingestion stub for HealthCore.

Accepts batches of telemetry events from the frontend capture service,
validates the format, logs the event types received, and returns 200.
Does NOT persist anything — that is Phase 3.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter

from app.schemas.telemetry import TelemetryBatch, TelemetryBatchResponse

logger = logging.getLogger("api.telemetry")

router = APIRouter()


@router.post("/telemetry/events", response_model=TelemetryBatchResponse)
async def ingest_telemetry_events(batch: TelemetryBatch) -> TelemetryBatchResponse:
    """Receive a batch of telemetry events from the frontend capture service.

    This is a **stub** endpoint for Phase 2. It validates the incoming
    payload format, logs a summary of received event types, and returns
    a 200 response with the count of events received. No data is persisted
    to any database — that responsibility belongs to Phase 3.

    Args:
        batch: A TelemetryBatch containing an array of TelemetryEvent objects.

    Returns:
        TelemetryBatchResponse with the number of events received.
    """
    event_count = len(batch.events)
    event_types = [evt.event_type for evt in batch.events]

    logger.info(
        "Telemetry batch received: %d event(s) — types: %s",
        event_count,
        ", ".join(sorted(set(event_types))),
    )

    for evt in batch.events:
        logger.debug(
            "Event: eventId=%s event_type=%s schemaVersion=%s userId=%s sessionId=%s",
            evt.eventId,
            evt.event_type,
            evt.schemaVersion,
            evt.userId,
            evt.sessionId,
        )

    return TelemetryBatchResponse(received=event_count)