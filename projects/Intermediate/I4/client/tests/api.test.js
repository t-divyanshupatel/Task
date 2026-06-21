import { afterEach, describe, expect, it, vi } from "vitest";

import {
  convertCurrency,
  fetchHealth,
  fetchRates,
} from "../src/api.js";

const BASE = "http://test.local";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchHealth", () => {
  it("returns health payload on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "ok" }),
      }),
    );

    await expect(fetchHealth(BASE)).resolves.toEqual({ status: "ok" });
    expect(fetch).toHaveBeenCalledWith(`${BASE}/health`);
  });

  it("throws on non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        json: async () => ({ detail: "down" }),
      }),
    );

    await expect(fetchHealth(BASE)).rejects.toThrow(/API error \(503\)/);
  });
});

describe("fetchRates", () => {
  it("returns rates payload on success", async () => {
    const payload = { base: "USD", currencies: [] };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => payload,
      }),
    );

    await expect(fetchRates(BASE)).resolves.toEqual(payload);
    expect(fetch).toHaveBeenCalledWith(`${BASE}/rates`);
  });
});

describe("convertCurrency", () => {
  it("POSTs convert request with mapped field names", async () => {
    const payload = {
      amount: 100,
      from_currency: "USD",
      to_currency: "EUR",
      rate: 0.92,
      converted_amount: 92,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => payload,
      }),
    );

    const result = await convertCurrency(
      { amount: 100, fromCurrency: "USD", toCurrency: "EUR" },
      BASE,
    );

    expect(result).toEqual(payload);
    expect(fetch).toHaveBeenCalledWith(`${BASE}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 100,
        from_currency: "USD",
        to_currency: "EUR",
      }),
    });
  });
});
