"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bot,
  BookOpen,
  FolderKanban,
  GitBranch,
  Home,
  BarChart3,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const GITHUB = "https://github.com/t-divyanshupatel/Task";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/architecture", label: "Architecture", icon: GitBranch },
  { href: "/docs", label: "Documentation", icon: BookOpen },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white">
            T
          </span>
          <span className="hidden font-semibold sm:inline">Task</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm transition-colors",
                  active ? "bg-white/10 text-fg" : "text-fg-muted hover:text-fg hover:bg-white/5",
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-white/5 px-3 text-xs font-medium text-fg hover:bg-white/10"
          >
            <ExternalLink size={15} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border bg-bg-elevated px-4 py-3 md:hidden"
        >
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-fg-muted hover:bg-white/5 hover:text-fg"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </motion.nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg-elevated">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <p className="text-sm text-fg-muted">
          AI Agent Engineering showcase — 10 agents, 14 projects, 24 eval items
        </p>
        <a
          href={GITHUB}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-accent-2"
        >
          <ExternalLink size={16} />
          t-divyanshupatel/Task
        </a>
      </div>
    </footer>
  );
}
