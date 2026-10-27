# Documentation and Developer Experience

## Rule 13: Keep README setup references backed by checked-in files

If the README references a file users must create or copy, either commit the referenced file or document how to create it.

**Repo fact:** `README.md` (line 46) tells users to copy `frontend/.env.example` to `.env`, but `frontend/.env.example` does not exist in the repository (confirmed absent as of 2026-10-09).

## Rule 14: Preserve fetch failure details in developer diagnostics without exposing raw internal errors to users

Log or retain the caught error for debugging; show users a friendly message that does not include raw internal error text.

**Repo fact:** the `.catch(() => ...)` in `frontend/src/App.tsx` ignores its caught error parameter entirely and sets a fixed Spanish message, discarding status and cause information.
