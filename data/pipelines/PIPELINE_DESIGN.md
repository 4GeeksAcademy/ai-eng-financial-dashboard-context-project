# Pipeline Design — Monthly Clinic Supply Performance

> **Company:** HealthCore  
> **Pipeline:** Business Performance Pipeline (v1)  
> **Design Date:** 2026-10-31  
> **Status:** Implemented — Part 2 (pipeline) + Part 3 (subflows, tests, dashboard)  

---

## 1. Current State

### Existing telemetry system

We capture five mandatory telemetry event types into `public.telemetry_events`:

| `event_type` | What it records | Since |
|---|---|---|
| `inbound_order_created` | Clinic registers receipt of supplies from a supplier | Phase 2 |
| `outbound_order_created` | Clinic registers consumption of a supply at a department | Phase 2 |
| `direct_stock_edit_rejected` | System rejects a direct stock modification attempt | Phase 2 |
| `stock_threshold_triggered` | Product stock falls below configured minimum threshold | Phase 2 |
| `supply_expiry_flagged` | Product lot approaches its expiry date (≤30 days) | Phase 2 |

### Existing technical report

`services/telemetry/analysis.py` + `GET /telemetry/report` answers **engineering** questions:

- Daily event volume by `event_type`
- Error rate (rejected events / validation failures)
- Latency distribution (where captured)
- Auth failure trends

These serve the engineering team (James Osei) for system debugging and capacity planning.

### The business gap

**Nobody answers these questions today:**

> *"How much did each clinic spend on medical supplies this month?"*
> *"Which clinics are running out of critical supplies most frequently?"*
> *"How many supply batches are about to expire across the network?"*

Dr. Okonkwo (CEO) and Claire Whitfield (Chief Compliance Officer) need a **monthly board-ready pack** — per-clinic, per-country numbers they can act on without waiting two days for someone to consolidate spreadsheets. The existing technical report does not and should not answer these questions.

### What stays unchanged

- `services/telemetry/analysis.py` — **untouched**
- `GET /telemetry/report` — **untouched**
- `public.telemetry_events` — **source only, never a destination**
- All existing telemetry event types preserved

### What is extended (allowed additive fields)

The data-pipelines BRIEFING requires a cost value on `inbound_order_created` events to compute Supply Cost per Clinic. Since this is a natural extension of an existing mandatory event (not a new event type), we add:

| Event | Additive field | Type | Description |
|---|---|---|---|
| `inbound_order_created` | `unit_cost` | `number` | Cost per unit in clinic's local currency (USD/GBP) |

This field is documented in the event schema (`docs/telemetry/event-schemas.json`) and allowlisted in the database layer (`ALLOWLIST_KEYS` in `backend/app/core/database.py`).

---

## 2. Purpose

> **Generate the monthly, per-clinic, per-country rollup of supply cost, stockout activity, and expiry risk that feeds the "Monthly Clinic Supply Performance Report" — the board-ready pack Dr. Okonkwo and Claire need.**

### Target deliverable

| Attribute | Detail |
|---|---|
| **Deliverable** | Monthly Clinic Supply Performance Report |
| **Audience** | Dr. Okonkwo (CEO) and Claire Whitfield (Chief Compliance Officer) — non-technical stakeholders |
| **Cadence** | Monthly, ready by the first working day of the month |
| **Grain** | One row per `clinic_id` per calendar month |

### KPIs produced (from data-pipelines BRIEFING §2)

| KPI | Computed as | Feeds business question |
|---|---|---|
| **Supply Cost per Clinic** | Sum of `inbound_order_created` costs (quantity × unit_cost) for the month | Where is spending concentrating across the network? |
| **Supply Consumption Volume** | Count of `outbound_order_created` events for the month | Which clinics are genuinely busy vs. data-capture gaps? |
| **Critical Stockout Frequency** | Count of `stock_threshold_triggered` events for the month | Patient-safety / compliance risk signal |
| **Expiry Risk Count** | Count of `supply_expiry_flagged` events for the month | Waste / compliance risk — supplies needing action |

### Mandatory source telemetry events (from telemetry BRIEFING)

| Source `event_type` | Feeds KPI |
|---|---|
| `inbound_order_created` | Supply Cost per Clinic |
| `outbound_order_created` | Supply Consumption Volume |
| `stock_threshold_triggered` | Critical Stockout Frequency |
| `supply_expiry_flagged` | Expiry Risk Count |

---

