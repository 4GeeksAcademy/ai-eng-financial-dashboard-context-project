# 🗺️ Mapa de Arquitectura — Financial Metrics Dashboard

> **Proyecto:** Dashboard financiero con frontend React + TypeScript y backend FastAPI.
> **Generado el:** 2026-11-12

---

## 1. 📁 Carpetas Principales

```
ai-eng-financial-dashboard-context-project-AdrianGomezMesto/
│
├── backend/                 → API REST (Python / FastAPI)
│   ├── app/                 → Código fuente del backend
│   │   ├── __init__.py
│   │   ├── main.py          → Punto de entrada del backend
│   │   └── routes.py        → Endpoints, modelos y lógica de negocio
│   └── tests/               → Tests del backend (pytest + httpx)
│       ├── conftest.py
│       └── test_routes.py
│
├── frontend/                → UI (React 19 + TypeScript + Vite + Tailwind v4)
│   ├── public/              → Archivos estáticos
│   ├── src/                 → Código fuente del frontend
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── dashboard/   → Componentes específicos del dashboard
│   │   │   │   ├── dashboard-header.tsx
│   │   │   │   ├── kpi-row.tsx
│   │   │   │   ├── kpi-card.tsx
│   │   │   │   ├── income-outcome-chart.tsx
│   │   │   │   └── profit-percent-chart.tsx
│   │   │   └── ui/          → Componentes UI reutilizables (shadcn/ui)
│   │   │       ├── card.tsx
│   │   │       └── skeleton.tsx
│   │   ├── lib/             → Utilidades, tipos y datos mock
│   │   │   ├── financial-types.ts
│   │   │   ├── financial-utils.ts
│   │   │   ├── financial-utils.test.ts
│   │   │   ├── mock-data.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx          → Componente raíz
│   │   ├── main.tsx         → Entry point del frontend
│   │   └── index.css        → Estilos globales + tema CSS
│   ├── components.json
│   ├── vite.config.ts
│   ├── package.json
│   ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
│   ├── eslint.config.js
│   └── Dockerfile
│
├── docker-compose.yml       → Orquestación de servicios
├── AGENTS.md                → Guía para agentes de IA
├── README.md / README.es.md → Documentación del proyecto
└── MAPEO.md                 ← Este archivo
```

---

## 2. 📄 Archivos Más Importantes

### Backend

| Archivo | Ruta | Propósito |
|---|---|---|
| **main.py** | `backend/app/main.py` | Punto de entrada. Crea la app FastAPI, configura CORS (`allow_origins=["*"]`) e incluye el router |
| **routes.py** | `backend/app/routes.py` | Define todos los endpoints, modelos Pydantic (`FinancialMovement`, `MetricsSummaryItem`, `MetricsAlert`, etc.) y la lógica de negocio (generación de datos mock, filtros, sumarización, detección de alertas) |
| **requirements.txt** | `backend/requirements.txt` | Dependencias: `fastapi`, `uvicorn[standard]`, `debugpy`, `pytest`, `pytest-cov`, `httpx` |
| **Dockerfile** | `backend/Dockerfile` | Imagen `python:3.13-slim`. Ejecuta uvicorn con debugpy en modo recarga (`--reload`) |
| **conftest.py** | `backend/tests/conftest.py` | Añade el directorio raíz del backend al `sys.path` para poder importar `app` |
| **test_routes.py** | `backend/tests/test_routes.py` | Tests de endpoints (`/health`, `/api/metrics`, `/api/metrics/b2b`, `/api/metrics/b2c`) y funciones helper (`generate_mock_movements`, `filter_movements_by_date`) |

### Frontend

