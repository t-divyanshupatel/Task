import { z } from "zod";

import { SUPPORTED_CURRENCIES } from "./config.js";

const currencySchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine((value) => SUPPORTED_CURRENCIES.includes(value), {
    message: `Currency must be one of: ${SUPPORTED_CURRENCIES.join(", ")}`,
  });

export const convertArgsSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  fromCurrency: currencySchema,
  toCurrency: currencySchema,
});

export function parseConvertArgs(amount, fromCurrency, toCurrency) {
  return convertArgsSchema.parse({
    amount,
    fromCurrency,
    toCurrency,
  });
}

export function formatConvertResult(result) {
  return [
    `Converted ${result.amount} ${result.from_currency} -> ${result.converted_amount} ${result.to_currency}`,
    `Rate: ${result.rate}`,
  ].join("\n");
}

export function formatRatesResult(result) {
  const lines = [`Base: ${result.base}`, "Rates (units per 1 USD):"];
  for (const entry of result.currencies) {
    lines.push(`  ${entry.currency}: ${entry.rate_to_usd}`);
  }
  return lines.join("\n");
}
