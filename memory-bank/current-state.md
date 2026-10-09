# Estado actual

Verificado contra el commit `c06ab07`.

## Qué funciona (comprobado)

- ✅ El backend genera 360 movimientos y las funciones de todas las rutas de `routes.py` se ejecutaron con datos reales (con `fastapi` simulado, sin la capa HTTP): 569 combinaciones de parámetros se ejecutan sin errores. Se usaron para comprobar que el refactor de la Fase 3 no cambia ninguna salida.
- ✅ La agregación mensual del frontend (`computeMonthlyData`) coincide mes a mes (12 de 12) con `/api/metrics/summary?group_by=month` en 4 zonas horarias (`UTC`, `Europe/Madrid`, `America/Bogota`, `America/New_York`). Ejecutado con Node; el frontend completo no se arrancó.
- ✅ Se aclaró en los dos READMEs que el `.env` va en `frontend/.env`.

## Huecos conocidos

| Hueco | Evidencia |
|---|---|
| La cabecera dice `2024 - Full Year` pero los datos son una ventana móvil de 12 meses. | `frontend/src/App.tsx:49`, `dashboard-header.tsx:7` |
| `frontend/src/lib/mock-data.ts` (57 movimientos de 2024) no lo importa nadie; `frontend/src/assets/hero.png` tampoco se referencia. | búsqueda en `frontend/src` |
| El frontend usa 1 de 9 rutas y repite en el navegador una agregación que ya ofrece `/api/metrics/summary`. | `App.tsx:16`, `computeMonthlyData` |
| `build_metrics_facets` lanza `IndexError` con una lista vacía. | ejecutado |
| `generate_mock_movements` reinicia el generador aleatorio global en cada petición. | ejecutado |
| Los tests del frontend solo cubren `src/lib`; no hay entorno para probar componentes. | `frontend/package.json` sin `jsdom` ni `@testing-library` |
| `debugpy` en `0.0.0.0:5678`, `--reload` y CORS `*` están pensados solo para desarrollo. | `backend/Dockerfile`, `backend/app/main.py` |
| Dependencias de Python sin versión y `npm install` en la imagen aunque exista `package-lock.json`. | `backend/requirements.txt`, `frontend/Dockerfile:6` |
| Sin integración continua y sin healthcheck en Compose, aunque existe `/health`. | no existe `.github/`; `docker-compose.yml` |
| Aviso de error en español y resto de la interfaz en inglés. | `App.tsx:37` |

## Sin verificar (❓)

- El arranque real con `docker compose up --build` y todo lo de la tabla de comandos de `tech-stack.md`.

## Siguientes prioridades

No hay un plan del equipo en el repositorio. Esta lista sale de los huecos de arriba y hay que acordarla con quien mantenga el proyecto:

1. Ejecutar el arranque, `pytest`, `npm test` (también con `TZ=America/New_York`), `npm run lint` y `npm run build` en Codespaces o en local, y marcar ✅ lo que pase.
2. Decidir si la etiqueta de periodo se calcula a partir de los datos o se elimina (`App.tsx:49`).
3. Decidir si `mock-data.ts` y `hero.png` se borran o se usan.
4. Decidir si el frontend consume `/api/metrics/summary` o mantiene su agregación.
