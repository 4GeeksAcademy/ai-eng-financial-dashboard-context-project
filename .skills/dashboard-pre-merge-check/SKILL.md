---
name: dashboard-pre-merge-check
description: "Use when asked 'listo para merge', 'pre-merge check', or 'verifica la rama' to check this dashboard branch before merge. Do not use for deployment, writing new tests, or code-style review."
---

# Dashboard Pre-Merge Check

Objetivo: verificar el estado de la rama, entorno, configuración y validaciones del dashboard antes de merge.

## Inputs

- Rama fuente y rama destino esperada del PR; si no se indica destino, usar `main` (destino requerido por la tarea) e indicarlo en el informe como valor por defecto.
- Estado de los servicios `frontend` y `backend` de Docker Compose.
- `frontend/.env`; inspeccionar sólo `VITE_API_BASE_URL`, nunca copiar otros valores al informe.

## Pasos

1. Comprobar `git status --short` vacío y que `git branch --show-current` coincida con la rama fuente esperada. Registrar rama fuente/destino del PR; si no se indica destino, informar `main` como valor por defecto. Seguir [AGENTS.md](../../AGENTS.md) y revisar las reglas aplicables: [fechas calendario](../../.agents/rules/calendar-date-handling.md), [periodo desde los datos](../../.agents/rules/dashboard-period-source.md) y [contrato API](../../.agents/rules/metrics-api-contract.md).
2. Revisar `docker compose ps`. Si `frontend` o `backend` están parados (puede ocurrir tras reiniciar Codespaces), ejecutar `docker compose up -d`. Los dos servicios y sus contextos están definidos en [docker-compose.yml](../../docker-compose.yml).
3. Validar la línea de `VITE_API_BASE_URL` en `frontend/.env`: sólo es válida si empieza por `#` o si la asignación es exactamente `VITE_API_BASE_URL=` sin nada después del `=`. `VITE_API_BASE_URL= #https://...` cuenta como **❌ ambiguo**; cualquier valor no vacío incumple el criterio. El ejemplo lo deja vacío ([.env.example](../../frontend/.env.example)); Vite proxy ya cubre `/api` ([README.es.md](../../README.es.md), [vite.config.ts](../../frontend/vite.config.ts)). No mostrar valores de `.env`.
4. Ejecutar siempre dentro de los contenedores: `docker compose exec -T frontend npm run build`, `docker compose exec -T frontend npm test` y `docker compose exec -T backend pytest -q`. Son los scripts declarados en [frontend/package.json](../../frontend/package.json); Compose monta el código de ambos servicios ([docker-compose.yml](../../docker-compose.yml)). Nunca ejecutar `npm install` en el host: se registró `EACCES` por permisos de `frontend/node_modules` ([verification.md](../../verification.md)).
5. Si Docker falla con `parent snapshot does not exist`, recuperar con `docker compose down`, luego `docker system prune -af` y reconstruir con `docker compose up -d --build`. **Advertencia:** `docker system prune -af` elimina recursos Docker no usados de todo el entorno; confirmar que no se necesitan antes de ejecutarlo. No es un paso rutinario de merge.

## Output y aceptación

Entregar un informe corto con ✅/❌ por paso, rama revisada, destino (indicando si se usó `main` por defecto), resultado de build, conteos de pruebas y avisos. Aceptar sólo build sin errores, **0 fallos y el número de tests no baja de la referencia actual (frontend 9, backend 28)**. Actualizar la referencia en [memory-bank/current-status.md](../../memory-bank/current-status.md) al añadir tests y mantener esta skill alineada.

Avisos conocidos que no cuentan como nuevos: `StarletteDeprecationWarning` relacionado con httpx y el aviso `PLUGIN_TIMINGS` de Vite. El aviso de chunk minificado >500 kB está registrado en [verification.md](../../verification.md), pero dejó de aparecer tras el commit que aplicó la carga diferida de los gráficos; si reaparece, marcar **❌ regresión**, no como aviso conocido.

## Ejemplo

> ✅ Rama: feature/dashboard, limpia; destino: main (por defecto; no indicado)  
> ✅ Contenedores: frontend y backend Up  
> ✅ VITE_API_BASE_URL: vacío; proxy /api activo  
> ✅ Build frontend: correcto  
> ✅ Tests frontend: 9/9; backend: 28/28; fallos: 0  
> ✅ Avisos nuevos: ninguno  
> Avisos conocidos: StarletteDeprecationWarning (httpx); PLUGIN_TIMINGS (Vite).  
> Resultado: listo para merge.