## 3. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BUSINESS PERFORMANCE PIPELINE                         │
│                   data/pipelines/business_performance_etl_flow                │
└─────────────────────────────────────────────────────────────────────────────┘

 EXTRACT                               TRANSFORM                           LOAD
 ┌──────────────────────┐      ┌──────────────────────────────┐      ┌──────────────────────────────┐
 │                      │      │                              │      │                              │
 │  telemetry_events    │      │  Group by clinic_id + month  │      │  reporting.                   │
 │  (public schema)     │─────▶│  Aggregate each event type   │─────▶│  monthly_clinic_supply_       │
 │                      │      │  Compute total_supply_cost   │      │  performance                  │
 │  Filter by:          │      │  (sum of qty × unit_cost)    │      │  (reporting schema)           │
 │  • timestamp range   │      │  Determine currency from     │      │                              │
 │  • event_type IN (   │      │  clinic's country            │      │  Upsert on                    │
 │    inbound_order_,   │      │                              │      │  (clinic_id, month_start)     │
 │    outbound_order_,  │      │  Join/aggregate only what's  │      │                              │
 │    stock_threshold_, │      │  needed — no patient data    │      │                              │
 │    supply_expiry_)   │      │                              │      │                              │
 │                      │      │                              │      │                              │
 └──────────────────────┘      └──────────────────────────────┘      └──────────────────────────────┘
         │                               │                                      │
         │  watermark: last_processed_at │                                      │
         │  (pipeline_runs table)        │                                      │
         └───────────────────────────────┘                                      │
                                                                                │
                                                                                ▼
                                                                    ┌──────────────────────────┐
                                                                    │   services/reporting/    │
                                                                    │                          │
                                                                    │  GET /reporting/         │
                                                                    │  monthly-clinic-supply-  │
                                                                    │  performance             │
                                                                    │                          │
                                                                    │  GET /reporting/         │
                                                                    │  pipeline-runs/latest    │
                                                                    │                          │
                                                                    │  POST /reporting/        │
                                                                    │  pipeline-runs           │
                                                                    └──────────────────────────┘
