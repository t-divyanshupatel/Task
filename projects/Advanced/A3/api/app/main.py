from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import FastAPI, HTTPException, status

from app.models import (
    FraudScoreResult,
    TransactionCreate,
    TransactionIngest,
    TransactionRecord,
)
from app.store import apply_score, get_transaction, init_db, insert_transaction, list_pending, new_transaction_id

app = FastAPI(
    title="A3 Fraud Ingestion API",
    description="Accepts transactions for async fraud scoring by the Node worker + Rust CLI.",
    version="1.0.0",
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


def _to_record(row: dict[str, Any]) -> TransactionRecord:
    return TransactionRecord(
        transaction_id=row["transaction_id"],
        user_id=row["user_id"],
        amount=row["amount"],
        currency=row["currency"],
        merchant_category=row["merchant_category"],
        country_code=row["country_code"],
        device_id=row["device_id"],
        timestamp=datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00")),
        status=row["status"],
        risk_score=row.get("risk_score"),
        risk_level=row.get("risk_level"),
        reasons=row.get("reasons"),
        scored_at=(
            datetime.fromisoformat(row["scored_at"].replace("Z", "+00:00"))
            if row.get("scored_at")
            else None
        ),
        created_at=datetime.fromisoformat(row["created_at"].replace("Z", "+00:00")),
    )


def _to_ingest(row: dict[str, Any]) -> TransactionIngest:
    return TransactionIngest(
        transaction_id=row["transaction_id"],
        user_id=row["user_id"],
        amount=row["amount"],
        currency=row["currency"],
        merchant_category=row["merchant_category"],
        country_code=row["country_code"],
        device_id=row["device_id"],
        timestamp=datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00")),
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "a3-fraud-api"}


@app.post("/transactions", response_model=TransactionRecord, status_code=status.HTTP_201_CREATED)
def create_transaction(payload: TransactionCreate) -> TransactionRecord:
    tx_id = new_transaction_id()
    ingest = TransactionIngest(
        transaction_id=tx_id,
        **payload.model_dump(),
    )
    row = insert_transaction(ingest.model_dump(mode="json"))
    return _to_record(row)


@app.get("/transactions/pending", response_model=list[TransactionIngest])
def get_pending_transactions(limit: int = 50) -> list[TransactionIngest]:
    rows = list_pending(limit=limit)
    return [_to_ingest(r) for r in rows]


@app.get("/transactions/{transaction_id}", response_model=TransactionRecord)
def get_transaction_by_id(transaction_id: str) -> TransactionRecord:
    row = get_transaction(transaction_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return _to_record(row)


@app.post("/transactions/{transaction_id}/score", response_model=TransactionRecord)
def submit_score(transaction_id: str, score: FraudScoreResult) -> TransactionRecord:
    if str(score.transaction_id) != transaction_id:
        raise HTTPException(status_code=400, detail="transaction_id mismatch")
    updated = apply_score(transaction_id, score.model_dump(mode="json"))
    if updated is None:
        existing = get_transaction(transaction_id)
        if existing is None:
            raise HTTPException(status_code=404, detail="Transaction not found")
        raise HTTPException(status_code=409, detail="Transaction already scored or not pending")
    return _to_record(updated)
