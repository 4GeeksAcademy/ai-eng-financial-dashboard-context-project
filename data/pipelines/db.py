"""Database access for the business performance pipeline.

A small asyncpg helper used by both the CLI (``python data/pipelines/pipeline.py``)
and the HTTP trigger in ``services/reporting``. It is deliberately independent
of the FastAPI connection pool in ``backend/app/core/database.py`` so the
pipeline can run as a standalone script.

Access rules enforced here:
  * ``telemetry_events`` is only ever read.
  * Every write targets the ``reporting`` schema.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

import asyncpg

from data.pipelines.config import database_url


@asynccontextmanager
async def acquire_connection(dsn: str | None = None) -> AsyncIterator[asyncpg.Connection]:
    """Open a single dedicated connection for one pipeline operation."""
    conn = await asyncpg.connect(dsn or database_url())
    try:
        yield conn
    finally:
        await conn.close()


async def ping(dsn: str | None = None) -> bool:
    """Return True when the configured database is reachable."""
    async with acquire_connection(dsn) as conn:
        return await conn.fetchval("SELECT TRUE") is True


async def reporting_objects_exist(dsn: str | None = None) -> dict[str, bool]:
    """Report whether the destination tables from migration 002 exist."""
    sql = """
        SELECT
            to_regclass('reporting.monthly_clinic_supply_performance') IS NOT NULL
                AS performance_table,
            to_regclass('reporting.pipeline_runs') IS NOT NULL
                AS runs_table
    """
    async with acquire_connection(dsn) as conn:
        row = await conn.fetchrow(sql)
    return {
        "performance_table": bool(row["performance_table"]),
        "runs_table": bool(row["runs_table"]),
    }
