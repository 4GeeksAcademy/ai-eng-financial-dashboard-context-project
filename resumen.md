# Resumen Técnico del Proyecto

**Financial Metrics Dashboard**

---

## 1. ¿Qué hace el proyecto?

Es un **dashboard financiero** que muestra métricas clave de ingresos y gastos de una empresa. Presenta una interfaz visual con:

- **Indicadores KPI**: Total Income, Total Outcome, Profit y Profit Margin.
- **Gráfico de líneas "Income vs. Outcome"**: evolución mensual de ingresos y gastos.
- **Gráfico de líneas "Profit Margin %"**: margen de ganancia mensual como porcentaje.

Los datos provienen de una **API REST** que genera **movimientos financieros simulados (mock)** de forma determinista (siempre genera los mismos datos gracias a una semilla fija `seed=42`), representando un año completo de actividad empresarial con 360 movimientos (30 por mes).

---

## 2. ¿Para qué sirve?

Sirve como **herramienta de visualización ejecutiva** para:

- Monitorear rápidamente la salud financiera de una empresa.
- Identificar tendencias de ingresos y gastos mes a mes.
- Detectar alertas cuando los gastos de un período superan un umbral respecto al promedio histórico.
- Comparar el rendimiento financiero entre períodos.

Además, el proyecto está diseñado como un **ejercicio de ingeniería para agentes de IA**: los desarrolladores deben forkearlo y ejecutar agentes de IA para que inspeccionen el código fuente, documenten reglas y creen un "memory bank" del proyecto (según el archivo `AGENTS.md`).

---

## 3. ¿Cómo se ejecuta?

### Con Docker (recomendado)

```bash
docker compose up --build
```

Esto inicia dos contenedores:

| Servicio | Puerto | Comando |
|---|---|---|
| **Frontend** (React) | `localhost:5173` | `npm run dev` |
| **Backend** (FastAPI) | `localhost:8000` | `uvicorn app.main:app --reload` |
| **Backend debugger** | `localhost:5678` | `debugpy` |

### Sin Docker

- **Backend**: `pip install -r requirements.txt && uvicorn app.main:app --reload`
- **Frontend**: `npm install && npm run dev`

### Documentación de la API

Una vez ejecutando el backend, la documentación interactiva (Swagger) está disponible en:

> http://localhost:8000/docs

---

## 4. ¿Qué tecnologías utiliza?

### Backend

| Tecnología | Versión / Detalle | Propósito |
|---|---|---|
| **Python** | 3.13 | Lenguaje de programación |
| **FastAPI** | — | Framework web para crear la API REST |
| **Uvicorn** | — | Servidor ASGI para servir FastAPI |
| **Pydantic** | — | Validación de datos y modelos (`BaseModel`) |
| **debugpy** | — | Depurador remoto (puerto 5678) |
| **pytest** + **httpx** | — | Tests del backend (cliente HTTP de prueba) |
| **Docker** | Python 3.13-slim | Contenedor del backend |

### Frontend

| Tecnología | Versión / Detalle | Propósito |
|---|---|---|
| **React** | 19.2.4 | Framework de UI |
| **TypeScript** | ~6.0.2 | Tipado estático |
| **Vite** | 8.0.4 | Bundler y dev server |
| **Tailwind CSS** | 4.2.2 | Framework de estilos CSS |
| **Recharts** | 3.8.1 | Librería de gráficos (líneas) |
| **Lucide React** | 1.8.0 | Iconos |
| **shadcn/ui** | — | Componentes base: `Card`, `Skeleton` |
| **clsx** + **tailwind-merge** | — | Utilidades para clases CSS condicionales |
| **Vitest** | 4.1.4 | Tests unitarios |
| **ESLint** | 9.x | Linter |
| **Docker** | Node 24-alpine | Contenedor del frontend |

---

## 5. ¿Cuáles son sus componentes principales?

### Backend (`backend/app/routes.py`)

