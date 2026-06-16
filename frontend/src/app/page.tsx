import { AgentsExplorer } from "@/components/AgentsExplorer";
import { loadAllAgents } from "@/lib/load-agents";

export default function Home() {
  const agents = loadAllAgents();

  return <AgentsExplorer agents={agents} />;
}
