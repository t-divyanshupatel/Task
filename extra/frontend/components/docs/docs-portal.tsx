"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { docSections } from "@/lib/data/docs";
import { cn } from "@/lib/utils";

export function DocsPortal() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(docSections[0].id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docSections;
    return docSections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.content.some((c) => c.toLowerCase().includes(q)) ||
        s.subsections?.some(
          (sub) =>
            sub.title.toLowerCase().includes(q) ||
            sub.content.some((c) => c.toLowerCase().includes(q)),
        ),
    );
  }, [query]);

  const current = docSections.find((s) => s.id === active) ?? docSections[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold">Documentation</h1>
        <p className="mt-3 text-fg-muted">
          Searchable portal for getting started, agent development, running projects, and technical deep dives.
        </p>
      </div>

      <div className="relative mt-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
        <Input
          placeholder="Search documentation…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="space-y-1">
          {(query ? filtered : docSections).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                active === s.id ? "bg-accent/15 text-accent-2" : "text-fg-muted hover:bg-white/5 hover:text-fg",
              )}
            >
              {s.title}
            </button>
          ))}
        </nav>

        <Card>
          <CardHeader>
            <CardTitle>{current.title}</CardTitle>
          </CardHeader>
          <CardContent className="prose-doc">
            {current.content.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
            {current.subsections?.map((sub) => (
              <div key={sub.title}>
                <h3>{sub.title}</h3>
                <ul>
                  {sub.content.map((c) => (
                    <li key={c.slice(0, 40)}>{c}</li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/agents" className="text-sm text-accent-2 hover:text-accent">Browse agents →</Link>
              <Link href="/projects" className="text-sm text-project hover:text-accent-2">Browse projects →</Link>
              <a href="https://github.com/t-divyanshupatel/Task" target="_blank" rel="noopener noreferrer" className="text-sm text-fg-muted hover:text-fg">GitHub repository →</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
