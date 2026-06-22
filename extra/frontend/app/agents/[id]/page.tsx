import { notFound } from "next/navigation";
import { AgentDetailView } from "@/components/agents/agent-detail-view";
import { getAgent } from "@/lib/data/agents";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const { agents } = await import("@/lib/data/agents");
  return agents.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const agent = getAgent(id);
  return { title: agent ? `${agent.id} — ${agent.name}` : "Agent" };
}

export default async function AgentDetailPage({ params }: Props) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();
  return <AgentDetailView agent={agent} />;
}
