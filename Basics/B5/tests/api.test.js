import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { store } from "../src/store.js";

describe("Transaction Ledger API", () => {
  let app;

  beforeEach(() => {
    store.reset();
    app = createApp();
  });

  afterEach(() => {
    store.reset();
  });

  it("creates and lists transactions", async () => {
    const deposit = await request(app)
      .post("/transactions")
      .send({ amount: 100, type: "deposit", description: "Paycheck" });

    const withdrawal = await request(app)
      .post("/transactions")
      .send({ amount: 25.5, type: "withdrawal" });

    expect(deposit.status).toBe(201);
    expect(deposit.body.type).toBe("deposit");
    expect(withdrawal.status).toBe(201);

    const list = await request(app).get("/transactions");

    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(2);
    expect(list.body[0].id).toBe(1);
    expect(list.body[1].amount).toBe(25.5);
  });

  it("returns health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("returns the current balance", async () => {
    await request(app)
      .post("/transactions")
      .send({ amount: 200, type: "deposit" });
    await request(app)
      .post("/transactions")
      .send({ amount: 50, type: "withdrawal" });

    const response = await request(app).get("/balance");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ balance: 150, transaction_count: 2 });
  });

  it("rejects invalid payloads", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({ amount: -10, type: "deposit" });

    expect(response.status).toBe(422);
    expect(response.body.detail).toBeDefined();
  });

  it("rejects withdrawals when balance is insufficient", async () => {
    await request(app)
      .post("/transactions")
      .send({ amount: 30, type: "deposit" });

    const response = await request(app)
      .post("/transactions")
      .send({ amount: 50, type: "withdrawal" });

    expect(response.status).toBe(400);
    expect(response.body.detail).toBe("Insufficient balance for withdrawal");
  });
});
