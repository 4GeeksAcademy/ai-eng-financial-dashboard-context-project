---
name: dashboard-release-qa
description: Run evidence-based pre-merge quality checks for this React, TypeScript, Vite, Recharts, and FastAPI financial dashboard.
---

# Dashboard Release QA

## Objective

Verify a change against this repository's actual frontend, API proxy, accessibility, and container workflow. Do not introduce Next.js or Vercel-only APIs: this frontend is a Vite SPA deployed for local integration through Docker Compose.

## Inputs

- The changed files or feature under review.
- The intended run target: frontend-only or integrated frontend plus API.
- Any known expected behavior or accessibility requirement.

## Procedure

1. Read the applicable `AGENTS.md`, available `.agents/rules`, this skill, and relevant component tests before editing. Treat missing instruction or memory directories as missing; do not infer their contents.
2. From `frontend/`, run `npm ci` when dependencies are absent, then run `npm test`, `npm run lint`, and `npm run build`.
3. For integrated verification, run `docker compose up --build -d` from the repository root. Confirm the dashboard responds at `http://localhost:5173/`, the proxied endpoint `http://localhost:5173/api/metrics` returns financial movements, and the direct API endpoint `http://localhost:8000/api/metrics` returns the same. Compose sets `VITE_API_PROXY_TARGET` to `http://host.docker.internal:8000` and maps `host.docker.internal` to `host-gateway`; keep those settings aligned. If direct API works but the proxy fails, report an inter-container/network issue rather than treating the frontend shell as an integrated pass. Stop the stack with `docker compose down` after verification unless it is being left available for the user to test.
4. For chart changes, preserve the shared `MonthlyDataPoint` contract and `financial-utils` formatting/calculation helpers. Keep a screen-reader-readable data alternative when changing the visual chart, and retain Recharts keyboard accessibility when charts are interactive.
5. For loading changes, preserve the existing dashboard geometry with same-size chart placeholders. Re-check the production build output for accidental eager chart imports and new chunk-size warnings.
6. For page metadata, edit `frontend/index.html`; this is a single-page Vite app, so do not add route-level metadata frameworks that the project does not use.
7. Report each finding with its repository file, the command or runtime evidence, and whether keyboard/screen-reader checks were directly exercised or remain pending. Do not describe static inspection or an HTTP response as a full browser accessibility audit.

## Expected output

A short pre-merge QA report containing changed behavior, commands and results, integrated URLs checked (if applicable), unresolved warnings or risks, and manual accessibility checks still needed.

## Acceptance criteria

- `npm test`, `npm run lint`, and `npm run build` pass from `frontend/`.
- The integrated dashboard, proxied `/api/metrics`, and direct API endpoint respond when Docker verification is requested.
- No new unexplained bundle warning or broken loading placeholder is introduced.
- Keyboard operation, accessible names/roles, chart data alternatives, and focus behavior are checked for affected UI; any check that could not run is explicitly identified.
- Recommendations use Vite/React/FastAPI patterns present in this repository and do not assume Next.js or Vercel deployment infrastructure.