| Archivo | Ruta | Propósito |
|---|---|---|
| **main.tsx** | `frontend/src/main.tsx` | Entry point. Renderiza `<App />` dentro de `<StrictMode>` en `#root` |
| **App.tsx** | `frontend/src/App.tsx` | Componente raíz. Obtiene datos de la API (`GET /api/metrics`), los procesa con `computeKPIs()` y `computeMonthlyData()`, y orquesta el dashboard |
| **financial-types.ts** | `frontend/src/lib/financial-types.ts` | Tipos TypeScript compartidos: `FinancialMovement`, `KPIMetrics`, `MonthlyDataPoint`, `OperationType`, `Category`, `BusinessType` |
| **financial-utils.ts** | `frontend/src/lib/financial-utils.ts` | Utilidades: `computeKPIs()`, `computeMonthlyData()`, `formatCurrency()`, `formatPercent()` |
| **financial-utils.test.ts** | `frontend/src/lib/financial-utils.test.ts` | Tests unitarios con Vitest para `computeKPIs`, `computeMonthlyData`, `formatCurrency`, `formatPercent` |
| **mock-data.ts** | `frontend/src/lib/mock-data.ts` | Datos mock estáticos con movimientos de Enero a Diciembre 2024 para desarrollo offline |
| **vite.config.ts** | `frontend/vite.config.ts` | Configura Vite con plugin React, Tailwind CSS v4, proxy `/api → http://backend:8000` y alias `@ → ./src` |
| **package.json** | `frontend/package.json` | Dependencias: React 19, Recharts 3, Lucide React, Tailwind v4, clsx, tailwind-merge. Dev: TypeScript 6, Vitest, ESLint |
| **index.css** | `frontend/src/index.css` | Tema completo con variables CSS (modo claro/oscuro), colores para charts y badges |

---

## 3. 🧩 Servicios y Módulos

### Backend — Funciones de lógica de negocio (en `routes.py`)

| Función | Descripción |
|---|---|
| `generate_mock_movements(seed=42)` | Genera 360 movimientos financieros mock (12 meses × 30 movs/día aleatorio) con datos deterministas |
| `_build_movement(month, income_probability, today)` | Construye un movimiento individual con tipo, categoría, monto y fecha aleatorios |
| `filter_movements_by_date()` | Filtra por rango de fechas (inicio y fin) |
| `filter_movements()` | Filtra combinando fecha, categoría y tipo de operación |
| `ensure_chronological_order()` | Ordena movimientos por fecha ascendente |
| `build_metrics_facets()` | Extrae los valores únicos de tipos, categorías, business types y rango de fechas |
| `summarize_movements()` | Agrupa movimientos por día/semana/mes y calcula income, outcome y net |
| `build_top_categories()` | Obtiene el Top N de categorías por tipo de operación (income/outcome) |
| `calculate_net_value()` | Calcula el valor neto (income total - outcome total) |
| `detect_outcome_alerts()` | Detecta periodos donde los gastos superan un umbral (%) respecto al promedio histórico |

### Frontend — Componentes React

| Componente | Ruta | Descripción |
|---|---|---|
| **DashboardHeader** | `components/dashboard/dashboard-header.tsx` | Encabezado con ícono, título "Financial Overview" y badge del período |
| **KPIRow** | `components/dashboard/kpi-row.tsx` | Grid de 4 columnas con `KPICard` para Total Income, Total Outcome, Profit y Profit Margin |
| **KPICard** | `components/dashboard/kpi-card.tsx` | Tarjeta individual con label, valor, helper text, icono (Lucide) y variante de color (income/outcome/profit/profitPercent). Incluye estado de carga con Skeleton |
| **IncomeOutcomeChart** | `components/dashboard/income-outcome-chart.tsx` | Gráfico de líneas (Recharts) mostrando ingresos vs gastos mensuales con tooltip personalizado |
| **ProfitPercentChart** | `components/dashboard/profit-percent-chart.tsx` | Gráfico de líneas del margen de ganancia mensual con ReferenceLine en 0% y tooltip personalizado |
| **Card** (y subcomponentes) | `components/ui/card.tsx` | Componente Card reutilizable estilo shadcn/ui con `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardAction` |
| **Skeleton** | `components/ui/skeleton.tsx` | Placeholder de carga con animación pulse |

