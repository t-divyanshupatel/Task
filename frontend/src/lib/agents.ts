export type AgentCategory = "basics" | "intermediate" | "advanced";

export interface AgentMeta {
  id: string;
  slug: string;
  category: AgentCategory;
  title: string;
  shortDescription: string;
  relativePath: string;
  outputRelativePath: string;
}

export const CATEGORY_LABELS: Record<AgentCategory, string> = {
  basics: "Basics",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const CATEGORY_COLORS: Record<
  AgentCategory,
  { accent: string; glow: string; badge: string }
> = {
  basics: {
    accent: "#34d399",
    glow: "rgba(52, 211, 153, 0.25)",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  intermediate: {
    accent: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.25)",
    badge: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  },
  advanced: {
    accent: "#c084fc",
    glow: "rgba(192, 132, 252, 0.25)",
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  },
};

export const AGENTS: AgentMeta[] = [
  {
    id: "B1",
    slug: "repo-structure-mapper",
    category: "basics",
    title: "Repo Structure Mapper",
    shortDescription:
      "Discovers classes, services, controllers, models, and more — writes a structure map report.",
    relativePath: "Basics/B1/repo-structure-mapper-agent.md",
    outputRelativePath: "Basics/B1/repo-structure-map.md",
  },
  {
    id: "B2",
    slug: "repo-route-api-mapper",
    category: "basics",
    title: "Route & API Mapper",
    shortDescription:
      "Maps every frontend route and API endpoint the app calls or serves.",
    relativePath: "Basics/B2/repo-route-api-mapper-agent.md",
    outputRelativePath: "Basics/B2/route-api-map.md",
  },
  {
    id: "B3",
    slug: "repo-test-discovery",
    category: "basics",
    title: "Test Discovery",
    shortDescription:
      "Detects test frameworks, runs tests, and writes a discovery report.",
    relativePath: "Basics/B3/repo-test-discovery-agent.md",
    outputRelativePath: "Basics/B3/test-discovery-report.md",
  },
  {
    id: "I1",
    slug: "repo-er-diagram",
    category: "intermediate",
    title: "ER Diagram",
    shortDescription:
      "Discovers database entities and relationships with a Mermaid ER diagram.",
    relativePath: "Intermediate/I1/repo-er-diagram-agent.md",
    outputRelativePath: "Intermediate/I1/er-diagram-report.md",
  },
  {
    id: "I2",
    slug: "repo-e2e-flow-tracer",
    category: "intermediate",
    title: "E2E Flow Tracer",
    shortDescription:
      "Traces end-to-end user flows across frontend, API, and data layers.",
    relativePath: "Intermediate/I2/repo-e2e-flow-tracer-agent.md",
    outputRelativePath: "Intermediate/I2/e2e-flow-trace-report.md",
  },
  {
    id: "I3",
    slug: "repo-minimal-change",
    category: "intermediate",
    title: "Minimal Change",
    shortDescription:
      "Implements the smallest safe change to satisfy a requirement.",
    relativePath: "Intermediate/I3/repo-minimal-change-agent.md",
    outputRelativePath: "Intermediate/I3/minimal-change-report.md",
  },
  {
    id: "I6",
    slug: "repo-seeded-bug-diagnosis",
    category: "intermediate",
    title: "Bug Diagnosis",
    shortDescription:
      "Diagnoses seeded bugs with root-cause analysis and fix recommendations.",
    relativePath: "Intermediate/I6/repo-seeded-bug-diagnosis-agent.md",
    outputRelativePath: "Intermediate/I6/bug-diagnosis-report.md",
  },
  {
    id: "A1",
    slug: "parallel-worktree-plan",
    category: "advanced",
    title: "Parallel Worktree Plan",
    shortDescription:
      "Decomposes a feature into parallel worktrees with lane prompts, merge order, and verification gates.",
    relativePath: "Advanced/A1/parallel-worktree-plan-agent.md",
    outputRelativePath: "Advanced/A1/parallel-worktree-plan.md",
  },
  {
    id: "A2",
    slug: "parallel-worktree-execution",
    category: "advanced",
    title: "Parallel Worktree Execution",
    shortDescription:
      "Creates parallel worktrees, implements lane changes, merges cleanly, and documents conflicts.",
    relativePath: "Advanced/A2/parallel-worktree-execution-agent.md",
    outputRelativePath: "Advanced/A2/parallel-worktree-execution-report.md",
  },
  {
    id: "A6",
    slug: "performance-optimization",
    category: "advanced",
    title: "Performance Optimization",
    shortDescription:
      "Profiles a real bottleneck, applies a minimal fix, and proves improvement with before/after metrics.",
    relativePath: "Advanced/A6/performance-optimization-agent.md",
    outputRelativePath: "Advanced/A6/performance-optimization-report.md",
  },
  {
    id: "A4",
    slug: "repo-modernization",
    category: "advanced",
    title: "Repo Modernization",
    shortDescription:
      "Analyzes modernization opportunities and implements the highest-value step.",
    relativePath: "Advanced/A4/repo-modernization-agent.md",
    outputRelativePath: "Advanced/A4/modernization-report.md",
  },
  {
    id: "A5",
    slug: "pr-review",
    category: "advanced",
    title: "PR Review",
    shortDescription:
      "Reviews PRs for correctness, security, tests, performance, and maintainability.",
    relativePath: "Advanced/A5/pr-review-agent.md",
    outputRelativePath: "Advanced/A5/pr-review-report.md",
  },
];
