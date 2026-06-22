"use client";

import { ArrowRight } from "lucide-react";
import { pipelineSteps } from "@/lib/data/diagrams";

export function PipelineStrip() {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-stretch gap-2">
        {pipelineSteps.map((item, i) => (
          <div key={item.step} className="flex items-center gap-2">
            <div className="w-44 rounded-xl border border-accent/25 bg-gradient-to-b from-accent/10 to-transparent p-4">
              <span className="font-mono text-xs text-accent-2">Phase {item.step}</span>
              <p className="mt-1 text-sm font-semibold text-fg">{item.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-fg-muted">{item.desc}</p>
            </div>
            {i < pipelineSteps.length - 1 && (
              <ArrowRight size={16} className="shrink-0 text-fg-muted" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EvalTierGrid() {
  const tiers = [
    {
      name: "Basics",
      color: "border-slate-500/40 bg-slate-500/10",
      agents: ["B1", "B2", "B3"],
      projects: ["B4", "B5", "B6"],
    },
    {
      name: "Intermediate",
      color: "border-emerald-500/40 bg-emerald-500/10",
      agents: ["I1", "I2", "I3", "I6"],
      projects: ["I4", "I5"],
    },
    {
      name: "Advanced",
      color: "border-orange-500/40 bg-orange-500/10",
      agents: ["A4", "A5", "A6"],
      projects: ["A1", "A2", "A3"],
    },
    {
      name: "Infra",
      color: "border-violet-500/40 bg-violet-500/10",
      agents: [] as string[],
      projects: ["D1", "D2", "D3", "D4", "D5", "D6"],
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiers.map((tier) => (
        <div key={tier.name} className={`rounded-xl border p-4 ${tier.color}`}>
          <h3 className="text-sm font-semibold">{tier.name}</h3>
          {tier.agents.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] uppercase tracking-wide text-agent">Agents</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {tier.agents.map((id) => (
                  <span key={id} className="rounded bg-agent/20 px-1.5 py-0.5 font-mono text-[10px] text-agent">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-wide text-project">Projects</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {tier.projects.map((id) => (
                <span key={id} className="rounded bg-project/20 px-1.5 py-0.5 font-mono text-[10px] text-project">
                  {id}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
