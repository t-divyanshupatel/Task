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

  // --- POST /transactions ---

  it("POST /transactions — deposit returns 201 with transaction fields", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({ amount: 100, type: "deposit", description: "Paycheck" });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe(1);
    expect(response.body.amount).toBe(100);
    expect(response.body.type).toBe("deposit");
    expect(response.body.description).toBe("Paycheck");
    expect(response.body.created_at).toBeDefined();
  });

  it("POST /transactions — withdrawal returns 201", async () => {
    await request(app)
      .post("/transactions")
      .send({ amount: 100, type: "deposit" });

    const response = await request(app)
      .post("/transactions")
      .send({ amount: 40, type: "withdrawal", description: "ATM" });

    expect(response.status).toBe(201);
    expect(response.body.type).toBe("withdrawal");
    expect(response.body.amount).toBe(40);
  });

  it("POST /transactions — deposit without description", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({ amount: 50, type: "deposit" });

    expect(response.status).toBe(201);
    expect(response.body.description).toBeNull();
  });

  it("POST /transactions — withdrawal at exact balance succeeds", async () => {
    await request(app)
      .post("/transactions")
      .send({ amount: 75, type: "deposit" });

    const response = await request(app)
      .post("/transactions")
      .send({ amount: 75, type: "withdrawal" });

    expect(response.status).toBe(201);

    const balance = await request(app).get("/balance");
    expect(balance.body.balance).toBe(0);
  });

  it("POST /transactions — rejects insufficient balance with 400", async () => {
    await request(app)
      .post("/transactions")
      .send({ amount: 30, type: "deposit" });

    const response = await request(app)
      .post("/transactions")
      .send({ amount: 50, type: "withdrawal" });

    expect(response.status).toBe(400);
    expect(response.body.detail).toBe("Insufficient balance for withdrawal");
  });

  // --- GET /transactions ---

  it("GET /transactions — returns empty list initially", async () => {
    const response = await request(app).get("/transactions");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("GET /transactions — returns transactions in creation order", async () => {
    await request(app)
      .post("/transactions")
      .send({ amount: 100, type: "deposit", description: "First" });
    await request(app)
      .post("/transactions")
      .send({ amount: 25.5, type: "withdrawal" });

    const response = await request(app).get("/transactions");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].id).toBe(1);
    expect(response.body[0].description).toBe("First");
    expect(response.body[1].id).toBe(2);
    expect(response.body[1].amount).toBe(25.5);
  });

  // --- GET /balance ---

  it("GET /balance — empty ledger returns zero", async () => {
    const response = await request(app).get("/balance");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ balance: 0, transaction_count: 0 });
  });

  it("GET /balance — reflects mixed deposits and withdrawals", async () => {
    await request(app)
      .post("/transactions")
      .send({ amount: 200, type: "deposit" });
    await request(app)
      .post("/transactions")
      .send({ amount: 50, type: "withdrawal" });
    await request(app)
      .post("/transactions")
      .send({ amount: 25, type: "deposit" });

    const response = await request(app).get("/balance");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ balance: 175, transaction_count: 3 });
  });

  // --- Input validation (422) ---

  it("rejects negative amount", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({ amount: -10, type: "deposit" });

    expect(response.status).toBe(422);
    expect(response.body.detail).toBeDefined();
  });

  it("rejects zero amount", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({ amount: 0, type: "deposit" });

    expect(response.status).toBe(422);
  });

  it("rejects invalid transaction type", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({ amount: 10, type: "transfer" });

    expect(response.status).toBe(422);
  });

  it("rejects missing amount", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({ type: "deposit" });

    expect(response.status).toBe(422);
  });

  it("rejects missing type", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({ amount: 10 });

    expect(response.status).toBe(422);
  });

  it("rejects description over max length", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({ amount: 10, type: "deposit", description: "x".repeat(201) });

    expect(response.status).toBe(422);
  });

  it("rejects invalid JSON body", async () => {
    const response = await request(app)
      .post("/transactions")
      .set("Content-Type", "application/json")
      .send("not json");

    expect(response.status).toBe(400);
  });
});
