import { promises as fs } from "fs";
import path from "path";
import JSZip from "jszip";
import { agents, getAgent } from "@/lib/data/agents";
import { agentToJson, agentToMarkdown, agentToSkillMarkdown } from "@/lib/agent-export";

const AGENT_FILES = ["agent/agent.md", "agent/planning.md", "agent/execute.md", "agent/verify.md", "README.md"];

async function addAgentToZip(zip: JSZip, agentId: string, folderPrefix = "") {
  const agent = getAgent(agentId);
  if (!agent) return;

  const prefix = folderPrefix ? `${folderPrefix}/${agent.id}` : agent.id;
  const agentDir = path.join(process.cwd(), "..", agent.repoPath.replace(/^Task\//, ""));

  zip.file(`${prefix}/${agent.id}-spec.md`, agentToMarkdown(agent));
  zip.file(`${prefix}/${agent.id}-spec.json`, agentToJson(agent));
  zip.file(`${prefix}/SKILL.md`, agentToSkillMarkdown(agent));

  for (const rel of AGENT_FILES) {
    const full = path.join(agentDir, rel);
    try {
      const content = await fs.readFile(full, "utf-8");
      zip.file(`${prefix}/${rel}`, content);
    } catch {
      // file missing — skip
    }
  }

  // proof sample report
  try {
    const proofDir = path.join(agentDir, "proof");
    const files = await fs.readdir(proofDir);
    for (const f of files.filter((x) => x.endsWith(".md"))) {
      const content = await fs.readFile(path.join(proofDir, f), "utf-8");
      zip.file(`${prefix}/proof/${f}`, content);
    }
  } catch {
    // no proof dir
  }
}

export async function buildAgentBundle(agentId: string): Promise<Buffer> {
  const agent = getAgent(agentId);
  if (!agent) throw new Error("Agent not found");

  const zip = new JSZip();
  await addAgentToZip(zip, agentId);
  zip.file(
    "HOW-TO-USE.txt",
    [
      `${agent.id} — ${agent.name}`,
      "",
      `1. Copy SKILL.md to .cursor/skills/${agent.skillPath.split("/").slice(-2, -1)[0]}/`,
      `2. In Cursor Agent chat: ${agent.slashCommand}`,
      `3. Follow Plan → Execute → Verify`,
      "",
      `Report output: ${agent.repoPath}/${agent.reportPath}`,
    ].join("\n"),
  );

  return Buffer.from(await zip.generateAsync({ type: "nodebuffer" }));
}

export async function buildAllAgentsBundle(): Promise<Buffer> {
  const zip = new JSZip();
  zip.file(
    "README.txt",
    [
      "Task Agent Library — Full Bundle",
      "",
      "10 Cursor slash-command agents",
      "Each folder contains: agent/*.md, README, spec, SKILL template, sample proof",
      "",
      "https://github.com/t-divyanshupatel/Task",
    ].join("\n"),
  );

  for (const agent of agents) {
    await addAgentToZip(zip, agent.id, "agents");
  }

  return Buffer.from(await zip.generateAsync({ type: "nodebuffer" }));
}
