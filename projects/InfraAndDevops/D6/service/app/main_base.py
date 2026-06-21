"""Uninstrumented baseline — used only to generate instrumentation-diff.patch proof."""
from __future__ import annotations

import logging
import sys
from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s service=d6-order-api %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("d6-order-api")

OrderStatus = Literal["pending", "confirmed", "shipped"]

_orders: list[dict] = []
_next_id = 1


class OrderCreate(BaseModel):
    sku: str = Field(..., min_length=1, max_length=64)
    quantity: int = Field(..., ge=1, le=1000)


class OrderResponse(BaseModel):
    id: int
    sku: str
    quantity: int
    status: OrderStatus


app = FastAPI(title="D6 Order API (baseline)", version="1.0.0")


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
    logger.info(
        "event=order_created order_id=%s sku=%s quantity=%s",
        order["id"],
        order["sku"],
        order["quantity"],
    )
    _next_id += 1
    return OrderResponse(**order)


@app.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: int) -> OrderResponse:
    for order in _orders:
        if order["id"] == order_id:
            return OrderResponse(**order)
    raise HTTPException(status_code=404, detail="Order not found")
