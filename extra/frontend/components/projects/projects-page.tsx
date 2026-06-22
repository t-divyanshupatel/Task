"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Badge, IdBadge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { projects } from "@/lib/data/projects";

export function ProjectsPageContent() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="mt-3 text-fg-muted">
          14 self-contained sandboxes — APIs, CLIs, polyglot pipelines, and infra stacks
          with tests, READMEs, and proof/ artifacts.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="h-full overflow-hidden hover:border-project/30 transition-colors">
              {project.screenshots?.[0] && (
                <div className="relative h-40 border-b border-border bg-black/40">
                  <Image
                    src={project.screenshots[0].src}
                    alt={project.screenshots[0].alt}
                    fill
                    className="object-cover object-top opacity-90"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <IdBadge id={project.id} kind="project" />
                  <Badge variant={project.tier}>{project.tier}</Badge>
                  <Badge variant="outline">{project.complexity}</Badge>
                </div>
                <CardTitle className="mt-2">{project.name}</CardTitle>
                <CardDescription>{project.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase text-fg-muted mb-1">Stack</h3>
                  <div className="flex flex-wrap gap-1">
                    {project.stack.map((s) => (
                      <span key={s} className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase text-fg-muted mb-1">Goals</h3>
                  <ul className="space-y-0.5">{project.goals.slice(0, 2).map((g) => <li key={g} className="text-xs text-fg-muted">· {g}</li>)}</ul>
                </div>
                <p className="font-mono text-xs text-accent-2">{project.tests}</p>
                <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-1 text-sm text-project hover:text-accent-2">
                  View project <ArrowRight size={14} />
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
