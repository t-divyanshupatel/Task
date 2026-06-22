# B1 — Repo Structure Mapper

**Agent name:** `repo-structure-mapper`  
**Tier:** Basics (read-only)  
**Entry point:** [`agent/agent.md`](./agent/agent.md)

---

## Purpose

Produces a complete inventory of a repository's major code building blocks across **ten categories**:

| Category | Examples |
|----------|----------|
| Classes | Domain, application, infrastructure classes |
| Interfaces | Contracts, ports, abstract types |
| Services | Business logic, application services, API clients |
| Controllers | HTTP handlers, route entry points |
| Models | Entities, DTOs, schemas |
| Repositories | DAOs, persistence adapters |
| Jobs | Cron, batch, background workers |
| Consumers | Kafka, RabbitMQ, SQS listeners |
| Configs | Bootstrap, `@Configuration`, env loaders |
| Utilities | Helpers, validators, formatters |

Every symbol cites **`path:line`**. Layer relationships (controller → service → repository) are mapped with Mermaid diagrams.

---

## When to use

- Onboarding to a new codebase
- Architecture documentation or audit prep
- Finding where business logic, APIs, and persistence live
- Before refactoring — understand layers first

**Example invocation:**

```
/basics-repo-structure-mapper on Task/extra/medusa — markdown output
```

---

## How to run in Cursor

```
/basics-repo-structure-mapper

Analyze path/to/repo. Output format: markdown.
```

### Phase 1 — Planning ([`agent/planning.md`](./agent/planning.md))

| Question | Options |
|----------|---------|
| Repository path | Workspace root **or** custom path |
| Output format | **Markdown** or **Website** |

Optional: `scope` (monorepo subdirectory), `includeTests` (default false).

### Phase 2 — Execute ([`agent/execute.md`](./agent/execute.md))

1. Repo reconnaissance (stack, monorepo layout, source roots)
2. Symbol discovery by category (glob, grep, annotations)
3. Layer and dependency overview
4. Write deliverable with charts and tables

### Phase 3 — Verify ([`agent/verify.md`](./agent/verify.md))

Checklist: all ten categories, metadata, Mermaid diagrams, count consistency, no placeholders.

---

## Outputs

| Format | Path |
|--------|------|
| **Markdown** | `Task/agents/Basics/B1/proof/repo-structure-map.md` |
| **Website** | `Task/agents/Basics/B1/agent/repo-structure-map-site/` → http://localhost:3000 |

### Markdown report includes

- Metadata (duration, stack, symbol counts)
- Executive summary
- Architecture overview + package tree
- Mermaid layer flowchart + category pie chart
- Ten category tables with `path:line`
- Layer relationships table
- Discovery notes

### Website includes

- Category stat cards, searchable symbol explorer
- Layer diagram, package tree navigation
- Copy-to-clipboard source citations

---

## Constraints

- **Read-only** on target repo — no source edits
- Reports never written inside analyzed repo
- **Do not edit** `Task/agents/frontend/` — copy only
- Large repos: summarize utilities/models when > 75 rows per category

---

## Cursor skill

| Slash command | Skill file |
|---------------|------------|
| `/basics-repo-structure-mapper` | `.cursor/skills/basics-repo-structure-mapper/SKILL.md` |

---

## File layout

```
Basics/B1/
├── README.md
├── agent/
│   ├── agent.md
│   ├── planning.md
│   ├── execute.md
│   └── verify.md
└── proof/
    └── repo-structure-map.md    ← sample output
```

---

## Sample invocation result

> Repo structure map complete. Report: `proof/repo-structure-map.md` — 310 controllers, 111 services, 124 models. Layer: API routes → workflows → module services → DML. Duration: 22m.
