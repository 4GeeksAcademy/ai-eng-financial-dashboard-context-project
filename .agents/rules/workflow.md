# Workflow

**Scope:** every task in this repository.

**Why:** the app only works as a whole on the Compose network, because the Vite
proxy targets `http://backend:8000`. No CI exists (there is no `.github/` folder),
so a contributor's own checks are the only checks.

## Run everything through Docker Compose

Run commands from the repo root, inside the containers. The containers hold the
dependencies, and the Vite proxy target (`http://backend:8000`) only resolves on
the Compose network, so `npm run dev` on the host cannot reach the API.

```bash
docker compose up --build -d     # start both services
docker compose ps                # check they are up
docker compose logs -f backend   # or frontend
```

Use `-T` with `docker compose exec` when there is no interactive terminal.

Source code is bind-mounted and both servers reload on save, so a code change
does not need a rebuild. A dependency change does:

| Change | Command |
|---|---|
| `backend/requirements.txt` | `docker compose up --build -d backend` |
| `frontend/package.json` | `docker compose up --build -d -V frontend` |

`-V` is required for the frontend: `node_modules` is an anonymous volume, and
without `-V` the old one hides the freshly built packages.

## Verify before reporting a change as done

Use the [verify-changes](../skills/verify-changes/SKILL.md) skill. Report the
real results, including failures and anything you skipped.

## Scope

- Do the requested change only. Record unrelated problems in
  `memory-bank/current-state.md` instead of fixing them on the way.
- Do not commit, push or open a PR unless asked. If asked while on `main`,
  branch first.
- Keep one concern per commit, and use a type prefix as recent commits do: `feat:`,
  `fix:`, `test:` or `docs:`. Commit `2cd0e1e` mixed rules and memory bank, which
  made it harder to review each one on its own.
- Never commit `.env` files. Only `frontend/.env.example` is tracked.

## Keep the docs true

- Fixing or finding an issue, or changing what is wired up: update
  `memory-bank/current-state.md`.
- Changing architecture, endpoints, ports or tooling: update the matching file
  in `memory-bank/` and any rule that states the old fact.
- Changing how the project runs: update both `README.md` and `README.es.md`.
