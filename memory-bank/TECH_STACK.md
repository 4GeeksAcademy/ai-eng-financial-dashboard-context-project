---
name: Technology Stack
date_last_updated: 2026-11-25
categories: [languages, frameworks, tooling, infrastructure]
---

# Technology Stack

## Overview

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 19.2.4 | UI framework |
| **Frontend** | TypeScript | 6.0.2 | Type safety |
| **Frontend** | Vite | 8.0.4 | Build tool & dev server |
| **Backend** | Python | 3.13 | Runtime |
| **Backend** | FastAPI | (latest) | Web framework |
| **Backend** | Uvicorn | (latest) | ASGI server |
| **Infrastructure** | Docker | - | Containerization |
| **Infrastructure** | Docker Compose | - | Local orchestration |

---

## Frontend Stack

### Core Dependencies

```json
{
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "typescript": "~6.0.2"
}
```

### Styling & Components

```json
{
  "tailwindcss": "^4.2.2",
  "@tailwindcss/vite": "^4.2.2",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.5.0"
}
```

**Key Details**:
- **Tailwind CSS v4**: OKLCH color space for accessibility
- **CVA Pattern**: Component variants via `class-variance-authority`
- **Utility Merging**: `tailwind-merge` prevents class conflicts
- **CSS Variables**: Theme colors in `:root` and `.dark`

### Data Visualization

```json
{
  "recharts": "^3.8.1",
  "lucide-react": "^1.8.0"
}
```

**Chart Types Implemented**:
- Bar chart (Income vs Outcome by month)
- Line/Area chart (Profit % evolution)

### Development Tools

```json
{
  "@vitejs/plugin-react": "^6.0.1",
  "vite": "^8.0.4",
  "vitest": "^4.1.4",
  "@vitest/coverage-v8": "^4.1.4",
  "eslint": "^9.39.4",
  "typescript-eslint": "^8.58.0",
  "postcss": "^8.5.9",
  "autoprefixer": "^10.4.27"
}
```

**Testing**:
- Vitest for unit tests (TypeScript, React components)
- Coverage reporting via `@vitest/coverage-v8`

**Linting**:
- ESLint + TypeScript plugin for code quality

### Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TS compiler options |
| `tsconfig.app.json` | App-specific paths (alias `@/`) |
| `vite.config.ts` | Vite build & dev config |
| `eslint.config.js` | ESLint rules |
| `.env.example` | Sample env variables (`VITE_API_BASE_URL`) |

---

## Backend Stack

### Core Dependencies

```txt
fastapi          # Web framework with OpenAPI/Swagger
uvicorn[standard]  # ASGI server with hot reload
debugpy          # Remote debugging (port 5678)
pytest           # Test framework
pytest-cov       # Coverage reporting
httpx            # HTTP client for tests
```

**Python Version**: 3.13 (latest, from Dockerfile)

### Key Libraries Used

| Library | Purpose | Usage |
|---------|---------|-------|
| **FastAPI** | Web framework | Route handlers, request validation |
| **Pydantic** | Data validation | Request/response models |
| **CORSMiddleware** | CORS security | Cross-origin request handling |
| **random** | Deterministic seed | Mock data generation |
| **datetime** | Date handling | Financial movement timestamps |

### API Architecture

**Type Definitions** (Pydantic models):
- `FinancialMovement`: Transaction record
- `ProfitMargin`: Single float metric
- `MetricsSummary`: Aggregated by period
- `MetricsFacets`: Filter dimensions
- `TopCategoryItem`: Category ranking
- `MetricsAlert`: Anomaly detection
- `MetricComparison`: Period delta

**Endpoints Structure**:
- Base: `/api/` namespace
- Schema: RESTful GET operations
- Response Format: JSON with strict types

### Infrastructure

| File | Purpose |
|------|---------|
| `Dockerfile` | Python 3.13 image, Uvicorn runner |
| `.venv/` | Virtual environment (not in repo) |
| `requirements.txt` | Pinned dependencies |
| `app/main.py` | FastAPI app + middleware setup |
| `app/routes.py` | 11 endpoints + helpers |

---

## Development Workflow

### Local Setup

**Frontend**:
```bash
cd frontend
npm install
npm run dev        # Vite dev server on :5173
npm test           # Vitest
npm run lint       # ESLint
npm run build      # Production build
```

**Backend**:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
# Or with debugpy:
python -m debugpy --listen 0.0.0.0:5678 -m uvicorn app.main:app --reload
```

### Docker Setup

```bash
docker compose up --build
# Frontend: :5173
# Backend: :8000
# API Docs: :8000/docs
```

---

## Environment & Build

### Variables

| Name | Scope | Default | Purpose |
|------|-------|---------|---------|
| `VITE_API_BASE_URL` | Frontend | (empty) | Override backend URL in production |
| `CORS_ORIGINS` | Backend | `*` (dev) | Restrict origins in production |

### Build Outputs

**Frontend**:
- `dist/` folder (Vite output)
- Minified JS/CSS/HTML

**Backend**:
- Python wheel (not packaged, runs directly)

---

## Deployment Readiness

✅ **Production-Ready Features**:
- Configurable CORS via env var (`os.getenv("CORS_ORIGINS")`)
- Pydantic validation on all endpoints
- OpenAPI/Swagger docs for API contracts
- Docker containerization for reproducibility
- pytest suite for regression testing

❌ **Not Included** (out of scope):
- Database (uses in-memory mock)
- Authentication/Authorization
- Rate limiting
- Logging aggregation
- Monitoring/Alerting

---

## Dependency Validation

### CVE Status
- **Frontend**: npm packages checked for security updates
- **Backend**: pip packages pinned to known-good versions
- **Review Cadence**: Regular updates via tools like Dependabot

### License Compliance
- **MIT**: React, Tailwind, Vite, FastAPI, Uvicorn
- **Apache 2.0**: TypeScript
- All permissive licenses (no GPL)

---

## Related Documentation

- **Styling Rules**: `.agents/rules/07-styles.mdc` (CSS variables in `index.css`)
- **DX Rules**: `.agents/rules/05-developer-experience.mdc` (alias @/, debugpy port)
- **Testing Standards**: `.agents/rules/03-testing.mdc` (file naming, coverage)
- **Frontend React**: `.agents/rules/09-frontend-react.mdc` (component structure)

