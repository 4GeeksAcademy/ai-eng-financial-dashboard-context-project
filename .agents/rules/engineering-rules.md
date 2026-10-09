# Project Engineering Rules

These English-only rules operationalize [`../../verificacions-phase2.md`](../../verificacions-phase2.md) and [`../../AGENTS.md`](../../AGENTS.md).

Each rule provides its name, scope, justification, project guidance, and repository evidence. Evidence describes current implementation and does not require preserving a known mismatch.

## 1. English source and technical language

- **Name:** `english-source-and-docs`
- **Scope:** All source code, including identifiers, comments, docstrings, technical messages, API names, tests, and user-facing string literals.
- **Justification:** A single technical/documentation language improves searchability and reduces translation drift.
- **Project guidance:** Write all frontend/backend code and UI string literals in English. Do not translate API fields or domain identifiers. All Markdown is English except the root `README.es.md`, which must stay aligned with `README.md`.
- **Repository evidence:** API fields/literals are English in [routes.py](../../backend/app/routes.py); dashboard labels are English in [kpi-row.tsx](../../frontend/src/components/dashboard/kpi-row.tsx).

## 2. README localization boundary

- **Name:** `spanish-readme-only`
- **Scope:** Localization of project documentation.
- **Justification:** Keep one English source of truth while providing a Spanish onboarding README.
- **Project guidance:** Keep all Markdown except the root `README.es.md` in English. When setup or product facts in `README.md` change, update `README.es.md` in the same change. Do not create other `.es.md` files.
- **Repository evidence:** [README.md](../../README.md) and [README.es.md](../../README.es.md) follow this convention.

## 3. Idiomatic naming

- **Name:** `idiomatic-naming`
- **Scope:** Source filenames, components, types, functions, variables, and tests.
- **Justification:** Language-idiomatic names make code easier to read and extend.
- **Project guidance:** Use PascalCase for React components/exported types, kebab-case for component filenames, camelCase for TypeScript variables/functions, and snake_case for Python functions/variables. Use `test_*.py` and `*.test.ts`/`*.test.tsx` for tests.
- **Repository evidence:** [kpi-card.tsx](../../frontend/src/components/dashboard/kpi-card.tsx) exports `KPICard`; [routes.py](../../backend/app/routes.py) defines `generate_mock_movements`.

## 4. Frontend responsibility boundaries

- **Name:** `separate-ui-domain-and-types`
- **Scope:** React composition, reusable components, domain calculations, and types.
- **Justification:** Separation keeps logic testable and prevents business behavior accumulating in presentation components.
- **Project guidance:** Keep composition in `App.tsx` or feature entry components, calculations in `src/lib`, and domain types in their relevant type module. Keep substantial financial calculations out of chart/card rendering.
- **Repository evidence:** [App.tsx](../../frontend/src/App.tsx), [financial-utils.ts](../../frontend/src/lib/financial-utils.ts), [financial-types.ts](../../frontend/src/lib/financial-types.ts).

## 5. Frontend feature structure

- **Name:** `group-components-by-feature`
- **Scope:** Feature components and shared UI primitives.
- **Justification:** Feature grouping improves discoverability; shared primitives reduce duplication.
- **Project guidance:** Put dashboard components in `src/components/dashboard` and reusable primitives in `src/components/ui`. Keep structure proportional to feature size; do not add layers for trivial components.
- **Repository evidence:** [kpi-row.tsx](../../frontend/src/components/dashboard/kpi-row.tsx), [card.tsx](../../frontend/src/components/ui/card.tsx).

## 6. Proportional backend boundaries

- **Name:** `explicit-api-boundaries-with-proportional-layers`
- **Scope:** FastAPI routes, request/response models, validation, and domain helpers.
- **Justification:** Explicit boundaries protect API contracts without imposing premature architecture.
- **Project guidance:** Keep route parameters and response models explicit. Split routers/services when `routes.py` becomes hard to maintain; do not add layers without a concrete use case.
- **Repository evidence:** [routes.py](../../backend/app/routes.py) contains models, helpers, and routes; [main.py](../../backend/app/main.py) registers the router.

## 7. Typed API contracts

- **Name:** `validate-api-contracts`
- **Scope:** HTTP parameters, response schemas, and frontend domain representations.
- **Justification:** Typed validation catches invalid inputs and reduces frontend/backend drift.
- **Project guidance:** Use Pydantic models, FastAPI `response_model`, and `Literal` or equivalent validation. Update corresponding TypeScript types when payloads change.
- **Repository evidence:** [routes.py](../../backend/app/routes.py) declares Pydantic models and `Literal` filters; frontend shapes are in [financial-types.ts](../../frontend/src/lib/financial-types.ts).

## 8. Reuse frontend imports and UI

- **Name:** `reuse-configured-imports-and-ui`
- **Scope:** Frontend imports, class composition, shared components, and theme values.
- **Justification:** Reuse reduces brittle paths and inconsistent styling.
- **Project guidance:** Use `@/` for imports rooted at `src`, `cn()` for conditional Tailwind classes, shared `Card`/`Skeleton` where applicable, and existing CSS variables for colors.
- **Repository evidence:** Alias in [vite.config.ts](../../frontend/vite.config.ts) and [tsconfig.app.json](../../frontend/tsconfig.app.json); helper in [utils.ts](../../frontend/src/lib/utils.ts); tokens in [index.css](../../frontend/src/index.css).

