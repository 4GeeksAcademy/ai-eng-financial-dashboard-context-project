# Tech Stack

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│                                                         │
│  ┌──────────────────┐        ┌──────────────────────┐  │
│  │    Frontend       │ proxy  │      Backend          │  │
│  │  React + TS + Vite│ /api → │  Python + FastAPI     │  │
│  │  :5173            │  :8000 │  :8000 + :5678 debug  │  │
│  └──────────────────┘        └──────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 24-alpine | Runtime |
| **React** | ^19.2.4 | UI library |
| **TypeScript** | ~6.0.2 | Type safety |
| **Vite** | ^8.0.4 | Bundler + dev server |
| **Tailwind CSS** | ^4.2.2 | Utility-first styling |
| **Recharts** | ^3.8.1 | Charts (LineChart) |
| **Lucide React** | ^1.8.0 | Icons |
| **shadcn/ui** | New York style | UI components (Card, Skeleton) |
| **Vitest** | ^4.1.4 | Unit testing |
| **ESLint** | ^9.39.4 | Linting |

### Frontend dependencies
- `class-variance-authority` — component variants
- `clsx` — conditional classes
- `tailwind-merge` — merge Tailwind classes
- `@tailwindcss/vite` — Tailwind Vite plugin

## Backend

| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.13-slim | Runtime |
| **FastAPI** | latest (unpinned) | REST API framework |
| **Uvicorn** | latest (unpinned) | ASGI server |
| **Pydantic** | (bundled) | Data validation |
| **debugpy** | latest | Remote debugging |
| **pytest** | latest | Testing |
| **pytest-cov** | latest | Coverage |
| **httpx** | latest | HTTP client for tests |

## Infrastructure

| Technology | Purpose |
|---|---|
| **Docker** | Containerization |
| **Docker Compose** | Service orchestration |

## Ports

| Port | Service | Purpose |
|---|---|---|
| 5173 | Frontend | Vite dev server |
| 8000 | Backend | FastAPI + Uvicorn |
| 5678 | Backend | debugpy remote debugger |

## File structure

```
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app, CORS, router
│   │   └── routes.py        # All API endpoints (~380 lines)
│   ├── tests/
│   │   ├── conftest.py      # Path setup
│   │   └── test_routes.py   # 5 tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Root component
│   │   ├── main.tsx          # Entry point
│   │   ├── index.css         # Theme + CSS variables
│   │   ├── components/
│   │   │   ├── dashboard/    # Business components
│   │   │   └── ui/           # shadcn/ui primitives
│   │   └── lib/
│   │       ├── financial-types.ts   # Type definitions
│   │       ├── financial-utils.ts   # KPI computation
│   │       ├── financial-utils.test.ts
│   │       ├── mock-data.ts         # Static reference data
│   │       └── utils.ts             # cn() helper
│   ├── Dockerfile
│   └── package.json
├── .agents/rules/            # Agent conventions
├── memory-bank/              # This directory
├── docker-compose.yml
├── AGENTS.md
└── README.md
```

## API Endpoints

| Method | Path | Response Model | Description |
|---|---|---|---|
| GET | `/health` | `{"status": "ok"}` | Health check |
| GET | `/api/metrics` | `list[FinancialMovement]` | All movements (filterable) |
| GET | `/api/metrics/facets` | `MetricsFacets` | Available filter values |
| GET | `/api/metrics/summary` | `list[MetricsSummaryItem]` | Grouped summary |
| GET | `/api/metrics/categories/top` | `list[TopCategoryItem]` | Top categories |
| GET | `/api/metrics/comparison` | `MetricsComparison` | Period comparison |
| GET | `/api/metrics/alerts` | `list[MetricsAlert]` | Outcome alerts |
| GET | `/api/metrics/b2b` | `list[FinancialMovement]` | B2B only |
| GET | `/api/metrics/b2c` | `list[FinancialMovement]` | B2C only |

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `""` (uses proxy) | Backend URL for API calls |

## SEO skill

The repository includes `.agents/skills/seo/SKILL.md` to guide technical SEO
audits for the React/Vite frontend. It was selected because the dashboard needs
technical optimization covering **crawlability, on-page elements, structured
data, and mobile best practices**. The skill is appropriate for checking the
SPA entry document, metadata, semantic headings, canonical/indexation controls,
responsive behavior, image/resource loading, and structured data eligibility.

SEO findings must remain evidence-based: source and HTTP checks can verify the
technical configuration, while actual indexing, ranking, and Core Web Vitals
outcomes require rendered-page measurements and, where applicable, Search
Console or field data.
