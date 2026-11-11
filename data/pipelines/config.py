"""Configuration for the HealthCore business performance pipeline.

Central place for everything the flow needs to be reproducible: database DSN,
destination table names, the four mandatory source event types from the
telemetry BRIEFING, the country → currency mapping and the processing window
rules agreed in ``PIPELINE_DESIGN.md``.

Nothing here talks to the network; it only reads environment variables and
exposes immutable settings so tasks stay thin.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Final

# Repository root (…/ai-eng-financial-dashboard-context-project)
REPO_ROOT: Final[Path] = Path(__file__).resolve().parents[2]
DATA_DIR: Final[Path] = REPO_ROOT / "data"
RAW_DIR: Final[Path] = DATA_DIR / "raw"
EVAL_DIR: Final[Path] = DATA_DIR / "eval"

#: Pipeline version persisted with every run (reproducibility, design §6).
PIPELINE_VERSION: Final[str] = os.getenv("PIPELINE_VERSION", "business-performance-pipeline/2.0.0")

#: Allowed source event types and the KPI each one feeds (design §2).
EVENT_TYPE_TO_KPI: Final[dict[str, str]] = {
    "inbound_order_created": "supply_cost_per_clinic",
    "outbound_order_created": "supply_consumption_volume",
    "stock_threshold_triggered": "critical_stockout_frequency",
    "supply_expiry_flagged": "expiry_risk_count",
}

#: Event types the extract task reads. Read-only against telemetry_events.
SOURCE_EVENT_TYPES: Final[tuple[str, ...]] = tuple(EVENT_TYPE_TO_KPI)

#: Country → currency. Never mixed inside a single row (design §9).
COUNTRY_CURRENCY: Final[dict[str, str]] = {"US": "USD", "UK": "GBP"}
DEFAULT_CURRENCY: Final[str] = "UNKNOWN"
UNKNOWN_COUNTRY: Final[str] = "UNKNOWN"

#: Destination objects (reporting schema only — never telemetry_events).
TARGET_SCHEMA: Final[str] = "reporting"
TARGET_TABLE: Final[str] = "monthly_clinic_supply_performance"
TARGET_TABLE_FQN: Final[str] = f"{TARGET_SCHEMA}.{TARGET_TABLE}"
RUNS_TABLE_FQN: Final[str] = f"{TARGET_SCHEMA}.pipeline_runs"

#: How far back the very first run looks when no successful run exists yet.
INITIAL_LOOKBACK_DAYS: Final[int] = int(os.getenv("PIPELINE_INITIAL_LOOKBACK_DAYS", "180"))

#: Safety window that re-reads the tail of already-processed months so
#: late-arriving events are absorbed (design §4).
REPROCESS_WINDOW_DAYS: Final[int] = int(os.getenv("PIPELINE_REPROCESS_WINDOW_DAYS", "3"))

#: Prefect cache lifetime for the expensive transform task (design §7).
TRANSFORM_CACHE_TTL_HOURS: Final[int] = int(os.getenv("PIPELINE_TRANSFORM_CACHE_HOURS", "1"))

#: Retry policy for tasks that touch external services (PostgreSQL).
DB_RETRIES: Final[int] = int(os.getenv("PIPELINE_DB_RETRIES", "3"))
DB_RETRY_DELAY_SECONDS: Final[int] = int(os.getenv("PIPELINE_DB_RETRY_DELAY_SECONDS", "5"))

#: Write an extract snapshot to data/raw/ (input artefact for audits).
WRITE_RAW_SNAPSHOT: Final[bool] = os.getenv("PIPELINE_WRITE_RAW_SNAPSHOT", "1") not in {"0", "false", "False"}

#: Default DSN matches docker-compose.yml (db published on host port 5433).
DEFAULT_DATABASE_URL: Final[str] = (
    "postgresql://healthcore:healthcore_secret@host.docker.internal:5433/healthcore_telemetry"
)


def database_url() -> str:
    """Resolve the PostgreSQL DSN used by the pipeline tasks."""
    return os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)


@dataclass(frozen=True)
class PipelineSettings:
    """Immutable snapshot of the settings used by one run."""

    database_url: str = field(default_factory=database_url)
    target_table: str = TARGET_TABLE_FQN
    runs_table: str = RUNS_TABLE_FQN
    source_event_types: tuple[str, ...] = SOURCE_EVENT_TYPES
    pipeline_version: str = PIPELINE_VERSION
    reprocess_window_days: int = REPROCESS_WINDOW_DAYS


def get_settings() -> PipelineSettings:
    """Return the settings for the current process."""
    return PipelineSettings()
