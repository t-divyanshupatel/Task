import path from "node:path";
import { fileURLToPath } from "node:url";
import { runScorer } from "../src/score-runner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scorerBin = path.resolve(__dirname, "../../scorer/target/release/fraud-scorer");

const lowRiskTx = {
  transaction_id: "550e8400-e29b-41d4-a716-446655440001",
  user_id: "user-1",
  amount: 100,
  currency: "USD",
  merchant_category: "retail",
  country_code: "US",
  device_id: "dev-1",
  timestamp: "2026-06-21T12:00:00Z",
};

describe("runScorer", () => {
  test("returns low risk for safe US retail transaction", async () => {
    const result = await runScorer(scorerBin, lowRiskTx);
    expect(result.transaction_id).toBe(lowRiskTx.transaction_id);
    expect(result.risk_level).toBe("low");
    expect(result.risk_score).toBe(0);
    expect(result.reasons).toEqual([]);
  });

  test("returns high risk for large crypto transaction abroad", async () => {
    const result = await runScorer(scorerBin, {
      ...lowRiskTx,
      transaction_id: "550e8400-e29b-41d4-a716-446655440002",
      amount: 15000,
      merchant_category: "crypto",
      country_code: "NG",
    });
    expect(result.risk_level).toBe("high");
    expect(result.risk_score).toBe(90);
    expect(result.reasons).toContain("high_amount");
    expect(result.reasons).toContain("high_risk_category");
    expect(result.reasons).toContain("high_risk_country");
  });
});
