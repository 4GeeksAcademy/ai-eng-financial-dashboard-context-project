# Phase-based task execution

## Purpose

Make multi-step dashboard work easy for the project owner to direct, review, and repeat without pausing for routine actions or silently making product decisions.

## Scope

Apply when a request spans more than one meaningful stage, such as discovery, planning, implementation, validation, and delivery. Do not split a small, single-step request into artificial phases.

## Before acting

- Restate the requested outcome in one sentence and identify the phases needed to reach it.
- For each phase, show: actions that can start now, decisions that need the owner's answer, and the evidence or artifact that will mark completion.
- Start repository inspection and other reversible actions that are clearly within the request. Do not ask for information that can be established from the repository.
- Ask one concise, grouped set of questions only when an unanswered choice could materially change product behavior, data, architecture, scope, or delivery.
- When helpful, offer a recommended option and explain its practical effect. If the user has already authorized the action or the repository provides a clear answer, proceed without asking again.

## During execution

- Complete phases in order when later work depends on earlier findings. Continue independent work that does not depend on an unanswered decision.
- At a phase boundary, report completed work, concrete evidence, remaining decisions, and the next phase. Do not imply an unrun check passed.
- Keep each phase's files and Git commit separate when the task or assignment requires phase-specific commits. Do not make artificial commits for phases with no changes.
- Follow the repository's actual setup and scripts. For example, Compose configuration declares `frontend` and `backend`; Vite proxies `/api` to `http://backend:8000`; the backend currently generates seeded mock movements in memory. Do not assume a database or treat mock data as persisted records.
- Run tests or other validation when the user or task asks for them, or when an applicable repository instruction requires them. Record exactly what ran and its result.

## Stop and ask before a decision

Pause the dependent change and ask the owner when:

- a financial formula, period definition, currency, rounding rule, or business meaning is unspecified;
- the request could replace simulated data with a real source or introduce persistence;
- an API contract, dependency, or architecture change is needed but not required explicitly;
- the requested outcome conflicts with repository evidence or leaves two materially different implementations;
- delivery requires an external action that was not requested.

Do not block unrelated inspection, documentation, or clearly authorized edits while waiting for an answer.

## Completion report

Summarize the phases completed, files changed, checks actually run, decisions still pending, and the resulting branch or artifact link when available.

## Repository evidence

- `docker-compose.yml` declares `frontend` and `backend`, with no database service.
- `frontend/vite.config.ts` proxies `/api` to `http://backend:8000`.
- `backend/app/routes.py` creates seeded mock movements in memory.
- `verification.md` records the difference between source-level smoke checks and an actual Docker Compose/Codespaces run.
