import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_currencies(client: TestClient) -> None:
    response = client.get("/currencies")

    assert response.status_code == 200
    assert response.json()["currencies"] == ["EUR", "GBP", "INR", "JPY", "USD"]


def test_convert_usd_to_eur(client: TestClient) -> None:
    response = client.post(
        "/convert",
        json={"amount": 100, "from": "USD", "to": "EUR"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["amount"] == 100
    assert body["from"] == "USD"
    assert body["to"] == "EUR"
    assert body["result"] == 92.0
    assert body["rate"] == 0.92


def test_convert_accepts_lowercase_codes(client: TestClient) -> None:
    response = client.post(
        "/convert",
        json={"amount": 10, "from": "usd", "to": "inr"},
    )

    assert response.status_code == 200
    assert response.json()["from"] == "USD"
    assert response.json()["to"] == "INR"


def test_convert_same_currency(client: TestClient) -> None:
    response = client.post(
        "/convert",
        json={"amount": 42.5, "from": "GBP", "to": "GBP"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["result"] == 42.5
    assert body["rate"] == 1.0


def test_validation_rejects_non_positive_amount(client: TestClient) -> None:
    response = client.post(
        "/convert",
        json={"amount": 0, "from": "USD", "to": "EUR"},
    )

    assert response.status_code == 422


def test_validation_rejects_invalid_currency_code_length(client: TestClient) -> None:
    response = client.post(
        "/convert",
        json={"amount": 10, "from": "US", "to": "EUR"},
    )

    assert response.status_code == 422


def test_convert_rejects_unsupported_currency(client: TestClient) -> None:
    response = client.post(
        "/convert",
        json={"amount": 10, "from": "USD", "to": "XYZ"},
    )

    assert response.status_code == 400
    assert "Unsupported currency 'XYZ'" in response.json()["detail"]
