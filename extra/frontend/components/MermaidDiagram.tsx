"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { mermaidConfig } from "@/lib/data/diagrams";

let mermaidReady = false;

async function getMermaid() {
  const mermaid = (await import("mermaid")).default;
  if (!mermaidReady) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      ...mermaidConfig,
    });
    mermaidReady = true;
  }
  return mermaid;
}

function nextRenderId() {
  return `mmd-${Math.random().toString(36).slice(2, 11)}`;
}

export function MermaidDiagram({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const attempt = useRef(0);

  const render = async () => {
    setLoading(true);
    setError(null);
    attempt.current += 1;
    const current = attempt.current;

    try {
      const mermaid = await getMermaid();
      const id = nextRenderId();
      const { svg: rendered } = await mermaid.render(id, chart.trim());
      if (current === attempt.current) {
        setSvg(rendered);
        setError(null);
      }
    } catch (e) {
      if (current === attempt.current) {
        setSvg(null);
        setError(e instanceof Error ? e.message : "Diagram failed to render");
      }
    } finally {
      if (current === attempt.current) setLoading(false);
    }
  };

  useEffect(() => {
    render();
    return () => {
      attempt.current += 1;
    };
  }, [chart]);

  if (loading) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-border/50 bg-black/20">
        <Loader2 className="animate-spin text-accent-2" size={22} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-rose-300">Diagram render failed</p>
            <p className="mt-1 break-all font-mono text-[11px] text-rose-200/70">{error}</p>
            <button
              type="button"
              onClick={render}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs text-fg hover:bg-white/15"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mermaid-wrap min-h-[120px] overflow-x-auto rounded-lg border border-border/40 bg-black/20 p-3 [&_svg]:mx-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg ?? "" }}
    />
  );
}
