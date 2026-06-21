# Phase 2 — Execute

Run after [planning.md](./planning.md) inputs are confirmed. Discover major symbols, map layer relationships, and write the deliverable.

You are **read-only on `repoPath`**. Your only writes are in `{proofDir}` and/or `{agentDir}/repo-structure-map-site/`.

---

## Input (from planning)

| Field | Required | Description |
|-------|----------|-------------|
| `repoPath` | Yes | Repository root |
| `outputFormat` | Yes | `markdown` or `website` |
| `outputPath` | Yes | `{proofDir}/repo-structure-map.md` or `{agentDir}/repo-structure-map-site/` |
| `scope` | No | Subdirectory, package, or module limit in monorepos |
| `includeTests` | No | `false` default — skip `test/`, `__tests__/`, `*Test.*`, `*_test.*` |

Record `startTime` (ISO 8601) if not already set.

---

## Step 1 — Repo reconnaissance

Before scanning symbols, establish context:

1. Read `README.md`, `package.json`, `pom.xml`, `build.gradle`, `build.gradle.kts`, `pubspec.yaml`, `Cargo.toml`, `pyproject.toml`, or equivalent to detect stack(s).
2. Note monorepo layout — list top-level apps/packages if present.
3. Record: repo name, detected language(s), primary framework (Spring Boot, Express, React, Flutter, etc.), build tool, and architectural style if documented (layered, hexagonal, MVC, clean architecture).
4. Identify source roots: `src/main/java`, `src/`, `lib/`, `app/`, `packages/*/src`, etc.
5. Note directories to **exclude** from scanning: `node_modules/`, `vendor/`, `build/`, `dist/`, `.git/`, `target/`, `coverage/`, generated code (`**/generated/**`, `*.g.dart`, `*.pb.go` unless they are the only models).

If `scope` is set, limit scanning to that subdirectory or package.

---

## Step 2 — Symbol discovery by category

Scan the codebase and classify each **major** symbol into one or more categories below. A single file may contribute multiple rows (e.g. a file with both a service class and a DTO).

### What counts as "major"

Include symbols that are:

- Exported / public (or package-visible in Java/Kotlin)
- Named with conventional suffixes or annotations (see per-stack tables)
- Referenced from more than one place, OR clearly an entry point (controller, job, consumer, main config)
- Larger than trivial helpers (< ~10 lines with no business meaning)

Exclude unless `includeTests: true`:

- Test classes, mocks, fixtures
- Auto-generated protobuf/OpenAPI stubs (note in discovery notes instead)
- Barrel re-export files with no logic (list once under utilities if they are central)

### Where to look (use all that apply)

#### Java / Kotlin / Spring Boot

| Category | Signals |
|----------|---------|
| Controllers | `@RestController`, `@Controller`, `@RequestMapping` |
| Services | `@Service`, `*Service`, `*ServiceImpl`, application layer in `service/` |
| Repositories | `@Repository`, `JpaRepository`, `CrudRepository`, `*Repository` |
| Models | `@Entity`, `@Table`, `*Dto`, `*Request`, `*Response`, `*Model`, records in `model/`, `entity/`, `dto/` |
| Interfaces | `interface` keyword, repository/service interfaces |
| Jobs | `@Scheduled`, `@EnableScheduling`, Quartz `Job`, Spring Batch `*Tasklet`, `*Job` |
| Consumers | `@KafkaListener`, `@RabbitListener`, `@JmsListener`, `*Consumer`, `*Listener` |
| Configs | `@Configuration`, `@ConfigurationProperties`, `SecurityConfig`, `application.yml`, `application.properties` |
| Utilities | `*Utils`, `*Helper`, `*Validator`, static helper classes in `util/`, `common/` |

#### JavaScript / TypeScript (Node, React, Next)

