"""Stegonet FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.core.model import get_cnn_model
from app.api.error_handlers import register_error_handlers
from app.api.routes import embed, extract, evaluate, analyze, history, health, embed_stream, stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle events."""
    init_db()
    try:
        get_cnn_model()
    except Exception:
        pass
    yield


app = FastAPI(
    title="Stegonet API",
    description=(
        "CNN-guided LSB steganography system. "
        "Embed, extract, evaluate, and analyze secret messages in images "
        "using MobileNetV2 feature extraction."
    ),
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


@app.get("/")
async def root():
    """Root endpoint — redirect to API docs."""
    return {
        "name": "Stegonet API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health",
        "endpoints": {
            "embed": "/api/v1/embed",
            "extract": "/api/v1/extract",
            "evaluate": "/api/v1/evaluate",
            "analyze": "/api/v1/analyze",
            "history": "/api/v1/history",
            "health": "/api/v1/health",
        },
    }


app.include_router(embed.router, prefix="/api/v1", tags=["embed"])
app.include_router(embed_stream.router, prefix="/api/v1", tags=["embed"])
app.include_router(extract.router, prefix="/api/v1", tags=["extract"])
app.include_router(evaluate.router, prefix="/api/v1", tags=["evaluate"])
app.include_router(analyze.router, prefix="/api/v1", tags=["analyze"])
app.include_router(history.router, prefix="/api/v1", tags=["history"])
app.include_router(stats.router, prefix="/api/v1", tags=["stats"])
app.include_router(health.router, prefix="/api/v1", tags=["health"])

register_error_handlers(app)
