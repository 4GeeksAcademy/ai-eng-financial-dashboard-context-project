# Frontend

**Scope:** `frontend/`. Stack: React 19, TypeScript, Vite, Tailwind CSS 4,
Recharts, and shadcn/ui-style components.

**Why:** only `src/lib/` can be tested today, because no component test setup
exists. Date handling has already caused a real bug: `new Date(create_date)` in
`computeMonthlyData` added a false month to the charts behind UTC (fixed in
`5bee479`).

## Structure

| Path | Contents |
|---|---|
| `src/App.tsx` | Data fetching, page state and layout |
| `src/components/dashboard/` | Dashboard components |
| `src/components/ui/` | Generic primitives (`Card`, `Skeleton`) |
| `src/lib/financial-types.ts` | Types that mirror the API |
| `src/lib/financial-utils.ts` | Pure calculations and formatters |

- Keep calculations in `src/lib/`, not in components.
- Import across folders with the `@/` alias.
- Import types with the inline form: `import { type KPIMetrics } from "..."`.
- There is no Prettier config, and quote and semicolon style differs between
  files. Match the file you are editing and do not reformat unrelated lines.

## Components

Components that show API data take `loading` and render three states:

1. **Loading:** a `Skeleton` with the same layout as the loaded content.
2. **Empty:** a clear message, as in the charts' "No data available to display".
3. **Data:** the content itself.

`App.tsx` owns the error state. Data that is only decorative should not block the
page: if the facets request fails, the header simply omits its period label.

## Styling

- Use the theme tokens from `src/index.css` (`bg-card`, `text-muted-foreground`,
  `border-border`) rather than literal colors.
- Series colors come from `var(--chart-income)`, `var(--chart-outcome)` and
  `var(--chart-profit)`. Reuse them so a metric keeps its color across charts.
- The app always renders dark because `App.tsx` sets `.dark` on `<main>`. New
  tokens need values in both `:root` and `.dark`.
- `components.json` has `cssVariables: false`, so check that anything generated
  by the shadcn CLI uses the theme tokens.

## Money, percentages and dates

- Format with `formatCurrency` and `formatPercent` from `financial-utils.ts`.
  Number and date output uses the `en-US` locale and USD.
- Do not parse API dates with `new Date("YYYY-MM-DD")` to read their month or
  day. That string is parsed as UTC midnight, and local getters then return the
  previous day in timezones behind UTC. Work with the string itself, for example
  `create_date.slice(0, 7)` for the year and month.

## Tests

- Tests sit next to the code as `*.test.ts` and run on Vitest in its default
  Node environment.
- Component tests are not set up: `jsdom` and Testing Library are not installed.
  Test logic through `src/lib/`, and ask before adding those dependencies.
- Containers run in UTC, which hides timezone bugs. For date logic, add a test
  with a date on the 1st of a month that sets its own timezone with
  `vi.stubEnv("TZ", "America/Santiago")`, as `financial-utils.test.ts` does.
