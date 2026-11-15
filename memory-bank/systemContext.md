# System Context - Financial Dashboard

**Last Updated:** 2026-11-13  
**Status:** Production-Grade Development (Pre-Production Review)  
**Architecture Version:** 1.0-alpha

---

## 📋 System Overview

### Purpose
A financial metrics dashboard for tracking B2B/B2C business operations with real-time KPI visualization and historical movement analysis.

### Primary Users
- Finance/Operations teams monitoring transaction movements
- Managers analyzing spending by category
- Analytics teams generating reports

### System Scope
```
┌─ Frontend (React/TypeScript) ──┐
│  - Dashboard UI Components      │
│  - Financial data visualization  │
│  - Client-side validation       │
└────────────────────────────────┘
         ↓ CORS + HTTP
┌─ Backend API (FastAPI) ────────┐
│  - Metrics calculation          │
│  - Movement filtering           │
│  - Comparison endpoints         │
└────────────────────────────────┘
         ↓ Python logic
┌─ Data Layer (Mock) ────────────┐
│  - Hardcoded movements (360)    │
│  - Deterministic seed (42)      │
│  - No persistence              │
└────────────────────────────────┘
```

### Key Capabilities
✅ Movement categorization (income/outcome)  
✅ Category breakdown analysis  
✅ Time-period comparisons  
✅ Alert generation  
✅ Type-safe frontend-backend contract  

### Known Limitations
⚠️ Data regenerated per-request (no caching)  
⚠️ No persistent storage layer  
⚠️ CORS open to all origins  
⚠️ No logging infrastructure  
⚠️ Limited test coverage  

---

## 🏗️ Technical Architecture

### Component Breakdown

#### Frontend Stack
- **Framework:** React 19.2.4 + TypeScript 6.0.2
- **Build Tool:** Vite 8.0.4
- **Styling:** Tailwind CSS 4.2.2 + CVA
- **Charts:** Recharts 3.8.1
- **Testing:** Vitest 4.1.4
- **Linting:** ESLint 9.39.4

**Key Files:**
- `/frontend/src/App.tsx` - Main entry point + API integration
- `/frontend/src/lib/financial-types.ts` - Shared type definitions
- `/frontend/src/components/dashboard/` - Domain components
- `/frontend/src/components/ui/` - Reusable UI components

#### Backend Stack
- **Framework:** FastAPI (latest)
- **Server:** Uvicorn with standard extras
- **Validation:** Pydantic BaseModel
- **Testing:** Pytest + Pytest-Cov
- **HTTP Client:** httpx
- **Development:** debugpy (⚠️ exposed in current config)

**Key Files:**
- `/backend/app/main.py` - Application setup, CORS middleware
- `/backend/app/routes.py` - All API endpoints (15 routes)
- `/backend/tests/test_routes.py` - Route tests

#### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Orchestration:** docker-compose.yml defines multi-container setup
- **Frontend Port:** 5173 (Vite dev server)
- **Backend Port:** 8000 (Uvicorn)
- **Debug Port:** 5678 (debugpy, ⚠️ exposed)

---

## 📊 Data Model

### Core Entities

**FinancialMovement** (Defined in both frontend and backend)
```
- id: UUID
- date: Date
- description: String
- amount: Float > 0
- operation_type: Literal["income", "outcome"]
- category: Literal["suppliers", "sales", "operational", "administrative", "others"]
- business_type: Literal["B2B", "B2C"]
- tags: List[String] (optional)
```

**KPIMetrics**
```
- total_income: Float
- total_outcome: Float
- net_result: Float (income - outcome)
- avg_income: Float
- avg_outcome: Float
```

### Data Flow
1. Mock data generated once (360 movements with seed=42)
2. Endpoints filter/transform this static set
3. Frontend fetches via HTTP GET requests
4. Frontend caches in React state (no TTL)
5. User navigates → refetch (regenerates on backend)

**Issue:** Data regenerated on every request despite being deterministic.

---

## 🔌 API Contract

### Base URL
- Development: `http://localhost:8000` (or `http://backend:8000` in Docker)
- Production: Via environment variable `CORS_ORIGINS`

### Endpoints (15 total)

#### Metrics Aggregation
- `GET /api/metrics` - Overall KPI metrics
- `GET /api/metrics/categories/breakdown` - Spending by category
- `GET /api/metrics/categories/top` - Top N categories (limit: 1-20)
- `GET /api/metrics/time-series` - Time-based aggregation
- `GET /api/metrics/comparison` - Compare two periods

