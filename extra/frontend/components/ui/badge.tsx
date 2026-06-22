import { cn } from "@/lib/utils";
import type { Tier } from "@/lib/types";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "agent" | "project" | "outline" | Tier;
}) {
  const variants: Record<string, string> = {
    default: "bg-white/10 text-fg-muted border-white/10",
    agent: "bg-agent/15 text-agent border-agent/25",
    project: "bg-project/15 text-project border-project/25",
    outline: "bg-transparent text-fg-muted border-border",
    Basics: "bg-slate-500/15 text-slate-300 border-slate-500/25",
    Intermediate: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    Advanced: "bg-orange-500/15 text-orange-300 border-orange-500/25",
    "Infra & DevOps": "bg-violet-500/15 text-violet-300 border-violet-500/25",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
        variants[variant] ?? variants.default,
        className,
      )}
      {...props}
    />
  );
}

export function IdBadge({
  id,
  kind,
}: {
  id: string;
  kind: "agent" | "project";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-[2rem] items-center justify-center rounded-md px-2 font-mono text-xs font-bold",
        kind === "agent"
          ? "bg-agent/20 text-agent"
          : "bg-project/20 text-project",
      )}
    >
      {id}
    </span>
  );
}
