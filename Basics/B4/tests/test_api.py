import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.store import store


@pytest.fixture(autouse=True)
def reset_store() -> None:
    store.reset()
    yield
    store.reset()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_create_and_list_transactions(client: TestClient) -> None:
    deposit = client.post(
        "/transactions",
        json={"amount": 100.0, "type": "deposit", "description": "Paycheck"},
    )
    withdrawal = client.post(
        "/transactions",
        json={"amount": 25.5, "type": "withdrawal"},
    )

    assert deposit.status_code == 201
    assert deposit.json()["type"] == "deposit"
    assert withdrawal.status_code == 201

    response = client.get("/transactions")
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    assert body[0]["id"] == 1
    assert body[1]["amount"] == 25.5


def test_get_balance(client: TestClient) -> None:
    client.post("/transactions", json={"amount": 200.0, "type": "deposit"})
    client.post("/transactions", json={"amount": 50.0, "type": "withdrawal"})

    response = client.get("/balance")

    assert response.status_code == 200
    assert response.json() == {"balance": 150.0, "transaction_count": 2}


def test_validation_rejects_invalid_payload(client: TestClient) -> None:
    response = client.post(
        "/transactions",
        json={"amount": -10.0, "type": "deposit"},
    )

    assert response.status_code == 422


def test_withdrawal_rejected_when_insufficient_balance(client: TestClient) -> None:
    client.post("/transactions", json={"amount": 30.0, "type": "deposit"})

    response = client.post(
        "/transactions",
        json={"amount": 50.0, "type": "withdrawal"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Insufficient balance for withdrawal"
