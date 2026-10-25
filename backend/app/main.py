import logging
import os
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.routes import router
from app.routers.telemetry import router as telemetry_router

logger = logging.getLogger("api.timing")

app = FastAPI(title="HealthCore API")

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
