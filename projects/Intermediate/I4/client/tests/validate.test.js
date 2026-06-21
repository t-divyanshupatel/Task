import { describe, expect, it } from "vitest";

import {
  formatConvertResult,
  formatRatesResult,
  parseConvertArgs,
} from "../src/validate.js";

describe("parseConvertArgs", () => {
  it("accepts valid amount and currencies", () => {
    expect(parseConvertArgs("100", "usd", "eur")).toEqual({
      amount: 100,
      fromCurrency: "USD",
      toCurrency: "EUR",
    });
  });

  it("rejects non-positive amount", () => {
    expect(() => parseConvertArgs("0", "USD", "EUR")).toThrow(/greater than 0/);
    expect(() => parseConvertArgs("-5", "USD", "EUR")).toThrow(/greater than 0/);
  });

  it("rejects unsupported currency", () => {
    expect(() => parseConvertArgs("10", "XYZ", "EUR")).toThrow(/one of:/);
  });
});

describe("formatConvertResult", () => {
  it("formats conversion output", () => {
    const output = formatConvertResult({
      amount: 100,
      from_currency: "USD",
      to_currency: "EUR",
      rate: 0.92,
      converted_amount: 92,
    });

    expect(output).toContain("100 USD -> 92 EUR");
    expect(output).toContain("Rate: 0.92");
  });
});

describe("formatRatesResult", () => {
  it("formats rates listing", () => {
    const output = formatRatesResult({
      base: "USD",
      currencies: [
        { currency: "EUR", rate_to_usd: 0.92 },
        { currency: "USD", rate_to_usd: 1 },
      ],
    });

    expect(output).toContain("Base: USD");
    expect(output).toContain("EUR: 0.92");
  });
});
