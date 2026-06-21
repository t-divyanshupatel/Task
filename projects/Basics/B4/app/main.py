from fastapi import FastAPI

from app.models import BalanceResponse, Transaction, TransactionCreate
from app.store import store

app = FastAPI(
    title="Transaction Ledger API",
    description="Small FastAPI service for deposits, withdrawals, and balance.",
    version="1.0.0",
)


@app.post("/transactions", response_model=Transaction, status_code=201)
def create_transaction(payload: TransactionCreate) -> Transaction:
    return store.create(payload)


@app.get("/transactions", response_model=list[Transaction])
def list_transactions() -> list[Transaction]:
    return store.list_transactions()


@app.get("/balance", response_model=BalanceResponse)
def get_balance() -> BalanceResponse:
    return store.get_balance()
