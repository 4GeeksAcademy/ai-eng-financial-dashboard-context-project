# Frontend Engineering Rules

**Last Updated:** 2026-11-16  
**Scope:** React 19 + TypeScript + Vite financial dashboard (`frontend/src/`)  
**Purpose:** Establish conventions for contributors and AI agents

---

## Rule 1: Use Named Exports for Components

**Scope:** All files in `frontend/src/components/**/*.tsx`

**Rationale:**
Every component in the codebase uses named exports (e.g., `export function KPICard(...)`). This convention:
- Makes imports explicit and discoverable
- Aligns with codebase consistency
- Simplifies refactoring and tree-shaking

**Reference:** 
- `frontend/src/components/dashboard/kpi-card.tsx:34` exports `KPICard`
- `frontend/src/components/dashboard/dashboard-header.tsx:14` exports `DashboardHeader`

**Actionable Instructions:**
1. All components must use: `export function ComponentName(...) { ... }`
2. When importing, use: `import { ComponentName } from "@/components/..."`
3. Update imports if converting default exports to named exports

---

## Rule 2: Organize Components by Domain

**Scope:** Directory structure at `frontend/src/components/`

**Rationale:**
Components are organized into two categories:
- **`dashboard/`** — Domain-specific components (KPI cards, charts)
- **`ui/`** — Reusable primitives (Card, Skeleton)

This separation scales as new features are added.

**Reference:**
- `frontend/src/components/dashboard/` contains business logic components
- `frontend/src/components/ui/` contains reusable primitives

**Actionable Instructions:**
1. New dashboard features: create `frontend/src/components/dashboard/<feature-name>.tsx`
2. New UI primitives (buttons, modals, etc.): create `frontend/src/components/ui/<primitive-name>.tsx`
3. Single-use components: collocate with their feature; don't add to `ui/`

---

## Rule 3: Use Kebab-Case for Component File Names

**Scope:** All files in `frontend/src/components/**/*.tsx`

**Rationale:**
Every component file uses kebab-case naming (e.g., `kpi-card.tsx`, `income-outcome-chart.tsx`). This convention maintains consistency across the codebase.

**Reference:**
- `frontend/src/components/dashboard/kpi-card.tsx`
- `frontend/src/components/dashboard/income-outcome-chart.tsx`
- `frontend/src/components/ui/skeleton.tsx`

**Actionable Instructions:**
1. File names must use kebab-case: `component-name.tsx`
2. Export function uses PascalCase: `export function ComponentName(...)`
3. Import using kebab-case path: `import { ComponentName } from "@/components/component-name"`

---

## Rule 4: Define Props as Explicit TypeScript Interfaces

**Scope:** All component files in `frontend/src/components/**/*.tsx`

**Rationale:**
Every component defines its props via a TypeScript interface (e.g., `interface KPICardProps`). This explicitly documents component contracts.

**Reference:**
- `frontend/src/components/dashboard/kpi-card.tsx:11-16` defines `KPICardProps`
- `frontend/src/components/dashboard/kpi-row.tsx:6-9` defines `KPIRowProps`

**Actionable Instructions:**
1. Every component must define: `interface ComponentNameProps { ... }`
2. Mark optional props with `?`: `loading?: boolean`
3. Use `type` keyword for imported type unions: `import { type LucideIcon } from "lucide-react"`
4. Function signature must destructure props: `export function ComponentName({ prop1, prop2 }: ComponentNameProps)`

---

## Rule 5: Handle Loading, Error, and Empty States

**Scope:** All data-fetching components and components receiving `loading` prop

**Rationale:**
Data-driven components should handle three states: loading (show placeholder), error (show message), and empty (show "no data" message). This improves UX and prevents broken/partial UI.

**Reference:**
- Loading: `frontend/src/components/dashboard/kpi-card.tsx:33-43` shows Skeleton during load
- Empty: `frontend/src/components/dashboard/income-outcome-chart.tsx:65-73` shows empty message
- Error: `frontend/src/App.tsx:52-54` shows error message

**Actionable Instructions:**
1. Components with `loading` prop must render Skeleton placeholders during load
2. Components with `error` prop must display error message in a styled container
3. After data loads, check for empty arrays/null values and show appropriate message
4. Example pattern:
   ```typescript
   if (loading) return <Skeleton />
   if (error) return <ErrorBoundary message={error} />
   if (!data?.length) return <EmptyState />
   return <DataView data={data} />
   ```

