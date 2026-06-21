import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

export const config = {
  apiBaseUrl: process.env.FRAUD_API_URL ?? "http://127.0.0.1:8000",
  pollIntervalMs: Number(process.env.WORKER_POLL_MS ?? 2000),
  batchSize: Number(process.env.WORKER_BATCH_SIZE ?? 10),
  scorerBin:
    process.env.FRAUD_SCORER_BIN ??
    path.join(root, "scorer", "target", "release", "fraud-scorer"),
};
