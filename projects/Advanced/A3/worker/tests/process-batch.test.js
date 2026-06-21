import { jest } from "@jest/globals";

const mockFetchPending = jest.fn();
const mockSubmitScore = jest.fn();
const mockRunScorer = jest.fn();

jest.unstable_mockModule("../src/api-client.js", () => ({
  fetchPending: mockFetchPending,
  submitScore: mockSubmitScore,
}));

jest.unstable_mockModule("../src/score-runner.js", () => ({
  runScorer: mockRunScorer,
}));

const { processBatch } = await import("../src/process-batch.js");

describe("processBatch", () => {
  beforeEach(() => {
    mockFetchPending.mockReset();
    mockSubmitScore.mockReset();
    mockRunScorer.mockReset();
  });

  test("returns 0 when pending queue is empty", async () => {
    mockFetchPending.mockResolvedValue([]);

    const processed = await processBatch();

    expect(processed).toBe(0);
    expect(mockRunScorer).not.toHaveBeenCalled();
    expect(mockSubmitScore).not.toHaveBeenCalled();
  });

  test("scores each pending transaction and submits result", async () => {
    const tx = {
      transaction_id: "550e8400-e29b-41d4-a716-446655440010",
      user_id: "user-1",
      amount: 15000,
      currency: "USD",
      merchant_category: "crypto",
      country_code: "NG",
      device_id: "dev-1",
      timestamp: "2026-06-21T15:00:00Z",
    };
    const score = {
      transaction_id: tx.transaction_id,
      risk_score: 90,
      risk_level: "high",
      reasons: ["high_amount", "high_risk_category", "high_risk_country"],
    };

    mockFetchPending.mockResolvedValue([tx]);
    mockRunScorer.mockResolvedValue(score);
    mockSubmitScore.mockResolvedValue({ ...tx, status: "scored", ...score });

    const processed = await processBatch();

    expect(processed).toBe(1);
    expect(mockRunScorer).toHaveBeenCalledWith(expect.any(String), tx);
    expect(mockSubmitScore).toHaveBeenCalledWith(tx.transaction_id, score);
  });

  test("propagates submitScore failures (e.g. 409 already scored)", async () => {
    const tx = {
      transaction_id: "550e8400-e29b-41d4-a716-446655440011",
      user_id: "user-1",
      amount: 100,
      currency: "USD",
      merchant_category: "retail",
      country_code: "US",
      device_id: "dev-1",
      timestamp: "2026-06-21T15:00:00Z",
    };

    mockFetchPending.mockResolvedValue([tx]);
    mockRunScorer.mockResolvedValue({
      transaction_id: tx.transaction_id,
      risk_score: 0,
      risk_level: "low",
      reasons: [],
    });
    mockSubmitScore.mockRejectedValue(
      new Error('submit score failed: 409 {"detail":"Transaction already scored or not pending"}'),
    );

    await expect(processBatch()).rejects.toThrow("409");
  });
});
