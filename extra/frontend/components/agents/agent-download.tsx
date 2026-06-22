"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  FileJson,
  FileText,
  Loader2,
  Package,
  Terminal,
} from "lucide-react";
import type { Agent } from "@/lib/types";
import {
  agentToJson,
  agentToMarkdown,
  agentToSkillMarkdown,
  downloadAgentBundle,
  downloadBlob,
} from "@/lib/agent-export";
import { cn } from "@/lib/utils";

type Props = {
  agent: Agent;
  variant?: "default" | "compact";
  className?: string;
};

export function AgentDownloadMenu({ agent, variant = "default", className }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const run = async (key: string, fn: () => void | Promise<void>) => {
    setLoading(key);
    try {
      await fn();
    } finally {
      setLoading(null);
      setOpen(false);
    }
  };

  const copyCommand = async () => {
    await navigator.clipboard.writeText(agent.exampleUsage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const items = [
    {
      key: "zip",
      label: "Full agent bundle (.zip)",
      desc: "agent.md, planning, execute, verify, skill, proof",
      icon: Package,
      action: () => downloadAgentBundle(agent.id),
    },
    {
      key: "md",
      label: "Agent spec (.md)",
      desc: "Markdown specification",
      icon: FileText,
      action: () => downloadBlob(agentToMarkdown(agent), `${agent.id}-spec.md`, "text/markdown"),
    },
    {
      key: "json",
      label: "Agent spec (.json)",
      desc: "Structured JSON export",
      icon: FileJson,
      action: () => downloadBlob(agentToJson(agent), `${agent.id}-spec.json`, "application/json"),
    },
    {
      key: "skill",
      label: "Cursor skill (SKILL.md)",
      desc: "Ready for .cursor/skills/",
      icon: Terminal,
      action: () => downloadBlob(agentToSkillMarkdown(agent), `SKILL.md`, "text/markdown"),
    },
  ];

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap gap-1.5", className)}>
        <button
          type="button"
          onClick={() => run("zip", () => downloadAgentBundle(agent.id))}
          disabled={!!loading}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-agent/30 bg-agent/10 px-2.5 text-xs font-medium text-agent hover:bg-agent/20"
        >
          {loading === "zip" ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          ZIP
        </button>
        <button
          type="button"
          onClick={() => run("md", () => downloadBlob(agentToMarkdown(agent), `${agent.id}-spec.md`, "text/markdown"))}
          disabled={!!loading}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs text-fg-muted hover:bg-white/5"
        >
          MD
        </button>
        <button
          type="button"
          onClick={copyCommand}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs text-fg-muted hover:bg-white/5"
        >
          {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    );
  }

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => run("zip", () => downloadAgentBundle(agent.id))}
          disabled={!!loading}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-agent px-4 text-sm font-medium text-white shadow-lg shadow-agent/20 hover:bg-agent/90 disabled:opacity-60"
        >
          {loading === "zip" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Download agent
        </button>
        <button
          type="button"
          onClick={copyCommand}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white/5 px-4 text-sm hover:bg-white/10"
        >
          {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy command"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white/5 px-3 text-sm hover:bg-white/10"
        >
          More formats
          <ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-2xl shadow-black/40">
          {items.map(({ key, label, desc, icon: Icon, action }) => (
            <button
              key={key}
              type="button"
              onClick={() => run(key, action)}
              disabled={!!loading}
              className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-white/5"
            >
              {loading === key ? (
                <Loader2 size={16} className="mt-0.5 shrink-0 animate-spin text-agent" />
              ) : (
                <Icon size={16} className="mt-0.5 shrink-0 text-agent" />
              )}
              <div>
                <p className="text-sm font-medium text-fg">{label}</p>
                <p className="text-xs text-fg-muted">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DownloadAllAgentsButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const { downloadAllAgentsBundle } = await import("@/lib/agent-export");
          await downloadAllAgentsBundle();
        } finally {
          setLoading(false);
        }
      }}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-lg border border-agent/40 bg-agent/10 px-4 text-sm font-medium text-agent hover:bg-agent/20 disabled:opacity-60",
        className,
      )}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
      Download all agents
    </button>
  );
}
