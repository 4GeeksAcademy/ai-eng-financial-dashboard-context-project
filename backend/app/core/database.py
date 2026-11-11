"""
PostgreSQL connection pool and repository for telemetry events.

Provides:
  - init_db() / close_db() — lifecycle hooks called from FastAPI lifespan
  - bulk_insert_telemetry() — single-transaction batch insert for validated events
"""

from __future__ import annotations

import logging
import os
import json
from datetime import datetime, timezone
from typing import Any

import asyncpg

logger = logging.getLogger("api.database")

_pool: asyncpg.Pool | None = None

# Allowlist of property keys that are stored in the `tags` JSONB column.
# These match the dimensions defined in docs/telemetry/telemetry-plan.md
# and align with the company BRIEFING (clinic_id, country, product_id,
# product_category, department, etc.).
ALLOWLIST_KEYS: frozenset[str] = frozenset({
    # Inventory dimensions (from BRIEFING mandatory events)
    "clinic_id",
    "country",
    "product_id",
    "product_category",
    "quantity",
    "department",
    "orderId",
    "supplier_id",
    "supplier_name",
    "lot_id",
    "reorder_point",
    "available_stock",
    # Cost fields for business performance pipeline (data-pipelines BRIEFING)
    "unit_cost",
    "total_cost",
    # Stock threshold / expiry alerts (M3, M5)
    "currentStock",
    "threshold",
    "trigger_source",
    "expiry_date",
    "days_to_expiry",
    "quantity_on_lot",
    # Direct edit rejection (M4) and validation failures (O1, O2)
    "attempted_field",
    "reject_reason",
    "attempted_quantity",
    "validation_rule",
    "field_name",
    "requested_quantity",
    # Auth / session dimensions (O4, O5)
    "section",
    "item_id",
    "reason",
    "method",
    "endpoint",
    "status_code",
    "error_message",
    "failure_reason",
    "username",
    "role",
    "auth_method",
    "entry_point",
    # Performance / latency dimensions (O6, O7)
    "duration_ms",
    "sampling",
    "http_status",
    "error_class",
    "error_message_hash",
    "client_region",
    # Frontend error dimensions (O8)
    "page",
    "component",
    "api_endpoint",
    # Incident dimensions (O12–O14)
    "incident_id",
    "severity",
    "responsible_area",
    "previous_status",
    "new_status",
    "time_to_resolution_hours",
    "channel",
})


def _derive_level(event_type: str) -> str:
    """Derive severity level from event_type."""
    if event_type.endswith(("_failed", "_rejected")):
        return "error"
    if event_type.endswith(("_triggered", "_flagged")):
        return "warn"
    return "info"


def _derive_value(properties: dict[str, Any]) -> float | None:
    """Extract an optional numeric value from properties.

    Used as a generic numeric payload for metrics that need a numeric
    dimension: `quantity`/`amount`/`value`/`available_stock` for inventory
    events, and `duration_ms` for latency events (O6 api_latency_recorded).
    """
    for key in (
        "quantity",
        "amount",
        "value",
        "available_stock",
        "duration_ms",
        "days_to_expiry",
        "time_to_resolution_hours",
    ):
        val = properties.get(key)
        if val is not None and isinstance(val, (int, float)):
            return float(val)
    return None


def _derive_message(event_type: str, properties: dict[str, Any]) -> str | None:
    """Build a short human-readable summary."""
    if event_type == "inbound_order_created":
        pid = properties.get("product_id", "?")
        qty = properties.get("quantity", "?")
        return f"Inbound {qty} units of {pid}"
    if event_type == "outbound_order_created":
        pid = properties.get("product_id", "?")
        qty = properties.get("quantity", "?")
        return f"Outbound {qty} units of {pid}"
    if event_type == "direct_stock_edit_rejected":
        return "Direct stock edit attempt rejected"
    if event_type == "stock_threshold_triggered":
        pid = properties.get("product_id", "?")
        return f"Stock threshold triggered for {pid}"
    if event_type == "login_failed":
        return "Login attempt failed"
    return None


def _filter_tags(properties: dict[str, Any]) -> dict[str, Any]:
    """Keep only allowlisted keys from the event properties object.

    Also preserves envelope metadata needed for analysis (eventId, sessionId,
    userId, schemaVersion, requestId) per the telemetry plan.
    """
    return {k: v for k, v in properties.items() if k in ALLOWLIST_KEYS}


