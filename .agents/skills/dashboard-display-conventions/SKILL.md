---
name: dashboard-display-conventions
description: Enforce consistent data formatting, display styling, and UI conventions across this financial dashboard's frontend components
---

# Dashboard Display Conventions

## Objective

Ensure consistent data formatting, display styling, and UI conventions across all frontend components in this financial dashboard — preventing the subtle drift that occurs when different agents apply generic React or accessibility skills that are unaware of this repo's specific presentation rules.

## Inputs

- The feature requirement (what data to display and where)
- The relevant types from `frontend/src/lib/financial-types.ts` (always add new types/fields there first)
- The utility functions from `frontend/src/lib/financial-utils.ts` (always add pure logic there)

## Procedure

### A. Number & Currency Formatting

1. **Monetary amounts** MUST use `formatCurrency()` from `frontend/src/lib/financial-utils.ts`:
   - Uses `Intl.NumberFormat` with `style: "currency"`, `currency: "USD"`
   - `minimumFractionDigits: 0`, `maximumFractionDigits: 0`
   - Output style: `"$1,235"` (no decimals, comma-separated thousands)
   - **Never** use `Number.prototype.toFixed()`, template strings, or inline `Intl` for currency.

2. **Percentages** MUST use `formatPercent()` from `frontend/src/lib/financial-utils.ts`:
   - `value.toFixed(1) + "%"`
   - Output style: `"15.6%"` (one decimal, percent sign, no space)
   - `profitPercent` is already on a 0–100 scale (e.g., 25 means 25%), not a decimal fraction.

3. **Raw numbers** (counts, indices) — use `Intl.NumberFormat("en-US")` with no fraction digits, or plain `String()` for small integers.

### B. Date & Period Label Conventions

4. **Month labels** in charts and tables MUST match `formatMonthYearLabel()` behavior in `frontend/src/lib/financial-utils.ts`:
   - Input: a `"YYYY-MM"` key
   - Output: `"Dec 2025"` (en-US short month + numeric year)
   - Implementation: `new Date(year, month, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" })`
   - The `month` parameter is 0-based (subtract 1 from the parsed month number).

5. **Period labels** (dashboard badge) MUST use `computePeriodLabel()` from `frontend/src/lib/financial-utils.ts`:
   - Same-year data → `"2025 - Full Year"`
   - Multi-year data → `"2025 - 2026"`
   - No data → `"No data"`
   - Period is **derived from loaded data**, never hard-coded.

6. **Date-only string handling** — API `create_date` is an ISO date string (`"2025-10-02"`):
   - Parse the year by reading the first 4 characters: `movement.create_date.slice(0, 4)`
   - Parse the month by reading characters 5–7: `movement.create_date.slice(5, 7)`
   - **Do NOT** use `new Date("YYYY-MM-DD")` followed by `.getFullYear()` / `.getMonth()` — those are relative to the local timezone and can shift midnight dates across month boundaries.
   - `new Date(year, month, 1)` is safe only for constructing month labels where day=1 and time is irrelevant.

### C. KPI Card Display Conventions

7. **KPICard props** (`frontend/src/components/dashboard/kpi-card.tsx`):
   ```typescript
   interface KPICardProps {
     label: string           // Short Spanish label, e.g. "Ingresos", "Ganancia"
     value: string           // Pre-formatted string (call formatCurrency / formatPercent upstream)
     helperText: string      // Context string, Spanish, e.g. "vs mes anterior"
     icon: LucideIcon        // lucide-react icon component
     variant: 'income' | 'outcome' | 'profit' | 'profitPercent'
   }
   ```

8. **Variant color mapping** — use the `variantStyles` map inside `kpi-card.tsx`:
   - `income` → `bg-[var(--income-badge)]`, icon `text-[var(--income-badge-fg)]`
   - `outcome` → `bg-[var(--outcome-badge)]`, icon `text-[var(--outcome-badge-fg)]`
   - `profit` / `profitPercent` → `bg-[var(--profit-badge)]`, icon `text-[var(--profit-badge-fg)]`

