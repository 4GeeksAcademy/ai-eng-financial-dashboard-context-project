# calidad-del-frontend (P9)
**Prioridad:** media
**Alcance:** `frontend/package.json`; `frontend/eslint.config.js`; `frontend/src/**/*.{ts,tsx}`
**Regla:** Antes de terminar un cambio en `frontend/src`, DEBES ejecutar lint y test; NO DEBES reformatear archivos completos porque no hay formatter, CI ni pre-commit en la búsqueda versionada del informe.
**Justificación:** C7, R12; `frontend/package.json:9` — `"lint": "eslint .",`; `frontend/package.json:11` — `"test": "vitest run",`; `frontend/eslint.config.js:12` — `extends: [`; `frontend/eslint.config.js:15` — `reactHooks.configs.flat.recommended,`.
**Verificación:** `git ls-files | grep -iE "prettier|biome|editorconfig|ruff|pre-commit|^\.github|pyproject|pytest\.ini|tox\.ini"` (esperado: sin salida); `npm run lint` y `npm run test` desde `frontend/` (esperado: exit=0 en ambos; en el contenedor: `docker compose exec -T frontend npm run lint` y `docker compose exec -T frontend npm run test`).
**Línea base:** `git ls-files` filtrado: sin salida (exit=1). En el contenedor, `npm run lint` dio exit=0 sin avisos y `npm run test` dio exit=0 con 5 passed.
