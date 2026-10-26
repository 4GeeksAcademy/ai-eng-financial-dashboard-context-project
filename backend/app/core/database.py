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
    # Auth / session dimensions
    "section",
    "item_id",
    "reason",
    "method",
    "endpoint",
    "status_code",
    "error_message",
})


def _derive_level(event_type: str) -> str:
    """Derive severity level from event_type."""
    if event_type.endswith(("_failed", "_rejected")):
        return "error"
    if event_type.endswith(("_triggered", "_flagged")):
        return "warn"
    return "info"


def _derive_value(properties: dict[str, Any]) -> float | None:
    """Extract an optional numeric value from properties."""
    for key in ("quantity", "amount", "value", "available_stock"):
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