"""MANAK-AI FastAPI application entrypoint."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from scripts.seed import seed
from app.api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup: create schema and seed from JSON (skips if already populated).
    seed()
    yield


app = FastAPI(
    title="MANAK-AI Backend",
    description="Evidence-backed recommendation engine for Indian Standards in procurement.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
