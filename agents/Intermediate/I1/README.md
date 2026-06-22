# I1 — Repo ER Diagram

**Agent name:** `repo-er-diagram`  
**Tier:** Intermediate (read-only)  
**Entry point:** [`agent/agent.md`](./agent/agent.md)

---

## Purpose

Builds an **entity-relationship map** of every database table and persistent entity in a repository:

- Table/entity list with columns
- Primary keys and foreign keys
- Inferred relationships (with confidence)
- **Mermaid ER diagram**
- Source file citation for every claim

Detects JPA `@Entity`, MikroORM/DML models, Prisma schema, Flyway/Liquibase migrations, TypeORM entities, SQL DDL, and ORM model definitions.

---

## When to use

- Understand data model before feature work
- Document schema for new team members
- Migration planning or denormalization review
- Compare code entities vs actual DB tables

**Example invocation:**

```
/intermediate-repo-er-diagram on Task/extra/medusa — markdown output
```

---

## How to run in Cursor

```
/intermediate-repo-er-diagram

Analyze Task/extra/medusa. Output format: markdown.
```

### Phase 1 — Planning ([`agent/planning.md`](./agent/planning.md))

| Question | Options |
|----------|---------|
| Repository path | Workspace **or** custom |
| Output format | **Markdown** or **Website** |

Optional: `scope` (monorepo package), `includeLogicalEntities`.

### Phase 2 — Execute ([`agent/execute.md`](./agent/execute.md))

1. Scan migrations, ORM models, schema files
2. Extract tables, columns, PKs, FKs
3. Infer relationships from joins, `@ManyToOne`, link modules
4. Render Mermaid `erDiagram`
5. Write deliverable

### Phase 3 — Verify ([`agent/verify.md`](./agent/verify.md))

Valid Mermaid syntax; every entity has source path; ambiguities listed.

---

## Outputs

| Format | Path |
|--------|------|
| **Markdown** | `Task/agents/Intermediate/I1/proof/er-diagram-report.md` |
| **Website** | `Task/agents/Intermediate/I1/agent/er-diagram-site/` → http://localhost:3000 |

### Markdown report includes

- Metadata (table count, relationship count)
- Entity/table catalog with PK/FK columns
- Relationship table (explicit vs inferred)
- Full Mermaid ER diagram
- Discovery notes (generated code, multi-DB, link tables)

---

## Detection sources

| Source | Location examples |
|--------|-------------------|
| DML / MikroORM | `model.define()` in Medusa modules |
| JPA | `@Entity`, `@Table`, `@JoinColumn` |
| Prisma | `schema.prisma` |
| Migrations | `V*.sql`, Liquibase changesets |
| TypeORM | `*.entity.ts` |

---

## Constraints

- **Read-only** on target repo
- Deliverables in agent/proof paths — not inside analyzed repo
- Mark inferred relationships with confidence level
- **Do not edit** `Task/agents/frontend/`

---

## Cursor skill

| Slash command | Skill file |
|---------------|------------|
| `/intermediate-repo-er-diagram` | `.cursor/skills/intermediate-repo-er-diagram/SKILL.md` |

---

## File layout

```
Intermediate/I1/
├── README.md
├── agent/
│   ├── agent.md
│   ├── planning.md
│   ├── execute.md
│   └── verify.md
└── proof/
    └── er-diagram-report.md
```
