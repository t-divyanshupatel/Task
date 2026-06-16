"""Hardcoded exchange rates relative to USD."""

RATES_TO_USD: dict[str, float] = {
    "USD": 1.0,
    "EUR": 0.92,
    "GBP": 0.79,
    "INR": 83.12,
    "JPY": 149.5,
}


def supported_currencies() -> list[str]:
    return sorted(RATES_TO_USD.keys())


def convert_amount(amount: float, from_currency: str, to_currency: str) -> tuple[float, float]:
    """Return (converted_amount, effective_rate)."""
    from_rate = RATES_TO_USD[from_currency]
    to_rate = RATES_TO_USD[to_currency]
    usd_amount = amount / from_rate
    result = usd_amount * to_rate
    effective_rate = to_rate / from_rate
    return round(result, 4), round(effective_rate, 6)
