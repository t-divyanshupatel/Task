import fs from "fs";
import path from "path";
import { AGENTS, type AgentMeta } from "./agents";

export interface AgentWithContent extends AgentMeta {
  content: string;
  filename: string;
  demoContent: string;
  demoFilename: string;
}

const TASK_ROOT = path.join(process.cwd(), "..");

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(TASK_ROOT, relativePath), "utf-8");
}

export function loadAllAgents(): AgentWithContent[] {
  return AGENTS.map((agent) => ({
    ...agent,
    content: readFile(agent.relativePath),
    filename: path.basename(agent.relativePath),
    demoContent: readFile(agent.outputRelativePath),
    demoFilename: path.basename(agent.outputRelativePath),
  }));
}
