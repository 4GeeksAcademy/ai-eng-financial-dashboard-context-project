# Domain Glossary

- **Last verified:** 2026-10-09
- **Source:** [`../backend/app/routes.py`](../backend/app/routes.py), [`../frontend/src/lib/financial-types.ts`](../frontend/src/lib/financial-types.ts), and [`../frontend/src/lib/financial-utils.ts`](../frontend/src/lib/financial-utils.ts).

| Term | Meaning in this repository |
|---|---|
| Financial movement | Record with `create_date`, `amount`, `operation_type`, `category`, and `business_type`. |
| `income` | Income movement type. The current generator assigns it mostly to `sales`, sometimes to `others`. |
| `outcome` | Expense movement type. The current generator selects `suppliers`, `operational`, `administrative`, or `others`. |
| `category` | One of `suppliers`, `sales`, `operational`, `administrative`, or `others`. |
| `business_type` | Business segment: `B2B` or `B2C`. |
| `net` / `profit` | Income minus outcome. The backend summary calls it `net`; the frontend KPI calls it `profit`. |
| Profit margin | `(income - outcome) / income * 100`; frontend calculations return zero when income is zero. |
| Grouping period | Backend supports `day`, ISO `week`, and `month`; the frontend charts by calendar month. |
| Currency formatting | Frontend formatter uses USD and `en-US`, showing zero decimal places. |

These definitions describe the current code, not a complete accounting policy. Confirm domain meaning with product/business owners before changing financial formulas or interpreting categories as accounting classifications.

