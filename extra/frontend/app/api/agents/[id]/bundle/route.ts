import { NextResponse } from "next/server";
import { buildAgentBundle } from "@/lib/agent-bundle";
import { getAgent } from "@/lib/data/agents";

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const buffer = await buildAgentBundle(agent.id);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${agent.id}-${agent.internalName}-bundle.zip"`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Bundle failed" },
      { status: 500 },
    );
  }
}
