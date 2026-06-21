import os

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_ok() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "d5-bootstrap-demo"}


def test_ready_returns_default_env() -> None:
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "ready"
    assert response.json()["app_env"] == "development"


def test_ready_uses_app_env_variable() -> None:
    os.environ["APP_ENV"] = "test"
    response = client.get("/ready")
    assert response.json()["app_env"] == "test"
    del os.environ["APP_ENV"]


def test_echo_returns_text() -> None:
    response = client.post("/echo", json={"text": "hello bootstrap"})
    assert response.status_code == 200
    body = response.json()
    assert body["text"] == "hello bootstrap"
    assert body["environment"] == "development"


def test_echo_rejects_empty_text() -> None:
    response = client.post("/echo", json={"text": ""})
    assert response.status_code == 422
