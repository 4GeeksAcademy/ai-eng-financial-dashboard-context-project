---
name: verify-changes
description: Run this project's tests, lint, type checks and build inside Docker, then check the running services. Use before reporting a code change as done, or when asked to validate the project.
---

# Verify changes

Run from the repo root. If `docker` is not found on macOS, Docker Desktop puts it
in `~/.docker/bin`.

## 1. Make sure the services are up

```bash
docker compose ps
```

If they are not running, start them with `docker compose up --build -d`.

## 2. Run the checks for what changed

**Backend:**

```bash
docker compose exec -T backend python -m pytest
```

**Frontend:**

```bash
docker compose exec -T frontend npm test
docker compose exec -T frontend npm run lint
docker compose exec -T frontend npm run build
```

`npm run build` also runs the type check. It writes to `frontend/dist/`, which
is ignored by git.

**Date logic in the frontend:** also run the tests in a timezone behind UTC:

```bash
docker compose exec -T -e TZ=America/Santiago frontend npm test
```

This only helps if the tests use dates on the 1st of a month, so add such a date
to any test you write for date logic.

**Changes on both sides:** run all of the above.

## 3. Check the running services

```bash
curl -s -o /dev/null -w "backend %{http_code}\n" localhost:8000/health
curl -s -o /dev/null -w "proxy %{http_code}\n" localhost:5173/api/metrics
```

Both must print `200`. For a new endpoint, also request it through the proxy and
inspect the response.

For visual changes, open http://localhost:5173 and check the loading, empty and
data states. If you could not view the page, say so.

If you use headless Chrome, do not rely on `--virtual-time-budget`: it freezes the
chart animation, so the lines look missing when they are fine. Wait in real time.
Using `--timeout` alone can capture the loading state instead of the data.

## 4. Report

State what you ran and the result of each check. Expected noise that is not a
failure:

- A deprecation warning from `starlette.testclient` about `httpx` in pytest.
- A warning from Vite about a chunk larger than 500 kB in the build.

Any other warning or failure is worth reporting. Do not describe a check you did
not run as passing.
