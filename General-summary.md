## 📊 Resumen General del Proyecto: **Financial Metrics Dashboard**

### 🧭 ¿Qué es?

**Financial Metrics Dashboard** es una aplicación web full-stack que visualiza métricas financieras simuladas. Proporciona un panel ejecutivo interactivo con indicadores clave de rendimiento (KPIs), gráficos de ingresos vs gastos, y análisis de márgenes de ganancia.

El proyecto fue desarrollado por estudiantes de **4Geeks Academy** como parte del programa de **AI Engineering**, bajo la autoría de [@marcogonzalo](https://github.com/marcogonzalo) y otros contribuidores.

---

### 🏗️ Arquitectura General

| Componente | Tecnología | Puerto |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS 4 | `5173` |
| **Backend** | Python 3.13 + FastAPI + Uvicorn | `8000` |
| **Contenedores** | Docker Compose (2 servicios) | — |

Se ejecuta completamente con `docker compose up --build`.

---

### 🔙 Backend (FastAPI)

**Ruta:** backend

**Dependencias principales:** `fastapi`, `uvicorn`, `debugpy`, `pytest`, `httpx`

**Archivos clave:**
- `app/main.py` — Configuración de la app FastAPI con CORS habilitado.
- `app/routes.py` — Toda la lógica de negocio y endpoints de la API.

#### Endpoints de la API (verificables en routes.py):

| Endpoint | Método | Descripción |
|---|---|---|
| `GET /health` | Health check | Retorna `{"status": "ok"}` |
| `GET /api/metrics` | Lista movimientos financieros con filtros opcionales por `start_date`, `end_date`, `category`, `operation_type` |
| `GET /api/metrics/facets` | Facetas disponibles (tipos de operación, tipos de negocio, categorías, rango de fechas) |
| `GET /api/metrics/summary` | Resumen agrupado por `day`, `week` o `month` con totales de income/outcome/net |
| `GET /api/metrics/categories/top` | Top N categorías por `operation_type` |
| `GET /api/metrics/comparison` | Comparación entre dos períodos (net actual vs anterior con delta absoluto y porcentual) |
| `GET /api/metrics/alerts` | Detección de alertas/anomalías cuando un período supera un umbral (%) sobre el promedio histórico |
| `GET /api/metrics/b2b` | Filtrado solo para movimientos B2B |
| `GET /api/metrics/b2c` | Filtrado solo para movimientos B2C |

**Características del backend:**
- Genera **360 movimientos mock aleatorios** (30 por mes durante 12 meses) con semilla fija `seed=42` para resultados deterministas.
- Cada movimiento tiene: `create_date`, `amount`, `operation_type` (income/outcome), `category` (suppliers, sales, operational, administrative, others), `business_type` (B2B/B2C).
- Función `detect_outcome_alerts` que compara cada período contra el promedio histórico acumulado y alerta si la variación supera un umbral configurable.
- Función `calculate_net_value` para calcular valor neto (income - outcome).

**Tests (verificables en `tests/test_routes.py`):**
14 tests con `pytest` que cubren: generación de datos mock, filtros por fecha, endpoints B2B/B2C, filtros por categoría/tipo de operación, facets, summary, top categories, comparison, alerts.

---

### 🖥️ Frontend (React + TypeScript)

**Ruta:** frontend

**Dependencias principales:** `react`, `recharts` (gráficos), `lucide-react` (iconos), `tailwindcss`, `clsx`, `class-variance-authority`

**Componentes del Dashboard:**

| Componente | Archivo | Función |
|---|---|---|
| `DashboardHeader` | dashboard-header.tsx | Encabezado con título "Financial Overview" y badge del período |
| `KPIRow` | kpi-row.tsx | Grid de 4 tarjetas KPI |
| `KPICard` | kpi-card.tsx | Tarjeta individual con label, valor, descripción e ícono (con variantes de color para income/outcome/profit) |
| `IncomeOutcomeChart` | income-outcome-chart.tsx | Gráfico de líneas (Recharts) mostrando ingresos vs gastos mensuales |
| `ProfitPercentChart` | profit-percent-chart.tsx | Gráfico de líneas del margen de ganancia porcentual mensual |

**Lógica de negocio del frontend** (en `lib/`):
- financial-types.ts — Interfaces TypeScript (`FinancialMovement`, `KPIMetrics`, `MonthlyDataPoint`).
- financial-utils.ts — Funciones: `computeKPIs` (totales y profit), `computeMonthlyData` (agregación mensual), `formatCurrency`, `formatPercent`.
- financial-utils.test.ts — Tests con Vitest que verifican el cálculo de KPIs y la agregación mensual.
- mock-data.ts — Dataset mock estático de 53 movimientos financieros del año 2024.
- utils.ts — Función utilitaria `cn()` para merging de clases Tailwind.

**UI Components** (en `components/ui/`):
- card.tsx — Componente Card reutilizable (con `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`).
- skeleton.tsx — Componente Skeleton para estados de carga.

**Estilos:** Tailwind CSS 4 con tema oscuro personalizado. Variables CSS en `oklch()` para colores del dashboard (income, outcome, profit badges). Usa el patrón `.dark` para modo oscuro.

**Configuración de Vite:** Proxy configurado para redirigir `/api` al backend en `http://backend:8000`, alias `@` apuntando a `src/`.

---

### 🐳 Infraestructura (Docker Compose)

```yaml
services:
  frontend:
    build: ./frontend      # Node 24, puerto 5173
    volumes: ./frontend:/app (con hot-reload)
    depends_on: backend

  backend:
    build: ./backend       # Python 3.13-slim, puertos 8000 y 5678 (debug)
    volumes: ./backend:/app (con hot-reload)
```

El backend se ejecuta con `debugpy` para depuración remota y `--reload` para recarga automática.

---

### 🧪 Tests (verificables en el código)

| Capa | Framework | Cantidad de tests |
|---|---|---|
| **Backend** | `pytest` + `httpx` (TestClient) | 14 tests |
| **Frontend** | `vitest` | 5 tests (3 describes) |

---

### 📁 Estructura de directorios (verificada)

```
├── docker-compose.yml
├── README.md / README.es.md
├── AGENTS.md                 ← Guía para agentes de IA
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py
│   │   └── routes.py
│   └── tests/
│       ├── conftest.py
│       └── test_routes.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── components.json
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── index.css
        ├── components/
        │   ├── dashboard/
        │   │   ├── dashboard-header.tsx
        │   │   ├── kpi-row.tsx
        │   │   ├── kpi-card.tsx
        │   │   ├── income-outcome-chart.tsx
        │   │   └── profit-percent-chart.tsx
        │   └── ui/
        │       ├── card.tsx
        │       └── skeleton.tsx
        └── lib/
            ├── financial-types.ts
            ├── financial-utils.ts
            ├── financial-utils.test.ts
            ├── mock-data.ts
            └── utils.ts
```

---

**Resumen ejecutivo:** Este proyecto es un dashboard financiero full-stack completamente funcional con datos mock deterministas, 11 endpoints REST documentados en FastAPI, visualizaciones interactivas con Recharts, tema oscuro, contenedores Docker con hot-reload, y suite de tests tanto en frontend (Vitest) como backend (pytest).
