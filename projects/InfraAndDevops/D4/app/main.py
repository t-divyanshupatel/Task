import os

from fastapi import FastAPI
from pydantic import BaseModel, Field

SERVICE_NAME = os.getenv("SERVICE_NAME", "d4-notify")
LOG_LEVEL = os.getenv("LOG_LEVEL", "info")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")

app = FastAPI(
    title="D4 Notify Service",
    description="Small API deployed to Kubernetes for Infra & DevOps D4.",
    version=APP_VERSION,
)


class NotifyRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=200)


class NotifyResponse(BaseModel):
    message: str
    status: str = "queued"


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": SERVICE_NAME, "log_level": LOG_LEVEL}


@app.get("/version")
def version() -> dict[str, str]:
    return {"version": app.version, "service": SERVICE_NAME}


@app.post("/notify", response_model=NotifyResponse, status_code=201)
def notify(payload: NotifyRequest) -> NotifyResponse:
    return NotifyResponse(message=payload.message)
