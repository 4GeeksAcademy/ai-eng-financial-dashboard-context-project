# Progress — agent skills session (branch feature/agent-skills)

## Skills applied

- accessibility (addyosmani/web-quality-skills) — commit b1ab982: page title, error role="alert", chart text alternatives (role="img" + sr-only tables), dashed outcome line, h2 chart titles, aria-hidden decorative icons, prefers-reduced-motion. Verified: Lighthouse Accessibility 100.
- vercel-react-best-practices (vercel-labs/agent-skills) — commit dd1dab2: meta description, KPI skeleton heights h-9/h-5 to stop layout shift. Rejected V1 (lucide barrel imports): dev-only gain, type risk. Next.js/server rules do not apply (Vite app).

## Ecosystem skill chosen

- performance (addyosmani/web-quality-skills), found with `npx skills find performance` — commit ac0e230.
- Why: the build warned "chunks larger than 500 kB" (main JS 585.54 kB, already present on main). The skill covers JS budgets and code splitting, and requires before/after measurement.
- Result: charts lazy-loaded with Suspense + h-[422px] skeleton fallbacks; entry 187.61 kB, largest 342.29 kB, warning gone; Lighthouse a11y still 100; no layout shift (checked in browser).

## Internal skill authored

- .skills/verify-frontend-change/SKILL.md — commit 167fef8. How to verify any frontend change in this repo before merge: Docker-only build/test, never trust `npx tsc --noEmit` in frontend/, chunk Baseline, layout-shift and frozen-item checks, Lighthouse human step.
- Validated in a fresh agent chat on this branch: found 6 gaps in the first draft, fixed; final verdict MERGE.

## Where skills live

- Community skills: .agents/skills/ (installed with `npx skills add`, recorded in skills-lock.json). Internal skills: .skills/.
