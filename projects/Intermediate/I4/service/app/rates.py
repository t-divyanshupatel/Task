"""Hardcoded exchange rates relative to USD (1 USD = rate units of each currency)."""

from typing import Final

SUPPORTED_CURRENCIES: Final[frozenset[str]] = frozenset({"USD", "EUR", "GBP", "INR", "JPY"})

# 1 USD equals this many units of the target currency.
RATES_TO_USD: Final[dict[str, float]] = {
    "USD": 1.0,
    "EUR": 0.92,
    "GBP": 0.79,
    "INR": 83.12,
    "JPY": 157.5,
}
