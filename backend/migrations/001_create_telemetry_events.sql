-- Migration: Create telemetry_events table
-- DDL for HealthCore telemetry event storage.
-- This table is append-only: no UPDATE or DELETE paths exist in application code.

CREATE TABLE IF NOT EXISTS telemetry_events (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp   timestamptz NOT NULL,
    service     text        NOT NULL,
    event_type  text        NOT NULL,
    level       text        NOT NULL DEFAULT 'info',
    value       numeric     NULL,
    message     text        NULL,
    tags        jsonb       NOT NULL DEFAULT '{}'
);

-- Indexes for analytic queries (time range, event_type filtering, JSONB exploration)
CREATE INDEX IF NOT EXISTS idx_telemetry_events_timestamp ON telemetry_events (timestamp);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_event_type ON telemetry_events (event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_tags ON telemetry_events USING GIN (tags);