## 9. Behavior-focused tests

- **Name:** `test-changed-behavior-at-its-layer`
- **Scope:** Changed frontend calculations/components and backend helpers/endpoints.
- **Justification:** Tests at the owning layer provide focused regression coverage and explicit expectations.
- **Project guidance:** Put backend tests in `backend/tests/` and use pytest/FastAPI `TestClient`. Place frontend unit tests beside the covered module and use Vitest. Cover relevant boundaries/errors, not only happy-path response shapes.
- **Repository evidence:** [test_routes.py](../../backend/tests/test_routes.py), [financial-utils.test.ts](../../frontend/src/lib/financial-utils.test.ts).

## 10. Honest verification reporting

- **Name:** `report-only-executed-checks`
- **Scope:** Validation summaries from agents and contributors.
- **Justification:** Clear evidence distinguishes static inspection from runtime behavior.
- **Project guidance:** State actual commands and results. Distinguish static review, existing tests, and executed tests; never claim an unrun test passed.
- **Repository evidence:** [verifications.md](../../verifications.md) records static review and that tests were not run.

## 11. Synthetic data boundaries

- **Name:** `keep-mocks-out-of-production-data-flows`
- **Scope:** Demo generators, fixtures, and mock datasets.
- **Justification:** Demo data must not be mistaken for real records or become an undocumented source of truth.
- **Project guidance:** Mark generated/fixture data as demo/test, keep one intentional source per active flow, and state its provenance in UI/docs.
- **Repository evidence:** [routes.py](../../backend/app/routes.py) generates data; [mock-data.ts](../../frontend/src/lib/mock-data.ts) is not imported by active [App.tsx](../../frontend/src/App.tsx).

## 12. Local development entry point

- **Name:** `document-compose-as-local-entrypoint`
- **Scope:** Local setup and service access.
- **Justification:** A repeatable entry point simplifies onboarding and aligns environments.
- **Project guidance:** Document `docker compose up --build`, service URLs, API docs URL, and required environment configuration in both README files.
- **Repository evidence:** [docker-compose.yml](../../docker-compose.yml), [README.md](../../README.md), [README.es.md](../../README.es.md).

## 13. Secrets and environment configuration

- **Name:** `never-hardcode-secrets-or-deployment-values`
- **Scope:** Source, tests, docs, fixtures, configuration, and logs.
- **Justification:** Hardcoded secrets can leak and make deployments unsafe or difficult to change.
- **Project guidance:** Never commit credentials, tokens, API keys, private URLs, or environment-specific secrets. Use environment variables or an approved secret store; commit placeholders only and never log secrets.
- **Repository evidence:** [.gitignore](../../.gitignore) excludes `.env`/`.env.*` while allowing `.env.example`; [README.md](../../README.md) documents `VITE_API_BASE_URL`.

## 14. Secure production configuration

- **Name:** `separate-development-and-production-security-settings`
- **Scope:** CORS, debug servers, autoreload, ports, and deployment configuration.
- **Justification:** Development conveniences can expose services when copied to production.
- **Project guidance:** Restrict CORS to approved origins outside local development. Disable debugpy, autoreload, and debug ports in production; make environment mode explicit.
- **Repository evidence:** [main.py](../../backend/app/main.py) configures wildcard CORS; [backend/Dockerfile](../../backend/Dockerfile) starts development autoreload/debugpy.

## 15. AI-assisted change discipline

- **Name:** `ground-ai-changes-in-repository-context`
- **Scope:** Agents analyzing, editing, testing, and reporting changes.
- **Justification:** Context-grounded, narrow changes reduce invented behavior, unrelated refactors, and accidental loss of user work.
- **Project guidance:** Read [AGENTS.md](../../AGENTS.md) and this file. Inspect owning code and nearby tests; state a behavior hypothesis; make the smallest relevant change; preserve user changes; run the cheapest focused check; report uncertainty and actual results. Do not claim unused API routes are UI features.
- **Repository evidence:** [AGENTS.md](../../AGENTS.md) requires preserving user changes and reporting checks; [App.tsx](../../frontend/src/App.tsx) consumes only `/api/metrics` although [routes.py](../../backend/app/routes.py) defines more routes.

## 16. Keep findings separate from policy

- **Name:** `keep-findings-separate-from-policy`
- **Scope:** Reviews, implementation inventories, and standards.
- **Justification:** Observed behavior changes; approved rules should remain explicit and separately maintained.
- **Project guidance:** Use [verifications.md](../../verifications.md) for dated findings/evidence and this file for normative rules. Refresh evidence when implementation changes.
- **Repository evidence:** [verifications.md](../../verifications.md) records review scope, endpoint catalog, and limitations.

## Excluded in this phase

Do not add a mandatory automated formatting/lint policy or backend dependency-pinning policy based on this document. The team deferred both decisions.
