from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="D3 Notify Service",
    description="Small API for CI lint, test, and Docker build demo.",
    version="1.0.0",
)


class NotifyRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=200)


class NotifyResponse(BaseModel):
    message: str
    status: str = "queued"


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "d3-notify"}


@app.get("/version")
def version() -> dict[str, str]:
    return {"version": app.version}


@app.post("/notify", response_model=NotifyResponse, status_code=201)
def notify(payload: NotifyRequest) -> NotifyResponse:
    return NotifyResponse(message=payload.message)
