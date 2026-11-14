# Fase 2: notas de análisis

Hallazgos por inspección estática del repositorio. No se ejecutaron pruebas ni contenedores.

## Arquitectura y datos

- `frontend/src/App.tsx` consume `GET /api/metrics` y calcula KPI y agregados mensuales en el cliente; las rutas de resumen y comparación de `backend/app/routes.py` no se consumen desde la UI.
- `frontend/src/lib/mock-data.ts` mantiene movimientos fijos de 2024, distintos de los movimientos que genera `backend/app/routes.py` y que consume la aplicación.
- `frontend/src/lib/financial-utils.ts` agrupa fechas con `new Date(...)` y getters locales; las pruebas actuales no cubren fechas del primer día en zonas horarias al oeste de UTC.

## Consistencia de período

- `frontend/src/components/dashboard/dashboard-header.tsx` muestra `2024 - Full Year`; `backend/app/routes.py` genera el período usando `date.today()`.

## Operación y seguridad

- `docker-compose.yml` declara `depends_on` sin healthcheck. `frontend/src/App.tsx` hace una solicitud inicial sin reintento.
- `backend/app/main.py` configura `allow_origins=["*"]` y `allow_credentials=True`.
- `backend/app/routes.py` ejecuta `random.seed(seed)` dentro de `generate_mock_movements`, cambiando el estado aleatorio global.

## Handover de agentes

- `AGENTS.md` pide revisar `.agents/rules/`, `.agents/skills/` y `memory-bank/`; en este checkout solo se añadió `.agents/rules/` para las propuestas de esta fase.
