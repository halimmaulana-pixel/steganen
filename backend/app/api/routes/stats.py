"""GET /api/v1/stats — dashboard statistics."""

from fastapi import APIRouter

from app.core.database import get_db

router = APIRouter()


@router.get("/stats")
def get_stats():
    """Aggregate statistics for the dashboard."""
    conn = get_db()
    try:
        row = conn.execute("SELECT COUNT(*) as total FROM process_history").fetchone()
        total = row["total"]

        avg_row = conn.execute(
            """
            SELECT
                AVG(psnr_db) as avg_psnr,
                AVG(ssim) as avg_ssim,
                SUM(message_length_bits) as total_bits,
                AVG(usage_percent) as avg_usage
            FROM process_history
            """
        ).fetchone()

        type_rows = conn.execute(
            """
            SELECT process_type, COUNT(*) as count
            FROM process_history
            GROUP BY process_type
            """
        ).fetchall()
        by_type = {r["process_type"]: r["count"] for r in type_rows}

        embed_count = by_type.get("embed", 0)
        embed_ratio = embed_count / total if total > 0 else 0

        return {
            "success": True,
            "data": {
                "total_processes": total,
                "avg_psnr": round(avg_row["avg_psnr"] or 0, 2),
                "avg_ssim": round(avg_row["avg_ssim"] or 0, 4),
                "total_payload_bits": avg_row["total_bits"] or 0,
                "avg_usage_percent": round(avg_row["avg_usage"] or 0, 1),
                "embed_ratio": round(embed_ratio, 2),
                "by_type": by_type,
            },
        }
    finally:
        conn.close()