---

## Rule 6: Use CSS Custom Properties for Theme-Dependent Values

**Scope:** 
- All files in `frontend/src/components/**/*.tsx`
- `frontend/src/index.css` (source of truth)

**Rationale:**
Theme colors are defined in CSS custom properties (e.g., `--chart-income`, `--border`). Components reference them via `var(--token-name)`. This centralizes design decisions and enables theme switching.

**Reference:**
- CSS tokens: `frontend/src/index.css:1-50` defines color variables
- Usage: `frontend/src/components/dashboard/income-outcome-chart.tsx:111-119` references `var(--border)`

**Actionable Instructions:**
1. Never hardcode colors in component code (e.g., `#FF0000`, `rgb(255,0,0)`)
2. Add new colors to `frontend/src/index.css` `:root` section with meaningful names
3. Reference in components via: `className="text-[var(--token-name)]"` or `style={{ color: 'var(--token-name)' }}`
4. Keep dark mode theme in `.dark { ... }` block in CSS

---

## Rule 7: Validate API Responses at Runtime

**Scope:** 
- `frontend/src/App.tsx` (data fetching)
- All utility functions in `frontend/src/lib/`

**Rationale:**
According to PHASE2-FINDINGS.md, `frontend/src/App.tsx:19` calls `.json()` without validating structure. Invalid or malformed API data could cause unexpected behavior.

**Reference:** `frontend/src/App.tsx:19` — API data not validated before use

**Actionable Instructions:**
1. Create a validation function for each API response type:
   ```typescript
   function validateFinancialMovement(data: unknown): FinancialMovement[] {
     if (!Array.isArray(data)) throw new Error("Expected array")
     return data.map(m => {
       if (!m.create_date || typeof m.amount !== 'number') throw new Error(...)
       return m as FinancialMovement
     })
   }
   ```
2. Use this validator before processing API data:
   ```typescript
   const data = await response.json()
   const movements = validateFinancialMovement(data)
   ```
3. Catch validation errors separately from network errors

---

## Rule 8: Distinguish Error Types in Catch Blocks

**Scope:** All error handling in `frontend/src/App.tsx` and async utilities

**Rationale:**
According to PHASE2-FINDINGS.md, generic error messages reduce clarity. Distinguishing error types helps both users and developers understand failures.

**Reference:** `frontend/src/App.tsx:38` — Uses generic `.catch(() => {...})`

**Actionable Instructions:**
1. Capture error in catch block: `.catch((error) => { ... })`
2. Distinguish error types:
   ```typescript
   if (error instanceof TypeError) {
     setError("Network error. Check your connection.")
   } else if (error instanceof SyntaxError) {
     setError("Server returned invalid data.")
   } else {
     setError("Failed to load financial data.")
   }
   ```
3. Never swallow errors with `.catch(() => null)` without handling the case

---

## Rule 9: Use TypeScript Strict Mode

**Scope:** `frontend/tsconfig.app.json`

**Rationale:**
Strict mode is already enabled in the codebase, catching errors like unused variables, missing type hints, and unreachable code.

**Reference:** `frontend/tsconfig.app.json:19-25` enables strict options

**Actionable Instructions:**
1. Never disable strict mode
2. Resolve all TypeScript errors before merge
3. Use non-null assertion (`!`) only when you're certain a value exists (rare)
4. If type errors block progress, add `// @ts-expect-error <reason>` with justification

---

## Rule 10: Include Unit Tests for Utility Functions

**Scope:** 
- All files in `frontend/src/lib/**/*.ts`
- Tests in `frontend/src/lib/**/*.test.ts`

**Rationale:**
According to PHASE2-FINDINGS.md, only `frontend/src/lib/financial-utils.test.ts` has tests. Utility functions should have tests to prevent regressions.

**Reference:** `frontend/src/lib/financial-utils.test.ts` contains existing test patterns

**Actionable Instructions:**
1. Every function in `lib/` should have unit tests
2. Each test should include:
   - Happy path (normal input)
   - At least one edge case (zero, boundary, empty array)
   - Error case (if applicable)
