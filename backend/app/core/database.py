"""SQLite database operations for Stegonet."""

import os
import sqlite3
from datetime import datetime, timezone
from typing import Any, Optional

from app.core.config import settings


def get_db() -> sqlite3.Connection:
    """Get a SQLite connection with row factory enabled."""
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Create database tables if they do not exist."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS process_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            process_type TEXT NOT NULL,
            image_name TEXT NOT NULL,
            message_length_chars INTEGER NOT NULL,
            message_length_bits INTEGER NOT NULL,
            threshold_percent INTEGER NOT NULL,
            selected_pixels INTEGER NOT NULL,
            total_pixels INTEGER NOT NULL,
            capacity_bits INTEGER NOT NULL,
            usage_percent REAL NOT NULL,
            psnr_db REAL,
            ssim REAL,
            mse REAL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS evaluation_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            process_id INTEGER NOT NULL,
            method TEXT NOT NULL,
            psnr_db REAL NOT NULL,
            ssim REAL NOT NULL,
            mse REAL NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (process_id) REFERENCES process_history(id)
        )
    """)

    conn.commit()
    conn.close()


def save_process(data: dict[str, Any]) -> int:
    """Save a process history record and return its ID.

    Args:
        data: Dictionary containing process history fields.

    Returns:
        The inserted row ID.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO process_history (
            process_type, image_name, message_length_chars, message_length_bits,
            threshold_percent, selected_pixels, total_pixels, capacity_bits,
            usage_percent, psnr_db, ssim, mse
        ) VALUES (
            :process_type, :image_name, :message_length_chars, :message_length_bits,
            :threshold_percent, :selected_pixels, :total_pixels, :capacity_bits,
            :usage_percent, :psnr_db, :ssim, :mse
        )
        """,
        data,
    )

    conn.commit()
    row_id = cursor.lastrowid
    conn.close()
    return row_id


def get_history(limit: int = 50) -> list[dict[str, Any]]:
    """Retrieve recent process history records.

    Args:
        limit: Maximum number of records to return.

    Returns:
        List of process history dictionaries.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM process_history ORDER BY created_at DESC LIMIT ?",
        (limit,),
    )

    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def save_evaluation(data: dict[str, Any]) -> int:
    """Save an evaluation result and return its ID.

    Args:
        data: Dictionary containing evaluation result fields.

    Returns:
        The inserted row ID.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO evaluation_results (process_id, method, psnr_db, ssim, mse)
        VALUES (:process_id, :method, :psnr_db, :ssim, :mse)
        """,
        data,
    )

    conn.commit()
    row_id = cursor.lastrowid
    conn.close()
    return row_id


def get_evaluation(process_id: int) -> list[dict[str, Any]]:
    """Retrieve evaluation results for a given process.

    Args:
        process_id: The process_history ID to fetch evaluations for.

    Returns:
        List of evaluation result dictionaries.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM evaluation_results WHERE process_id = ? ORDER BY created_at ASC",
        (process_id,),
    )

    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
