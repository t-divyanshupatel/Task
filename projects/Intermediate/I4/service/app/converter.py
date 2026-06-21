from app.models import ConvertRequest, ConvertResponse
from app.rates import RATES_TO_USD, SUPPORTED_CURRENCIES


class UnsupportedCurrencyError(ValueError):
    def __init__(self, currency: str) -> None:
        super().__init__(f"Unsupported currency: {currency}")
        self.currency = currency


def convert(payload: ConvertRequest) -> ConvertResponse:
    from_code = payload.from_currency.upper()
    to_code = payload.to_currency.upper()

    if from_code not in SUPPORTED_CURRENCIES:
        raise UnsupportedCurrencyError(from_code)
    if to_code not in SUPPORTED_CURRENCIES:
        raise UnsupportedCurrencyError(to_code)

    from_rate = RATES_TO_USD[from_code]
    to_rate = RATES_TO_USD[to_code]
    exchange_rate = to_rate / from_rate
    converted_amount = round(payload.amount * exchange_rate, 2)

    return ConvertResponse(
        amount=payload.amount,
        from_currency=from_code,
        to_currency=to_code,
        rate=round(exchange_rate, 6),
        converted_amount=converted_amount,
    )
