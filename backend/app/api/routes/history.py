"""GET /api/v1/history — retrieve and filter process history."""

from typing import Optional

from fastapi import APIRouter, Query

from app.core.database import get_db
from app.models.schemas import HistoryItem, HistoryResponse

router = APIRouter()


@router.get("/history", response_model=HistoryResponse)
def list_history(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    process_type: Optional[str] = Query(default=None),
):
    """Retrieve process history records with optional filtering and pagination."""
    conn = get_db()
    try:
        if process_type:
            count_row = conn.execute(
                "SELECT COUNT(*) as total FROM process_history WHERE process_type = ?",
                (process_type,),
            ).fetchone()
            rows = conn.execute(
                "SELECT * FROM process_history WHERE process_type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
                (process_type, limit, offset),
            ).fetchall()
        else:
            count_row = conn.execute(
                "SELECT COUNT(*) as total FROM process_history"
            ).fetchone()
            rows = conn.execute(
                "SELECT * FROM process_history ORDER BY created_at DESC LIMIT ? OFFSET ?",
                (limit, offset),
            ).fetchall()

        total = count_row["total"]
        items = [HistoryItem(**dict(r)) for r in rows]
        return HistoryResponse(success=True, data=items, total=total)
    finally:
        conn.close()


@router.get("/history/{process_id}")
def get_history_detail(process_id: int):
    """Retrieve a single process record with its evaluation results."""
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT * FROM process_history WHERE id = ?", (process_id,)
        ).fetchone()
        if not row:
            return {"success": False, "error": "Process not found"}

        eval_rows = conn.execute(
            "SELECT * FROM evaluation_results WHERE process_id = ?", (process_id,)
        ).fetchall()

        return {
            "success": True,
            "data": {
                **dict(row),
                "evaluations": [dict(r) for r in eval_rows],
            },
        }
    finally:
        conn.close()
