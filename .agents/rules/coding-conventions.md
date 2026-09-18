---
description: Coding conventions for frontend and backend — naming, imports, exports, styles
applyTo:
  - "frontend/src/**"
  - "backend/app/**"
  - "backend/tests/**"
---

# Coding Conventions

## Frontend (React + TypeScript)

### File naming
- Components: `kebab-case.tsx` → `kpi-card.tsx`, `dashboard-header.tsx`
- Utilities/types: `kebab-case.ts` → `financial-utils.ts`, `financial-types.ts`
- One component per file. File name = component name in kebab-case.

### Imports
- **Always use `@/` alias** for imports within `src/`:
  ```ts
  import { cn } from "@/lib/utils"
  import { type KPIMetrics } from "@/lib/financial-types"
  ```
- Use relative imports (`./`) ONLY for sibling files:
  ```ts
  import { KPICard } from './kpi-card'
  ```
- **Always use `type` keyword** for type-only imports:
  ```ts
  import { type MonthlyDataPoint } from "@/lib/financial-types"
  ```

### Exports
- **Named exports** for all components (NOT default export):
  ```ts
  export function KPICard({ label, value, ... }: KPICardProps) { ... }
  ```
- Exception: `App.tsx` uses `export default App;` — this is the ONLY default export.

### TypeScript
- **`interface`** for object shapes: `export interface FinancialMovement { ... }`
- **`type`** for unions/enums: `export type Category = 'suppliers' | 'sales'`
- Interfaces for component props: `interface <ComponentName>Props { ... }`
- Target: ES2023, modules: ESNext (see `tsconfig.app.json`)

### Styling
- **Tailwind CSS inline** — no CSS modules, no separate CSS files per component
- Use `cn()` utility to merge classes: `className={cn('base-class', conditional && 'extra')}`
- **Never hardcode colors** — use CSS variables from `index.css`:
  ```tsx
  // ✅ Correct
  className="bg-(--income-badge) text-(--income-badge-fg)"
  // ❌ Wrong
  className="bg-green-100 text-green-800"
  ```
- Dark mode is hardcoded on `<main className="dark ...">` — always design for dark theme

### Icons
- Import from `lucide-react` directly:
  ```ts
  import { TrendingUp, DollarSign } from 'lucide-react'
  ```

### shadcn/ui components (`components/ui/`)
- These are **generated files** — do NOT manually edit their API
- They use `data-slot` attributes for CSS selectors
- To update: regenerate with `npx shadcn@latest add <component>`
- To use: import from `@/components/ui/card`, `@/components/ui/skeleton`

---

## Backend (Python + FastAPI)

### File naming
- Python files: `snake_case.py` → `routes.py`, `main.py`
- Test files: `test_<module>.py` → `test_routes.py`

### File structure (routes.py pattern)
Follow this exact order in `routes.py`:
1. `from __future__ import annotations` (first line)
2. Imports
3. Type aliases (`Literal` types)
4. Constants
5. Pydantic models (`class X(BaseModel)`)
6. Private helper functions (`_year_for_month`, `_build_movement`)
7. Public helper functions (`generate_mock_movements`, `filter_movements`)
8. Endpoint functions (`@router.get(...)`) — always LAST

### Type hints
- **Always use type hints** on all function parameters and return types
- Use `X | None` for optional params (enabled by `from __future__ import annotations`)
- Use `Literal` for enum-like values:
  ```python
  OperationType = Literal["income", "outcome"]
  ```

### API endpoints
- Always include `response_model` in decorators:
  ```python
  @router.get("/api/metrics", response_model=list[FinancialMovement])
  ```
- Endpoints should be thin — delegate to helper functions for logic
- Use `Query(default=...)` for query parameters with defaults

### Models
- Define Pydantic models **above** the functions that use them
- One model per concept: `FinancialMovement`, `MetricsSummaryItem`, etc.
