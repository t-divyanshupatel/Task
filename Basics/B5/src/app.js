import express from "express";

import { transactionCreateSchema } from "./schemas.js";
import { store } from "./store.js";

export function createApp() {
  const app = express();
  app.use(express.json());

  app.post("/transactions", (req, res) => {
    const parsed = transactionCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ detail: parsed.error.flatten() });
    }

    try {
      const transaction = store.create(parsed.data);
      return res.status(201).json(transaction);
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json({ detail: error.message });
      }
      throw error;
    }
  });

  app.get("/transactions", (_req, res) => {
    res.json(store.listTransactions());
  });

  app.get("/balance", (_req, res) => {
    res.json(store.getBalance());
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}

export const app = createApp();
