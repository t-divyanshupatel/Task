from __future__ import annotations

import json
import logging
import os
import sys
import time

import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://d2user:d2pass@db:5432/d2jobs",
)
POLL_INTERVAL = float(os.environ.get("POLL_INTERVAL", "2"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s service=worker %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("d2-worker")


def wait_for_db() -> None:
    for attempt in range(60):
        try:
            with psycopg2.connect(DATABASE_URL) as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT 1")
            logger.info("event=db_ready attempt=%s", attempt + 1)
            return
        except psycopg2.OperationalError:
            time.sleep(1)
    raise RuntimeError("Database did not become ready")


def process_payload(payload: dict) -> dict:
    task = payload["task"]
    text = payload["text"]
    if task == "uppercase":
        return {"output": text.upper()}
    if task == "reverse":
        return {"output": text[::-1]}
    raise ValueError(f"Unknown task: {task}")


def claim_next_job(conn) -> dict | None:
    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE jobs
            SET status = 'processing'
            WHERE id = (
                SELECT id FROM jobs
                WHERE status = 'pending'
                ORDER BY id
                FOR UPDATE SKIP LOCKED
                LIMIT 1
            )
            RETURNING id, payload
            """
        )
        return cur.fetchone()


def complete_job(conn, job_id: int, result: dict) -> None:
    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE jobs
            SET status = 'completed', result = %s
            WHERE id = %s
            """,
            (json.dumps(result), job_id),
        )


def fail_job(conn, job_id: int, error: str) -> None:
    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE jobs
            SET status = 'failed', result = %s
            WHERE id = %s
            """,
            (json.dumps({"error": error}), job_id),
        )


def run_once(conn) -> bool:
    job = claim_next_job(conn)
    if job is None:
        return False

    job_id = job["id"]
    payload = job["payload"]
    logger.info(
        "event=job_picked job_id=%s task=%s status=processing",
        job_id,
        payload.get("task"),
    )

    try:
        result = process_payload(payload)
        complete_job(conn, job_id, result)
        conn.commit()
        logger.info(
            "event=job_completed job_id=%s task=%s status=completed output=%s",
            job_id,
            payload.get("task"),
            result.get("output"),
        )
        return True
    except Exception as exc:
        conn.rollback()
        fail_job(conn, job_id, str(exc))
        conn.commit()
        logger.exception("event=job_failed job_id=%s error=%s", job_id, exc)
        return True


def main() -> None:
    logger.info("event=worker_start poll_interval=%s", POLL_INTERVAL)
    wait_for_db()
    while True:
        try:
            with psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor) as conn:
                processed = run_once(conn)
            if not processed:
                time.sleep(POLL_INTERVAL)
        except psycopg2.OperationalError as exc:
            logger.warning("event=db_unavailable error=%s", exc)
            time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
