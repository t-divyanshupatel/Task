from __future__ import annotations

from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from app.observability import (
    ObservabilityMiddleware,
    metrics_asgi_app,
    record_order_created,
    setup_logging,
)

OrderStatus = Literal["pending", "confirmed", "shipped"]

_orders: list[dict] = []
_next_id = 1

logger = setup_logging()


class OrderCreate(BaseModel):
    sku: str = Field(..., min_length=1, max_length=64)
    quantity: int = Field(..., ge=1, le=1000)


class OrderResponse(BaseModel):
    id: int
    sku: str
    quantity: int
    status: OrderStatus


app = FastAPI(title="D6 Order API", version="1.0.0")
app.add_middleware(ObservabilityMiddleware, logger=logger)
app.mount("/metrics", metrics_asgi_app())


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "d6-order-api"}


@app.get("/orders", response_model=list[OrderResponse])
def list_orders() -> list[OrderResponse]:
    return [OrderResponse(**order) for order in _orders]


@app.post("/orders", response_model=OrderResponse, status_code=201)
def create_order(body: OrderCreate) -> OrderResponse:
    global _next_id
    order = {
        "id": _next_id,
        "sku": body.sku,
        "quantity": body.quantity,
        "status": "pending",
    }
    _orders.append(order)
    record_order_created(logger, order["id"], order["sku"], order["quantity"])
    _next_id += 1
    return OrderResponse(**order)


@app.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: int) -> OrderResponse:
    for order in _orders:
        if order["id"] == order_id:
            return OrderResponse(**order)
    raise HTTPException(status_code=404, detail="Order not found")
