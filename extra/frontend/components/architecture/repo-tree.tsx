"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { repoTree } from "@/lib/data/diagrams";

type Node = {
  name: string;
  description: string;
  children?: Node[];
};

function TreeNode({ node, depth = 0 }: { node: Node; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <button
        type="button"
        onClick={() => hasChildren && setOpen(!open)}
        className="flex w-full items-start gap-2 rounded-lg py-2 text-left hover:bg-white/5"
      >
        {hasChildren ? (
          open ? <ChevronDown size={14} className="mt-0.5 shrink-0 text-fg-muted" /> : <ChevronRight size={14} className="mt-0.5 shrink-0 text-fg-muted" />
        ) : (
          <span className="w-3.5" />
        )}
        {hasChildren ? (
          open ? <FolderOpen size={14} className="mt-0.5 shrink-0 text-accent-2" /> : <Folder size={14} className="mt-0.5 shrink-0 text-accent" />
        ) : (
          <span className="mt-0.5 h-3.5 w-3.5 rounded-sm bg-white/10" />
        )}
        <div>
          <span className="font-mono text-sm text-fg">{node.name}</span>
          <p className="text-xs text-fg-muted mt-0.5">{node.description}</p>
        </div>
      </button>
      {open && hasChildren && node.children!.map((child) => (
        <TreeNode key={child.name} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function RepoTree() {
  return (
    <Card>
      <CardContent className="pt-5">
        {repoTree.map((node) => (
          <TreeNode key={node.name} node={node} />
        ))}
      </CardContent>
    </Card>
  );
}
