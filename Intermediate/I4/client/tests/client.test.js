import { describe, expect, it } from "vitest";

import { convertCurrency } from "../src/api.js";
import {
  formatConversion,
  parseArgs,
  validateCliInput,
} from "../src/parseArgs.js";

describe("parseArgs", () => {
  it("parses positional arguments", () => {
    expect(parseArgs(["node", "cli.js", "100", "USD", "EUR"])).toEqual({
      amount: "100",
      from: "USD",
      to: "EUR",
      baseUrl: "http://127.0.0.1:8000",
      help: false,
    });
  });

  it("parses named flags", () => {
    expect(
      parseArgs([
        "node",
        "cli.js",
        "--amount",
        "25",
        "--from",
        "gbp",
        "--to",
        "jpy",
        "--url",
        "http://localhost:9000",
      ]),
    ).toMatchObject({
      amount: "25",
      from: "gbp",
      to: "jpy",
      baseUrl: "http://localhost:9000",
    });
  });
});

describe("validateCliInput", () => {
  it("accepts valid input", () => {
    const result = validateCliInput({ amount: "10.5", from: "usd", to: "inr" });
    expect(result).toEqual({
      ok: true,
      value: { amount: 10.5, from: "USD", to: "INR" },
    });
  });

  it("rejects invalid amount and currency", () => {
    const result = validateCliInput({ amount: "-1", from: "US", to: "ABC" });
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(3);
  });
});

describe("formatConversion", () => {
  it("formats a successful response", () => {
    expect(
      formatConversion({
        amount: 100,
        from: "USD",
        to: "EUR",
        result: 92,
        rate: 0.92,
      }),
    ).toBe("100 USD = 92 EUR (rate: 0.92)");
  });
});

describe("convertCurrency", () => {
  it("posts to the convert endpoint and returns JSON", async () => {
    const fetchImpl = async (url, init) => ({
      ok: true,
      status: 200,
      json: async () => ({
        amount: 100,
        from: "USD",
        to: "EUR",
        result: 92,
        rate: 0.92,
      }),
    });

    const result = await convertCurrency(
      { baseUrl: "http://127.0.0.1:8000", amount: 100, from: "USD", to: "EUR" },
      fetchImpl,
    );

    expect(result.result).toBe(92);
  });

  it("surfaces API errors", async () => {
    const fetchImpl = async () => ({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({ detail: "Unsupported currency 'XYZ'" }),
    });

    await expect(
      convertCurrency(
        { baseUrl: "http://127.0.0.1:8000", amount: 1, from: "USD", to: "XYZ" },
        fetchImpl,
      ),
    ).rejects.toThrow("Unsupported currency 'XYZ'");
  });
});
