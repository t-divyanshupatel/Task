export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY"];

export function getBaseUrl() {
  return process.env.CONVERTER_API_URL ?? "http://127.0.0.1:8000";
}