def _map_event_to_row(event: dict[str, Any]) -> dict[str, Any]:
    """Transform a validated TelemetryEvent dict into a DB row dict."""
    properties: dict[str, Any] = event.get("properties", {})

    # Parse ISO 8601 timestamp string into a datetime object for PostgreSQL
    ts_str = event["timestamp"]
    try:
        ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
    except ValueError:
        ts = datetime.now(timezone.utc)

    return {
        "timestamp": ts,
        "service": "backoffice",
        "event_type": event["event_type"],
        "level": _derive_level(event["event_type"]),
        "value": _derive_value(properties),
        "message": _derive_message(event["event_type"], properties),
        "tags": _filter_tags(properties),
    }


async def init_db() -> None:
    """Create the asyncpg connection pool.

    Reads DATABASE_URL from the environment.  Falls back to a local
    Docker Compose Postgres if not set.
    """
    global _pool
    dsn = os.getenv(
        "DATABASE_URL",
        "postgresql://healthcore:healthcore_secret@host.docker.internal:5433/healthcore_telemetry",
    )
    logger.info("Connecting to database …")
    _pool = await asyncpg.create_pool(dsn, min_size=2, max_size=10)
    logger.info("Database pool ready (min=2, max=10)")


async def close_db() -> None:
    """Close the connection pool gracefully."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
        logger.info("Database pool closed")


async def bulk_insert_telemetry(rows: list[dict[str, Any]]) -> int:
    """Insert multiple telemetry event rows in a single bulk statement.

    Uses asyncpg's execute_values for a single multi-row INSERT.

    Args:
        rows: List of row dicts with keys matching telemetry_events columns.

    Returns:
        Number of rows inserted.

    Raises:
        RuntimeError: If the database pool is not initialised.
    """
    global _pool
    if _pool is None:
        raise RuntimeError("Database pool not initialised — call init_db() first")

    # Build tuples for execute_values
    records = []
    for r in rows:
        records.append((
            r["timestamp"],
            r["service"],
            r["event_type"],
            r["level"],
            r["value"],
            r["message"],
            json.dumps(r["tags"]),
        ))

    INSERT_SQL = """
        INSERT INTO telemetry_events (timestamp, service, event_type, level, value, message, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
    """

    inserted = 0
    async with _pool.acquire() as conn:
        async with conn.transaction():
            for record in records:
                await conn.execute(INSERT_SQL, *record)
                inserted += 1

    logger.info("Bulk inserted %d telemetry event(s)", inserted)
    return inserted


async def fetch_events(
    *,
    event_types: list[str] | None = None,
    start_date: datetime,
    end_date: datetime,
) -> list[dict[str, Any]]:
    """Load telemetry events for analysis with SQL push-down filtering.

    Both filtering dimensions that the metrics care about are pushed down
    to SQL (never applied in Pandas):

      - `timestamp` range with **inclusive start, exclusive end** so that
        grouping by day/date is deterministic and unambiguous.
      - `event_type` allow-list, including `IN (...)` for ratio metrics
        that need several types loaded in a single query.

    Rows are returned as plain dicts (camelCase `timestamp` preserved for
    `pd.to_datetime`), with the `tags` JSONB column expanded.  The caller
    is a metric function in ``app.analysis``; this repository never loads
    the full ``telemetry_events`` table into memory.

    Args:
        event_types: Optional list of event types to load.  When None, all
            event types are loaded (used by volume metrics that need the
            whole window).
        start_date: Inclusive lower bound (UTC).
        end_date: Exclusive upper bound (UTC).

    Returns:
        List of row dicts with keys ``id``, ``timestamp``, ``service``,
        ``event_type``, ``level``, ``value``, ``message`` and ``tags``.
    """
    global _pool
    if _pool is None:
        raise RuntimeError("Database pool not initialised — call init_db() first")

    where: list[str] = ["timestamp >= $1 AND timestamp < $2"]
    params: list[Any] = [start_date, end_date]

    if event_types:
        placeholders = ", ".join(f"${i}" for i in range(3, 3 + len(event_types)))
        where.append(f"event_type IN ({placeholders})")
        params.extend(event_types)

    sql = f"""
        SELECT id, timestamp, service, event_type, level, value, message, tags
        FROM telemetry_events
        WHERE {' AND '.join(where)}
        ORDER BY timestamp ASC
    """

    async with _pool.acquire() as conn:
        rows = await conn.fetch(sql, *params)

    return [dict(row) for row in rows]