# Dates and Time Zones

## Rule 11: Derive the dashboard period label from the displayed data

Do not hard-code period labels in UI components; derive them from the loaded data or keep the label's date range explicitly synchronized with the data source.

**Repo fact:** `frontend/src/App.tsx` hard-codes `period="2024 - Full Year"`, while `backend/app/routes.py` derives movement years from `date.today()` via `_year_for_month()`. As of 2026-10-09 the generated dates span 2025–2026, so the displayed label does not match the data.

## Rule 12: Handle API date-only strings as calendar dates

When grouping or displaying `create_date` values from the API, parse them as calendar dates rather than relying on implicit local-time conversion.

**Repo fact:** `frontend/src/lib/financial-utils.ts` passes `m.create_date` to `new Date(...)` (date-only strings parse as UTC midnight) and then groups with local `getFullYear()`/`getMonth()`, which can shift dates near year or month boundaries for users west of UTC.
