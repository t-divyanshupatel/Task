"""End-to-end pipeline test using FastAPI TestClient (no live server required)."""

from __future__ import annotations

import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

os.environ["FRAUD_DB_PATH"] = str(Path(__file__).resolve().parent / "pipeline_fraud.db")

from app.main import app  # noqa: E402
from app.store import init_db  # noqa: E402

init_db()

client = TestClient(app)

HIGH_RISK = {
    "user_id": "pipeline-user",
    "amount": 15000.0,
    "currency": "USD",
    "merchant_category": "crypto",
    "country_code": "NG",
    "device_id": "pipeline-device",
    "timestamp": "2026-06-21T15:00:00Z",
}


def test_full_ingest_score_retrieve_pipeline() -> None:
    create = client.post("/transactions", json=HIGH_RISK)
    assert create.status_code == 201
    created = create.json()
    tx_id = created["transaction_id"]
    assert created["status"] == "pending"

    pending = client.get("/transactions/pending").json()
    assert any(tx["transaction_id"] == tx_id for tx in pending)

    score = {
        "transaction_id": tx_id,
        "risk_score": 90.0,
        "risk_level": "high",
        "reasons": ["high_amount", "high_risk_category", "high_risk_country"],
    }
    scored_resp = client.post(f"/transactions/{tx_id}/score", json=score)
    assert scored_resp.status_code == 200
    scored = scored_resp.json()
    assert scored["status"] == "scored"
    assert scored["risk_score"] == 90.0
    assert scored["scored_at"] is not None

    fetched = client.get(f"/transactions/{tx_id}").json()
    assert fetched["status"] == "scored"
    assert fetched["risk_level"] == "high"

    pending_after = client.get("/transactions/pending").json()
    assert all(tx["transaction_id"] != tx_id for tx in pending_after)


def test_score_submission_removed_from_pending_queue() -> None:
    create = client.post(
        "/transactions",
        json={**HIGH_RISK, "user_id": "queue-user", "timestamp": "2026-06-21T16:00:00Z"},
    ).json()
    tx_id = create["transaction_id"]

    before = len(client.get("/transactions/pending").json())
    client.post(
        f"/transactions/{tx_id}/score",
        json={
            "transaction_id": tx_id,
            "risk_score": 10.0,
            "risk_level": "low",
            "reasons": [],
        },
    )
    after = len(client.get("/transactions/pending").json())
    assert after == before - 1
