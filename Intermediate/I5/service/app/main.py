from fastapi import FastAPI, HTTPException

from app.models import (
    ConvertRequest,
    ConvertResponse,
    SupportedCurrenciesResponse,
    validate_currency_code,
)
from app.rates import convert_amount, supported_currencies

app = FastAPI(
    title="Currency Converter API",
    description="Convert amounts between currencies using hardcoded rates.",
    version="1.0.0",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/currencies", response_model=SupportedCurrenciesResponse)
def list_currencies() -> SupportedCurrenciesResponse:
    return SupportedCurrenciesResponse(currencies=supported_currencies())


@app.post("/convert", response_model=ConvertResponse)
def convert_currency(payload: ConvertRequest) -> ConvertResponse:
    try:
        validate_currency_code(payload.from_currency)
        validate_currency_code(payload.to)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    result, rate = convert_amount(payload.amount, payload.from_currency, payload.to)

    return ConvertResponse(
        amount=payload.amount,
        from_currency=payload.from_currency,
        to=payload.to,
        result=result,
        rate=rate,
    )
