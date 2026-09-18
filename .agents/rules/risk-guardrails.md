---
description: Risk guardrails — actions that WILL break the project if done incorrectly
applyTo:
  - "**"
---

# Risk Guardrails

> ⚠️ These are verified risks. Violating them WILL damage the project.

## 🔴 CRITICAL — Do NOT do these

### R1: Do NOT delete `frontend/src/lib/mock-data.ts`
- **Why**: Although unused in production, it's a **reference file** for tests and fallback scenarios
- **Risk**: Deleting it removes documentation of expected data shapes
- **Rule**: Never delete files that could serve as reference material

### R2: Do NOT manually edit `components/ui/` files
- **Why**: These are **shadcn/ui generated components** with `data-slot` attributes
- **Risk**: Editing breaks the contract with shadcn/ui's CSS system
- **Rule**: To modify UI primitives, regenerate with `npx shadcn@latest add <component>`

### R3: Do NOT change `generate_mock_movements()` without updating tests
- **Why**: Tests depend on `seed=42` producing exactly **360 movements**
- **Evidence**: `test_routes.py` line 8: `assert len(movements) == 360`
- **Rule**: Any change to data generation must pass `test_routes.py`

### R4: Do NOT add Python dependencies without verifying compatibility
- **Why**: `requirements.txt` has NO pinned versions — any new dep could conflict
- **Rule**: After adding a dependency, run `pytest` to verify nothing breaks

### R5: Do NOT split `routes.py` into multiple files
- **Why**: The entire API is designed as one coherent unit (~380 lines)
- **Risk**: Splitting breaks the import chain and endpoint ordering
- **Rule**: Keep all endpoints in `routes.py` unless it exceeds 500 lines

---

## 🟡 IMPORTANT — Avoid these patterns

### R6: Do NOT use `export default` for new components
- **Why**: Convention is named exports; only `App.tsx` uses default
- **Rule**: `export function MyComponent() { ... }`

### R7: Do NOT create CSS files per component
- **Why**: Project uses Tailwind inline + CSS variables in `index.css`
- **Rule**: Always use `className` with Tailwind utilities

### R8: Do NOT forget `type` keyword in TypeScript imports
- **Why**: Prevents circular dependencies and bundling issues
- **Rule**: `import { type Foo } from "..."` for type-only imports

### R9: Do NOT add endpoints without `response_model`
- **Why**: All endpoints use explicit response models for Swagger docs + validation
- **Rule**: Always include `response_model=...` in `@router.get()` decorators

### R10: Do NOT use relative imports (`../`) in frontend
- **Why**: Convention is `@/` alias for everything in `src/`
- **Exception**: Relative imports OK for sibling files (`./kpi-card`)

---

## 🟢 MINOR — Keep consistent

### R11: Include `data-slot` in new shadcn/ui components
- **Why**: CSS selectors depend on these attributes

### R12: Use CSS variables for colors, never hardcoded values
- **Why**: Dark mode depends on the variable system in `index.css`

### R13: Update both sides when changing shared types
- **Why**: `FinancialMovement` exists in both `routes.py` (Pydantic) and `financial-types.ts` (TS)

### R14: Check `.gitignore` before creating new files
- **Why**: The gitignore is carefully organized by category

### R15: Preserve `AGENTS.md` structure
- **Why**: It's the entry point for all agents working on this project

---

## Verification checklist

Before making any change, verify:

- [ ] Does it respect the file naming convention? (kebab-case frontend, snake_case backend)
- [ ] Does it use the `@/` alias for frontend imports?
- [ ] Does it use named exports (not default)?
- [ ] Does it include `response_model` for new endpoints?
- [ ] Does it keep types in sync between frontend and backend?
- [ ] Does it pass existing tests (`pytest` + `vitest`)?
- [ ] Does it use CSS variables instead of hardcoded colors?
