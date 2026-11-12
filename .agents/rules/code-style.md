# Code-style rules

No formatter config exists (no Prettier, Ruff, Black, EditorConfig or
pyproject in the repo root, `frontend/` or `backend/`; only
`frontend/eslint.config.js`). Observed split:

- Double quotes + semicolons: `frontend/src/App.tsx`, `frontend/src/lib/*`.
- Single quotes, no semicolons: `frontend/src/main.tsx`,
  `frontend/src/components/dashboard/dashboard-header.tsx`.

Match the style of the file you edit; don't reformat unrelated lines.

- `frontend/tsconfig.app.json:22-23` sets `noUnusedLocals` and
  `noUnusedParameters`, so unused code fails `npm run build`
  (`tsc -b && vite build`).
- Dashboard components live in `frontend/src/components/dashboard/`; generic
  primitives in `frontend/src/components/ui/` (`card.tsx`, `skeleton.tsx`);
  imports use the `@/` alias (`vite.config.ts`, `components.json:13-16`).
