---
name: Product Overview
date_last_updated: 2026-11-25
status: verified_from_codebase
---

# Financial Metrics Dashboard — Product Overview

## Executive Summary

A financial metrics dashboard displaying real-time key performance indicators (KPIs) and financial trends. Built with a React + TypeScript frontend and a FastAPI Python backend.

**Primary Users**: Finance teams, business analysts, executives  
**Core Value**: Centralized view of income, expenses, profit margins, and anomaly detection  
**Current Scope**: Dashboard UI + 11 API endpoints for financial data retrieval

---

## Verified Product Capabilities

### ✅ **Working Features** (verified from codebase)

#### Dashboard Display
- **KPI Cards**: Total Income, Total Outcome, Profit, Profit Margin %
- **Summary Card**: Displays aggregated financial summary
- **Income/Outcome Chart**: Monthly trend comparison (bar chart via Recharts)
- **Profit Percentage Chart**: Monthly profit margin evolution
- **Dashboard Header**: Period display and branding

#### Backend API Endpoints
1. `GET /api/metrics` → List of financial movements (144 mock entries, seed=42)
2. `GET /api/metrics/profit-margin` → Profit margin calculation
3. `GET /api/metrics/facets` → Available filter dimensions
4. `GET /api/metrics/summary` → Aggregated data (by day, week, or month)
5. `GET /api/metrics/categories/top` → Top N expense/income categories
6. `GET /api/metrics/comparison` → Period-over-period deltas
7. `GET /api/metrics/alerts` → Anomaly detection (outcome spikes)
8. `GET /api/metrics/averages` → Monthly average income and outcome
9. `GET /api/metrics/b2b` → B2B transactions filtered
10. `GET /api/metrics/b2c` → B2C transactions filtered
11. `GET /health` → API health check
12. **Swagger/OpenAPI**: Auto-generated at `http://localhost:8000/docs`

#### Data & Filtering
- **Mock Data**: 144 movements (~12/month) generated deterministically with `seed=42`
- **Queryable Fields**: Date range, category, operation type (income/outcome), business type (B2B/B2C)
- **Response Types**: Pydantic models with strict typing

#### Frontend Architecture
- **State Management**: React hooks (useState, useEffect)
- **Centralized Fetching**: All API calls in `App.tsx`
- **Shared Logic**: `financial-utils.ts` (computeKPIs, computeMonthlyData)
- **Components**: Separated into `ui/` (generic) and `dashboard/` (domain-specific)

#### Styling & UX
- **Tailwind CSS v4** with OKLCH color space
- **Theme**: Dark mode support with CSS variables
- **Component Library**: Custom card/skeleton components (CVA pattern)
- **Icons**: Lucide React

#### Testing
- **Backend**: pytest suite (12+ tests with TestClient)
- **Frontend**: Vitest + coverage reporting
- **Mock Data**: Deterministic seed ensures reproducible tests

#### Developer Experience
- **TypeScript**: Full type safety (frontend & mock validation)
- **Code Organization**: Clear separation of concerns (ui/dashboard, lib/, routes)
- **Hot Reload**: Vite dev server + FastAPI auto-reload
- **Remote Debug**: Port 5678 (debugpy) for backend debugging
- **Environment Variables**: `.env.example` for custom backend URLs

---

## Technical Validation

### Evidence of Completeness
- ✅ 30/30 verification checks passed (from `verification.md`)
- ✅ All 11 API endpoints responding with correct schemas
- ✅ Dashboard renders all 5 components without errors
- ✅ Docker setup works (both services build and start)
- ✅ Tests pass with no failures

### Product-Reality Alignment
- **No claimed features without code**: Every dashboard component has an implementation
- **No incomplete endpoints**: All 11 API routes are fully functional
- **No invented roadmaps**: Only documented what exists

---

## Known Limitations

| Area | Limitation | Reason |
|------|-----------|--------|
| **Data Persistence** | Mock data only, no database | By design for learning/prototyping |
| **Authentication** | None implemented | Out of scope for MVP |
| **Real-Time Updates** | Static fetch on page load | No WebSocket/polling implemented |
| **Export Features** | No CSV/PDF export | Not in current spec |
| **User Preferences** | No settings/customization per user | Stateless design |
| **Multi-Language i18n** | English UI only (Spanish docs separate) | Frontend strings are English only |

---

## Success Criteria (Met)

- [x] Dashboard loads without errors
- [x] All KPIs compute correctly
- [x] Charts render monthly trends
- [x] Backend returns consistent, filtered data
- [x] Tests verify calculations and endpoints
- [x] Frontend/backend communicate via REST API
- [x] Code follows project conventions (DX-02, STY-01, REACT-02, etc.)
- [x] CORS security configured for production (`SEC-01`)

---

## Related Documents

- **Rules & Standards**: `.agents/rules/` (10 governance files)
- **Technical Stack**: `memory-bank/TECH_STACK.md`
- **Current State & Gaps**: `memory-bank/CURRENT_STATE.md`
- **Verification Checklist**: `verification.md` (30 checks)
