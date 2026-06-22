# Task Showcase Frontend

Next.js site for browsing the **Task** agent and project libraries — a recruiter-facing AI agent engineering showcase built from repository READMEs.

**Not** the same as [`Task/agents/frontend/`](../../agents/frontend/README.md), which is the shared template agents copy when producing per-agent website deliverables.

---

## Pages

| Route | Content |
|-------|---------|
| `/` | Hero, featured agents/projects, workflow preview, metrics |
| `/agents` | Full agent catalog with search, filters, downloads |
| `/agents/[id]` | Agent detail + download menu (ZIP, MD, JSON, SKILL) |
| `/projects` | Project catalog with stack tags and proof screenshots |
| `/projects/[id]` | Project detail |
| `/architecture` | Pipeline diagrams, eval grid, Mermaid charts, repo tree |
| `/docs` | Searchable documentation portal |
| `/stats` | Repository metrics and charts |

---

## Getting started

```bash
cd Task/extra/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (Next.js picks the next free port if 3000 is taken).

Production build:

```bash
npm run build
npm start
```

---

## Agent downloads

| Endpoint | Description |
|----------|-------------|
| `GET /api/agents/{id}/bundle` | Single agent ZIP (agent.md, phases, README, SKILL, proof) |
| `GET /api/agents/bundle-all` | All 10 agents in one ZIP |

Client-side exports (no API): Markdown spec, JSON spec, SKILL.md, copy slash command.

---

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4, Framer Motion
- Recharts, Mermaid, JSZip

Data lives in `lib/data/` — sourced from `Task/agents/` and `Task/projects/` READMEs.
