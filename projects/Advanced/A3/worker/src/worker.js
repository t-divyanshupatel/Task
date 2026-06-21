import { waitForApi } from "./api-client.js";
import { config } from "./config.js";
import { processBatch } from "./process-batch.js";

const once = process.argv.includes("--once");

async function main() {
  console.log(`[worker] API=${config.apiBaseUrl} scorer=${config.scorerBin}`);
  await waitForApi();

  if (once) {
    const n = await processBatch();
    console.log(`[worker] processed ${n} transaction(s)`);
    return;
  }

  console.log(`[worker] polling every ${config.pollIntervalMs}ms`);
  for (;;) {
    try {
      await processBatch();
    } catch (err) {
      console.error("[worker] error:", err.message);
    }
    await new Promise((r) => setTimeout(r, config.pollIntervalMs));
  }
}

main().catch((err) => {
  console.error("[worker] fatal:", err);
  process.exit(1);
});