| Category | Signals |
|----------|---------|
| Controllers | Express `router.*`, `app.get/post`, Next.js `route.ts` handlers, API route files |
| Services | `*Service.js/ts`, `services/`, RTK Query slices, React Query hooks wrapping API |
| Repositories | `*Repository`, `*Store`, Prisma/TypeORM data access, `dao/` |
| Models | `*Model`, Zod/Yup schemas, Mongoose schemas, TypeScript `interface`/`type` in `models/`, `types/` |
| Interfaces | `interface`, `type` exports used as contracts |
| Classes | `class` keyword (controllers, services, error types) |
| Jobs | `node-cron`, `bull`/`bullmq` processors, `agenda` jobs, `setInterval` workers in `jobs/` |
| Consumers | Kafka/SQS/Rabbit consumers in `consumers/`, `listeners/`, `subscribers/` |
| Configs | `config/`, `*.config.js/ts`, `envConfig`, `webpack.config`, `vite.config`, `next.config` |
| Utilities | `utils/`, `helpers/`, `lib/`, formatters, validators, constants modules |

#### Flutter / Dart

| Category | Signals |
|----------|---------|
| Services | `*Service`, `services/`, API client classes |
| Repositories | `*Repository`, `repositories/` |
| Models | `*Model`, `freezed`/`json_serializable` classes in `models/` |
| Controllers | N/A (use Cubit/Bloc/Notifier as service-like); `*Cubit`, `*Bloc`, `*Notifier` |
| Interfaces | `abstract class` contracts |
| Jobs | `workmanager`, background fetch handlers |
| Consumers | stream listeners, Firebase messaging handlers |
| Configs | `config/`, flavor configs, `app_config` |
| Utilities | `utils/`, `helpers/`, extensions |

#### Python (FastAPI, Django, Flask)

| Category | Signals |
|----------|---------|
| Controllers | FastAPI `@router`, Django `views.py`, Flask blueprints |
| Services | `*Service`, `services/` |
| Repositories | `*Repository`, ORM access in `repositories/` |
| Models | SQLAlchemy models, Pydantic `BaseModel`, Django `models.Model` |
| Jobs | Celery tasks, APScheduler, `tasks.py` |
| Consumers | Kafka/Rabbit consumers |
| Configs | `settings.py`, `config.py`, `.env.example` |
| Utilities | `utils/`, `helpers/` |

#### Go / Rust

| Category | Signals |
|----------|---------|
| Controllers | HTTP handlers in `handlers/`, `api/` |
| Services | `*Service`, `service/` package |
| Repositories | `*Repository`, `store/` |
| Models | structs in `models/`, `domain/` |
| Interfaces | Go interfaces, Rust traits |
| Jobs | cron workers, background goroutines in `jobs/` |
| Consumers | Kafka/NATS consumers |
| Configs | `config.go`, `config.rs`, env loading |
| Utilities | `pkg/`, `internal/util/` |

### For each symbol, capture

| Column | Description |
|--------|-------------|
| Name | Class, interface, function export, or module name |
| Category | One of: `class`, `interface`, `service`, `controller`, `model`, `repository`, `job`, `consumer`, `config`, `utility` |
| Package / module | Java package, JS import path, Go package, etc. |
| File | Relative path from repo root |
| Line | Definition line number (`path:line`) |
| Description | One line from doc comment, Javadoc, or inferred purpose — use `unknown` if unclear |
| Key dependencies | Notable imports or injected deps (e.g. `PortfolioRepository`, `axios`) — brief |
| Notes | Abstract, deprecated, feature-flagged, generated |

Deduplicate by fully qualified name. If a symbol fits multiple categories, pick the **primary** role and mention secondary in Notes (e.g. `Config class that also exposes beans`).

---

## Step 3 — Layer & dependency overview

Summarize how layers connect:

- Which controllers call which services
- Which services use which repositories
- Which consumers feed which services
- Central config files that wire modules together

Mark relationships as `explicit` (constructor injection, import) or `inferred` (naming convention only).

---

## Step 4 — Write deliverable

Record `endTime` and compute `duration` (human-readable, e.g. `3m 12s`).

Branch on `outputFormat`:

---

### Format A — Markdown (`outputFormat: markdown`)

Write to `{proofDir}/repo-structure-map.md`.

Use this exact structure:

