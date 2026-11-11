-- Migration: Create the business reporting schema (Part 2 pipeline output)
--
-- Two tables, both owned by the business performance pipeline:
--
--   reporting.monthly_clinic_supply_performance
--       Destination table from data/pipelines/PIPELINE_DESIGN.md §2 and §10.
--       Grain: one row per (clinic_id, month_start).
--
--   reporting.pipeline_runs
--       Execution log, one row per pipeline run (PIPELINE_DESIGN.md §6).
--       Also the source of truth for the high-water mark: the pipeline only
--       advances its watermark after a run finishes with status = 'success'.
--
-- telemetry_events is NOT touched by this migration: it remains the read-only
-- source used by both the technical report and this business pipeline.

CREATE SCHEMA IF NOT EXISTS reporting;

-- ---------------------------------------------------------------------------
-- Destination table (KPIs from the data-pipelines BRIEFING)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reporting.monthly_clinic_supply_performance (
    id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id                text        NOT NULL,
    country                  text        NOT NULL,
    month_start              date        NOT NULL,
    total_supply_cost        numeric     NOT NULL DEFAULT 0,
    supply_consumption_count integer     NOT NULL DEFAULT 0,
    critical_stockout_count  integer     NOT NULL DEFAULT 0,
    expiry_risk_count        integer     NOT NULL DEFAULT 0,
    currency                 text        NOT NULL,
    computed_at              timestamptz NOT NULL DEFAULT now(),
    -- Idempotency guard: the load task upserts ON CONFLICT of this grain.
    CONSTRAINT uq_monthly_clinic_supply_performance_clinic_month
        UNIQUE (clinic_id, month_start)
);

-- Part 3 dashboard reads a whole month at a time.
CREATE INDEX IF NOT EXISTS idx_monthly_clinic_supply_performance_month
    ON reporting.monthly_clinic_supply_performance (month_start DESC);

-- ---------------------------------------------------------------------------
-- Execution log (>= 5 metadata fields per run, per the milestone checklist)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reporting.pipeline_runs (
    run_id           uuid        PRIMARY KEY,
    status           text        NOT NULL DEFAULT 'running'
                     CHECK (status IN ('running', 'success', 'failed', 'partial')),
    watermark_from   timestamptz NOT NULL,
    watermark_to     timestamptz NOT NULL,
    rows_extracted   integer     NOT NULL DEFAULT 0,
    rows_loaded      integer     NOT NULL DEFAULT 0,
    error_summary    text,
    pipeline_version text        NOT NULL,
    started_at       timestamptz NOT NULL DEFAULT now(),
    finished_at      timestamptz
);

-- Latest-run lookup and watermark lookup both order by time.
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_started_at
    ON reporting.pipeline_runs (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_success_watermark
    ON reporting.pipeline_runs (watermark_to DESC)
    WHERE status = 'success';
