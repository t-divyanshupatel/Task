import os

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="D5 Bootstrap Demo API",
    description="Minimal service used to prove one-command repo bootstrap.",
    version="1.0.0",
)


class EchoRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)


class EchoResponse(BaseModel):
    text: str
    environment: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "d5-bootstrap-demo"}


@app.get("/ready")
def ready() -> dict[str, str]:
    env = os.environ.get("APP_ENV", "development")
    return {"status": "ready", "app_env": env}


@app.post("/echo", response_model=EchoResponse, status_code=200)
def echo(payload: EchoRequest) -> EchoResponse:
    return EchoResponse(
        text=payload.text,
        environment=os.environ.get("APP_ENV", "development"),
    )
