"""Reporting service package.

HTTP surface for the business performance pipeline. It is deliberately a thin
layer: it imports flows and query functions from ``data/pipelines`` and never
re-implements ETL logic (milestone rule). The telemetry service is untouched.
"""