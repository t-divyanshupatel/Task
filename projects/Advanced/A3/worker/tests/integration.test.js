/**
 * Integration: FastAPI + Node worker + Rust scorer (requires API running).
 * Skipped when FRAUD_API_URL is unset and health check fails.
 */
import { config } from "../src/config.js";
import { submitScore, waitForApi } from "../src/api-client.js";
import { runScorer } from "../src/score-runner.js";

const apiUp = await (async () => {
  try {
    await waitForApi(3);
    return true;
  } catch {
    return false;
  }
})();

const describeIf = apiUp ? describe : describe.skip;

describeIf("integration path", () => {
  test("ingest via API, score via Rust CLI, submit result", async () => {
    const payload = {
      user_id: "integration-user",
      amount: 12000,
      currency: "USD",
      merchant_category: "wire_transfer",
      country_code: "RU",
      device_id: "integration-dev",
      timestamp: "2026-06-21T14:00:00Z",
    };

    const createResp = await fetch(`${config.apiBaseUrl}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(createResp.status).toBe(201);
    const created = await createResp.json();
    expect(created.status).toBe("pending");

    const pendingResp = await fetch(`${config.apiBaseUrl}/transactions/pending`);
    const pending = await pendingResp.json();
    const tx = pending.find((p) => p.transaction_id === created.transaction_id);
    expect(tx).toBeDefined();

    const score = await runScorer(config.scorerBin, tx);
    expect(score.risk_level).toBe("high");

    const scored = await submitScore(created.transaction_id, score);
    expect(scored.status).toBe("scored");
    expect(scored.risk_score).toBeGreaterThan(0);
  });
});
