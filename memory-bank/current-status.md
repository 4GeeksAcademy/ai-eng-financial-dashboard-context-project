# Current Status

> Last updated: 2026-09-10

## What's working ✅

### Backend
- [x] FastAPI app with CORS enabled
- [x] 9 API endpoints returning mock financial data
- [x] Mock data generation with seed=42 (360 movements/year)
- [x] Filtering by date, category, operation_type, business_type
- [x] Summary aggregation (day/week/month)
- [x] Top categories ranking
- [x] Period comparison (current vs previous)
- [x] Outcome alerts detection
- [x] 5 pytest tests passing
- [x] Docker containerization

### Frontend
- [x] React 19 + TypeScript 6 + Vite 8 setup
- [x] Tailwind CSS 4 with CSS variables (oklch)
- [x] Dark mode (hardcoded)
- [x] 4 KPI cards with loading skeletons
- [x] 2 line charts (Income vs Outcome, Profit Margin)
- [x] Error handling for failed API calls
- [x] Vitest unit tests for utility functions
- [x] ESLint configuration
- [x] Docker containerization

### Infrastructure
- [x] Docker Compose with hot reload
- [x] Vite proxy for /api → backend
- [x] Debugpy remote debugging support
- [x] .gitignore configured

### Documentation
- [x] README.md with project overview
- [x] README.es.md (Spanish)
- [x] AGENTS.md for agent guidance
- [x] .agents/rules/ with 4 convention files
- [x] memory-bank/ with this documentation

## What's NOT done ❌

### Missing features
- [ ] Date picker / period selector (currently hardcoded to "2024 — Full Year")
- [ ] Filtering UI (API supports it, frontend doesn't expose it)
- [ ] Category breakdown chart
- [ ] B2B vs B2C comparison view
- [ ] Alert notifications in UI
- [ ] Responsive mobile layout optimization
- [ ] Export to PDF/CSV

### Missing infrastructure
- [ ] CI/CD pipeline (no .github/workflows/)
- [ ] Production Docker configuration (multi-stage builds)
- [ ] Environment variable validation
- [ ] API rate limiting
- [ ] Logging configuration
- [ ] Health check in Docker Compose

### Missing tests
- [ ] Frontend component tests (only utility tests exist)
- [ ] Integration tests (backend + frontend)
- [ ] E2E tests
- [ ] Accessibility tests

### Technical debt
- [ ] Types duplicated between frontend and backend (not shared)
- [ ] Requirements.txt has no pinned versions
- [ ] No API documentation beyond auto-generated Swagger
- [ ] No error boundaries in React
- [ ] No loading states for individual charts

## Known issues

1. **Mock data changes on each request** — Even with seed=42, the data is regenerated every time. This means:
   - KPI values may slightly differ between page refreshes if seed logic changes
   - No data persistence across server restarts

2. **Period hardcoded** — `App.tsx` line 50: `<DashboardHeader period="2024 - Full Year" />`

3. **No `.env.example`** — The README mentions it but the file doesn't exist in the repo

## Test status

### Backend (pytest)
```
test_generate_mock_movements_returns_full_year_sorted_data  ✅
test_filter_movements_by_date_includes_range_edges          ✅
test_health_endpoint_returns_ok                             ✅
test_metrics_endpoint_respects_date_filters                 ✅
test_b2b_endpoint_only_returns_b2b_records                  ✅
```

### Frontend (vitest)
```
computeKPIs — calculates totals and profit values           ✅
computeMonthlyData — groups by month correctly               ✅
formatCurrency — formats USD values                         ✅
formatPercent — formats percentage values                   ✅
```

## Recent changes

- Added `.agents/rules/` with coding conventions, architecture rules, risk guardrails, and testing rules
- Added `memory-bank/` with product description, tech stack, and current status
- Added technical report to README.md

## Next recommended actions

1. **High priority**: Add date picker to expose existing API filters
2. **High priority**: Pin Python dependencies in requirements.txt
3. **Medium priority**: Add React component tests
4. **Medium priority**: Create `.env.example` file
5. **Low priority**: Set up CI/CD with GitHub Actions
