# Phase 2 — Execute

Run after [planning.md](./planning.md) inputs are confirmed. Discover schema, map relationships, and write the deliverable.

You are **read-only on `repoPath`**. Your only writes are in `{agentDir}`.

---

## Input (from planning)

| Field | Required | Description |
|-------|----------|-------------|
| `repoPath` | Yes | Repository root |
| `outputFormat` | Yes | `markdown` or `website` |
| `outputPath` | Yes | `{agentDir}/er-diagram-report.md` or `{agentDir}/er-diagram-site/` |
| `includeLogicalEntities` | No | `false` default — only physical tables / ORM entities |
| `scope` | No | Subdirectory or package limit in monorepos |

---

## Step 1 — Repo reconnaissance

1. Read `README.md`, `package.json`, `pom.xml`, `build.gradle`, `pyproject.toml`, or equivalent.
2. Note monorepo layout — list top-level apps/packages.
3. Record: repo name, language(s), ORM/DB layer, database engine if stated.
4. Identify schema sources: migrations, `init_db.sql`, `schema.prisma`, `@Entity` classes, Mongoose schemas, Alembic, Flyway, Liquibase, etc.

---

## Step 2 — Table & entity discovery

Find **every table and persistent entity**. Use all applicable sources.

### Where to look

| Stack | Primary sources |
|-------|-----------------|
| SQL / migrations | `**/*.sql`, `db/migrations/**`, `flyway/**`, `liquibase/**`, `init_db.sql` |
| Java / Spring | `@Entity`, `@Table`, `@ManyToOne`, `@OneToMany`, `@JoinColumn` |
| Node / JS | `sequelize.define`, `mongoose.model`, knex migrations, `CREATE TABLE` |
| Python | SQLAlchemy `Base`, Alembic, Django `models.Model` |
| Prisma | `schema.prisma` `model` blocks |
| TypeORM | `@Entity()` in `*.entity.ts` |
| Go | struct tags `gorm:`, migration SQL |

### Also check

- Runtime migrations (`ALTER TABLE`, `CREATE TABLE` in app code)
- Query modules revealing table usage (`INSERT INTO`, `FROM table_name`)
- Seed scripts and test fixtures
- Dropped tables — note in Discovery Notes only; exclude from active ER diagram unless still created on fresh install

### Per table/entity capture

| Column | Description |
|--------|-------------|
| Name | Table or entity name |
| Kind | `table` / `entity` / `logical` (if `includeLogicalEntities`) |
| Source file | `path:line` where defined |
| Columns / fields | Name, type, nullable, default |
| Primary key | Column(s) and constraint type |
| Unique constraints | Column(s) |
| Foreign keys | Column → referenced table.column |
| Inferred relationships | Naming + JOIN evidence — mark **inferred** |
| Notes | CHECK, enums, deprecated |

Deduplicate. Count total tables and entities.

---

## Step 3 — Relationship mapping

1. **Explicit FKs** — `FOREIGN KEY`, `@JoinColumn`, Prisma `@relation`, etc.
2. **Inferred FKs** — column naming + JOIN/subquery in query files (naming alone is insufficient)
3. **Cardinality** — from nullability and usage:
   - `||--o{` one-to-many (default for FK on child)
   - `||--||` one-to-one
   - `}o--o{` many-to-many (junction table required)

Every relationship must cite at least one source file.

---

## Step 4 — Write deliverable

Record `endTime` and compute `duration` (e.g. `1m 42s`).

Branch on `outputFormat`:

---

### Format A — Markdown (`outputFormat: markdown`)

Write to `{agentDir}/er-diagram-report.md`.

Use this exact structure:

