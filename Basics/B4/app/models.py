from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class TransactionType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"


class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Positive transaction amount")
    type: TransactionType
    description: Optional[str] = Field(None, max_length=200)


class Transaction(BaseModel):
    id: int
    amount: float
    type: TransactionType
    description: Optional[str]
    created_at: datetime


class BalanceResponse(BaseModel):
    balance: float
    transaction_count: int
