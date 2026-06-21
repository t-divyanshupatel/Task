import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


# --- GET /health ---


def test_health_returns_200_with_ok_status() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# --- GET /rates ---


def test_rates_returns_all_supported_currencies() -> None:
    response = client.get("/rates")

    assert response.status_code == 200
    body = response.json()
    assert body["base"] == "USD"
    codes = {entry["currency"] for entry in body["currencies"]}
    assert codes == {"USD", "EUR", "GBP", "INR", "JPY"}


def test_rates_include_usd_as_unity() -> None:
    response = client.get("/rates")

    usd = next(c for c in response.json()["currencies"] if c["currency"] == "USD")
    assert usd["rate_to_usd"] == 1.0


def test_rates_entries_are_sorted_by_currency_code() -> None:
    response = client.get("/rates")

    codes = [entry["currency"] for entry in response.json()["currencies"]]
    assert codes == sorted(codes)


# --- POST /convert ---


def test_convert_usd_to_eur() -> None:
    response = client.post(
        "/convert",
        json={"amount": 100, "from_currency": "USD", "to_currency": "EUR"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["amount"] == 100
    assert body["from_currency"] == "USD"
    assert body["to_currency"] == "EUR"
    assert body["converted_amount"] == 92.0
    assert body["rate"] == pytest.approx(0.92)


def test_convert_eur_to_usd() -> None:
    response = client.post(
        "/convert",
        json={"amount": 92, "from_currency": "EUR", "to_currency": "USD"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["converted_amount"] == 100.0


def test_convert_same_currency_returns_unchanged_amount() -> None:
    response = client.post(
        "/convert",
        json={"amount": 50, "from_currency": "GBP", "to_currency": "GBP"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["converted_amount"] == 50.0
    assert body["rate"] == 1.0


def test_convert_normalizes_lowercase_currency_codes() -> None:
    response = client.post(
        "/convert",
        json={"amount": 10, "from_currency": "usd", "to_currency": "jpy"},
    )

    assert response.status_code == 200
    assert response.json()["from_currency"] == "USD"
    assert response.json()["to_currency"] == "JPY"


def test_convert_rejects_zero_amount() -> None:
    response = client.post(
        "/convert",
        json={"amount": 0, "from_currency": "USD", "to_currency": "EUR"},
    )

    assert response.status_code == 422


def test_convert_rejects_negative_amount() -> None:
    response = client.post(
        "/convert",
        json={"amount": -25, "from_currency": "USD", "to_currency": "EUR"},
    )

    assert response.status_code == 422


def test_convert_rejects_missing_amount() -> None:
    response = client.post(
        "/convert",
        json={"from_currency": "USD", "to_currency": "EUR"},
    )

    assert response.status_code == 422


def test_convert_rejects_missing_from_currency() -> None:
    response = client.post(
        "/convert",
        json={"amount": 10, "to_currency": "EUR"},
    )

    assert response.status_code == 422


def test_convert_rejects_missing_to_currency() -> None:
    response = client.post(
        "/convert",
        json={"amount": 10, "from_currency": "USD"},
    )

    assert response.status_code == 422


def test_convert_rejects_invalid_from_currency() -> None:
    response = client.post(
        "/convert",
        json={"amount": 10, "from_currency": "XYZ", "to_currency": "USD"},
    )

    assert response.status_code == 422


def test_convert_rejects_invalid_to_currency() -> None:
    response = client.post(
        "/convert",
        json={"amount": 10, "from_currency": "USD", "to_currency": "ABC"},
    )

    assert response.status_code == 422


def test_openapi_docs_available() -> None:
    response = client.get("/docs")

    assert response.status_code == 200
    assert "swagger" in response.text.lower()
