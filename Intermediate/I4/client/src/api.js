export async function convertCurrency({ baseUrl, amount, from, to }, fetchImpl = fetch) {
  const url = `${baseUrl.replace(/\/$/, "")}/convert`;
  const response = await fetchImpl(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, from, to }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = body.detail ?? response.statusText;
    const message = typeof detail === "string" ? detail : JSON.stringify(detail);
    throw new Error(`API error (${response.status}): ${message}`);
  }

  return body;
}