```markdown
# Repo Structure Map Report

## Metadata

| Field | Value |
|-------|-------|
| **Agent name** | repo-structure-mapper |
| **Started at** | {startTime ISO 8601} |
| **Completed at** | {endTime ISO 8601} |
| **Duration** | {duration} |
| **Repository** | {repoPath} |
| **Repo name** | {derived name} |
| **Stack detected** | {e.g. Spring Boot 3 + Java 17, React 18 + TypeScript} |
| **Scope** | {scope or "full repo"} |
| **Output format** | markdown |
| **Files scanned** | {count} |
| **Symbols found** | {total count} |
| **Controllers** | {count} |
| **Services** | {count} |
| **Repositories** | {count} |
| **Models** | {count} |
| **Jobs** | {count} |
| **Consumers** | {count} |
| **Configs** | {count} |
| **Utilities** | {count} |
| **Classes** | {count} |
| **Interfaces** | {count} |

## Summary

{2–4 sentences: what kind of app/service this is, how code is organized (packages, layers), where business logic lives, notable patterns (e.g. centralized config, event-driven consumers), and any gaps.}

## Architecture Overview

{Short paragraph or bullet list describing top-level modules/packages and layer flow.}

\`\`\`
{Optional ASCII tree diagram, e.g.}
com.example.app
├── controller/   → HTTP entry
├── service/      → business logic
├── repository/   → persistence
├── model/        → entities & DTOs
├── config/       → Spring beans
├── job/          → scheduled tasks
└── consumer/     → Kafka listeners
\`\`\`

## Category Distribution

\`\`\`mermaid
pie title Symbols by Category
    "Controllers" : {count}
    "Services" : {count}
    "Repositories" : {count}
    "Models" : {count}
    "Jobs" : {count}
    "Consumers" : {count}
    "Configs" : {count}
    "Utilities" : {count}
    "Classes" : {count}
    "Interfaces" : {count}
\`\`\`

## Layer Flow

\`\`\`mermaid
flowchart LR
    C[Controllers] --> S[Services]
    S --> R[Repositories]
    S --> M[Models]
    J[Jobs] --> S
    K[Consumers] --> S
    CFG[Configs] -.-> C
    CFG -.-> S
\`\`\`

## Controllers

| # | Name | Package / Module | File | Description | Key dependencies | Notes |
|---|------|------------------|------|-------------|------------------|-------|
| 1 | PortfolioController | com.example.controller | src/main/java/.../PortfolioController.java:12 | Portfolio API | PortfolioService | — |

## Services

| # | Name | Package / Module | File | Description | Key dependencies | Notes |
|---|------|------------------|------|-------------|------------------|-------|
| 1 | PortfolioService | com.example.service | src/main/java/.../PortfolioService.java:18 | Portfolio business logic | PortfolioRepository | — |

## Repositories

| # | Name | Package / Module | File | Description | Key dependencies | Notes |
|---|------|------------------|------|-------------|------------------|-------|
| 1 | PortfolioRepository | com.example.repository | src/main/java/.../PortfolioRepository.java:8 | JPA portfolio access | — | extends JpaRepository |

## Models

| # | Name | Package / Module | File | Description | Key dependencies | Notes |
|---|------|------------------|------|-------------|------------------|-------|
| 1 | PortfolioDto | com.example.dto | src/main/java/.../PortfolioDto.java:5 | Portfolio response shape | — | record |

## Jobs

| # | Name | Package / Module | File | Description | Schedule / trigger | Notes |
|---|------|------------------|------|-------------|-------------------|-------|
| 1 | ReconciliationJob | com.example.job | src/main/java/.../ReconciliationJob.java:10 | Daily reconciliation | @Scheduled(cron = "0 0 2 * * *") | — |

{If none: "_No scheduled jobs or background workers found._"}

## Consumers

| # | Name | Package / Module | File | Description | Topic / queue | Notes |
|---|------|------------------|------|-------------|---------------|-------|
| 1 | OrderEventConsumer | com.example.consumer | src/main/java/.../OrderEventConsumer.java:14 | Processes order events | orders-topic | @KafkaListener |

{If none: "_No message consumers found._"}

## Configs

| # | Name | Package / Module | File | Description | Notes |
|---|------|------------------|------|-------------|-------|
| 1 | SecurityConfig | com.example.config | src/main/java/.../SecurityConfig.java:20 | Spring Security setup | — |
| 2 | application.yml | — | src/main/resources/application.yml:1 | Runtime properties | DB, Kafka URLs |

## Utilities

| # | Name | Package / Module | File | Description | Notes |
|---|------|------------------|------|-------------|-------|
| 1 | DateUtils | com.example.util | src/main/java/.../DateUtils.java:8 | Date formatting helpers | static methods |

## Classes

| # | Name | Package / Module | File | Description | Notes |
|---|------|------------------|------|-------------|-------|
| 1 | Application | com.example | src/main/java/.../Application.java:6 | Spring Boot entry point | @SpringBootApplication |

{List significant classes not already covered in Services/Controllers/Models. Omit if fully redundant.}

## Interfaces

| # | Name | Package / Module | File | Description | Implemented by | Notes |
|---|------|------------------|------|-------------|----------------|-------|
| 1 | PortfolioService | com.example.service | src/main/java/.../PortfolioService.java:5 | Portfolio contract | PortfolioServiceImpl | — |

## Layer Relationships

| From | To | Relationship | Confidence |
|------|-----|--------------|------------|
| PortfolioController | PortfolioService | injects | explicit |
| PortfolioService | PortfolioRepository | injects | explicit |
| OrderEventConsumer | OrderService | calls | inferred |

## Discovery notes

### Files examined
- `path/to/file` — {why it mattered}

### Excluded from scan
- `node_modules/` — third-party dependencies
- `target/` — build output

### Ambiguities & gaps
- {Dynamic imports, reflection-based wiring, generated code not checked, symbols only in uncompiled branches, etc.}

### Recommendations
- {Optional: missing layer separation, god classes, duplicate utilities, configs scattered across env files, etc.}
```

