from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


JobStatus = Literal["pending", "processing", "completed", "failed"]


class JobCreate(BaseModel):
    task: Literal["uppercase", "reverse"] = Field(..., description="Worker task type")
    text: str = Field(..., min_length=1, max_length=500)


class JobResponse(BaseModel):
    id: int
    payload: dict[str, Any]
    status: JobStatus
    result: Optional[dict[str, Any]] = None
