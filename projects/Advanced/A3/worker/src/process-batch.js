import { fetchPending, submitScore } from "./api-client.js";
import { config } from "./config.js";
import { runScorer } from "./score-runner.js";

export async function processBatch() {
  const pending = await fetchPending();
  if (pending.length === 0) {
    console.log("[worker] no pending transactions");
    return 0;
  }

  let processed = 0;
  for (const tx of pending) {
    const score = await runScorer(config.scorerBin, tx);
    await submitScore(tx.transaction_id, score);
    console.log(
      `[worker] scored ${tx.transaction_id} -> ${score.risk_level} (${score.risk_score})`,
    );
    processed += 1;
  }
  return processed;
}
