"""Database operations for process history."""

from typing import Any

from app.core.database import get_history as _db_get_history
from app.core.database import save_process as _db_save_process


def save_process(data: dict[str, Any]) -> int:
    """Save a process history record.

    Args:
        data: Dictionary with process history fields.

    Returns:
        The inserted row ID.
    """
    return _db_save_process(data)


def get_history(limit: int = 10) -> list[dict[str, Any]]:
    """Retrieve recent process history records.

    Args:
        limit: Maximum records to return.

    Returns:
        List of process history dictionaries.
    """
    return _db_get_history(limit)


def get_process(process_id: int) -> dict[str, Any] | None:
    """Retrieve a single process record by ID.

    Args:
        process_id: The process_history ID.

    Returns:
        Process dict or None if not found.
    """
    from app.core.database import get_db

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM process_history WHERE id = ?", (process_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None
