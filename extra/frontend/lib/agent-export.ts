import type { Agent } from "@/lib/types";

function modLabel(agent: Agent) {
  if (agent.modifiesRepo === true) return "Modifies repository";
  if (agent.modifiesRepo === "partial") return "Install only (no source edits)";
  return "Read-only";
}

export function agentToMarkdown(agent: Agent): string {
  const lines = [
    `# ${agent.id} — ${agent.name}`,
    "",
    `> **Internal name:** \`${agent.internalName}\``,
    `> **Tier:** ${agent.tier}`,
    `> **Mode:** ${modLabel(agent)}`,
    `> **Slash command:** \`${agent.slashCommand}\``,
    "",
    "## Purpose",
    agent.purpose,
    "",
    "## Problem solved",
    agent.problem,
    "",
    "## Approach",
    agent.approach,
    ...(agent.sampleResult ? ["", "### Sample result", agent.sampleResult] : []),
    "",
    "## Responsibilities",
    ...agent.responsibilities.map((r) => `- ${r}`),
    "",
    "## Capabilities",
    ...agent.capabilities.map((c) => `- ${c}`),
    "",
    "## Inputs",
    ...agent.inputs.map((i) => `- ${i}`),
    ...(agent.extraInput ? [`- ${agent.extraInput} (extra)`] : []),
    "",
    "## Outputs",
    ...agent.outputs.map((o) => `- ${o}`),
    "",
    "## Use cases",
    ...agent.useCases.map((u) => `- ${u}`),
    "",
    "## Workflow",
    "1. **Plan** — `planning.md` MCQ inputs",
    "2. **Execute** — `execute.md` discovery / analysis / change",
    "3. **Verify** — `verify.md` completion checklist",
    "",
    "## Example usage",
    "```text",
    agent.exampleUsage,
    "```",
    "",
    "## Repository paths",
    `- Agent: \`${agent.repoPath}/\``,
    `- Skill: \`${agent.skillPath}\``,
    `- Report: \`${agent.repoPath}/${agent.reportPath}\``,
    "",
    "---",
    "*Generated from Task Agent Library — https://github.com/t-divyanshupatel/Task*",
  ];
  return lines.join("\n");
}

export function agentToJson(agent: Agent): string {
  return JSON.stringify(
    {
      id: agent.id,
      name: agent.name,
      internalName: agent.internalName,
      tier: agent.tier,
      slashCommand: agent.slashCommand,
      modifiesRepo: agent.modifiesRepo,
      purpose: agent.purpose,
      problem: agent.problem,
      responsibilities: agent.responsibilities,
      inputs: agent.inputs,
      outputs: agent.outputs,
      capabilities: agent.capabilities,
      useCases: agent.useCases,
      approach: agent.approach,
      exampleUsage: agent.exampleUsage,
      reportPath: agent.reportPath,
      skillPath: agent.skillPath,
      repoPath: agent.repoPath,
      sampleResult: agent.sampleResult,
      extraInput: agent.extraInput,
      workflow: ["Plan", "Execute", "Verify"],
    },
    null,
    2,
  );
}

export function agentToSkillMarkdown(agent: Agent): string {
  const skillName = agent.skillPath.split("/").slice(-2, -1)[0] ?? agent.internalName;
  return `---
name: ${skillName}
description: |
  ${agent.name} (${agent.id}) — ${agent.purpose.slice(0, 200)}
disable-model-invocation: true
---

# ${agent.name} (${agent.id})

Invoke with: \`${agent.slashCommand}\`

## Quick start

\`\`\`text
${agent.exampleUsage}
\`\`\`

## Agent path

\`${agent.repoPath}/agent/\`

Read in order: \`agent.md\` → \`planning.md\` → \`execute.md\` → \`verify.md\`

## Outputs

${agent.outputs.map((o) => `- ${o}`).join("\n")}

## Mode

${modLabel(agent)}
`;
}

export function downloadBlob(content: string, filename: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadAgentBundle(agentId: string) {
  const res = await fetch(`/api/agents/${agentId}/bundle`);
  if (!res.ok) throw new Error("Bundle unavailable");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${agentId}-agent-bundle.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadAllAgentsBundle() {
  const res = await fetch("/api/agents/bundle-all");
  if (!res.ok) throw new Error("Bundle unavailable");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "task-agents-all.zip";
  a.click();
  URL.revokeObjectURL(url);
}
