from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Isolated DB per test session
os.environ["FRAUD_DB_PATH"] = str(Path(__file__).resolve().parent / "test_fraud.db")

from app.main import app  # noqa: E402
from app.store import init_db  # noqa: E402

init_db()

client = TestClient(app)

SAMPLE = {
    "user_id": "user-99",
    "amount": 250.0,
    "currency": "usd",
    "merchant_category": "retail",
    "country_code": "us",
    "device_id": "device-xyz",
    "timestamp": "2026-06-21T12:00:00Z",
}


def test_health() -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_create_transaction_returns_pending() -> None:
    resp = client.post("/transactions", json=SAMPLE)
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "pending"
    assert body["currency"] == "USD"
    assert body["country_code"] == "US"
    assert body["risk_score"] is None


def test_get_pending_lists_unscored() -> None:
    resp = client.get("/transactions/pending")
    assert resp.status_code == 200
    pending = resp.json()
    assert isinstance(pending, list)
    assert all("transaction_id" in tx for tx in pending)


def test_submit_score_marks_scored() -> None:
    create = client.post("/transactions", json=SAMPLE).json()
    tx_id = create["transaction_id"]

    score = {
        "transaction_id": tx_id,
        "risk_score": 25.0,
        "risk_level": "low",
        "reasons": ["high_risk_country"],
    }
    resp = client.post(f"/transactions/{tx_id}/score", json=score)
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "scored"
    assert body["risk_score"] == 25.0
    assert body["reasons"] == ["high_risk_country"]


def test_submit_score_idempotent_conflict() -> None:
    create = client.post(
        "/transactions",
        json={**SAMPLE, "user_id": "user-dup", "timestamp": "2026-06-21T13:00:00Z"},
    ).json()
    tx_id = create["transaction_id"]
    score = {
        "transaction_id": tx_id,
        "risk_score": 10.0,
        "risk_level": "low",
        "reasons": [],
    }
    client.post(f"/transactions/{tx_id}/score", json=score)
    again = client.post(f"/transactions/{tx_id}/score", json=score)
    assert again.status_code == 409


def test_get_transaction_by_id() -> None:
    create = client.post(
        "/transactions",
        json={**SAMPLE, "user_id": "user-get", "timestamp": "2026-06-21T14:00:00Z"},
    ).json()
    tx_id = create["transaction_id"]

    resp = client.get(f"/transactions/{tx_id}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["transaction_id"] == tx_id
    assert body["status"] == "pending"


def test_get_transaction_not_found() -> None:
    resp = client.get("/transactions/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


def test_create_rejects_non_positive_amount() -> None:
    resp = client.post("/transactions", json={**SAMPLE, "amount": 0})
    assert resp.status_code == 422


def test_submit_score_rejects_id_mismatch() -> None:
    create = client.post(
        "/transactions",
        json={**SAMPLE, "user_id": "user-mismatch", "timestamp": "2026-06-21T15:00:00Z"},
    ).json()
    tx_id = create["transaction_id"]
    resp = client.post(
        f"/transactions/{tx_id}/score",
        json={
            "transaction_id": "00000000-0000-0000-0000-000000000000",
            "risk_score": 10.0,
            "risk_level": "low",
            "reasons": [],
        },
    )
    assert resp.status_code == 400
