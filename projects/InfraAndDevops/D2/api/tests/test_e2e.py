import os
import time

import httpx
import pytest

API_BASE_URL = os.environ.get("API_BASE_URL", "http://127.0.0.1:8000")
POLL_TIMEOUT = float(os.environ.get("E2E_POLL_TIMEOUT", "30"))
POLL_INTERVAL = float(os.environ.get("E2E_POLL_INTERVAL", "1"))


@pytest.fixture(scope="session", autouse=True)
def wait_for_api():
    deadline = time.time() + POLL_TIMEOUT
    last_error = None
    while time.time() < deadline:
        try:
            response = httpx.get(f"{API_BASE_URL}/health", timeout=2.0)
            if response.status_code == 200 and response.json().get("database") == "connected":
                return
            last_error = response.text
        except httpx.HTTPError as exc:
            last_error = str(exc)
        time.sleep(POLL_INTERVAL)
    pytest.fail(f"API not ready at {API_BASE_URL}: {last_error}")


def test_health_reports_database_connected():
    response = httpx.get(f"{API_BASE_URL}/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database"] == "connected"


def test_list_jobs_includes_seed_data():
    response = httpx.get(f"{API_BASE_URL}/jobs")
    assert response.status_code == 200
    jobs = response.json()
    assert len(jobs) >= 3
    texts = {job["payload"]["text"] for job in jobs}
    assert "hello from seed" in texts
    assert "docker stack" in texts


def test_create_job_returns_pending():
    response = httpx.post(
        f"{API_BASE_URL}/jobs",
        json={"task": "uppercase", "text": "e2e test job"},
    )
    assert response.status_code == 201
    job = response.json()
    assert job["status"] == "pending"
    assert job["payload"]["text"] == "e2e test job"
    assert job["id"] > 0


def test_worker_processes_created_job():
    create_response = httpx.post(
        f"{API_BASE_URL}/jobs",
        json={"task": "reverse", "text": "worker"},
    )
    assert create_response.status_code == 201
    job_id = create_response.json()["id"]

    deadline = time.time() + POLL_TIMEOUT
    final_job = None
    while time.time() < deadline:
        get_response = httpx.get(f"{API_BASE_URL}/jobs/{job_id}")
        assert get_response.status_code == 200
        final_job = get_response.json()
        if final_job["status"] == "completed":
            break
        time.sleep(POLL_INTERVAL)

    assert final_job is not None
    assert final_job["status"] == "completed"
    assert final_job["result"]["output"] == "rekrow"


def test_worker_processes_seed_jobs():
    deadline = time.time() + POLL_TIMEOUT
    while time.time() < deadline:
        response = httpx.get(f"{API_BASE_URL}/jobs")
        assert response.status_code == 200
        jobs = {job["payload"]["text"]: job for job in response.json()}
        seed_job = jobs.get("hello from seed")
        if seed_job and seed_job["status"] == "completed":
            assert seed_job["result"]["output"] == "HELLO FROM SEED"
            return
        time.sleep(POLL_INTERVAL)
    pytest.fail("Seed job 'hello from seed' was not completed by worker in time")


def test_get_job_not_found():
    response = httpx.get(f"{API_BASE_URL}/jobs/999999")
    assert response.status_code == 404
