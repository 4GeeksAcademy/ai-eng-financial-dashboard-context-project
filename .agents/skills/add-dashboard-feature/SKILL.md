# Skill: Add a Frontend Dashboard Feature

## When to use

Adding or changing UI capabilities in `frontend/src/`.

## Steps

1. **Pick the data source deliberately** (rule 3): the UI currently consumes only `GET /api/metrics` and computes everything client-side. If you need a backend analytics route (summary, comparison, alerts, facets, top categories — all exist but are unused), wire it explicitly with a relative `/api/...` URL (rule 2, Vite proxy).

2. **Types first** (rule 1): mirror any new/changed payload fields in `frontend/src/lib/financial-types.ts`. Never `any` or inline structural types.

3. **Pure logic in `frontend/src/lib/financial-utils.ts`** with colocated tests in `financial-utils.test.ts` (rule 8). Handle:
   - empty inputs explicitly,
   - date-only strings as **calendar dates** — read the ISO string (`.slice(0, 4)` etc.) or parse components; do not rely on `new Date("YYYY-MM-DD")` + local getters (rule 12),
   - any period/date labels **derived from data**, never hard-coded (rule 11).

4. **Component**: kebab-case `.tsx` in `frontend/src/components/dashboard/` (composed views) or `components/ui/` (primitives); shadcn-style with CVA + `cn()` where a primitive is needed (rules 5). Import via the `@/` alias (rule 6). Loading state → reuse `ui/skeleton.tsx`. User-facing copy in Spanish, consistent with existing strings.

5. **Verify** (rule 8 checklist):
   ```bash
   cd frontend
   npm test -- --run && npm run lint && npm run build
   ```

## Pitfalls

- When editing files near the end of a file, read to the true end first — inserting from a truncated read can orphan existing lines.
- The build prints a pre-existing ">500 kB chunk" warning; it is not caused by test or component additions.
- Keep `computePeriodLabel`/`computeKPIs`/`computeMonthlyData` signatures stable — their tests encode the contract.
