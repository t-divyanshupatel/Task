from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.models import BalanceResponse, Transaction, TransactionCreate, TransactionType


class TransactionStore:
    def __init__(self) -> None:
        self._transactions: list[Transaction] = []
        self._next_id = 1

    def reset(self) -> None:
        self._transactions.clear()
        self._next_id = 1

    def create(self, payload: TransactionCreate) -> Transaction:
        if payload.type == TransactionType.WITHDRAWAL and payload.amount > self.balance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient balance for withdrawal",
            )

        transaction = Transaction(
            id=self._next_id,
            amount=payload.amount,
            type=payload.type,
            description=payload.description,
            created_at=datetime.now(timezone.utc),
        )
        self._next_id += 1
        self._transactions.append(transaction)
        return transaction

    def list_transactions(self) -> list[Transaction]:
        return list(self._transactions)

    @property
    def balance(self) -> float:
        total = 0.0
        for txn in self._transactions:
            if txn.type == TransactionType.DEPOSIT:
                total += txn.amount
            else:
                total -= txn.amount
        return round(total, 2)

    def get_balance(self) -> BalanceResponse:
        return BalanceResponse(
            balance=self.balance,
            transaction_count=len(self._transactions),
        )


store = TransactionStore()
