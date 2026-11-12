---
name: code-style
scope: frontend/src/**, frontend/tsconfig.app.json
applies_when: writing or editing frontend code
related: [api-contracts]
---

# Code-style rules

### STYLE-1: Match the file you are editing
- **When:** you edit an existing frontend file.
- **Do:** keep its quote and semicolon style. Double quotes + semicolons in `frontend/src/App.tsx` and
  `frontend/src/lib/*`; single quotes, no semicolons in `frontend/src/main.tsx` and
  `frontend/src/components/dashboard/*`. New files copy their sibling files in the same folder.
  Don't reformat lines you aren't changing.
- **Check:** `git diff` shows only the lines you meant to change.
- **Why:** there is no Prettier, Ruff, Black, EditorConfig or pyproject; only `frontend/eslint.config.js`.

### STYLE-2: Leave no unused locals or params
- **When:** you finish an edit.
- **Do:** delete unused variables, imports and parameters.
- **Check:** `cd frontend && npx tsc -b` exits 0.
- **Why:** `tsconfig.app.json:22-23` enables `noUnusedLocals` and `noUnusedParameters`; an unused local
  failed with `TS6133`.

### STYLE-3: Where new frontend files go
- **When:** you add a file.
- **Do:** dashboard-specific component -> `frontend/src/components/dashboard/`; generic primitive ->
  `frontend/src/components/ui/` (like `card.tsx`, `skeleton.tsx`); pure logic -> `frontend/src/lib/`.
  Import with the `@/` alias.
- **Check:** `npx tsc -b` resolves the import.
- **Why:** `vite.config.ts` aliases `@` to `src`; `components.json` maps `ui` to `@/components/ui`.
