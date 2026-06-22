import { agents } from "./agents";
import { projects } from "./projects";

export const repoStats = {
  totalAgents: agents.length,
  totalProjects: projects.length,
  evalItems: 24,
  cursorSkills: 10,
  tiers: 4,
  languages: ["Python", "TypeScript", "JavaScript", "Rust", "HCL", "YAML", "SQL"],
  frameworks: [
    "FastAPI", "Express", "Next.js", "Docker", "Terraform",
    "GitHub Actions", "Kubernetes", "Prometheus", "Grafana",
    "pytest", "Vitest", "Jest", "Cargo", "SQLAlchemy",
  ],
  workflowPhases: 3,
  readOnlyAgents: agents.filter((a) => a.modifiesRepo === false).length,
  changeCapableAgents: agents.filter((a) => a.modifiesRepo === true).length,
  partialAgents: agents.filter((a) => a.modifiesRepo === "partial").length,
  totalTests: "100+ automated tests across sandboxes",
  documentationReadmes: 30,
  proofArtifacts: "Screenshots, logs, command output, reports",
};

export const tierBreakdown = [
  { tier: "Basics", agents: 3, projects: 3, focus: "Repo discovery; single-language greenfield apps" },
  { tier: "Intermediate", agents: 4, projects: 2, focus: "Schema/flow analysis; multi-service + Docker" },
  { tier: "Advanced", agents: 3, projects: 3, focus: "Modernization, review, perf; worktrees; polyglot" },
  { tier: "Infra & DevOps", agents: 0, projects: 6, focus: "Terraform, Compose, CI, K8s, bootstrap, observability" },
];

export const chartColors = {
  agent: "#a78bfa",
  project: "#38bdf8",
  accent: "#6366f1",
  accent2: "#22d3ee",
  modify: "#f472b6",
  readOnly: "#64748b",
  partial: "#fb923c",
};

export function tierChartData() {
  return tierBreakdown.map((t) => ({
    name: t.tier.replace(" & DevOps", ""),
    agents: t.agents,
    projects: t.projects,
  }));
}

export function agentModeData() {
  return [
    { name: "Read-only", value: repoStats.readOnlyAgents, fill: chartColors.readOnly },
    { name: "Install only", value: repoStats.partialAgents, fill: chartColors.partial },
    { name: "Modifies repo", value: repoStats.changeCapableAgents, fill: chartColors.modify },
  ];
}

export function languageData() {
  const counts: Record<string, number> = {};
  for (const p of projects) {
    for (const s of p.stack) {
      counts[s] = (counts[s] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
}
