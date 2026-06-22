"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvalTierGrid, PipelineStrip } from "@/components/architecture/pipeline-strip";
import { RepoTree } from "@/components/architecture/repo-tree";
import { diagrams } from "@/lib/data/diagrams";

const MermaidDiagram = dynamic(
  () => import("@/components/MermaidDiagram").then((m) => m.MermaidDiagram),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-border/50 bg-black/20">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    ),
  },
);

export function ArchitecturePageContent() {
  const diagramBlocks = [
    { title: "Agent pipeline", chart: diagrams.agentPipeline, desc: "Developer → Cursor Skill → Plan → Execute → Verify → Output" },
    { title: "Agents vs projects", chart: diagrams.agentVsProject, desc: "HOW agents analyze repos vs WHAT projects build" },
    { title: "Three-phase workflow", chart: diagrams.threePhase, desc: "Mandatory Plan → Execute → Verify for every agent" },
    { title: "Eval framework", chart: diagrams.evalFramework, desc: "24 items across four difficulty tiers" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold">Architecture</h1>
        <p className="mt-3 text-fg-muted">
          Visual diagrams showing agent selection, repository analysis, specialized processing,
          and generated output across the Task evaluation library.
        </p>
      </div>

      <Card className="mt-8 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
        <CardHeader>
          <CardTitle>End-to-end agent pipeline</CardTitle>
          <p className="text-sm text-fg-muted">From slash command to verified deliverable</p>
        </CardHeader>
        <CardContent>
          <PipelineStrip />
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">24-item eval framework</h2>
        <EvalTierGrid />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {diagramBlocks.map((d) => (
          <Card key={d.title} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{d.title}</CardTitle>
              <p className="text-sm text-fg-muted">{d.desc}</p>
            </CardHeader>
            <CardContent>
              <MermaidDiagram chart={d.chart} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Full workflow sequence</CardTitle>
          <p className="text-sm text-fg-muted">Sequence from developer invocation to verified output</p>
        </CardHeader>
        <CardContent>
          <MermaidDiagram chart={diagrams.workflow} />
        </CardContent>
      </Card>

      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Repository structure</h2>
        <RepoTree />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { title: "Spec-first agents", desc: "agent.md → planning.md → execute.md → verify.md — no phase skipped" },
          { title: "Evidence over claims", desc: "Reports cite path:line, config keys, and real command output" },
          { title: "Dual output format", desc: "Markdown report in proof/ or Next.js website on localhost:3000" },
        ].map((p) => (
          <Card key={p.title}>
            <CardHeader><CardTitle className="text-sm">{p.title}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-fg-muted">{p.desc}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
