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


# --- POST /transactions ---


def test_post_deposit_returns_201_with_transaction_fields(client: TestClient) -> None:
    response = client.post(
        "/transactions",
        json={"amount": 100.0, "type": "deposit", "description": "Paycheck"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["id"] == 1
    assert body["amount"] == 100.0
    assert body["type"] == "deposit"
    assert body["description"] == "Paycheck"
    assert "created_at" in body


def test_post_withdrawal_returns_201(client: TestClient) -> None:
    client.post("/transactions", json={"amount": 100.0, "type": "deposit"})

    response = client.post(
        "/transactions",
        json={"amount": 40.0, "type": "withdrawal", "description": "ATM"},
    )

    assert response.status_code == 201
    assert response.json()["type"] == "withdrawal"
    assert response.json()["amount"] == 40.0


def test_post_deposit_without_description(client: TestClient) -> None:
    response = client.post(
        "/transactions",
        json={"amount": 50.0, "type": "deposit"},
    )

    assert response.status_code == 201
    assert response.json()["description"] is None


def test_withdrawal_at_exact_balance_succeeds(client: TestClient) -> None:
    client.post("/transactions", json={"amount": 75.0, "type": "deposit"})

    response = client.post(
        "/transactions",
        json={"amount": 75.0, "type": "withdrawal"},
    )

    assert response.status_code == 201
    assert client.get("/balance").json()["balance"] == 0.0


def test_withdrawal_rejected_when_insufficient_balance(client: TestClient) -> None:
    client.post("/transactions", json={"amount": 30.0, "type": "deposit"})

    response = client.post(
        "/transactions",
        json={"amount": 50.0, "type": "withdrawal"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Insufficient balance for withdrawal"


# --- GET /transactions ---


def test_get_transactions_empty_list(client: TestClient) -> None:
    response = client.get("/transactions")

    assert response.status_code == 200
    assert response.json() == []


def test_get_transactions_returns_created_in_order(client: TestClient) -> None:
    client.post(
        "/transactions",
        json={"amount": 100.0, "type": "deposit", "description": "First"},
    )
    client.post(
        "/transactions",
        json={"amount": 25.5, "type": "withdrawal"},
    )

    response = client.get("/transactions")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    assert body[0]["id"] == 1
    assert body[0]["description"] == "First"
    assert body[1]["id"] == 2
    assert body[1]["amount"] == 25.5


# --- GET /balance ---


def test_get_balance_empty_ledger(client: TestClient) -> None:
    response = client.get("/balance")

    assert response.status_code == 200
    assert response.json() == {"balance": 0.0, "transaction_count": 0}


def test_get_balance_after_mixed_transactions(client: TestClient) -> None:
    client.post("/transactions", json={"amount": 200.0, "type": "deposit"})
    client.post("/transactions", json={"amount": 50.0, "type": "withdrawal"})
    client.post("/transactions", json={"amount": 25.0, "type": "deposit"})

    response = client.get("/balance")

    assert response.status_code == 200
    assert response.json() == {"balance": 175.0, "transaction_count": 3}


# --- Input validation (422) ---


def test_validation_rejects_negative_amount(client: TestClient) -> None:
    response = client.post(
        "/transactions",
        json={"amount": -10.0, "type": "deposit"},
    )

    assert response.status_code == 422


def test_validation_rejects_zero_amount(client: TestClient) -> None:
    response = client.post(
        "/transactions",
        json={"amount": 0, "type": "deposit"},
    )

    assert response.status_code == 422


def test_validation_rejects_invalid_type(client: TestClient) -> None:
    response = client.post(
        "/transactions",
        json={"amount": 10.0, "type": "transfer"},
    )

    assert response.status_code == 422


def test_validation_rejects_missing_amount(client: TestClient) -> None:
    response = client.post(
        "/transactions",
        json={"type": "deposit"},
    )

    assert response.status_code == 422


def test_validation_rejects_missing_type(client: TestClient) -> None:
    response = client.post(
        "/transactions",
        json={"amount": 10.0},
    )

    assert response.status_code == 422


def test_validation_rejects_description_over_max_length(client: TestClient) -> None:
    response = client.post(
        "/transactions",
        json={"amount": 10.0, "type": "deposit", "description": "x" * 201},
    )

    assert response.status_code == 422


def test_validation_rejects_non_json_body(client: TestClient) -> None:
    response = client.post(
        "/transactions",
        content="not json",
        headers={"Content-Type": "application/json"},
    )

    assert response.status_code == 422


# --- App metadata (proves FastAPI app is wired) ---


def test_openapi_docs_available(client: TestClient) -> None:
    response = client.get("/docs")

    assert response.status_code == 200
    assert "swagger" in response.text.lower()
