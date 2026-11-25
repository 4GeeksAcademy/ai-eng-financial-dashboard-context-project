import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import router

app = FastAPI(title="Financial Metrics API")

# CORS configuration from environment variable
# In development: defaults to "*" (allow all)
# In production: set CORS_ORIGINS env var with comma-separated origins
#   e.g., CORS_ORIGINS=https://example.com,https://app.example.com
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
