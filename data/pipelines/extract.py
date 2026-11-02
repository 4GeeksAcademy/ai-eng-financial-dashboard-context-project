"""Extract stage — read source telemetry events (read-only).

The telemetry system intentionally keeps ``telemetry_events`` append-only. This
stage only ever reads it, filtered by:
  * the four mandatory business event types from the data-pipelines BRIEFING,
  * the processing window ``[watermark_from, watermark_to)``.

The window is computed by the pipeline flow and persisted per run, so the
extraction is deterministic for a given run id.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from data.pipelines.config import SOURCE_EVENT_TYPES
from data.pipelines.db import acquire_connection

logger = logging.getLogger(__name__)

_EXTRACT_SQL = """
    SELECT id, timestamp, event_type, value, tags
      FROM telemetry_events
     WHERE timestamp >= $1
       AND timestamp <  $2
       AND event_type = ANY($3::text[])
     ORDER BY timestamp ASC
"""


async def extract_telemetry_events(
    watermark_from: datetime,
    watermark_to: datetime,
    event_types: list[str] | None = None,
    dsn: str | None = None,
) -> list[dict[str, Any]]:
    """Read the source events inside the window.

    Retries live at the Prefect task level (see ``pipeline.py``) because this
    function talks to an external service (PostgreSQL): transient blips are
    absorbed without paging anyone.

    Args:
        watermark_from: Inclusive lower bound (UTC).
        watermark_to: Exclusive upper bound (UTC).
        event_types: Optional override; defaults to the mandatory four.
        dsn: Optional override of the database DSN.

    Returns:
        Row dicts with ``id``, ``timestamp``, ``event_type``, ``value``, ``tags``.
    """
    types = list(event_types or SOURCE_EVENT_TYPES)

    async with acquire_connection(dsn) as conn:
        rows = await conn.fetch(_EXTRACT_SQL, watermark_from, watermark_to, types)

    logger.debug(
        "Extracted %d event(s) in [%s, %s) for types=%s",
        len(rows),
        watermark_from.isoformat(),
        watermark_to.isoformat(),
        types,
    )
    return [dict(row) for row in rows]


def utc_now() -> datetime:
    """Aware "now" in UTC — factored out so tests can freeze it."""
    return datetime.now(timezone.utc)
