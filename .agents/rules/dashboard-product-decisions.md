# Ask before changing financial product behavior

## Purpose

Prevent the agent from inventing financial definitions or silently changing what dashboard users see.

## Scope

Apply when a task changes KPI calculations, date ranges, comparisons, currency formatting, chart meaning, data provenance, or visible empty/error behavior.

## Instructions

- First inspect the existing implementation, types, API response, and relevant tests. Report what is already defined by the code.
- Preserve existing behavior when the request can be completed without changing an unspecified product decision.
- Ask the owner before implementing a material choice that is not settled by the request or repository evidence. Group related questions and offer a recommended default where appropriate.
- Do not ask again about a choice already explicit in the request or confirmed earlier in the conversation.
- Do not describe simulated or in-memory data as production, customer, or database data.
- Keep the question focused on the unresolved choice; continue implementation of unrelated, clearly defined parts.

## Questions to ask only when the answer is missing

- What exact formula and input fields should this KPI use?
- Which start/end dates define the selected period, and what should it be compared with?
- Which currency, locale, precision, and rounding rule should be displayed?
- Should the data remain simulated, or should this task connect a real source? If real, which source and contract?
- What should the user see when the result is empty or the API request fails?

## Repository evidence

- `frontend/src/App.tsx` currently labels the view `2024 - Full Year`, while `backend/app/routes.py` generates dates relative to the current date.
- `frontend/src/lib/financial-utils.ts` contains KPI and aggregation calculations; `frontend/src/lib/financial-utils.test.ts` covers their current behavior.
- `backend/app/routes.py` generates seeded movements in memory, and `docker-compose.yml` declares no database service.
- `frontend/src/lib/financial-types.ts` and the backend response model define the current movement data shape.

## Validation

Before changing these behaviors, cite the existing definition and the owner's decision in the task notes or verification record. Add or update focused tests when the task asks for validation or the applicable calculation/API rule requires them; report checks truthfully.
