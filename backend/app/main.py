import logging
import os
import sys
import time
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware


def _add_monorepo_root_to_path() -> None:
    """Make ``data.pipelines`` and ``services.reporting`` importable.

    The monorepo root is where ``data/pipelines`` lives. It can be the
    repository root (uvicorn started from the root), ``/repo`` inside the
    backend container (see docker-compose.yml) or two levels above this file.
    """
    candidates = [
        Path(__file__).resolve().parents[2],
        Path.cwd(),
        *(Path(entry) for entry in sys.path if entry),
    ]
    for candidate in candidates:
        if (candidate / "data" / "pipelines").is_dir():
            root = str(candidate)
            if root not in sys.path:
                sys.path.insert(0, root)
            return


_add_monorepo_root_to_path()

from app.core.database import close_db, init_db  # noqa: E402
from app.routes import router  # noqa: E402
from app.routers.telemetry import router as telemetry_router  # noqa: E402
from app.routers.telemetry_report import router as telemetry_report_router  # noqa: E402
from services.reporting.router import router as reporting_router  # noqa: E402

logger = logging.getLogger("api.timing")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: initialise database pool. Shutdown: close pool."""
    await init_db()
    yield
    await close_db()


app = FastAPI(title="HealthCore API", lifespan=lifespan)

# TELEMETRY_ENDPOINT is read for configuration (used in Phase 3).
# The frontend uses NEXT_PUBLIC_TELEMETRY_ENDPOINT to point to this stub.
_ = os.getenv("TELEMETRY_ENDPOINT", "http://localhost:8000/telemetry/events")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
app.include_router(telemetry_router)
app.include_router(telemetry_report_router)
# Business reporting surface (Part 2). Lives in services/reporting/ and imports
# the pipeline from data/pipelines/. Telemetry routes above are untouched.
app.include_router(reporting_router)


@app.middleware("http")
async def timing_middleware(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration = (time.perf_counter() - start) * 1000  # ms

    logger.info(
        "%s %s → %s | %.1fms",
        request.method,
        request.url.path,
        response.status_code,
        duration,
    )
    return response
