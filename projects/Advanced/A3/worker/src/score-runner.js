import { spawn } from "node:child_process";

export function runScorer(scorerBin, transaction) {
  return new Promise((resolve, reject) => {
    const child = spawn(scorerBin, [], { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`scorer exited ${code}: ${stderr || stdout}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch {
        reject(new Error(`invalid scorer JSON: ${stdout}`));
      }
    });

    child.stdin.write(JSON.stringify(transaction));
    child.stdin.end();
  });
}