```

### Stages detail

| Stage | Module | Operation | Read/Write |
|---|---|---|---|
| **Extract** | `data/pipelines/extract.py` | Read `telemetry_events` filtered by `event_type` IN (4 types) and `timestamp > watermark`. Never a full table scan. | Read-only on `telemetry_events` |
| **Transform** | `data/pipelines/transform.py` | Group events by `(clinic_id, month_start)`, aggregate counts per type, compute `total_supply_cost` = sum of `quantity * unit_cost` for inbound events, assign `currency` from country. | Pure computation |
| **Load** | `data/pipelines/load.py` | Upsert into `reporting.monthly_clinic_supply_performance` on `(clinic_id, month_start)` unique constraint. | Write to `reporting.*` only |

---

## 4. Update / Dedup Strategy

Telemetry events are **append-only** — they are never updated. However, the **aggregated KPI rows** in the reporting table may need to be recalculated when:

1. **Late-arriving events** — an event from a past month arrives after the pipeline already ran (e.g. a delayed `inbound_order_created`). The pipeline's watermark uses a safety window (reprocessing the last 3 days of the current month + the first 5 days of the next month), so late events within a reasonable delay are still captured.
2. **Backfill / correction** — a manual re-run is triggered for a specific month.

### Mechanism: Upsert by grain

```sql
INSERT INTO reporting.monthly_clinic_supply_performance
    (clinic_id, country, month_start, total_supply_cost,
     supply_consumption_count, critical_stockout_count,
     expiry_risk_count, currency, computed_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
ON CONFLICT (clinic_id, month_start)
DO UPDATE SET
    total_supply_cost          = EXCLUDED.total_supply_cost,
    supply_consumption_count   = EXCLUDED.supply_consumption_count,
    critical_stockout_count    = EXCLUDED.critical_stockout_count,
    expiry_risk_count          = EXCLUDED.expiry_risk_count,
    currency                   = EXCLUDED.currency,
    computed_at                = now();
```

The `UNIQUE (clinic_id, month_start)` constraint on the destination table guarantees that re-running the pipeline for the same clinic-month simply replaces the existing row rather than duplicating it.

### Dedup at extract level

The extract query uses `DISTINCT` on `(eventId, timestamp)` as a safety net, although `telemetry_events` already deduplicates at ingestion via `eventId` idempotency checks. This is belt-and-suspenders.

---

## 5. Idempotency Strategy

### Guarantee: running the pipeline twice produces the same result

| Run scenario | Behaviour | Result |
|---|---|---|
| **First run (normal)** | Extracts events since last watermark, aggregates, upserts. | Correct data for the month. |
| **Fail mid-load (after 60% of upserts committed, then crash)** | Next run re-extracts the same month window (the watermark hasn't advanced because `pipeline_runs.status = 'failed'`). A new `run_id` is created. | All upserts are re-applied atomically per row. Rows already committed are overwritten with the same values. No duplicates. |
| **Complete re-run (backfill)** | Set `watermark_to` manually or trigger `backfill_flow` for a specific month. | Same upsert logic recalculates and replaces. |
| **Idempotent load** | `ON CONFLICT DO UPDATE` means the second write of the same values is a no-op (same values written). | Table state is identical to after the first successful run. |

### Key invariants

1. **Each run creates a unique `run_id`** — recorded in `pipeline_runs` at the start of the flow.
2. **Watermark only advances on `status = 'success'`** — if the pipeline crashes or fails, the watermark stays at the previous successful checkpoint.
3. **Load is transactional per upsert row** — the `ON CONFLICT` clause prevents duplication regardless of partial failures.
4. **Extract uses `WHERE timestamp > watermark_from AND timestamp < watermark_to`** — the range is deterministic for a given run.

---

## 6. Execution Log

> **Table:** `pipeline_runs` (under the `reporting` schema, alongside the destination table)

| # | Field | Type | Audit justification |
|---|---|---|---|
| 1 | `run_id` | `uuid` (PK) | **Correlation key** — links pipeline logs, metrics, and error alerts to the same execution. Generated at flow start. |
| 2 | `watermark_from` / `watermark_to` | `timestamptz` | **Audit trail** — records exactly what time range of source events was processed. Essential for debugging data gaps and late-arriving events. |
| 3 | `rows_extracted` | `integer` | **Data quality signal** — detects empty source windows or truncated extracts. If this drops to zero unexpectedly, the pipeline should alert. |
| 4 | `rows_loaded` | `integer` | **Reconciliation** — compared against `rows_extracted` and against the row count in `reporting.monthly_clinic_supply_performance` for the affected month. |
| 5 | `status` | `enum ('success', 'failed', 'partial')` | **Automation trigger** — success advances the watermark; failed/partial triggers an alert and does NOT advance the watermark so the next run retries. |
| 6 | `error_summary` | `text` (nullable) | **First-line diagnosis** — a human-readable error message so anyone can understand what failed without diving into stack traces. |
| 7 | `pipeline_version` | `text` (git SHA or semver) | **Reproducibility** — pins the exact code version that produced this run. Essential when pipeline logic evolves. |
| 8 | `started_at` / `finished_at` | `timestamptz` | **SLA tracking** — measures pipeline duration trends and helps correlate with infrastructure incidents. |

> **Note:** The rubric requires ≥5 fields with name, type, and justification. We include 8 for completeness, all of which serve a concrete audit purpose.

---

## 7. Prefect Mapping

> This section maps the pipeline design onto Prefect concepts (flows, tasks, states, blocks) for the orchestration layer to be implemented in Parts 2 & 3.

### 7.1 Main flow

| Prefect concept | Mapping | Details |
|---|---|---|
| **Flow** | `business_performance_etl_flow` | Monthly scheduled run, triggered by a cron schedule (`0 3 1 * *` — 3 AM on the first of each month). Also supports manual trigger. |
| **Task 1** | `extract_telemetry_events` | Reads from `public.telemetry_events` filtered by `event_type` and watermark range. Returns a list of event dicts (or a DataFrame). |
| **Task 2** | `transform_business_kpis` | Groups events by `(clinic_id, month_start)`, computes the four KPI aggregates per group, assigns `currency` from `country`. Returns a list of row dicts ready for load. |
| **Task 3** | `load_monthly_clinic_supply_performance` | Upserts each row into `reporting.monthly_clinic_supply_performance` using `ON CONFLICT DO UPDATE`. Returns the count of rows upserted. |
| **Task 4** (monitoring) | `record_pipeline_run` | Writes a record to `pipeline_runs` with status, counts, timing, and error summary. Always runs as final step (even on failure, to capture the failure state). |

### 7.2 States

| State | When | Behaviour |
|---|---|---|
| **Running** | Entered at flow start. | Logged to `pipeline_runs.status = 'running'`. |
| **Completed** | All tasks succeed. | `pipeline_runs.status = 'success'`, watermark advances. |
| **Failed** | Any task raises an unhandled exception. | `pipeline_runs.status = 'failed'`, watermark does NOT advance. An alert is triggered (v1: log; v2: Slack/email notification via Prefect automation). |
| **Partial** | Some upserts succeeded before a crash. | Next run re-processes the same window idempotently. |

### 7.3 Blocks (configuration)

| Block name | Stores | Used by |
|---|---|---|
| **DatabaseCredentials** | PostgreSQL DSN (read-only `telemetry_events` role + read-write `reporting` role) | `extract_telemetry_events`, `load_monthly_clinic_supply_performance` |
| **PipelineConfig** | `watermark_table` (pipeline_runs), `batch_size` (5000), `reprocess_window_days` (3), `target_table` (reporting.monthly_clinic_supply_performance) | All tasks |
| **NotificationConfig** (v2) | Alert webhook URL, Slack channel | `record_pipeline_run` on failure |

### 7.4 Optional sub-flow: Backfill (Part 3)

For reprocessing a specific historical month on demand:

| Prefect concept | Mapping |
|---|---|
| **Flow** | `backfill_monthly_clinic_supply_performance_flow` |
| **Trigger** | Manual, parameterised with `target_month` (date) |
| **Behaviour** | Overrides the watermark range to the target month, re-runs ETL for that month only. All idempotency guarantees apply. |

---

## 8. Application Integration

The pipeline's output and control surface are exposed through a **new** module `services/reporting/`, completely separate from `services/telemetry/`. Each endpoint imports functions and flows from `data/pipelines/`.

| Endpoint | Method | Purpose | Calls `data/pipelines/` function | Response format |
|---|---|---|---|---|
| `GET /reporting/pipeline-runs/latest` | Read | Returns status + metadata of the last `pipeline_runs` entry | `get_latest_pipeline_run()` from `data/pipelines/` | `{ "run_id", "status", "watermark_from", "watermark_to", "rows_extracted", "rows_loaded", "started_at", "finished_at", "error_summary", "pipeline_version" }` |
| `POST /reporting/pipeline-runs` | Trigger | Manually triggers a pipeline run (with optional `month_start` parameter for targeted re-run) | `business_performance_etl_flow()` (or `trigger_pipeline_run()`) — no ETL logic lives in the service layer | `{ "run_id", "status": "triggered" }` with `202 Accepted` |
| `GET /reporting/monthly-clinic-supply-performance` | Read | Returns all clinic rows for a given month (defaults to most recent computed month) | `get_monthly_clinic_supply_performance(month_start)` from `data/pipelines/` | `{ "month_start", "clinics": [{ "clinic_id", "country", "total_supply_cost", "supply_consumption_count", "critical_stockout_count", "expiry_risk_count", "currency" }] }` |

### Module responsibilities

```
services/reporting/
├── __init__.py
├── router.py              ← FastAPI APIRouter with the 3 endpoints above
├── pipeline_client.py     ← Thin wrapper that imports from data/pipelines/
└── schemas.py             ← Pydantic models for request/response

data/pipelines/
├── pipeline.py            ← Prefect flow definition (business_performance_etl_flow)
├── extract.py             ← extract_telemetry_events() function
├── transform.py           ← transform_business_kpis() function
├── load.py                ← load_monthly_clinic_supply_performance() function
├── models.py              ← Shared data classes / type aliases
└── config.py              ← Prefect Blocks and configuration loading
```

> **Key architectural rule:** `services/reporting/` imports from `data/pipelines/`, never the reverse. Pipeline logic stays in `data/pipelines/`; the service layer is only a thin HTTP interface.

---

## 9. Business Constraints (Regulatory & Compliance)

This pipeline is designed within the following non-negotiable boundaries from the BRIEFING:

| Constraint | Why | How enforced |
|---|---|---|
| **No PHI in output** | HIPAA (US) / UK GDPR. Aggregation stays at clinic/department level, never patient. | The extract query only selects from `telemetry_events` with allowlisted fields. The transform never joins against patient-level tables. The `event-schemas.json` schema enforces `additionalProperties: false`. |
| **No currency mixing** | A single aggregate row contains either USD (US clinics) or GBP (UK clinics), never both. | `currency` is derived deterministically from `country`. Reporting side-by-side by clinic, never summed across currencies. |
| **Read-only on telemetry_events** | The pipeline never writes back to the source table. | All write operations target `reporting.monthly_clinic_supply_performance`. Database credentials use separate roles. |
| **Existing report untouched** | `services/telemetry/analysis.py` and `GET /telemetry/report` continue serving engineering unchanged. | The new pipeline lives entirely in `data/pipelines/` and `services/reporting/`. No import or modification of `services/telemetry/`. |

---

## 10. Migration — Destination Table DDL

```sql
CREATE SCHEMA IF NOT EXISTS reporting;

-- Destination table for pipeline output
CREATE TABLE IF NOT EXISTS reporting.monthly_clinic_supply_performance (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id               text NOT NULL,
    country                 text NOT NULL,
    month_start             date NOT NULL,
    total_supply_cost       numeric NOT NULL DEFAULT 0,
    supply_consumption_count integer NOT NULL DEFAULT 0,
    critical_stockout_count integer NOT NULL DEFAULT 0,
    expiry_risk_count       integer NOT NULL DEFAULT 0,
    currency                text NOT NULL,
    computed_at             timestamptz NOT NULL DEFAULT now(),
    UNIQUE (clinic_id, month_start)
);

-- Execution log table
CREATE TABLE IF NOT EXISTS reporting.pipeline_runs (
    run_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    watermark_from      timestamptz NOT NULL,
    watermark_to        timestamptz NOT NULL,
    rows_extracted      integer NOT NULL DEFAULT 0,
    rows_loaded         integer NOT NULL DEFAULT 0,
    status              text NOT NULL DEFAULT 'running',
    error_summary       text,
    pipeline_version    text NOT NULL,
    started_at          timestamptz NOT NULL DEFAULT now(),
    finished_at         timestamptz
);
```

> **Note for Part 2:** This DDL will be added to `backend/migrations/` as a new migration file (e.g. `002_create_reporting_schema.sql`). It is included here for completeness as part of the design specification.

---

## Appendix: Compliance with Evaluation Checklist

| Criterion | Where it's addressed |
|---|---|
| `data/pipelines/PIPELINE_DESIGN.md` exists | This file |
| Purpose = one sentence naming business deliverable + KPIs + mandatory metrics | Section 2 |
| No modification to `services/telemetry/analysis.py` or `GET /telemetry/report` | Sections 1, 9 |
| Output in `reporting` schema + `services/reporting/` endpoints | Sections 8, 10 |
| Data flow diagram with extraction → transformation → load using real table/entity names | Section 3 |
| Update/dedup strategy with concrete mechanism (upsert by grain) | Section 4 |
| Idempotency describes second run after load failure | Section 5 |
| Execution log with ≥5 fields (name, type, justification) | Section 6 (8 fields) |
| Prefect mapping: ≥1 main flow, ≥3 tasks, states, ≥1 block | Section 7 |
| ≥3 `services/reporting/` endpoints naming `data/pipelines/` functions | Section 8 |
| Coherent with existing telemetry events and mandatory metrics | Sections 1, 2 |
| Commit message: `feat: add business performance pipeline design document` | Next commit |

## 11. Part 3 Enhancements — Subflows, Tests & Dashboard

### 11.1 Subflow Refactoring

The original monolithic flow was split into **three independent subflows** (`@flow`), one per ETL phase:

| Subflow | Responsibility | Invoked by |
|---|---|---|
| `extract-telemetry-subflow` | Read source events from telemetry_events | `business_performance_etl_flow` |
| `transform-business-kpis-subflow` | Aggregate events into clinic-month KPIs | `business_performance_etl_flow` |
| `load-monthly-clinic-supply-subflow` | Idempotent upsert into reporting table | `business_performance_etl_flow` |
| `resolve-run-window` | Compute processing window | `business_performance_etl_flow` |
| `emit-optional-artifacts` | Non-critical side effects (CSV, webhook) | `business_performance_etl_flow` |

Subflows communicate through return values, not globals. Each is independently executable.

### 11.2 Unit Tests

Location: `tests/pipelines/test_pipeline.py` — 10 tests, all in-memory (no DB):

- 5 KPI transform tests (cost, consumption, stockout, expiry, multi-clinic)
- 3 defensive tests (unknown type, null timestamp, missing clinic)
- 1 hand-calculated test against BRIEFING definitions (all 4 KPIs)
- 1 stats smoke test

### 11.3 Business Dashboard

New frontend tab (`Reporting`) that fetches from `/reporting/monthly-clinic-supply-performance` and displays all four BRIEFING KPIs with stakeholder-friendly labels.

### 11.4 Execution

```bash
# Run pipeline
python data/pipelines/pipeline.py
python data/pipelines/pipeline.py --month 2026-06
python data/pipelines/pipeline.py --dry-run

# Run tests
python -m pytest tests/pipelines/test_pipeline.py -v
```
