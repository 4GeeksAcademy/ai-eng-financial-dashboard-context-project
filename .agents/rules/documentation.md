# Documentation

## Scope

Applies to `README.md`, `README.es.md`, and `AGENTS.md`. Port text also has to match `backend/Dockerfile` and `docker-compose.yml`.

## Rules

1. Do update both `README.md` and `README.es.md` when you change the run command or ports 5173 and 8000.
2. Before working, read every file in .agents/rules/ and memory-bank/. When a task matches a skill in .agents/skills/ or .skills/, read that skill's SKILL.md first.
3. Do list 5173 and 8000 when you list published ports from the README. Never describe port 5678 as a port the README documents.

## Rationale

- Rule 1 — F13: `README.md` and `README.es.md` both document `docker compose up --build`, port 5173, and port 8000.
- Rule 2 — F27: `.agents/rules/` and `memory-bank/` exist. `.agents/skills/` or `.skills/` exists now. Before working, read every file in `.agents/rules/` and `memory-bank/`. When a task matches a skill in `.agents/skills/` or `.skills/`, read that skill's `SKILL.md` first.
- Rule 3 — F13, F28: The READMEs list 5173 and 8000. The backend image always starts debugpy on 5678 and Compose publishes it, and the README does not mention 5678.