#### Movement Analysis
- `GET /api/movements` - List movements with filters
- `GET /api/movements/search` - Text search

#### Health & Status
- `GET /api/health` - Liveness probe

### Request Validation
All date parameters use `Query(default=None)` pattern.  
All enum parameters validated against Literal types.  
All numeric parameters have min/max bounds.

**Issue:** No validation that `start_date <= end_date`.

---

## 🔐 Security Posture

### Current Implementation
✅ Type validation (Pydantic + TypeScript)  
✅ Method binding (POST only on mutation endpoints)  
✅ Parameter bounds (limit: 1-20, etc)

### Known Vulnerabilities
🔴 **CORS:** `allow_origins=["*"]` + `allow_credentials=True`  
- **Risk:** CSRF attacks, credential leakage
- **Fix Required:** Explicit origin list + environment variable

🔴 **Debugpy Exposed:** Port 5678 open on all interfaces  
- **Risk:** Remote code execution
- **Fix Required:** Disabled in production, separate Dockerfile

🟡 **Date Range Validation Missing:** No check for `start_date <= end_date`  
- **Risk:** Logic errors, silent failures
- **Fix Required:** Pydantic validator function

### Audit Trail
⚠️ No logging of API calls  
⚠️ No request tracing  
⚠️ No audit log persistence  

---

## ⚡ Performance Characteristics

### Current Bottlenecks
1. **Data Generation:** 360 movements generated per request (~5ms)
2. **Memory:** No caching → repeated allocations
3. **CPU:** Mock data transformation runs every time

### Measured Impact
- Cold start: ~200ms
- Metrics endpoint: ~50-100ms per request
- Comparison endpoint: ~80-150ms per request

### Scalability Limits
- Current: Handles ~100 concurrent requests (local testing)
- Bottleneck: Mock data generation, not I/O
- Fix: Global variable caching (5-10ms improvement per request)

---

## 🧪 Testing Status

### Current Coverage
- ✅ Route-level tests: 3-4 basic tests
- ⚠️ Edge case coverage: None
- ⚠️ Error path coverage: None
- ⚠️ Frontend unit tests: None
- ⚠️ Integration tests: None

### Test Infrastructure
- Backend: Pytest with httpx client
- Frontend: Vitest configured but no tests written
- CI/CD: None configured

---

## 📝 Documentation

### Existing Documentation
✅ `/README.md` - Overview + quick start
✅ `/README.es.md` - Spanish version
✅ `/AGENTS.md` - Copilot agent guidelines
⚠️ `/ENGINEERING-ANALYSIS.md` - Technical findings (comprehensive but not summarized)
⚠️ Environment variables: Not documented

### Documentation Gaps
- No API documentation (Swagger/OpenAPI disabled)
- No deployment guide
- No environment setup guide
- No troubleshooting guide
- No architecture decision records (ADRs)

---

## 🎯 Current Operational Status

### What Works Well
✅ Type safety across frontend-backend  
✅ Clean component architecture (UI separation)  
✅ Proper Pydantic validation on backend  
✅ Deterministic mock data (reproducible tests)  

### What Needs Attention (Priority Order)

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| CORS open to all | Security breach | 30 min | 🔴 CRITICAL |
| Data regen per-request | Performance | 45 min | 🔴 CRITICAL |
| Debugpy exposed | RCE vector | 15 min | 🔴 CRITICAL |
| Date range validation | Logic errors | 30 min | 🟡 HIGH |
| Frontend error handling | UX degradation | 45 min | 🟡 HIGH |
| Environment docs | Onboarding pain | 20 min | 🟡 HIGH |
| Logging missing | Observability | 30 min | 🟡 HIGH |
| Test coverage | Quality assurance | 2 hrs | 🟠 MEDIUM |

### Next Steps (Recommended Order)
1. **Critical Path (90 min):** Fix CORS → Cache data → Remove debugpy
2. **High Priority (2 hrs):** Validation → Error handling → Documentation
3. **Quality (5 hrs):** Logging → Tests → Refactoring

---

## 🔗 Related Documents
- `/memory-bank/productContext.md` - Product details and roadmap
- `/memory-bank/techContext.md` - Tech stack decisions and rationale
- `/memory-bank/activeContext.md` - Current work priorities
- `/ENGINEERING-ANALYSIS.md` - Detailed technical audit findings
