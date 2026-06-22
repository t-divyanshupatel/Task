"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CircleSlash,
  Grid3X3,
  List,
  Pencil,
  Search,
  Terminal,
} from "lucide-react";
import { Badge, IdBadge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AgentDownloadMenu, DownloadAllAgentsButton } from "@/components/agents/agent-download";
import { AgentSequenceDiagram } from "@/components/agents/agent-diagrams";
import { agents } from "@/lib/data/agents";
import type { Tier } from "@/lib/types";
import { cn } from "@/lib/utils";

const TIERS: (Tier | "all")[] = ["all", "Basics", "Intermediate", "Advanced"];

export function AgentsPageContent() {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<Tier | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agents.filter((a) => {
      if (tier !== "all" && a.tier !== tier) return false;
      if (!q) return true;
      return (
        a.id.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.slashCommand.toLowerCase().includes(q) ||
        a.purpose.toLowerCase().includes(q)
      );
    });
  }, [query, tier]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-agent/20 bg-gradient-to-br from-agent/10 via-bg-elevated to-bg p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-agent/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Badge variant="agent" className="mb-3">10 agents · 3 phases each</Badge>
            <h1 className="text-3xl font-bold sm:text-4xl">Agent Library</h1>
            <p className="mt-3 text-fg-muted">
              Cursor slash-command agents for repository analysis, architecture discovery,
              implementation, review, and performance — download any agent as a ready-to-use bundle.
            </p>
          </div>
          <DownloadAllAgentsButton />
        </div>
      </div>

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
          <Input
            placeholder="Search agents…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={cn(
                "h-8 rounded-lg px-3 text-xs font-medium transition-colors",
                tier === t
                  ? "bg-agent text-white"
                  : "border border-border text-fg-muted hover:bg-white/5",
              )}
            >
              {t === "all" ? `All (${agents.length})` : t}
            </button>
          ))}
          <div className="ml-2 flex rounded-lg border border-border p-0.5">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={cn("rounded-md p-1.5", view === "grid" ? "bg-white/10 text-fg" : "text-fg-muted")}
              aria-label="Grid view"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn("rounded-md p-1.5", view === "list" ? "bg-white/10 text-fg" : "text-fg-muted")}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-fg-muted">{filtered.length} agents</p>

      {/* Grid / List */}
      <AnimatePresence mode="popLayout">
        {view === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((agent, i) => (
              <motion.div
                key={agent.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="card-glow group flex h-full flex-col overflow-hidden">
                  <CardHeader className="border-b border-border/50 bg-gradient-to-b from-white/[0.03] to-transparent pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        <IdBadge id={agent.id} kind="agent" />
                        <Badge variant={agent.tier}>{agent.tier}</Badge>
                      </div>
                      <ModIcon modifies={agent.modifiesRepo} />
                    </div>
                    <CardTitle className="mt-3 text-base group-hover:text-agent transition-colors">
                      <Link href={`/agents/${agent.id}`}>{agent.name}</Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">{agent.purpose}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4 pt-4">
                    <code className="block truncate rounded-lg bg-black/30 px-2 py-1.5 font-mono text-[10px] text-accent-2">
                      {agent.slashCommand}
                    </code>
                    <ul className="flex-1 space-y-1">
                      {agent.capabilities.slice(0, 2).map((c) => (
                        <li key={c} className="text-xs text-fg-muted line-clamp-1">· {c}</li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                      <AgentDownloadMenu agent={agent} variant="compact" />
                      <Link
                        href={`/agents/${agent.id}`}
                        className="inline-flex items-center gap-1 text-xs text-accent-2 hover:text-accent"
                      >
                        Details <ArrowRight size={12} />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-4">
            {filtered.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="card-glow overflow-hidden">
                  <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <IdBadge id={agent.id} kind="agent" />
                        <Badge variant={agent.tier}>{agent.tier}</Badge>
                        <ModIcon modifies={agent.modifiesRepo} />
                      </div>
                      <h2 className="mt-2 text-lg font-semibold">
                        <Link href={`/agents/${agent.id}`} className="hover:text-agent">{agent.name}</Link>
                      </h2>
                      <p className="mt-1 text-sm text-fg-muted line-clamp-2">{agent.purpose}</p>
                      <div className="mt-2 flex items-center gap-2 font-mono text-xs text-accent-2">
                        <Terminal size={12} />
                        {agent.slashCommand}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                      <AgentDownloadMenu agent={agent} variant="compact" />
                      <Link href={`/agents/${agent.id}`} className="text-xs text-fg-muted hover:text-accent-2">
                        View full spec →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 && (
        <Card className="mt-8 border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-fg-muted">No agents match your search.</p>
            <button
              type="button"
              onClick={() => { setQuery(""); setTier("all"); }}
              className="mt-3 text-sm text-agent hover:underline"
            >
              Clear filters
            </button>
          </CardContent>
        </Card>
      )}

      <Card className="mt-12">
        <CardHeader><CardTitle>Agent workflow sequence</CardTitle></CardHeader>
        <CardContent><AgentSequenceDiagram /></CardContent>
      </Card>
    </div>
  );
}

function ModIcon({ modifies }: { modifies: boolean | "partial" }) {
  if (modifies === true) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-accent-3">
        <Pencil size={11} /> Modifies
      </span>
    );
  }
  if (modifies === "partial") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-fg-muted">
        <Pencil size={11} /> Install
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-fg-muted">
      <CircleSlash size={11} /> Read-only
    </span>
  );
}
