import { config } from "./config.js";

export async function fetchPending() {
  const url = `${config.apiBaseUrl}/transactions/pending?limit=${config.batchSize}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`fetch pending failed: ${resp.status}`);
  }
  return resp.json();
}

export async function submitScore(transactionId, score) {
  const url = `${config.apiBaseUrl}/transactions/${transactionId}/score`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(score),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`submit score failed: ${resp.status} ${text}`);
  }
  return resp.json();
}

export async function waitForApi(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const resp = await fetch(`${config.apiBaseUrl}/health`);
      if (resp.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`API not reachable at ${config.apiBaseUrl}`);
}
