"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Download, ExternalLink, FolderKanban, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentDownloadMenu, DownloadAllAgentsButton } from "@/components/agents/agent-download";
import { featuredAgents } from "@/lib/data/agents";
import { featuredProjects } from "@/lib/data/projects";
import { PipelineStrip, EvalTierGrid } from "@/components/architecture/pipeline-strip";
import { repoStats } from "@/lib/data/stats";

const GITHUB = "https://github.com/t-divyanshupatel/Task";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border mesh-bg">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <Badge className="mb-4 border-accent/30 bg-accent/10 text-accent-2">
            <Sparkles size={12} className="mr-1" />
            24 eval items · Plan → Execute → Verify
          </Badge>
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl sm:leading-[1.1]">
            AI Agents for{" "}
            <span className="gradient-text">Real Software Engineering</span>{" "}
            Workflows
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
            A collection of specialized Cursor coding agents for repository analysis,
            architecture discovery, test discovery, focused implementation, PR review,
            and performance optimization — paired with 14 runnable project sandboxes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/agents" className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-6 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500">
              <Bot size={18} />
              Explore Agents
            </Link>
            <Link href="/projects" className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-white/5 px-6 text-sm font-medium hover:bg-white/10">
              <FolderKanban size={18} />
              View Projects
            </Link>
            <DownloadAllAgentsButton className="h-11 border-accent/30 bg-accent/10 text-accent-2 hover:bg-accent/20" />
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-lg px-6 text-sm font-medium text-fg-muted hover:text-fg hover:bg-white/5">
              <ExternalLink size={18} />
              View Repository
            </a>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-fg-muted">
            <Download size={12} className="text-agent" />
            Every agent ships as ZIP, Markdown, JSON, or Cursor SKILL.md — ready to install
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function OverviewSection() {
  const items = [
    { title: "Agent-driven architecture", desc: "10 Cursor slash-command agents with dedicated skills, 3-phase workflows, and proof/ deliverables." },
    { title: "Engineering workflows", desc: "Repository structure mapping, route/API discovery, ER diagrams, E2E tracing, bug diagnosis, modernization, PR review, perf optimization." },
    { title: "Runnable sandboxes", desc: "14 self-contained projects: FastAPI/Node/Rust APIs, polyglot pipelines, Terraform, Docker Compose, CI, Kubernetes, observability." },
    { title: "Evidence-based delivery", desc: "Every agent cites path:line and command output. Projects ship tests, screenshots, and captured logs in proof/." },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h2 className="text-xl font-semibold sm:text-2xl">Repository overview</h2>
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">
        Task answers: <em>What can you do using a coding agent?</em> across structured
        eval items from repo discovery to infra engineering.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="h-full hover:border-accent/30 transition-colors">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function FeaturedAgentsSection() {
  const featured = featuredAgents().slice(0, 6);
  return (
    <section className="border-t border-border bg-bg-elevated/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Featured agents</h2>
            <p className="mt-1 text-sm text-fg-muted">Specialized agents for real repository engineering tasks</p>
          </div>
          <Link href="/agents" className="hidden items-center gap-1 text-sm text-accent-2 hover:text-accent sm:flex">
            All agents <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="card-glow group flex h-full flex-col transition-all hover:border-agent/40 hover:shadow-lg hover:shadow-agent/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="agent">{agent.id}</Badge>
                    <Badge variant={agent.tier}>{agent.tier}</Badge>
                  </div>
                  <CardTitle className="group-hover:text-agent transition-colors">
                    <Link href={`/agents/${agent.id}`}>{agent.name}</Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{agent.purpose}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex flex-col gap-3">
                  <code className="truncate text-[11px] text-fg-muted">{agent.slashCommand}</code>
                  <ul className="space-y-1">
                    {agent.capabilities.slice(0, 2).map((c) => (
                      <li key={c} className="text-xs text-fg-muted line-clamp-1">· {c}</li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                    <AgentDownloadMenu agent={agent} variant="compact" />
                    <Link href={`/agents/${agent.id}`} className="text-xs text-accent-2 hover:text-accent">
                      Details →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedProjectsSection() {
  const featured = featuredProjects().slice(0, 6);
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Featured projects</h2>
            <p className="mt-1 text-sm text-fg-muted">Completed implementations with tests and proof artifacts</p>
          </div>
          <Link href="/projects" className="hidden items-center gap-1 text-sm text-accent-2 hover:text-accent sm:flex">
            All projects <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link href={`/projects/${project.id}`}>
                <Card className="group h-full transition-all hover:border-project/40 hover:shadow-lg hover:shadow-project/5">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="project">{project.id}</Badge>
                      <Badge variant={project.tier}>{project.tier}</Badge>
                    </div>
                    <CardTitle className="group-hover:text-project transition-colors">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{project.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {project.stack.slice(0, 4).map((s) => (
                        <span key={s} className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">{s}</span>
                      ))}
                    </div>
                    <p className="mt-2 font-mono text-xs text-accent-2">{project.tests}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WorkflowPreviewSection() {
  return (
    <section className="border-t border-border py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-xl font-semibold sm:text-2xl">How agents work</h2>
        <p className="mt-1 text-sm text-fg-muted">Plan → Execute → Verify on every run</p>
        <div className="mt-8">
          <PipelineStrip />
        </div>
        <div className="mt-10">
          <h3 className="mb-4 text-lg font-semibold">24-item eval framework</h3>
          <EvalTierGrid />
        </div>
      </div>
    </section>
  );
}
export function ImpactMetricsSection() {
  const metrics = [
    { label: "Agents", value: repoStats.totalAgents },
    { label: "Projects", value: repoStats.totalProjects },
    { label: "Eval items", value: repoStats.evalItems },
    { label: "Cursor skills", value: repoStats.cursorSkills },
    { label: "Workflow phases", value: repoStats.workflowPhases },
    { label: "Tiers", value: repoStats.tiers },
  ];

  return (
    <section className="border-t border-border bg-bg-elevated/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Repository impact</h2>
        <p className="mt-1 text-sm text-fg-muted">Metrics generated from repository analysis</p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="text-center">
                <CardContent className="pt-5">
                  <p className="font-mono text-3xl font-bold gradient-text">{m.value}</p>
                  <p className="mt-1 text-xs text-fg-muted">{m.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {repoStats.languages.map((lang) => (
            <Badge key={lang} variant="outline">{lang}</Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
