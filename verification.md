# Verificación del Proyecto — Financial Metrics Dashboard

> Completa cada espacio con un icono (✅, ❌, ❓) según el estado de verificación.

| # | Validación | Descripción |
|---|----------------|-------------|
| 1 | ✅ | **Estructura del proyecto** — Organización clara en `frontend/` y `backend/` con docker-compose.yml |
| 2 | ✅ | **Frontend: React + TypeScript** — App construida con React 19, TypeScript 6 y Vite 8 |
| 3 | ✅ | **Backend: FastAPI (Python)** — API REST con Python 3.13, FastAPI y Uvicorn |
| 4 | ❓ | **Contenedores Docker** — Dos servicios definidos en docker-compose.yml con sus respectivos Dockerfiles |
| 5 | ✅ | **Proxy Vite** — Las llamadas a `/api` se redirigen automáticamente al backend en desarrollo |
| 6 | ✅ | **Endpoint `/api/metrics`** — Devuelve 360 movimientos financieros mock con seed determinista (42) |
| 7 | ✅ | **Endpoint `/api/metrics/facets`** — Metadatos de filtros disponibles (tipos, categorías, rango de fechas) |
| 8 | ✅ | **Endpoint `/api/metrics/summary`** — Resumen agrupado por día, semana o mes |
| 9 | ✅ | **Endpoint `/api/metrics/categories/top`** — Top N categorías por importe según tipo de operación |
| 10 | ✅ | **Endpoint `/api/metrics/comparison`** — Comparativa entre dos periodos con delta absoluto y porcentual |
| 11 | ✅ | **Endpoint `/api/metrics/alerts`** — Detección de periodos con gastos anómalos sobre la media histórica |
| 12 | ✅ | **Endpoint `/api/metrics/b2b`** — Filtro específico para movimientos B2B |
| 13 | ✅ | **Endpoint `/api/metrics/b2c`** — Filtro específico para movimientos B2C |
| 14 | ✅ | **Endpoint `/health`** — Health check simple de la API |
| 15 | ✅ | **Documentación Swagger** — Disponible en `http://localhost:8000/docs` |
| 16 | ✅ | **Dashboard — KPIs** — Tarjetas con Total Income, Total Outcome, Profit y Profit % |
| 17 | ✅ | **Dashboard — Gráfico Income/Outcome** — Barras mensuales de ingresos vs gastos (Recharts) |
| 18 | ✅ | **Dashboard — Gráfico Profit %** — Evolución mensual del porcentaje de beneficio (Recharts) |
| 19 | ✅ | **Tipos compartidos** — Interfaces TypeScript alineadas con los modelos Pydantic del backend |
| 20 | ✅ | **Lógica financiera** — Funciones `computeKPIs()` y `computeMonthlyData()` separadas de la UI |
| 21 | ✅ | **Tests backend** — Suite de pytest con TestClient de FastAPI (12 tests) |
| 22 | ✅ | **Tests frontend** — Tests unitarios con Vitest (`financial-utils.test.ts`) |
| 23 | ✅ | **Tailwind CSS v4** — Estilos utilitarios con el plugin oficial de Vite |
| 24 | ✅ | **Componentes shadcn/ui** — Patrón CVA + clsx + tailwind-merge para variantes de componentes |
| 25 | ✅ | **Variables de entorno** — `.env.example` con `VITE_API_BASE_URL` para backend alternativo |
| 26 | ✅ | **Modo debug** — Puerto 5678 expuesto con Debugpy para depuración remota del backend |
| 27 | ✅ | **.gitignore** — Reglas para Python, Node, Docker y archivos del sistema operativo |
| 28 | ✅ | **AGENTS.md** — Instrucciones para agentes de IA sobre reglas, skills y memory bank |
| 29 | ✅ | **Mock data determinista** — Datos generados con `seed=42` para resultados reproducibles |
| 30 | ✅ | **Soporte multilingüe** — README disponible en inglés y español |
