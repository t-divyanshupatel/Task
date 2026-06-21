from __future__ import annotations

import logging
import os
import sys
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from psycopg2.extras import Json

from app.db import get_connection
from app.models import JobCreate, JobResponse

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://d2user:d2pass@db:5432/d2jobs",
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s service=api %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("d2-api")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    for attempt in range(30):
        try:
            with get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT 1")
            logger.info("event=db_ready attempt=%s", attempt + 1)
            break
        except Exception:
            if attempt == 29:
                raise
            time.sleep(1)
    yield


app = FastAPI(title="D2 Job API", version="1.0.0", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
    return {"status": "ok", "database": "connected"}


@app.post("/jobs", response_model=JobResponse, status_code=201)
def create_job(body: JobCreate) -> JobResponse:
    payload = body.model_dump()
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO jobs (payload, status)
                VALUES (%s, 'pending')
                RETURNING id, payload, status, result
                """,
                (Json(payload),),
            )
            row = cur.fetchone()
    logger.info(
        "event=job_created job_id=%s task=%s status=pending",
        row["id"],
        payload["task"],
    )
    return JobResponse(**row)


@app.get("/jobs", response_model=list[JobResponse])
def list_jobs() -> list[JobResponse]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, payload, status, result
                FROM jobs
                ORDER BY id
                """
            )
            rows = cur.fetchall()
    return [JobResponse(**row) for row in rows]


@app.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int) -> JobResponse:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, payload, status, result
                FROM jobs
                WHERE id = %s
                """,
                (job_id,),
            )
            row = cur.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobResponse(**row)
