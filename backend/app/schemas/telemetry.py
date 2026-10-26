"""
Telemetry event schemas for HealthCore.

Defines the Pydantic models for the telemetry event envelope and batch
request used by the POST /telemetry/events endpoint.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class TelemetryEvent(BaseModel):
    """Standard event envelope shared by all HealthCore telemetry events.

    Matches the envelope defined in docs/telemetry/event-schemas.json
    and the approved telemetry-plan.md.
    """

    eventId: str = Field(..., description="Unique event identifier (UUID v4)")
    timestamp: str = Field(
        ...,
        description="Event timestamp in ISO 8601 UTC (capture time, not send time)",
    )
    sessionId: str = Field(..., description="Browser or API session identifier")
    userId: str = Field(
        ...,
        description="Authenticated operator identifier (may be hashed per PII policy)",
    )
    event_type: str = Field(
        ...,
        pattern=r"^[a-z]+_[a-z_]+$",
        description="Event type in entity_action taxonomy (e.g. order_submitted)",
    )
    schemaVersion: str = Field(
        ...,
        pattern=r"^[0-9]+\.[0-9]+\.[0-9]+$",
        description="Schema version for the event (semver)",
    )
    requestId: str = Field(
        ...,
        description="Correlation ID linking frontend, API, and logs",
    )
    properties: dict[str, Any] = Field(
        ...,
        description="Event-specific payload. Only properties from the defined allowlist are accepted.",
    )


class TelemetryBatch(BaseModel):
    """Batch of telemetry events sent from the frontend capture service.

    NOTE: events is declared as list[dict] (raw) so that FastAPI does NOT
    pre-validate each event against TelemetryEvent.  Validation is done
    inside the handler per-event so that invalid events don't reject the
    whole batch (partial acceptance).
    """

    events: list[dict]


class TelemetryBatchResponse(BaseModel):
    """Response returned by the POST /telemetry/events endpoint.

    Reports how many events were received, how many were stored,
    and how many were rejected due to validation failure.
    """

    received: int = Field(
        ...,
        description="Number of events received in the batch",
    )
    stored: int = Field(
        ...,
        description="Number of events successfully persisted",
    )
    rejected: int = Field(
        ...,
        description="Number of events rejected (failed validation)",
    )