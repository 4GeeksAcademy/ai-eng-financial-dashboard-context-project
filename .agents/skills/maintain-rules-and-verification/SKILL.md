# Skill: Maintain Rules and Verification

## When to use

Evolving the contributor rules (`.agents/rules/`), the audit trail (`verification.md`), or the memory bank (`memory-bank/`).

## Invariants

- **Every rule carries a concrete repo fact.** A rule without verifiable evidence (`file.py: behavior`, config value, test name) is not mergeable.
- **Rule numbers are global.** The canonical numbering lives in `verification.md` Phase 2; `.agents/rules/*.md` reference the same numbers. Adding a rule = append the number, never renumber existing ones.
- **Category ↔ file mapping** (see `.agents/rules/README.md`): architecture 1–4, naming 5–6, testing 7–8, runtime/security 9–10 + 19–20, dates 11–12, docs/DX 13–14, agent workflow 15, API validation 16–18.

## Adding or changing a rule

1. Verify the repo fact is still true (search the file, don't trust memory).
2. Add/edit the rule in `verification.md` Phase 2 **and** the matching `.agents/rules/<category>.md`.
3. Update the index table in `.agents/rules/README.md` if files or ranges change.
4. If the change was motivated by new work, record it in `verification.md` Phase 3-style and update `memory-bank/activeContext.md`.

## Updating status

- `verification.md` is the audit trail: checklist rows (✅/❌ with evidence), Phase 2 findings, Phase 3 implementations. Keep ❌ rows honest; note process incidents (e.g. the truncated-read test collision) rather than hiding them.
- `memory-bank/activeContext.md` is the "what works / gaps / next" snapshot — update it whenever status changes, and date the claims.

## Ratification (DRAFT → enforced)

When the rules are approved: drop the DRAFT markers in `.agents/rules/README.md` and `verification.md` Phase 3 in the same commit, so the two documents never disagree on status.