9. **KPI row** (`frontend/src/components/dashboard/kpi-row.tsx`):
   - Displays 4 KPICards by default: totalIncome, totalOutcome, profit, profitPercent.
   - **Extending the row**: if adding a new KPI, update ALL of the following together:
     1. The grid class from `xl:grid-cols-4` to `xl:grid-cols-N` (choose a col count that wraps neatly; avoid broken single-item rows on any breakpoint).
     2. The `KPIRowSkeleton` array length to match the new card count — otherwise layout shifts during loading.
     3. The responsive breakpoints (`sm:`, `md:`, `xl:`) if the new count changes wrapping behavior.
   - The `metrics` prop is **required** (never null/undefined after data loads).
   - Loading state is handled by the parent (`App.tsx`) using `KPIRowSkeleton` — child components do not accept a `loading` prop.

### D. Chart Display Conventions

10. **Chart components** are lazy-loaded via `Suspense` in `App.tsx` (code-split recharts into its own async chunk).

11. **Chart props** do NOT accept a `loading` prop — the parent supplies either data or a skeleton fallback (`ChartFallback` in `App.tsx`).

12. **Chart data shape** — `IncomeOutcomeChart` receives `MonthlyDataPoint[]`:
    ```typescript
    interface MonthlyDataPoint {
      month: string       // "Dec 2025" — already formatted
      income: number      // raw float for recharts
      outcome: number     // raw float for recharts
      profitPercent: number // 0–100 scale float
    }
    ```

13. **ProfitPercentChart** receives `MonthlyDataPoint[]` and renders the `profitPercent` field for each month.

### E. Language & Copy

14. **User-facing copy** is in **Spanish**, consistent with existing labels:
    - `"Ingresos"` for income, `"Egresos"` for outcome, `"Ganancia"` for profit, `"Margen"` for profit margin
    - `"Margen Neto"` for net profit margin (if adding a new margin variant)
    - `"vs mes anterior"` for month-over-month comparison helper text (this is decorative copy unless a computed delta is explicitly required)
    - `"Financial Overview"` / `"Executive metrics dashboard"` in the header remain in English (global product name)

    > **Incremental adoption note**: existing cards currently use English labels (`"Total Income"`, `"Total Outcome"`, `"Profit"`, `"Profit Margin"`). Migrate to Spanish labels incrementally: apply Spanish to NEW cards immediately, and batch-rename existing cards in a dedicated cleanup pass to keep diffs focused. Do not mix Spanish migration with functional changes in the same commit.

    **Icon selection convention**: choose icons from `lucide-react` that match the metric's semantics:
    - Income → `TrendingUp`, `ArrowUpRight`, `DollarSign`
    - Outcome → `TrendingDown`, `ArrowDownRight`, `ShoppingCart`
    - Profit → `DollarSign`, `Banknote`
    - Profit percent → `BarChart2`, `Percent`, `PieChart`
    - New metrics → pick a unique icon not used by an adjacent card so each card is visually distinguishable

### F. Component Composition & Loading

15. **Loading state** is owned by the orchestrator (`App.tsx`), not by individual display components:
    - `App.tsx` decides: `{loading ? <KPIRowSkeleton /> : metrics ? <KPIRow metrics={metrics} /> : null}`
    - Chart skeletons use `ChartFallback()` while the recharts async chunk loads.
    - Individual display components (KPICard, charts) always render their data view — they never accept a `loading` prop.

16. **Skeleton components** for composition:
    - `KPIRowSkeleton` — renders 4 skeleton KPICards in the same grid layout
    - `ChartFallback` — renders a card with a `Skeleton` placeholder matching chart dimensions
    - Keep skeletons visually consistent (same Card/CardHeader/CardContent structure, same dimensions).

## Expected Output

A frontend feature (new component, extended display, or annotation) that:

