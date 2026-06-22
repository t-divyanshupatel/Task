export const diagrams = {
  agentPipeline: `flowchart TD
    U[Developer] -->|slash command| SK[Cursor Skill]
    SK --> A[agent.md]
    A --> P[planning.md]
    P --> E[execute.md]
    E --> V[verify.md]
    V --> O{Output format?}
    O -->|markdown| R[proof report]
    O -->|website| W[Next.js dashboard]
    E --> REPO[Target Repository]`,

  agentVsProject: `flowchart LR
    subgraph Agents[agents HOW]
      A1[Structure Map]
      A2[Route Map]
      A3[Test Discovery]
      A4[ER Diagram]
      A5[E2E Trace]
      A6[Focused Change]
    end
    subgraph Projects[projects WHAT]
      P1[FastAPI Ledger]
      P2[Node Ledger]
      P3[Fraud Pipeline]
      P4[Terraform]
      P5[K8s and CI]
    end
    Agents -->|analyze modify| REPO[Any Repository]
    Projects -->|build verify| PROOF[proof artifacts]`,

  workflow: `sequenceDiagram
    participant Dev as Developer
    participant Skill as Cursor Skill
    participant Plan as planning.md
    participant Exec as execute.md
    participant Verify as verify.md
    participant Repo as Target Repo
    participant Out as Deliverable

    Dev->>Skill: slash command
    Skill->>Plan: Phase 1 MCQs
    Plan->>Dev: Repo path and format
    Dev-->>Plan: Answers
    Plan->>Exec: Phase 2 Execute
    Exec->>Repo: Read analyze modify
    Repo-->>Exec: Results
    Exec->>Out: Report or website
    Exec->>Verify: Phase 3 Checklist
    Verify-->>Dev: Done`,

  evalFramework: `flowchart TB
    subgraph Basics[Basics tier]
      B1[B1 Agent]
      B4[B4 Project]
      B5[B5 Project]
      B6[B6 Project]
    end
    subgraph Intermediate[Intermediate tier]
      I1[I1 Agent]
      I4[I4 Project]
      I6[I6 Agent]
    end
    subgraph Advanced[Advanced tier]
      A4[A4 Agent]
      A3[A3 Project]
      A2[A2 Project]
    end
    subgraph Infra[Infra and DevOps]
      D1[D1 Terraform]
      D2[D2 Compose]
      D6[D6 Observability]
    end`,

  threePhase: `flowchart LR
    P[Plan] --> E[Execute] --> V[Verify]
    P -.-> P1[MCQ inputs]
    E -.-> E1[Discovery and analysis]
    V -.-> V1[Verify checklist]`,
};

export const mermaidConfig = {
  theme: "dark" as const,
  themeVariables: {
    primaryColor: "#312e81",
    primaryTextColor: "#eef0f8",
    primaryBorderColor: "#6366f1",
    lineColor: "#64748b",
    secondaryColor: "#0c4a6e",
    tertiaryColor: "#4c1d95",
    background: "#0c0e18",
    mainBkg: "#1e1b4b",
    nodeBorder: "#6366f1",
    clusterBkg: "#12141c",
    titleColor: "#eef0f8",
    fontFamily: "system-ui, sans-serif",
    fontSize: "14px",
  },
};

export const repoTree = [
  {
    name: "Task/",
    description: "Evaluation library root",
    children: [
      {
        name: "agents/",
        description: "10 Cursor slash-command agents (B1–B3, I1–I3, I6, A4–A6)",
        children: [
          { name: "Basics/", description: "B1 Structure, B2 Routes, B3 Tests" },
          { name: "Intermediate/", description: "I1 ER, I2 E2E, I3 Change, I6 Debug" },
          { name: "Advanced/", description: "A4 Modernize, A5 Review, A6 Perf" },
          { name: "frontend/", description: "Shared Next.js template (copy only)" },
        ],
      },
      {
        name: "projects/",
        description: "14 runnable sandboxes (B4–B6, I4–I5, A1–A3, D1–D6)",
        children: [
          { name: "Basics/", description: "B4 FastAPI, B5 Node, B6 Rust CLI" },
          { name: "Intermediate/", description: "I4 Currency, I5 Docker" },
          { name: "Advanced/", description: "A1 Plan, A2 Worktree, A3 Fraud" },
          { name: "InfraAndDevops/", description: "D1–D6 infrastructure stacks" },
        ],
      },
      {
        name: "frontend/",
        description: "This showcase website",
      },
    ],
  },
  {
    name: ".cursor/skills/",
    description: "Cursor skill entry points — one per agent",
  },
];

export const pipelineSteps = [
  { step: "1", label: "Developer", desc: "Types /skill-name in Cursor Agent chat" },
  { step: "2", label: "Plan", desc: "MCQ: repo path, output format" },
  { step: "3", label: "Execute", desc: "Discovery, analysis, or code change" },
  { step: "4", label: "Verify", desc: "Checklist before claiming done" },
  { step: "5", label: "Output", desc: "proof/ report or Next.js website" },
];