| Componente / Función | Descripción |
|---|---|
| `generate_mock_movements(seed=42)` | Genera 360 movimientos financieros mock con datos deterministas. Para cada mes crea 30 movimientos con tipo (income/outcome), categoría, monto y fecha aleatorios. |
| `filter_movements()` | Filtra la lista de movimientos por fecha, categoría y tipo de operación. |
| `summarize_movements()` | Agrupa los movimientos por día, semana o mes y calcula income, outcome y neto. |
| `build_top_categories()` | Obtiene el Top N de categorías (suppliers, sales, operational, etc.) para un tipo de operación. |
| `calculate_net_value()` | Calcula el valor neto = suma(income) - suma(outcome). |
| `detect_outcome_alerts()` | Compara cada período contra el promedio histórico de gastos y genera alertas si la diferencia supera un umbral (default 30%). |
| `build_metrics_facets()` | Extrae los valores únicos disponibles (categorías, tipos, business types) y el rango de fechas. |

### Backend — Modelos Pydantic

| Modelo | Campos |
|---|---|
| `FinancialMovement` | `create_date`, `amount`, `operation_type` (income/outcome), `category`, `business_type` (B2B/B2C) |
| `MetricsFacets` | `operation_types`, `business_types`, `categories`, `min_date`, `max_date` |
| `MetricsSummaryItem` | `period`, `income`, `outcome`, `net` |
| `TopCategoryItem` | `category`, `operation_type`, `total_amount` |
| `MetricsComparison` | `current_period`, `previous_period`, `delta_abs`, `delta_pct` |
| `MetricsAlert` | `period`, `outcome_total`, `baseline_average`, `increase_ratio` |

### Frontend — Componentes React

| Componente | Archivo | Descripción |
|---|---|---|
| **App** | `App.tsx` | Componente raíz. Obtiene datos de la API (`GET /api/metrics`), los procesa y renderiza el layout completo. |
| **DashboardHeader** | `components/dashboard/dashboard-header.tsx` | Encabezado con ícono, título y badge del período (ej. "2024 - Full Year"). |
| **KPIRow** | `components/dashboard/kpi-row.tsx` | Grid de 4 tarjetas KPI. |
| **KPICard** | `components/dashboard/kpi-card.tsx` | Tarjeta individual con label, valor formateado, helper text, icono y color según variante (income/outcome/profit/profitPercent). |
| **IncomeOutcomeChart** | `components/dashboard/income-outcome-chart.tsx` | Gráfico de líneas doble (ingresos en azul, gastos en naranja) usando Recharts. |
| **ProfitPercentChart** | `components/dashboard/profit-percent-chart.tsx` | Gráfico de línea simple del margen de ganancia mensual con línea de referencia en 0%. |

### Frontend — Utilidades (`src/lib/`)

| Archivo | Contenido |
|---|---|
| `financial-types.ts` | Tipos TypeScript: `FinancialMovement`, `KPIMetrics`, `MonthlyDataPoint`, `OperationType`, `Category`, `BusinessType`. |
| `financial-utils.ts` | Funciones: `computeKPIs()` (totales y margen), `computeMonthlyData()` (serie mensual), `formatCurrency()` (USD), `formatPercent()`. |
| `mock-data.ts` | Datos mock estáticos con movimientos de ejemplo de Enero a Diciembre 2024. |
| `utils.ts` | Función `cn()` para combinar clases CSS (clsx + tailwind-merge). |

### Frontend — Tests

| Archivo | Herramienta | ¿Qué prueba? |
|---|---|---|
| `financial-utils.test.ts` | Vitest | `computeKPIs` (cálculo de ingresos, gastos, ganancia, margen con datos de ejemplo), `computeMonthlyData`, `formatCurrency`, `formatPercent`. |

### Backend — Tests

| Archivo | Herramienta | ¿Qué prueba? |
|---|---|---|
| `backend/tests/test_routes.py` | pytest + TestClient (httpx) | Generación de movimientos (360 registros ordenados), filtros por fecha, endpoints: `/health`, `/api/metrics`, `/api/metrics/b2b`, `/api/metrics/b2c`. |

---

