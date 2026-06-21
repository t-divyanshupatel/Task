from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_ok() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "d3-notify"}


def test_version_returns_app_version() -> None:
    response = client.get("/version")
    assert response.status_code == 200
    assert response.json()["version"] == "1.0.0"


def test_notify_accepts_valid_message() -> None:
    response = client.post("/notify", json={"message": "deploy complete"})
    assert response.status_code == 201
    body = response.json()
    assert body["message"] == "deploy complete"
    assert body["status"] == "queued"


def test_notify_rejects_empty_message() -> None:
    response = client.post("/notify", json={"message": ""})
    assert response.status_code == 422


def test_notify_rejects_missing_message() -> None:
    response = client.post("/notify", json={})
    assert response.status_code == 422
