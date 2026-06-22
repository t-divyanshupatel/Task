"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { repoStats, tierBreakdown } from "@/lib/data/stats";
import { agents } from "@/lib/data/agents";
import { projects } from "@/lib/data/projects";

const StatsCharts = dynamic(
  () => import("@/components/charts/stats-charts").then((m) => m.StatsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 lg:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-white/5" />
        ))}
      </div>
    ),
  },
);

export function StatsPageContent() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold">Repository Stats</h1>
        <p className="mt-3 text-fg-muted">
          Metrics dashboard generated from repository analysis — agents, projects,
          languages, frameworks, and tier coverage.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {[
          { label: "Agents", value: repoStats.totalAgents },
          { label: "Projects", value: repoStats.totalProjects },
          { label: "Eval items", value: repoStats.evalItems },
          { label: "Skills", value: repoStats.cursorSkills },
          { label: "Read-only agents", value: repoStats.readOnlyAgents },
          { label: "Change-capable", value: repoStats.changeCapableAgents },
        ].map((m) => (
          <Card key={m.label} className="text-center">
            <CardContent className="pt-5">
              <p className="font-mono text-2xl font-bold gradient-text">{m.value}</p>
              <p className="mt-1 text-xs text-fg-muted">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <StatsCharts />
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Tier breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tierBreakdown.map((t) => (
                <div key={t.tier} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={t.tier as "Basics"}>{t.tier}</Badge>
                    <span className="font-mono text-xs text-fg-muted">{t.agents} agents · {t.projects} projects</span>
                  </div>
                  <p className="mt-2 text-xs text-fg-muted">{t.focus}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Frameworks & tools</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {repoStats.frameworks.map((f) => (
                <Badge key={f} variant="outline">{f}</Badge>
              ))}
            </div>
            <p className="mt-4 text-sm text-fg-muted">{repoStats.totalTests}</p>
            <p className="mt-2 text-sm text-fg-muted">{repoStats.documentationReadmes} README files · {repoStats.proofArtifacts}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>All agents ({agents.length})</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1 font-mono text-xs text-fg-muted">
              {agents.map((a) => <li key={a.id}>{a.id} — {a.name}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>All projects ({projects.length})</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1 font-mono text-xs text-fg-muted">
              {projects.map((p) => <li key={p.id}>{p.id} — {p.name}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
