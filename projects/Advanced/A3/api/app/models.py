from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class MerchantCategory(str, Enum):
    retail = "retail"
    grocery = "grocery"
    travel = "travel"
    entertainment = "entertainment"
    gambling = "gambling"
    crypto = "crypto"
    wire_transfer = "wire_transfer"
    other = "other"


class TransactionIngest(BaseModel):
    """Matches contracts/transaction.schema.json — input to ingestion + Rust scorer."""

    transaction_id: UUID
    user_id: str = Field(min_length=1, max_length=64)
    amount: float = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)
    merchant_category: MerchantCategory
    country_code: str = Field(min_length=2, max_length=2)
    device_id: str = Field(min_length=1, max_length=128)
    timestamp: datetime

    @field_validator("currency", "country_code")
    @classmethod
    def uppercase_codes(cls, v: str) -> str:
        return v.upper()


class TransactionCreate(BaseModel):
    user_id: str = Field(min_length=1, max_length=64)
    amount: float = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)
    merchant_category: MerchantCategory
    country_code: str = Field(min_length=2, max_length=2)
    device_id: str = Field(min_length=1, max_length=128)
    timestamp: datetime

    @field_validator("currency", "country_code")
    @classmethod
    def uppercase_codes(cls, v: str) -> str:
        return v.upper()


class FraudScoreResult(BaseModel):
    """Matches contracts/score-result.schema.json — output from Rust scorer."""

    transaction_id: UUID
    risk_score: float = Field(ge=0, le=100)
    risk_level: Literal["low", "medium", "high"]
    reasons: list[str]


class TransactionRecord(BaseModel):
    transaction_id: UUID
    user_id: str
    amount: float
    currency: str
    merchant_category: MerchantCategory
    country_code: str
    device_id: str
    timestamp: datetime
    status: Literal["pending", "scored"]
    risk_score: Optional[float] = None
    risk_level: Optional[Literal["low", "medium", "high"]] = None
    reasons: Optional[list[str]] = None
    scored_at: Optional[datetime] = None
    created_at: datetime
