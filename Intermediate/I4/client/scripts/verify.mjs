#!/usr/bin/env node

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const baseUrl = process.env.CONVERT_API_URL ?? "http://127.0.0.1:8000";
const cliPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/cli.js");

function runCli(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      env: { ...process.env, CONVERT_API_URL: baseUrl },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() });
    });
    child.on("error", reject);
  });
}

async function assertHealth() {
  const response = await fetch(`${baseUrl}/health`);
  if (!response.ok) {
    throw new Error(
      `Converter API is not reachable at ${baseUrl}. Start it first (see README).`,
    );
  }
}

async function main() {
  await assertHealth();

  const success = await runCli(["100", "USD", "EUR"]);
  if (success.code !== 0) {
    throw new Error(`Expected success exit code, got ${success.code}: ${success.stderr}`);
  }
  if (!success.stdout.includes("100 USD = 92 EUR")) {
    throw new Error(`Unexpected CLI output: ${success.stdout}`);
  }

  const invalid = await runCli(["-5", "USD", "EUR"]);
  if (invalid.code === 0) {
    throw new Error("Expected validation failure for negative amount");
  }

  console.log("Client verification passed against live API.");
  console.log(success.stdout);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
