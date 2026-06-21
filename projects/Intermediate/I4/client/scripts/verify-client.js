#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const baseUrl = process.env.CONVERTER_API_URL ?? "http://127.0.0.1:8000";
const cliPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/cli.js");

function run(args) {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    encoding: "utf8",
    env: { ...process.env, CONVERTER_API_URL: baseUrl },
  });

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }

  return result.stdout.trim();
}

console.log(`Verifying CLI against ${baseUrl}\n`);

const health = run(["health"]);
console.log("health:", health);
if (!health.includes('"status": "ok"')) {
  console.error("health check failed");
  process.exit(1);
}

const rates = run(["rates"]);
console.log("\nrates:\n" + rates);
if (!rates.includes("EUR:")) {
  console.error("rates check failed");
  process.exit(1);
}

const convert = run(["convert", "100", "USD", "EUR"]);
console.log("\nconvert:\n" + convert);
if (!convert.includes("92") || !convert.includes("EUR")) {
  console.error("convert check failed");
  process.exit(1);
}

console.log("\nAll client verification checks passed.");
