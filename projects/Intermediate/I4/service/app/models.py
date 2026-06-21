from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.rates import RATES_TO_USD, SUPPORTED_CURRENCIES

CurrencyCode = Literal["USD", "EUR", "GBP", "INR", "JPY"]


class ConvertRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Positive amount to convert")
    from_currency: CurrencyCode
    to_currency: CurrencyCode

    @field_validator("from_currency", "to_currency", mode="before")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        if isinstance(value, str):
            return value.upper()
        return value


class ConvertResponse(BaseModel):
    amount: float
    from_currency: str
    to_currency: str
    rate: float
    converted_amount: float


class HealthResponse(BaseModel):
    status: str


class RateEntry(BaseModel):
    currency: str
    rate_to_usd: float


class RatesResponse(BaseModel):
    base: str = "USD"
    currencies: list[RateEntry]

    @classmethod
    def from_hardcoded(cls) -> "RatesResponse":
        return cls(
            currencies=[
                RateEntry(currency=code, rate_to_usd=RATES_TO_USD[code])
                for code in sorted(SUPPORTED_CURRENCIES)
            ]
        )
