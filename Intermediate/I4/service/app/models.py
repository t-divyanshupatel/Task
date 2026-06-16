from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.rates import RATES_TO_USD


class ConvertRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    amount: float = Field(..., gt=0, description="Positive amount to convert")
    from_currency: str = Field(..., alias="from", min_length=3, max_length=3)
    to: str = Field(..., min_length=3, max_length=3)

    @field_validator("from_currency", "to")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()


class ConvertResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    amount: float
    from_currency: str = Field(..., alias="from")
    to: str
    result: float
    rate: float


class SupportedCurrenciesResponse(BaseModel):
    currencies: list[str]


def validate_currency_code(currency: str) -> None:
    if currency not in RATES_TO_USD:
        supported = ", ".join(sorted(RATES_TO_USD))
        raise ValueError(f"Unsupported currency '{currency}'. Supported: {supported}")