1. Uses `formatCurrency` / `formatPercent` for all financial values displayed to the user
2. Uses `computePeriodLabel` for any period badge or data-range label
3. Uses `formatMonthYearLabel`-equivalent for any month-axis label
4. Treats date-only strings as calendar dates (parse ISO parts directly)
5. Follows the composition pattern (no `loading` prop on display components)
6. Uses Spanish for all user-facing copy (except the global product header)
7. Passes `npm test -- --run && npm run lint && npm run build`

## Acceptance Criteria

- [ ] New display code calls `formatCurrency()` or `formatPercent()` — no inline `Intl.NumberFormat`, `toFixed()`, or string concatenation for money/percent
- [ ] Period badge labels are computed from data (not hard-coded)
- [ ] All user-facing strings are in Spanish (exceptions: "Financial Overview", "Executive metrics dashboard" header)
- [ ] Date-only strings are parsed via `.slice()` of the ISO string, not via `new Date()` + getters
- [ ] Components do not accept a `loading` prop — loading state is composed by the parent
- [ ] Types are added to `financial-types.ts` before use (no inline structural types, no `any`)
- [ ] `npm test -- --run` passes | `npm run lint` passes | `npm run build` passes

### G. Extending Types & Test Maintenance

17. **Adding fields to `KPIMetrics`**: when adding a new computed field:
    - Add the field to `frontend/src/lib/financial-types.ts` first (always).
    - Compute it in `computeKPIs()` in `frontend/src/lib/financial-utils.ts`.
    - If the new field is mathematically identical to an existing computed field (e.g., `netProfitMargin === profitPercent`), still add it as a separate field for explicitness — the interface should declare what the UI needs, not what the math produces.
    - **Update all test assertions** in `frontend/src/lib/financial-utils.test.ts` that use `.toEqual()` on `KPIMetrics` — every invocation must include the new field. Search for all `toEqual` blocks mentioning `totalIncome`, `totalOutcome`, `profit`, or `profitPercent` and add the new field to each.

18. **Handling empty chart data**: `computeMonthlyData([])` returns `[]`. Chart components must handle empty input:
    - Render a "No data" message or empty chart area rather than crashing or showing a zero-only chart.
    - Check `data.length === 0` before passing to recharts and conditionally show the fallback.

19. **Spanish glossary for incremental adoption**:
    | English (current) | Spanish (target) |
    |---|---|
    | Total Income | Ingresos |
    | Total Outcome | Egresos |
    | Profit | Ganancia |
    | Profit Margin | Margen |
    | Net Profit Margin | Margen Neto |
    | vs previous month | vs mes anterior |
    | Cumulative revenue from all income movements | Ingresos acumulados del período |
    | Total expenses across all outcome movements | Egresos totales del período |
    | Net profit — income minus total outcome | Ganancia neta del período |
    | Profit as a percentage of total income | Porcentaje de ganancia sobre ingresos |

## Pitfalls

- **Decimal currency**: `formatCurrency` rounds to integers. Do not add decimal places unless a precision policy is explicitly approved.
- **Zero income**: `profitPercent` is `0` when `totalIncome <= 0` — display `"0.0%"`, not `"N/A"` or `undefined`.
- **New KPI types**: If adding a variant beyond the four existing ones, add the CSS variables to `index.css` (e.g. `--new-kpi-badge`, `--new-kpi-badge-fg`) and extend `variantStyles` in `kpi-card.tsx`.
- **Spanish vs English**: The header title ("Financial Overview") and subtitle remain English; all KPI labels, helper text, and period badge copy use Spanish. Keep this distinction.
- **Empty data edge case**: `computeMonthlyData([])` returns `[]` — chart components should handle empty arrays gracefully (show a "No data" message or empty chart area) rather than crashing.
- **Sibling communication**: Do not reach into another display component's internals — use the defined props/type interfaces only.
- **Skeleton–card count coupling**: whenever you change the number of KPICards in the row, update `KPIRowSkeleton`'s array length in the SAME commit. Forgetting this causes layout shift during loading.
- **Adding a field to `KPIMetrics`**: all `.toEqual()` assertions on this interface in test files must include the new field. Run `grep -n 'toEqual.*totalIncome' frontend/src/lib/financial-utils.test.ts` to find every assertion site.
