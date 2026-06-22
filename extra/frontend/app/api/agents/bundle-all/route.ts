import { NextResponse } from "next/server";
import { buildAllAgentsBundle } from "@/lib/agent-bundle";

export async function GET() {
  try {
    const buffer = await buildAllAgentsBundle();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="task-agents-all.zip"',
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Bundle failed" },
      { status: 500 },
    );
  }
}