---

## 4. 🚪 Puntos de Entrada (Entry Points)

### Backend
```
backend/app/main.py
  └─ Crea FastAPI(title="Financial Metrics API")
      ├─ app.add_middleware(CORSMiddleware, allow_origins=["*"])
      └─ app.include_router(router)  → importado de app.routes

Ejecutado por: python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```
frontend/src/main.tsx
  └─ createRoot(document.getElementById('root')!).render(
       <StrictMode>
         <App />
       </StrictMode>
     )

Ejecutado por: npm run dev → vite (puerto 5173)
```

### Infraestructura
```
docker-compose.yml
  ├─ frontend (servicio)
  │   ├─ build: ./frontend/Dockerfile
  │   ├─ ports: 5173:5173
  │   └─ depends_on: backend
  └─ backend (servicio)
      ├─ build: ./backend/Dockerfile
      └─ ports: 8000:8000, 5678:5678
```

---

## 5. 🔗 Diagrama de Conexión entre Componentes

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DOCKER COMPOSE                                         │
│                                                                                     │
│  ┌──────────────────────────────┐         ┌──────────────────────────────────┐      │
│  │      FRONTEND (:5173)         │         │       BACKEND (:8000)            │      │
│  │                               │         │                                  │      │
│  │  main.tsx                     │         │  main.py                         │      │
│  │    └─ App.tsx                 │         │    └─ routes.py                  │      │
│  │         │                     │         │         │                        │      │
│  │         │ fetch("/api/metrics")│  Vite  │         │                        │      │
│  │         ├─────────────────────┼────────►│         │                        │      │
│  │         │                     │  Proxy  │         ├─ GET /health           │      │
│  │         ▼                     │  /api   │         ├─ GET /api/metrics      │      │
│  │    ┌─────────┐               │ ──────► │         ├─ /api/metrics/facets   │      │
│  │    │ compute │               │         │         ├─ /api/metrics/summary  │      │
│  │    │ KPIs()  │               │         │         ├─ /api/metrics/         │      │
│  │    └────┬────┘               │         │         │   categories/top       │      │
│  │         │ KPIMetrics         │         │         ├─ /api/metrics/         │      │
│  │         ▼                    │         │         │   comparison           │      │
│  │    ┌──────────┐             │         │         ├─ /api/metrics/alerts   │      │
│  │    │ KPIRow   │             │         │         ├─ /api/metrics/b2b      │      │
│  │    │ └─ KPICard(x4)         │         │         └─ /api/metrics/b2c      │      │
│  │    └──────────┘             │         │                                  │      │
│  │                              │         │   generate_mock_movements(42)    │      │
│  │    ┌──────────────────┐     │         │   filter_movements()             │      │
│  │    │ computeMonthlyData│     │         │   summarize_movements()          │      │
│  │    └───────┬──────────┘     │         │   build_top_categories()         │      │
│  │            │ MonthlyDataPoint[]      │   calculate_net_value()           │      │
│  │            ▼                 │         │   detect_outcome_alerts()        │      │
│  │    ┌──────────────────┐     │         │                                  │      │
│  │    │ IncomeOutcomeChart│     │         │  tests/                          │      │
│  │    │ ProfitPercentChart│     │         │  ├─ conftest.py                  │      │
│  │    └──────────────────┘     │         │  └─ test_routes.py               │      │
│  │                              │         └──────────────────────────────────┘      │
│  │  lib/                        │                                                   │
│  │  ├─ financial-types.ts      │                                                   │
│  │  ├─ financial-utils.ts      │                                                   │
│  │  └─ mock-data.ts            │                                                   │
│  │                              │                                                   │
│  │  components/ui/             │                                                   │
│  │  ├─ card.tsx                │                                                   │
│  │  └─ skeleton.tsx            │                                                   │
│  │                              │                                                   │
│  │  tests/                      │                                                   │
│  │  └─ financial-utils.test.ts │                                                   │
│  └──────────────────────────────┘         └──────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. 🌐 Endpoints de la API (Backend)

| Método | Ruta | Parámetros | Descripción |
|---|---|---|---|
| GET | `/health` | — | Health check. Retorna `{"status": "ok"}` |
| GET | `/api/metrics` | `start_date`, `end_date`, `category`, `operation_type` | Lista completa de movimientos financieros (con filtros opcionales) |
| GET | `/api/metrics/facets` | — | Facetas disponibles para filtrar: tipos, categorías, business types, rango de fechas |
| GET | `/api/metrics/summary` | `group_by` (day/week/month), `start_date`, `end_date`, `category`, `operation_type`, `business_type` | Resumen agrupado con income, outcome y net |
| GET | `/api/metrics/categories/top` | `operation_type` (income/outcome), `limit` (1-20), `start_date`, `end_date`, `business_type` | Top N categorías por tipo de operación |
| GET | `/api/metrics/comparison` | `start_date`, `end_date`, `business_type` | Comparación del período actual vs el período anterior (delta absoluto y porcentual) |
| GET | `/api/metrics/alerts` | `threshold` (default 0.3), `group_by`, `start_date`, `end_date`, `business_type` | Alertas cuando los gastos superan el umbral respecto al promedio histórico |
| GET | `/api/metrics/b2b` | `start_date`, `end_date`, `category`, `operation_type` | Movimientos filtrados solo para negocio B2B |
| GET | `/api/metrics/b2c` | `start_date`, `end_date`, `category`, `operation_type` | Movimientos filtrados solo para negocio B2C |

---

## 7. 🔄 Flujo de Datos (Resumen)

```
1. El usuario abre http://localhost:5173
2. Vite sirve el frontend (React)
3. App.tsx se monta → useEffect → fetch("/api/metrics")
4. Vite proxy redirige a http://backend:8000/api/metrics
5. Backend genera 360 movimientos mock con seed=42
6. Backend devuelve JSON con los movimientos
7. App.tsx procesa:
   a. computeKPIs(movements) → { totalIncome, totalOutcome, profit, profitPercent }
   b. computeMonthlyData(movements) → [{ month, income, outcome, profitPercent }, ...]
