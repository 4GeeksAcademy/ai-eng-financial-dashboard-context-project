"""Business performance pipeline package (Part 2).

The executable flow entry point lives in :mod:`data.pipelines.pipeline`.
"""

from __future__ import annotations

__all__ = [
    "business_performance_etl_flow",
    "backfill_monthly_clinic_supply_performance_flow",
    "trigger_run",
]


def __getattr__(name: str):
    """Lazy re-export so importing the package does not import Prefect."""
    if name in __all__:
        from data.pipelines import pipeline

        return getattr(pipeline, name)
    raise AttributeError(name)
