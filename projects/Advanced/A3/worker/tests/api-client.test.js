import { jest } from "@jest/globals";

describe("api-client", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetModules();
  });

  test("fetchPending returns parsed JSON on success", async () => {
    const pending = [{ transaction_id: "tx-1", user_id: "u1" }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => pending,
    });

    const { fetchPending } = await import("../src/api-client.js");
    const result = await fetchPending();

    expect(result).toEqual(pending);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/transactions/pending"),
    );
  });

  test("submitScore throws with status and body on failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 409,
      text: async () => '{"detail":"Transaction already scored or not pending"}',
    });

    const { submitScore } = await import("../src/api-client.js");

    await expect(
      submitScore("tx-1", {
        transaction_id: "tx-1",
        risk_score: 10,
        risk_level: "low",
        reasons: [],
      }),
    ).rejects.toThrow("submit score failed: 409");
  });

  test("waitForApi succeeds when health endpoint responds", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    const { waitForApi } = await import("../src/api-client.js");
    await expect(waitForApi(2)).resolves.toBeUndefined();
  });

  test("waitForApi throws when API is unreachable", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("connection refused"));

    const { waitForApi } = await import("../src/api-client.js");
    await expect(waitForApi(2)).rejects.toThrow("API not reachable");
  });
});
