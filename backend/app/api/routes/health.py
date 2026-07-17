"""GET /api/v1/health — server health check."""

import os

from fastapi import APIRouter

from app.core.config import settings
from app.models.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check server, CNN model, and memory health status."""
    checks = {}

    checks["server"] = "ok"

    # Verify CNN model can actually load (not just file existence)
    try:
        from app.core.model import get_cnn_model
        get_cnn_model()
        checks["cnn_model"] = "ok"
    except Exception:
        checks["cnn_model"] = "model_load_failed"

    try:
        import psutil

        mem = psutil.virtual_memory()
        used_pct = mem.percent
        if used_pct > 90:
            checks["memory"] = f"critical ({used_pct}% used)"
        elif used_pct > 75:
            checks["memory"] = f"warning ({used_pct}% used)"
        else:
            checks["memory"] = f"ok ({used_pct}% used)"
    except ImportError:
        checks["memory"] = "unavailable (psutil not installed)"

    all_ok = all(v == "ok" or v.startswith("ok ") for v in checks.values())
    status = "healthy" if all_ok else "degraded"

    return HealthResponse(status=status, checks=checks)
