# Architecture

## Services

`docker-compose.yml` defines two services and no database. Versions are in
`tech-stack.md`.

| Service | Ports | Started with |
|---|---|---|
| `frontend` | 5173 | `npm run dev` |
| `backend` | 8000 (API), 5678 (debugpy) | `python -m debugpy ... uvicorn app.main:app` |

debugpy listens on 5678 and does not wait for a client, so the API starts without
a debugger attached.

## Data flow

```text
generate_mock_movements(seed=42)      rebuilt on every request, nothing is stored
        |
GET /api/metrics                      backend, port 8000
        |
Vite proxy for /api                   frontend dev server, port 5173
        |
fetchFinancialData() in App.tsx       runs once on mount
        |
computeKPIs(), computeMonthlyData()   calculated in the browser
        |
KPIRow, IncomeOutcomeChart, ProfitPercentChart
```

## Mock data

- 360 movements: 30 per month for 12 months, on days 1 to 28.
- Dates roll with today's date and cover the 12 full months before the current
  month. The current month is never included.
- `seed=42` makes amounts and categories repeat between requests.

## API routes

All routes are `GET` and are defined in `backend/app/routes.py`.

| Route | Returns | Parameters |
|---|---|---|
| `/health` | `{"status": "ok"}` | None |
| `/api/metrics` | Movements | `start_date`, `end_date`, `category`, `operation_type` |
| `/api/metrics/b2b` | B2B movements | Same as `/api/metrics` |
| `/api/metrics/b2c` | B2C movements | Same as `/api/metrics` |
| `/api/metrics/facets` | Filter values and date range | None |
| `/api/metrics/summary` | Income, outcome and net per period | `group_by` (`day`, `week`, `month`; default `month`), `start_date`, `end_date`, `category`, `operation_type`, `business_type` |
| `/api/metrics/categories/top` | Categories by total amount | `operation_type` (default `outcome`), `limit` (1 to 20; default 5), `start_date`, `end_date`, `business_type` |
| `/api/metrics/comparison` | Net for the period and for the previous period of equal length | `start_date` and `end_date` (required), `business_type` |
| `/api/metrics/alerts` | Periods whose outcome exceeds the average of all earlier periods by more than `threshold` | `threshold` (default 0.3), `group_by`, `start_date`, `end_date`, `business_type` |

The frontend uses `/api/metrics` for its data and `/api/metrics/facets` for the
period label in the header. The other routes are not used by the UI today.
