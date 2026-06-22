# Task Extra

Optional assets that sit outside the core **agents** and **projects** libraries:

| Path | Role |
|------|------|
| [`medusa/`](medusa/) | Vendored Medusa v2 commerce monorepo — default target for agent analysis exercises |
| [`frontend/`](frontend/) | Next.js showcase site — browse agents, projects, architecture, docs, stats, and download agent bundles |

---

## Medusa (`extra/medusa/`)

Full TypeScript monorepo used in agent proof reports:

- **463** HTTP routes, **139** DB tables, **1000+** test files
- Yarn 3 workspaces, Turbo, Jest, MikroORM

```bash
cd Task/extra/medusa
corepack enable
yarn install
yarn test
```

Upstream docs: [medusa/README.md](medusa/README.md)

---

## Showcase frontend (`extra/frontend/`)

Dark-mode catalog browser for the Task repository — not an agent deliverable template.

```bash
cd Task/extra/frontend
npm install
npm run dev
```

Pages: Home, Agents, Projects, Architecture, Documentation, Stats. Agent ZIP/MD/JSON/SKILL downloads are served from `/api/agents/*/bundle`.

See [frontend/README.md](frontend/README.md) for details.

---

## Related paths

| Path | Purpose |
|------|---------|
| [`../agents/`](../agents/README.md) | Cursor agent definitions |
| [`../projects/`](../projects/README.md) | Runnable project sandboxes |
| [`../agents/frontend/`](../agents/frontend/README.md) | Shared Next.js template copied per-agent for website output (DO NOT EDIT) |
