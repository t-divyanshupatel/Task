from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator, Optional
from uuid import uuid4

DB_PATH = Path(os.getenv("FRAUD_DB_PATH", Path(__file__).resolve().parent.parent / "data" / "fraud.db"))


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS transactions (
                transaction_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                amount REAL NOT NULL,
                currency TEXT NOT NULL,
                merchant_category TEXT NOT NULL,
                country_code TEXT NOT NULL,
                device_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                risk_score REAL,
                risk_level TEXT,
                reasons_json TEXT,
                scored_at TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


@contextmanager
def get_db() -> Iterator[sqlite3.Connection]:
    conn = _connect()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def insert_transaction(row: dict[str, Any]) -> dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO transactions (
                transaction_id, user_id, amount, currency, merchant_category,
                country_code, device_id, timestamp, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
            """,
            (
                row["transaction_id"],
                row["user_id"],
                row["amount"],
                row["currency"],
                row["merchant_category"],
                row["country_code"],
                row["device_id"],
                row["timestamp"],
                now,
            ),
        )
    return get_transaction(row["transaction_id"])  # type: ignore[return-value]


def get_transaction(transaction_id: str) -> Optional[dict[str, Any]]:
    with get_db() as conn:
        cur = conn.execute(
            "SELECT * FROM transactions WHERE transaction_id = ?",
            (transaction_id,),
        )
        row = cur.fetchone()
    return _row_to_dict(row) if row else None


def list_pending(limit: int = 50) -> list[dict[str, Any]]:
    with get_db() as conn:
        cur = conn.execute(
            """
            SELECT * FROM transactions
            WHERE status = 'pending'
            ORDER BY created_at ASC
            LIMIT ?
            """,
            (limit,),
        )
        rows = cur.fetchall()
    return [_row_to_dict(r) for r in rows]


def apply_score(transaction_id: str, score: dict[str, Any]) -> Optional[dict[str, Any]]:
    import json

    now = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        cur = conn.execute(
            """
            UPDATE transactions
            SET status = 'scored',
                risk_score = ?,
                risk_level = ?,
                reasons_json = ?,
                scored_at = ?
            WHERE transaction_id = ? AND status = 'pending'
            """,
            (
                score["risk_score"],
                score["risk_level"],
                json.dumps(score["reasons"]),
                now,
                transaction_id,
            ),
        )
        if cur.rowcount == 0:
            return None
    return get_transaction(transaction_id)


def _row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    import json

    data = dict(row)
    reasons_raw = data.pop("reasons_json", None)
    data["reasons"] = json.loads(reasons_raw) if reasons_raw else None
    return data


def new_transaction_id() -> str:
    return str(uuid4())
