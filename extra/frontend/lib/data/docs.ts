import type { DocSection } from "@/lib/types";

export const docSections: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: [
      "Task is a hands-on evaluation library for Cursor coding agents: 10 slash-command agents, 14 runnable project sandboxes, and a structured Plan → Execute → Verify workflow.",
      "Agents analyze or modify repositories. Projects are greenfield build targets with tests and proof artifacts.",
    ],
    subsections: [
      {
        title: "Run an agent",
        content: [
          "Open Cursor in Agent mode (not Ask mode).",
          "Type / in chat and select a skill, e.g. /basics-repo-structure-mapper.",
          "Provide target repo: /basics-repo-structure-mapper on Task/extra/medusa — markdown output",
          "Answer planning MCQs (repo path, output format).",
          "Read deliverable at Task/agents/{Tier}/{ID}/proof/*-report.md",
        ],
      },
      {
        title: "Run a project",
        content: [
          "cd Task/projects/Basics/B4 && python3 -m venv .venv && source .venv/bin/activate",
          "pip install -r requirements.txt && pytest -v",
          "cd Task/projects/Advanced/A3 && ./scripts/run-integration.sh",
          "cd Task/projects/InfraAndDevops/D6 && ./scripts/up.sh && ./scripts/verify.sh",
        ],
      },
    ],
  },
  {
    id: "installation",
    title: "Installation",
    content: [
      "Prerequisites vary by tier. Basics: Python 3.9+, Node.js 18+, Rust 1.70+. Intermediate adds Docker 20+. Advanced adds git. Infra adds Terraform ≥1.5, kubectl + kind.",
      "Each project README contains exact install, run, and test commands.",
      "Agents require Cursor with .cursor/skills/ loaded from the workspace root.",
    ],
  },
  {
    id: "repository-structure",
    title: "Repository Structure",
    content: [
      "Task/agents/ — 10 Cursor agents with agent.md, planning.md, execute.md, verify.md, and proof/ reports.",
      "Task/projects/ — 14 sandboxes across Basics, Intermediate, Advanced, and InfraAndDevops tiers.",
      "Task/agents/frontend/ — Shared Next.js template copied per-agent for website output (DO NOT EDIT).",
      ".cursor/skills/ — One SKILL.md per agent; invoke with /skill-name in Agent chat.",
    ],
    subsections: [
      {
        title: "Per-agent layout",
        content: [
          "{Tier}/{ID}/README.md — Human guide",
          "{Tier}/{ID}/agent/agent.md — Entry point",
          "{Tier}/{ID}/agent/planning.md — Phase 1 MCQ inputs",
          "{Tier}/{ID}/agent/execute.md — Phase 2 task instructions",
          "{Tier}/{ID}/agent/verify.md — Phase 3 checklist",
          "{Tier}/{ID}/proof/ — Sample markdown deliverables",
        ],
      },
      {
        title: "Per-project layout",
        content: [
          "{Tier}/{ID}/README.md — Install, run, test instructions",
          "{Tier}/{ID}/{app,api,service}/ — Source code",
          "{Tier}/{ID}/tests/ — Automated tests",
          "{Tier}/{ID}/proof/ — Screenshots, logs, captured output",
          "{Tier}/{ID}/scripts/ — Proof regeneration, E2E helpers",
        ],
      },
    ],
  },
  {
    id: "agent-development",
    title: "Agent Development",
    content: [
      "Every agent follows spec-first design: agent.md → planning.md → execute.md → verify.md. No phase is skipped.",
      "Reports cite path:line, config keys, and real command output. Gaps marked unknown or [NEEDS CLARIFICATION].",
      "Dual output: markdown report in proof/ OR website copied from agents/frontend/.",
      "Change-capable agents (I3, I6, A4, A6) stage edits but do not commit unless asked.",
    ],
    subsections: [
      {
        title: "Adding a new agent",
        content: [
          "Create Task/agents/{Tier}/{ID}/agent/ with agent.md, planning.md, execute.md, verify.md.",
          "Create proof/ for sample reports.",
          "Add README.md documenting the / slash command.",
          "Add .cursor/skills/{skill-name}/SKILL.md — one skill per agent.",
          "Update agents/README.md catalog table.",
        ],
      },
    ],
  },
  {
    id: "running-projects",
    title: "Running Projects",
    content: [
      "Each project is self-contained with its own README, dependencies, and test suite.",
      "Regenerate proof: cd Task/projects/{Tier}/{ID} && ./scripts/capture-proof.sh (where available).",
    ],
  },
  {
    id: "testing",
    title: "Testing",
    content: [
      "Projects ship automated tests: pytest, Vitest, Jest, Cargo, terraform validate, E2E scripts.",
      "Agents verify via verify.md checklists before claiming done.",
      "Test Discovery agent (B3) finds and runs tests in any repository.",
    ],
  },
  {
    id: "contributing",
    title: "Contributing",
    content: [
      "Repository: https://github.com/t-divyanshupatel/Task",
      "Follow existing agent folder contract and project README patterns.",
      "All deliverables require evidence — no placeholder reports.",
      "Tier difficulty: Basics → Intermediate → Advanced → Infra & DevOps.",
    ],
  },
  {
    id: "technical-deep-dive",
    title: "Technical Deep Dive",
    content: [
      "Agent design principles, prompt engineering, and repository analysis strategy are embedded in each agent's execute.md.",
    ],
    subsections: [
      {
        title: "Agent design principles",
        content: [
          "Spec-first: no implementation before planning MCQs answered.",
          "Evidence over claims: every finding cites path:line or command output.",
          "Read-only by default: 7 of 10 agents never edit source.",
          "Single deliverable per run: markdown OR website.",
        ],
      },
      {
        title: "Repository analysis strategy",
        content: [
          "B1: Ten-category symbol inventory with layer diagrams.",
          "B2: Framework-aware route + API correlation.",
          "B3: CI mining → test execution → failure classification.",
          "I1: ORM/migration parsing → Mermaid ER diagram.",
          "I2: Single-entry call-chain → sequence diagram.",
        ],
      },
      {
        title: "Code understanding workflow",
        content: [
          "Plan (MCQ inputs) → Execute (discovery/analysis/change) → Verify (checklist).",
          "Cursor skill loads agent instructions; developer provides repo path and format.",
          "Output written to proof/ or built as Next.js website on localhost:3000.",
        ],
      },
    ],
  },
];

export function getDocSection(id: string) {
  return docSections.find((s) => s.id === id);
}
