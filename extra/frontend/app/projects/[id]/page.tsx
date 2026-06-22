import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge, IdBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProject } from "@/lib/data/projects";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const { projects } = await import("@/lib/data/projects");
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const project = getProject(id);
  return { title: project ? `${project.id} — ${project.name}` : "Project" };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const blocks = [
    { title: "Goals", items: project.goals },
    { title: "Features", items: project.features },
    { title: "Challenges solved", items: project.challenges },
    { title: "Results", items: project.results },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-project">
        <ArrowLeft size={14} /> All projects
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <IdBadge id={project.id} kind="project" />
          <Badge variant={project.tier}>{project.tier}</Badge>
          <Badge variant="outline">{project.tests}</Badge>
        </div>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="mt-3 text-fg-muted max-w-3xl">{project.summary}</p>
      </header>

      {project.screenshots && project.screenshots.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {project.screenshots.map((shot) => (
            <Card key={shot.src} className="overflow-hidden">
              <div className="relative aspect-video bg-black/50">
                <Image src={shot.src} alt={shot.alt} fill className="object-contain" />
              </div>
              {shot.caption && (
                <CardContent className="pt-3 pb-4">
                  <p className="text-xs text-fg-muted">{shot.caption}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {blocks.map((b) => (
          <Card key={b.title}>
            <CardHeader><CardTitle className="text-sm">{b.title}</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-1">{b.items.map((item) => <li key={item} className="text-sm text-fg-muted">· {item}</li>)}</ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Architecture</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-fg-muted">{project.architecture}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Agent involvement</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-fg-muted">{project.agentInvolvement}</p></CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-sm">Folder structure</CardTitle></CardHeader>
        <CardContent>
          <ul className="font-mono text-xs text-fg-muted space-y-1">
            {project.folderStructure.map((f) => <li key={f}>├── {f}</li>)}
          </ul>
        </CardContent>
      </Card>

      {project.endpoints && (
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-sm">Endpoints</CardTitle></CardHeader>
          <CardContent>
            <ul className="font-mono text-xs text-accent-2 space-y-1">
              {project.endpoints.map((e) => <li key={e}>{e}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-sm">Quick start</CardTitle></CardHeader>
        <CardContent>
          <pre className="rounded-lg bg-black/40 p-4 font-mono text-xs text-fg-muted overflow-x-auto">
            {project.quickStart.join("\n")}
          </pre>
        </CardContent>
      </Card>

      {project.lessonsLearned && (
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-sm">Lessons learned</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1">{project.lessonsLearned.map((l) => <li key={l} className="text-sm text-fg-muted">· {l}</li>)}</ul>
          </CardContent>
        </Card>
      )}

      {project.relationships && (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.relationships.map((rel) => (
            <Link key={rel.id} href={`/projects/${rel.id}`} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm hover:border-project/40">
              {project.id} → {rel.id} <ArrowRight size={12} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
