from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.converter import UnsupportedCurrencyError, convert
from app.models import ConvertRequest, ConvertResponse, HealthResponse, RatesResponse

app = FastAPI(
    title="Currency Converter API",
    description="Small FastAPI service with hardcoded FX rates and a /convert endpoint.",
    version="1.0.0",
)


@app.exception_handler(UnsupportedCurrencyError)
async def unsupported_currency_handler(
    _request: Request, exc: UnsupportedCurrencyError
) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
    )


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.get("/rates", response_model=RatesResponse)
def list_rates() -> RatesResponse:
    return RatesResponse.from_hardcoded()


@app.post("/convert", response_model=ConvertResponse)
def convert_currency(payload: ConvertRequest) -> ConvertResponse:
    return convert(payload)
