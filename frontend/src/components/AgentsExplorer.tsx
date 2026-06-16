"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AGENTS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type AgentCategory,
} from "@/lib/agents";
import type { AgentWithContent } from "@/lib/load-agents";
import { MarkdownViewer } from "./MarkdownViewer";

interface AgentsExplorerProps {
  agents: AgentWithContent[];
}

type ContentPanel = "agent" | "demo";

export function AgentsExplorer({ agents }: AgentsExplorerProps) {
  const [selectedId, setSelectedId] = useState(agents[0]?.id ?? "B1");
  const [categoryFilter, setCategoryFilter] = useState<AgentCategory | "all">(
    "all",
  );
  const [contentPanel, setContentPanel] = useState<ContentPanel>("agent");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");

  const selected = useMemo(
    () => agents.find((a) => a.id === selectedId) ?? agents[0],
    [agents, selectedId],
  );

  const filteredAgents = useMemo(
    () =>
      categoryFilter === "all"
        ? agents
        : agents.filter((a) => a.category === categoryFilter),
    [agents, categoryFilter],
  );

  const activeContent = useMemo(() => {
    if (!selected) return { text: "", filename: "" };
    if (contentPanel === "demo") {
      return {
        text: selected.demoContent,
        filename: selected.demoFilename,
      };
    }
    return { text: selected.content, filename: selected.filename };
  }, [selected, contentPanel]);

  const handleCopy = useCallback(async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(activeContent.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard unavailable */
    }
  }, [selected, activeContent.text]);

  const handleDownload = useCallback(() => {
    if (!selected) return;
    const blob = new Blob([activeContent.text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = activeContent.filename;
    link.click();
    URL.revokeObjectURL(url);
  }, [selected, activeContent]);

  const accent = selected
    ? CATEGORY_COLORS[selected.category].accent
    : "#c084fc";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#07070f] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full blur-[120px] transition-colors duration-700"
          style={{ backgroundColor: `${accent}18` }}
        />
        <div className="absolute -bottom-40 -right-20 h-[480px] w-[480px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-sky-500/5 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <header className="relative z-10 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-lg"
              style={{ boxShadow: `0 0 24px ${accent}33` }}
            >
              <svg
                className="h-5 w-5"
                style={{ color: accent }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                Agent Library
              </h1>
              <p className="text-sm text-zinc-500">
                Browse agents, copy definitions & view sample outputs
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 border-t border-white/[0.04] pt-1">
            <button
              type="button"
              aria-current="page"
              className="relative px-4 py-3 text-sm font-medium text-white transition"
            >
              Agents
              <span
                className="absolute inset-x-2 bottom-0 h-0.5 rounded-full"
                style={{ backgroundColor: accent }}
              />
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8 lg:py-8">
        <aside className="lg:w-72 lg:shrink-0">
          <div className="sticky top-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Filter
            </p>
            <div className="mb-5 flex flex-wrap gap-2">
              {(["all", "basics", "intermediate", "advanced"] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      categoryFilter === cat
                        ? "bg-white/10 text-white ring-1 ring-white/20"
                        : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                    }`}
                  >
                    {cat === "all" ? "All" : CATEGORY_LABELS[cat]}
                  </button>
                ),
              )}
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Select Agent
            </p>
            <nav className="flex flex-col gap-1.5">
              {filteredAgents.map((agent) => {
                const colors = CATEGORY_COLORS[agent.category];
                const isActive = agent.id === selectedId;
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => setSelectedId(agent.id)}
                    className={`group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                      isActive
                        ? "bg-white/[0.08] ring-1 ring-white/15"
                        : "hover:bg-white/[0.04]"
                    }`}
                    style={
                      isActive
                        ? { boxShadow: `0 0 20px ${colors.glow}` }
                        : undefined
                    }
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${colors.badge}`}
                    >
                      {agent.id}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-white">
                        {agent.title}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-zinc-500">
                        {agent.slug}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {selected && (
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
              <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-lg border px-2.5 py-0.5 text-xs font-bold ${CATEGORY_COLORS[selected.category].badge}`}
                      >
                        {selected.id}
                      </span>
                      <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-zinc-400">
                        {CATEGORY_LABELS[selected.category]}
                      </span>
                      {contentPanel === "demo" && (
                        <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                          Demo Output
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      {selected.title}
                    </h2>
                    <p className="mt-1.5 text-sm text-zinc-400">
                      {contentPanel === "agent"
                        ? selected.shortDescription
                        : "Sample report produced when this agent runs on a repository."}
                    </p>
                    <p className="mt-2 font-mono text-xs text-zinc-600">
                      {activeContent.filename}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <div className="flex rounded-xl border border-white/10 bg-black/30 p-1">
                      <button
                        type="button"
                        onClick={() => setViewMode("preview")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          viewMode === "preview"
                            ? "bg-white/10 text-white"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("raw")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          viewMode === "raw"
                            ? "bg-white/10 text-white"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        Raw
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="group relative flex items-center gap-2 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                        boxShadow: `0 4px 24px ${accent}44`,
                      }}
                    >
                      {copied ? (
                        <>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m4.5 12.75 6 6 9-13.5"
                            />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 1.927-.184"
                            />
                          </svg>
                          Copy .md
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex rounded-xl border border-white/10 bg-black/30 p-1">
                  <button
                    type="button"
                    onClick={() => setContentPanel("agent")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      contentPanel === "agent"
                        ? "bg-white/10 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                      />
                    </svg>
                    Agent Definition
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentPanel("demo")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      contentPanel === "demo"
                        ? "text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                    style={
                      contentPanel === "demo"
                        ? {
                            background: `linear-gradient(135deg, ${accent}33, ${accent}11)`,
                            boxShadow: `inset 0 0 0 1px ${accent}44`,
                          }
                        : undefined
                    }
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
                      />
                    </svg>
                    Demo Output
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6 lg:max-h-[calc(100vh-340px)]">
                {contentPanel === "demo" && (
                  <div
                    className="mb-6 flex items-start gap-3 rounded-xl border px-4 py-3"
                    style={{
                      borderColor: `${accent}33`,
                      background: `linear-gradient(135deg, ${accent}11, transparent)`,
                    }}
                  >
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0"
                      style={{ color: accent }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.378a8.981 8.981 0 0 1-3.75-.773V15a2.25 2.25 0 0 1 2.25-2.25h.75a8.981 8.981 0 0 0 1.5-.189M12 12.75V6m0 0L9.75 8.25M12 6l2.25 2.25"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Sample output from {selected.id}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        This is the report generated when the agent runs — use it
                        to preview expected results.
                      </p>
                    </div>
                  </div>
                )}

                {viewMode === "preview" ? (
                  <MarkdownViewer content={activeContent.text} />
                ) : (
                  <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-5 font-mono text-sm leading-7 whitespace-pre-wrap text-emerald-200/80">
                    {activeContent.text}
                  </pre>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="relative z-10 mt-auto border-t border-white/[0.06] bg-black/20 py-8 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex flex-col items-center gap-2">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p
              className="font-signature text-2xl tracking-wide text-zinc-400 sm:text-3xl"
              style={{ fontFamily: "var(--font-signature), cursive" }}
            >
              Made by Divyanshu Patel
            </p>
            <p className="text-xs text-zinc-600">
              {agents.length} agents ·{" "}
              {AGENTS.filter((a) => a.category === "basics").length} basics ·{" "}
              {AGENTS.filter((a) => a.category === "intermediate").length}{" "}
              intermediate ·{" "}
              {AGENTS.filter((a) => a.category === "advanced").length} advanced
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
