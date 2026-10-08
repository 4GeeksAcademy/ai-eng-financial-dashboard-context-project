# Resumen del producto

## Overview del producto

Dashboard web de métricas financieras que presenta ingresos, gastos, beneficio, margen y evolución mensual. El frontend obtiene movimientos de la API y calcula los KPIs y series mensuales. El backend genera datos de ejemplo; el código revisado no muestra una base de datos ni persistencia.

El frontend consulta `GET /api/metrics`. El backend también ofrece endpoints de salud, filtros y resúmenes analíticos en `backend/app/routes.py`, aunque el dashboard actual solo solicita `/api/metrics` (`frontend/src/App.tsx`).

## Stack tecnológico

- **Lenguajes:** TypeScript y Python; CSS para estilos.
- **Frontend:** React 19, Vite 8, Tailwind CSS 4 y Recharts 3. Dependencias destacadas: `lucide-react`, `clsx`, `tailwind-merge` y `class-variance-authority`.
- **Backend:** FastAPI, Pydantic y Uvicorn. Los movimientos y respuestas se modelan y validan en la API.
- **Infraestructura y herramientas:** Docker Compose coordina `frontend` y `backend`; las imágenes usan Node 24 Alpine y Python 3.13 slim. Vite sirve el frontend en `5173` y reenvía `/api` a `backend:8000`; el backend expone `8000` y `debugpy` usa `5678`.
- **Pruebas y calidad:** Vitest para frontend, ESLint y TypeScript; pytest y httpx para backend.

## Estado actual

- Los movimientos son simulados: el backend genera 360 registros (30 por mes durante 12 meses) con semilla `42`; no hay almacenamiento persistente.
- El frontend muestra estados de carga y error, pero hace una sola solicitud inicial y no reintenta si la API todavía no responde.
- El encabezado del frontend tiene el texto fijo `2024 - Full Year`, mientras que el backend asigna fechas relativas al año actual. Esa etiqueta no aplica un filtro.
- El agrupamiento mensual convierte fechas `YYYY-MM-DD` con `new Date()` localmente. En algunas zonas horarias podría desplazar fechas de calendario; las pruebas actuales no cubren ese caso límite.
- La generación usa `random.seed()` del módulo global; la regla propuesta es usar un generador local para no alterar el estado aleatorio compartido.
- El terminal registra `docker compose up --build` con código de salida `0`; no se confirmó manualmente en el navegador ni mediante una solicitud a los endpoints.
