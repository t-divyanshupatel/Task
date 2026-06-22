"use client";

import Link from "next/link";
import { ArrowLeft, Terminal } from "lucide-react";
import { Badge, IdBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentWorkflowDiagram } from "@/components/agents/agent-diagrams";
import { AgentDownloadMenu } from "@/components/agents/agent-download";
import type { Agent } from "@/lib/types";

export function AgentDetailView({ agent }: { agent: Agent }) {
  const sections = [
    { title: "Responsibilities", items: agent.responsibilities },
    { title: "Capabilities", items: agent.capabilities },
    { title: "Inputs", items: agent.inputs },
    { title: "Outputs", items: agent.outputs },
    { title: "Use cases", items: agent.useCases },
  ];

  const modLabel =
    agent.modifiesRepo === true ? "Modifies" : agent.modifiesRepo === "partial" ? "Install only" : "Read-only";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/agents" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-accent-2">
        <ArrowLeft size={14} /> All agents
      </Link>

      {/* Sticky download bar */}
      <div className="sticky top-14 z-20 mt-6 -mx-4 border-y border-border/60 bg-bg/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <IdBadge id={agent.id} kind="agent" />
            <span className="text-sm font-semibold">{agent.name}</span>
          </div>
          <AgentDownloadMenu agent={agent} />
        </div>
      </div>

      <header className="mt-8">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant={agent.tier}>{agent.tier}</Badge>
          <Badge variant="outline">{modLabel}</Badge>
        </div>
        <h1 className="text-3xl font-bold">{agent.name}</h1>
        <p className="mt-3 text-fg-muted max-w-3xl leading-relaxed">{agent.purpose}</p>
        <p className="mt-3 text-sm text-fg-muted">
          <span className="font-medium text-fg">Problem: </span>{agent.problem}
        </p>
      </header>

      <Card className="mt-8 border-agent/20 bg-gradient-to-br from-agent/5 to-transparent">
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-agent/20">
              <Terminal className="text-agent" size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-fg-muted">Slash command</p>
              <code className="mt-1 block font-mono text-sm text-accent-2">{agent.slashCommand}</code>
              <p className="mt-2 font-mono text-xs text-fg-muted">{agent.exampleUsage}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow phases */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {["Plan", "Execute", "Verify"].map((phase, i) => (
          <div key={phase} className="rounded-xl border border-border bg-white/[0.02] p-4 text-center">
            <span className="font-mono text-xs text-agent">{i + 1}</span>
            <p className="mt-1 text-sm font-semibold">{phase}</p>
            <p className="mt-1 text-[10px] text-fg-muted">
              {i === 0 ? "MCQ inputs" : i === 1 ? "Analysis / change" : "Checklist"}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Card key={s.title} className="card-glow">
            <CardHeader><CardTitle className="text-sm">{s.title}</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {s.items.map((item) => (
                  <li key={item} className="text-sm text-fg-muted leading-relaxed">· {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card className="card-glow">
          <CardHeader><CardTitle className="text-sm">Approach</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-fg-muted leading-relaxed">{agent.approach}</p>
            {agent.sampleResult && (
              <p className="mt-3 rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent-2">
                Sample: {agent.sampleResult}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader><CardTitle className="text-sm">Workflow diagram</CardTitle></CardHeader>
          <CardContent><AgentWorkflowDiagram /></CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-sm">Repository paths</CardTitle></CardHeader>
        <CardContent>
          <pre className="rounded-lg bg-black/40 p-4 font-mono text-xs text-fg-muted overflow-x-auto">
{`Agent:  ${agent.repoPath}/
Skill:  ${agent.skillPath}
Report: ${agent.repoPath}/${agent.reportPath}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
