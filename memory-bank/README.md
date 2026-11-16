# Project memory bank

This directory records concise project context backed by repository files. Source code and configuration remain authoritative; re-check them when a task depends on current behavior.

## Documents

- [`product-overview.md`](product-overview.md): visible product behavior, data source, and a known mismatch. Read before product or dashboard changes.
- [`architecture.md`](architecture.md): frontend-to-backend flow, API routes, and boundaries. Read before changing requests, schemas, or services.
- [`stack-and-operations.md`](stack-and-operations.md): runtime images, dependencies, startup and quality commands. Read before setup or tooling changes.
- [`current-state.md`](current-state.md): confirmed capabilities, gaps, and work not verified. Read when planning or reporting project status.
- [`../verification.md`](../verification.md): revision, evidence, changes, commands and results for this handover. Read to distinguish inspected facts from checks actually run.

Before work, follow [`../AGENTS.md`](../AGENTS.md) and the applicable files in [`../.agents/rules/`](../.agents/rules/).
