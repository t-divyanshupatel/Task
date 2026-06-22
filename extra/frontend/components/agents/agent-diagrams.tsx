"use client";

import dynamic from "next/dynamic";
import { diagrams } from "@/lib/data/diagrams";

const MermaidDiagram = dynamic(
  () => import("@/components/MermaidDiagram").then((m) => m.MermaidDiagram),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-lg bg-white/5" /> },
);

export function AgentWorkflowDiagram() {
  return <MermaidDiagram chart={diagrams.threePhase} />;
}

export function AgentSequenceDiagram() {
  return <MermaidDiagram chart={diagrams.workflow} />;
}