3. Use Vitest: `describe()` for grouping, `it()` for cases
4. Test file name: `function-name.test.ts` (kebab-case)

---

## Rule 11: Mark Optional Props with `?` Explicitly

**Scope:** All `Props` interfaces in `frontend/src/components/**/*.tsx`

**Rationale:**
Optional props should be clearly marked with `?` to signal that a component works without certain values.

**Reference:** `frontend/src/components/dashboard/kpi-card.tsx:16` marks `loading?: boolean`

**Actionable Instructions:**
1. Mark optional props with `?` in interface: `loading?: boolean`
2. Provide sensible defaults in function signature: `{ loading = false }`
3. Use `null` coalescing operator when appropriate: `value ?? defaultValue`
4. Never make a prop required that can logically be undefined

---

## Rule 12: Use Locale-Aware Formatting for All User-Facing Values

**Scope:** 
- All formatter functions in `frontend/src/lib/financial-utils.ts`
- All text rendered in components

**Rationale:**
Formatters like `formatCurrency()` use `Intl.NumberFormat("en-US", ...)` for consistent, locale-aware formatting.

**Reference:** `frontend/src/lib/financial-utils.ts:63-78` uses `Intl.NumberFormat`

**Actionable Instructions:**
1. Currency: use `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`
2. Percentages: use `value.toFixed(1) + "%"`
3. Dates: use `Intl.DateTimeFormat(locale, { ... })`
4. Create utility functions for each format and reuse everywhere
5. Never display raw numbers or unformatted dates

---

## Rule 13: Use `data-slot` Attributes for Component Testing & Styling

**Scope:** All components in `frontend/src/components/ui/**/*.tsx`

**Rationale:**
Every UI primitive has a `data-slot` attribute for semantic targeting in tests and CSS.

**Reference:** `frontend/src/components/ui/card.tsx:5-8` uses `data-slot` attributes

**Actionable Instructions:**
1. Every component root must have: `data-slot="component-name"`
2. Sub-parts of compounds (like Card) get: `data-slot="card-header"`, `data-slot="card-content"`
3. Use in tests: `container.querySelector('[data-slot="card"]')`
4. Use in CSS: `[data-slot="card"] { ... }`

---

## Rule 14: Keep Pure Utility Functions Separate from Components

**Scope:** 
- Component logic: `frontend/src/components/**/*.tsx`
- Business logic: `frontend/src/lib/**/*.ts`

**Rationale:**
Pure functions in `lib/` are testable and reusable. Keeping them separate from components improves code organization.

**Reference:**
- Utilities: `frontend/src/lib/financial-utils.ts`
- Components: `frontend/src/App.tsx:30-31` calls business functions

**Actionable Instructions:**
1. Business logic (calculations, transformations, filtering) → `frontend/src/lib/`
2. UI rendering → `frontend/src/components/`
3. Components should be thin wrappers that call pure functions
4. No `useState`/`useEffect` logic in utility functions

---

## Rule 15: Use Path Alias `@/` for Imports

**Scope:** All imports across `frontend/src/`

**Rationale:**
Path alias `@` → `./src` simplifies imports and enables refactoring without updating paths.

**Reference:** `frontend/vite.config.ts:9-11` configures the alias

**Actionable Instructions:**
1. All imports must use: `import { X } from "@/path/to/file"`
2. Never use: `import { X } from "../../../path/to/file"`
3. Never use relative paths in new code
4. If Vite config alias changes, update all imports

---

## Enforcement Checklist for Contributors

Before submitting frontend code:

- [ ] Components use named exports (Rule 1)
- [ ] File names are kebab-case (Rule 3)
- [ ] Components have Props interfaces (Rule 4)
- [ ] Data-driven components handle loading/error/empty (Rule 5)
- [ ] No hardcoded colors (Rule 6)
- [ ] Error types are distinguished in .catch() (Rule 8)
- [ ] Utility functions have tests (Rule 10)
- [ ] Optional props marked with `?` (Rule 11)
- [ ] Values use formatters (Intl API) (Rule 12)
- [ ] UI components have data-slot attributes (Rule 13)
- [ ] Business logic in lib/, not components (Rule 14)
- [ ] All imports use @/ alias (Rule 15)