## 6. ¿Cómo funciona su arquitectura?

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            DOCKER COMPOSE                                 │
│                                                                          │
│  ┌──────────────────────┐              ┌──────────────────────────┐     │
│  │    FRONTEND (:5173)   │              │    BACKEND (:8000)       │     │
│  │                       │              │                          │     │
│  │  main.tsx             │              │  main.py                 │     │
│  │    └─ App.tsx ────────┼── Vite Proxy ──►  routes.py             │     │
│  │         │             │   /api       │       │                  │     │
│  │         ▼             │              │       ▼                  │     │
│  │    ┌──────────┐      │              │  generate_mock_movements │     │
│  │    │ compute  │      │              │  (seed=42 → 360 movs)    │     │
│  │    │ KPIs()   │      │              │       │                  │     │
│  │    └────┬─────┘      │              │       ▼                  │     │
│  │         │            │              │  filter / summarize /    │     │
│  │         ▼            │              │  build_top / detect_     │     │
│  │    ┌──────────┐     │              │  alerts / compare        │     │
│  │    │ KPIRow   │     │              │       │                  │     │
│  │    │ └─ KPICard     │              │       ▼                  │     │
│  │    └──────────┘     │              │  Respuesta JSON           │     │
│  │                     │              └──────────────────────────┘     │
│  │    ┌──────────────┐ │                                              │
│  │    │ computeMonthly│ │                                              │
│  │    │ Data()        │ │                                              │
│  │    └──────┬───────┘ │                                              │
│  │           ▼         │                                              │
│  │    ┌──────────────┐ │                                              │
│  │    │ IncomeOutcome│ │                                              │
│  │    │ Chart        │ │                                              │
│  │    │ ProfitPercent│ │                                              │
│  │    │ Chart        │ │                                              │
│  │    └──────────────┘ │                                              │
│  └──────────────────────┘              └──────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────────┘
```

### Flujo de datos paso a paso

1. El usuario abre `http://localhost:5173` en el navegador.
2. **Vite** (dev server) sirve la aplicación React.
3. `App.tsx` se monta y ejecuta un `useEffect` que llama a `fetch("/api/metrics")`.
4. **Vite proxy** intercepta la petición `/api` y la redirige a `http://backend:8000/api/metrics`.
5. **FastAPI** (backend) recibe la petición y ejecuta `generate_mock_movements(seed=42)`, que genera 360 movimientos financieros repartidos en 12 meses (30 por mes).
6. El backend responde con un **array JSON** de objetos `FinancialMovement`.
7. `App.tsx` recibe los datos y llama a dos funciones:
   - **`computeKPIs(movements)`** → calcula `{ totalIncome, totalOutcome, profit, profitPercent }`.
   - **`computeMonthlyData(movements)`** → agrupa por mes y genera `[{ month, income, outcome, profitPercent }, ...]`.
8. **`KPIRow`** recibe `KPIMetrics` y renderiza 4 instancias de **`KPICard`** con los valores formateados.
9. **`IncomeOutcomeChart`** y **`ProfitPercentChart`** reciben `MonthlyDataPoint[]` y renderizan gráficos de líneas con **Recharts**.
10. Los estilos se aplican con **Tailwind CSS v4** usando un tema oscuro (`className="dark"`).

### API REST (9 endpoints)

| Endpoint | Función |
|---|---|
| `GET /health` | Verifica que el backend está operativo. |
| `GET /api/metrics` | Lista todos los movimientos (con filtros opcionales por fecha, categoría, tipo). |
| `GET /api/metrics/facets` | Devuelve los valores únicos disponibles para filtros. |
| `GET /api/metrics/summary` | Resumen agrupado por día, semana o mes. |
| `GET /api/metrics/categories/top` | Top N de categorías para income o outcome. |
| `GET /api/metrics/comparison` | Compara el neto de un período contra el período anterior. |
| `GET /api/metrics/alerts` | Detecta períodos con gastos anormalmente altos. |
| `GET /api/metrics/b2b` | Movimientos filtrados solo para clientes B2B. |
| `GET /api/metrics/b2c` | Movimientos filtrados solo para clientes B2C. |

### Tipos de datos disponibles

- **operation_type**: `income` | `outcome`
- **category**: `suppliers` | `sales` | `operational` | `administrative` | `others`
- **business_type**: `B2B` | `B2C`
- **group_by**: `day` | `week` | `month`