#### Large repos

If any category exceeds **75 rows**:

- List all symbols in that category grouped by package/module subdirectory
- Add a per-subdirectory count table at the top of that section
- Full row listing is still required for controllers, services, and repositories; models/utilities may be summarized by directory with counts if > 150

---

### Format B — Website (`outputFormat: website`)

Build at `{agentDir}/repo-structure-map-site/`.

#### Bootstrap (do not edit template)

```bash
cp -R Task/agents/frontend/. {agentDir}/repo-structure-map-site/
cd {agentDir}/repo-structure-map-site
npm install
```

**Never modify files under `Task/agents/frontend/`** — only files inside `repo-structure-map-site/`.

#### Required site features

1. **Overview page** — metadata (agent, duration, repo, stack, scope), executive summary, category count stats cards
2. **Category charts** — bar or pie chart of symbol counts by category (use real discovery data)
3. **Symbol explorer** — searchable/filterable list grouped by category; click for full row detail and source citation
4. **Layer diagram** — Mermaid flowchart or visual graph showing controller → service → repository flow
5. **Architecture tree** — package/module hierarchy with role labels
6. **Layer relationships panel** — table with explicit/inferred confidence badges
7. **Source citations** — copy-to-clipboard for every `path:line`
8. **Responsive UI** — clean layout, good visual hierarchy, dark/light friendly

#### Data layer

Generate `{agentDir}/repo-structure-map-site/data/repo-structure.json` (or typed TS constants) from discovery results. Website must reflect **same completeness** as markdown report.

#### Run locally

```bash
cd {agentDir}/repo-structure-map-site
npm run dev
```

Open **http://localhost:3000**. Fix build/lint errors until `npm run build` passes.

---

## Execution rules

1. **Evidence over guessing** — every row must trace to a source file and line. Use `unknown` rather than inventing descriptions.
2. **Convention + annotation** — classify by folder naming, file suffix, and framework annotations; when ambiguous, note in Notes.
3. **Monorepos** — produce one combined report; add a `Package / App` column when multiple apps share the repo.
4. **Include mock services** — if the repo has an embedded or sibling mock API service, scan it and note its relationship to the main app.
5. **No target-repo changes** — read-only analysis only.
6. **Charts required** — markdown must include at least one Mermaid pie/bar chart and one layer flow diagram; website must include equivalent interactive charts.

After writing deliverable, proceed to [verify.md](./verify.md).
