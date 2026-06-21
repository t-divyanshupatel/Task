import { getBaseUrl } from "./config.js";

async function readJson(response) {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = body.detail ?? response.statusText;
    const message =
      typeof detail === "string"
        ? detail
        : JSON.stringify(detail, null, 2);
    throw new Error(`API error (${response.status}): ${message}`);
  }

  return body;
}

export async function fetchHealth(baseUrl = getBaseUrl()) {
  const response = await fetch(`${baseUrl}/health`);
  return readJson(response);
}

export async function fetchRates(baseUrl = getBaseUrl()) {
  const response = await fetch(`${baseUrl}/rates`);
  return readJson(response);
}

export async function convertCurrency(
  { amount, fromCurrency, toCurrency },
  baseUrl = getBaseUrl(),
) {
  const response = await fetch(`${baseUrl}/convert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      from_currency: fromCurrency,
      to_currency: toCurrency,
    }),
  });

  return readJson(response);
}
