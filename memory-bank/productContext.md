# Product Context — Why This Project Exists

_Last verified: 2026-10-09._

## Purpose

This is an **AI-engineering teaching project** (4Geeks Academy): the dashboard is the concrete artifact over which students practice an agent-driven engineering workflow — inspect a codebase, derive contributor rules, document findings, and maintain persistent context (this memory bank). See `README.md` "Recommended steps" and `AGENTS.md`.

The secondary purpose of the dashboard itself: give executives a fast read on financial health — total income vs. outcome, profit and profit %, and monthly trends — with B2B/B2C segmentation available through the API.

## Users and their goals

| User | Goal |
|---|---|
| Student / AI agent | Inspect, document, and evolve the repo safely using `.agents/rules/`, `memory-bank/`, `verification.md` |
| Executive viewer (persona) | At a glance: are we profitable, trending up or down, which months look off |
| API consumer (persona, future) | Query movements and analytics with filters (dates, category, operation type, business type) |

## Product decisions worth knowing

- **Mock data over a database** — keeps the exercise focused on architecture/agent workflow, not persistence. Deterministic via `seed=42` so tests are stable.
- **Today-relative dates** — mock data always spans the last ~12 months relative to `date.today()`, so the dashboard "looks current"; the period badge derives from the data rather than being hard-coded (fixed 2026-10-09).
- **Aggregation in the browser** — the frontend computes KPIs/charts from raw movements, keeping the backend a thin data source. Richer server-side analytics exist but are intentionally unused for now (rule 3).
- **Spanish-first UI, bilingual docs** — error banner and date labels are English-formatted currency ("en-US" locale, USD); copy in Spanish (`App.tsx`), docs in `README.md`/`README.es.md`.
- **Dev-only looseness is deliberate**: wildcard CORS, published debugpy port, `--reload` — documented as gaps (rules 10, 19) rather than fixed, because the target environment is local/Codespaces.

## Success criteria for the exercise

1. Rules in `.agents/rules/` are concrete, backed by verifiable repo facts, and actually followed by agents.
2. `verification.md` stays an honest audit trail (including ❌ findings and process notes).
3. The stack runs with one command (`docker compose up --build`) and its tests pass.