```markdown
# ER Diagram Report

## Metadata

| Field                    | Value                    |
| ------------------------ | ------------------------ |
| **Agent name**           | repo-er-diagram          |
| **Started at**           | {startTime ISO 8601}     |
| **Completed at**         | {endTime ISO 8601}       |
| **Duration**             | {duration}               |
| **Repository**           | {repoPath}               |
| **Repo name**            | {derived name}           |
| **Stack detected**       | {e.g. Node.js + SQLite3} |
| **Database engine**      | {e.g. SQLite}            |
| **Output format**        | markdown                 |
| **Schema sources found** | {count}                  |
| **Tables found**         | {count}                  |
| **Entities found**       | {count}                  |
| **Relationships found**  | {count}                  |

## Summary

{2–4 sentences: persistence layer, table count, hub entities, relationship shape.}

## Schema Overview

{Optional ASCII diagram of how packages/modules relate to DB.}

## Tables & Entities

| #   | Name  | Kind  | Primary key | FK count | Source        |
| --- | ----- | ----- | ----------- | -------- | ------------- |
| 1   | users | table | id (TEXT)   | 0        | init_db.sql:2 |

### {table_name}

**Source:** `{path:line}`

| Column | Type | Nullable | Default | Constraints | Source        |
| ------ | ---- | -------- | ------- | ----------- | ------------- |
| id     | TEXT | NO       | —       | PRIMARY KEY | init_db.sql:3 |

**Primary key:** `id` — `init_db.sql:3`

**Foreign keys:**

| Column  | References | On delete/update | Source         |
| ------- | ---------- | ---------------- | -------------- |
| user_id | users.id   | —                | init_db.sql:31 |

**Inferred relationships:**

| From              | To       | Basis                            | Source           |
| ----------------- | -------- | -------------------------------- | ---------------- |
| jira_runs.user_id | users.id | column name + JOIN in runs.js:53 | queries/runs.js:53 |

{Repeat per table/entity.}

## Primary Keys Summary

| Table | Primary key column(s) | Type | Source |
| ----- | --------------------- | ---- | ------ |

## Foreign Keys & Relationships Summary

| #   | Parent | Child     | Column(s) | Cardinality | Type        | Source         |
| --- | ------ | --------- | --------- | ----------- | ----------- | -------------- |
| 1   | users  | jira_runs | user_id   | 1:N         | explicit FK | init_db.sql:31 |

## Relationship Matrix

|  | {table_a} | {table_b} | ... |
|--|-----------|-----------|-----|
| **{table_a}** | — | 1:N via fk_col | |
| **{table_b}** | N:1 | — | |

## Mermaid ER Diagram

\`\`\`mermaid
erDiagram
users {
  TEXT id PK
  TEXT name
  TEXT email UK
  DATETIME created_at
}
jira_runs {
  TEXT jira_id PK
  TEXT user_id FK
}
users ||--o{ jira_runs : "owns"
\`\`\`

## Discovery Notes

### Files examined

- `{path}` — {brief note}

### Deprecated / dropped objects

- {e.g. artifacts table dropped on startup — db.js:20}

### Ambiguities & gaps

- {e.g. table defined but no queries found}

### Repos / packages with no persistence layer

- {monorepo packages with no tables}
```

---

### Format B — Website (`outputFormat: website`)

Build at `{agentDir}/er-diagram-site/`.

#### Bootstrap (do not edit template)

```bash
cp -R Task/agents/frontend/. {agentDir}/er-diagram-site/
cd {agentDir}/er-diagram-site
npm install
```

**Never modify files under `Task/agents/frontend/`** — only files inside `er-diagram-site/`.

#### Required site features

1. **Overview page** — metadata (agent, duration, repo, stack, table/relationship counts), summary
2. **Tables explorer** — searchable/sortable list; click for column detail, PK, FK, source citation
3. **Relationships view** — table of all FKs + inferred links with confidence badges
4. **ER diagram** — render Mermaid `erDiagram` (use `mermaid` package or embedded SVG from same source as markdown)
5. **Source citations** — copy-to-clipboard for every `path:line`
6. **Responsive UI** — clean layout, charts/stats cards for counts, dark/light friendly

#### Data layer

Generate `{agentDir}/er-diagram-site/data/er-schema.json` (or typed TS constants) from discovery results. Website must reflect **same completeness** as markdown report.

#### Run locally

```bash
cd {agentDir}/er-diagram-site
npm run dev
```

Open **http://localhost:3000**. Fix build/lint errors until `npm run build` passes.

---

## Execution rules

1. **Repo is the only source** — cite file path (and line when possible) for every claim. Use `unknown` rather than inventing schema.
2. **Active schema only** — dropped/superseded tables go in Discovery Notes, not the ER diagram.
3. **Evidence for inferred relationships** — confirm with JOIN, subquery, or INSERT referencing the column.
4. **Valid Mermaid** — `erDiagram` block must parse. Use `PK`, `FK`, `UK` markers.
5. **Monorepos** — scan all packages; group by package if multiple schemas exist.
6. **No target-repo changes** — read-only on `repoPath`.

After writing deliverable, proceed to [verify.md](./verify.md).