8. Pasa KPIMetrics a <KPIRow> → 4 <KPICard>
9. Pasa MonthlyDataPoint[] a <IncomeOutcomeChart> y <ProfitPercentChart>
10. Recharts renderiza los gráficos con tema oscuro
```

---

## 8. 🧪 Tests

| Tipo | Ubicación | Herramienta | ¿Qué prueba? |
|---|---|---|---|
| Backend | `backend/tests/test_routes.py` | pytest + httpx (TestClient) | Endpoints: `/health`, `/api/metrics`, `/api/metrics/b2b`, `/api/metrics/b2c`. Funciones: `generate_mock_movements`, `filter_movements_by_date` |
| Frontend | `frontend/src/lib/financial-utils.test.ts` | Vitest | `computeKPIs` (cálculo de ingresos, gastos, ganancia, margen), `computeMonthlyData`, `formatCurrency`, `formatPercent` |

---

## 9. 🛠️ Tecnologías Principales

| Capa | Tecnología | Versión |
|---|---|---|
| Backend | Python + FastAPI | Python 3.13 |
| Backend (servidor) | Uvicorn | — |
| Frontend | React + TypeScript | React 19, TypeScript 6 |
| Frontend (build) | Vite | — |
| Frontend (estilos) | Tailwind CSS v4 | — |
| Frontend (gráficos) | Recharts | 3.x |
| Frontend (iconos) | Lucide React | — |
| Frontend (UI) | shadcn/ui (Card, Skeleton) | — |
| Frontend (tests) | Vitest | — |
| Backend (tests) | pytest + httpx | — |
| Infraestructura | Docker / Docker Compose | — |