export type Tier = "Basics" | "Intermediate" | "Advanced" | "Infra & DevOps";

export type Agent = {
  id: string;
  name: string;
  internalName: string;
  tier: Tier;
  slashCommand: string;
  modifiesRepo: boolean | "partial";
  featured?: boolean;
  purpose: string;
  problem: string;
  responsibilities: string[];
  inputs: string[];
  outputs: string[];
  capabilities: string[];
  useCases: string[];
  approach: string;
  exampleUsage: string;
  reportPath: string;
  skillPath: string;
  repoPath: string;
  sampleResult?: string;
  extraInput?: string;
};

export type ProjectScreenshot = {
  src: string;
  alt: string;
  caption?: string;
};

export type Project = {
  id: string;
  name: string;
  tier: Tier;
  featured?: boolean;
  summary: string;
  goals: string[];
  features: string[];
  stack: string[];
  architecture: string;
  folderStructure: string[];
  challenges: string[];
  results: string[];
  tests: string;
  complexity: "Basics" | "Intermediate" | "Advanced" | "Infra";
  agentInvolvement: string;
  repoPath: string;
  quickStart: string[];
  endpoints?: string[];
  relationships?: { id: string; note: string }[];
  screenshots?: ProjectScreenshot[];
  lessonsLearned?: string[];
};

export type DocSection = {
  id: string;
  title: string;
  content: string[];
  subsections?: { title: string; content: string[] }[];
};
