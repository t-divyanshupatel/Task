# Phase 2 — Execute

Run after [planning.md](./planning.md) inputs are confirmed. Trace the flow end-to-end and write the deliverable.

You are **read-only on `repoPath`**. Your only writes are in `{agentDir}` and `{proofDir}`.

---

## Input (from planning)

| Field | Required | Description |
|-------|----------|-------------|
| `repoPath` | Yes | Repository root |
| `flowTarget` | Yes | Endpoint, event, cron, or `pick-one` |
| `outputFormat` | Yes | `markdown` or `website` |
| `outputPath` | Yes | `{proofDir}/e2e-flow-trace-report.md` or `{agentDir}/e2e-flow-site/` |
| `includeSiblingRepos` | No | `false` default — trace only within `repoPath` |
| `scope` | No | Subdirectory or package limit in monorepos |

Record `startTime` (ISO 8601) if not already set.

---

## Step 1 — Repo reconnaissance

Before tracing, establish context:

1. Read `README.md`, `package.json`, `pom.xml`, `build.gradle`, `pubspec.yaml`, or equivalent to detect stack(s).
2. Note monorepo layout — list top-level apps/packages if present.
3. Record: repo name, detected stack(s), primary framework (Spring Boot, Express, React SPA + BFF, Flutter, etc.), and how entry points are registered (router, controller scan, event bus, scheduler config).
4. If `flowTarget` is `pick-one` or ambiguous, locate candidates using route maps, OpenAPI specs, `@RestController`, `app.get/post`, `router.*`, `@EventListener`, `@Scheduled`, cron config files, and queue consumer definitions. State your choice and why.

---

## Step 2 — Resolve entry point

Find the **exact entry point** for the chosen flow.

### Where to look

| Flow kind | Primary sources |
|-----------|-----------------|
| HTTP (inbound) | `@RestController`, `@RequestMapping`, Express `app/router`, mock service route tables, OpenAPI `paths` |
| HTTP (frontend-initiated) | Route → page/component → API service → `fetch`/`axios` call |
| Event / message | `@EventListener`, `@KafkaListener`, `@RabbitListener`, `emitter.on`, SQS consumer, webhook handlers |
| Cron / batch | `@Scheduled`, `node-cron`, `agenda`, Bull/BullMQ processors, Quartz `Job`, Spring `@EnableScheduling` |

### Capture for entry point

| Field | Description |
|-------|-------------|
| Kind | `http-inbound` / `http-outbound` / `event` / `cron` / `webhook` |
| Identifier | Method + path, event name, cron expression, or queue/topic name |
| File | `path:line` where registered or handled |
| Function / method | Handler function or class method name |
| Trigger | What causes execution (user request, message publish, schedule, deep link) |

If no entry point is found, write a partial deliverable with **Known uncertainty** explaining what was searched. Proceed to verify.

---

## Step 3 — Step-by-step call path

Follow the flow **depth-first through major layers only**. Do not list every private helper — include functions that change control flow, I/O, auth, validation, mapping, or persistence.

### Layers to traverse (use all that apply)

| Layer | Examples |
|-------|----------|
| Middleware / filters | Auth, logging, rate limit, `OncePerRequestFilter`, Express middleware |
| Controller / handler | Route handler, `@RestController` method, webhook entry |
| Service / use-case | `*Service`, `*UseCase`, `*Manager`, domain logic |
| Repository / DAO | `*Repository`, `*Dao`, Prisma/Sequelize model calls |
| Client / adapter | HTTP client to downstream API, gRPC stub, message producer |
| Mapper / DTO | Request/response transformation when it affects external contracts |

### For each step, capture

| # | File | Function / symbol | Role | What it does (1 line) | Next hop |
|---|------|-------------------|------|----------------------|----------|
| 1 | `src/controllers/DashboardController.java:42` | `getDashboard()` | controller | Validates user, delegates to service | `DashboardService.fetch()` |

Rules:

- Every row must cite `path:line` (line when possible).
- Follow imports, dependency injection, and direct calls — not speculative dynamic dispatch unless evidenced.
- Stop at **terminal side effects** (DB read/write, outbound HTTP, queue publish, cache set, file write, email/SMS).
- For async flows, note `await`, `@Async`, `publish`, `emit` and continue the traced branch that carries the primary business outcome.
- Cap at ~25 major steps; summarize deeper internal helpers in a **Sub-call summary** bullet under the step.

---

## Step 4 — External dependencies

List every **external system** touched or called along the path (not in-repo modules).

| Dependency | Type | Where used | Purpose in this flow | Config / URL source |
|------------|------|------------|------------------------|---------------------|
| PostgreSQL `mf_db` | database | `UserRepository.save()` | Persist user profile | `application.yml:12` |
| Redis | cache | `CacheService.get()` | Session lookup | `REDIS_URL` env |
| `https://api.example.com/v3/dashboard` | HTTP API | `DashboardClient.fetch()` | Aggregate data | `apiUrls.mjs:45` |
| `orders.created` Kafka topic | queue | `OrderPublisher.send()` | Emit order event | `kafka.topics.orders` |

Types: `database`, `cache`, `http-api`, `queue`, `object-storage`, `email`, `sms`, `third-party-sdk`, `filesystem`, `other`.

If URL/host is built dynamically, note the resolution path and mark host as `dynamic`.

---

## Step 5 — Side effects

Document every **observable side effect** at the end of each branch (read and write).

### Database

| Operation | Table / collection | Query / method | File | Notes |
|-----------|-------------------|----------------|------|-------|
| READ | `users` | `SELECT ... WHERE id = ?` | `UserDao.java:88` | — |
| WRITE | `sync_log` | `INSERT INTO sync_log ...` | `SyncRepository.kt:34` | Upsert on conflict |

### API (outbound)

| Method | Path / operation | Client | File | Request summary | Response used for |
|--------|------------------|--------|------|-----------------|-------------------|
| GET | `/portfolio/v2/{userId}` | `PortfolioHttpClient` | `portfolioClient.js:22` | `userId` path param | Dashboard aggregation |

### Queue / events

| Action | Topic / queue / event | Producer | File | Payload summary |
|--------|----------------------|----------|------|-----------------|
| PUBLISH | `user.sync.completed` | `EventPublisher` | `events.py:67` | `{ userId, timestamp }` |

Mark effects as **confirmed** (direct call/SQL in code) or **inferred** (ORM method name implies write, framework magic).

---

## Step 6 — Sequence diagram

Build a **valid Mermaid `sequenceDiagram`** covering the traced flow from actor/trigger through major components to side effects.

Guidelines:

- Participants: `Actor`/`Client`, in-repo components (Controller, Service, Repository), and external systems (DB, API, Queue).
- One `->>` or `-->>` per major step; use `alt`/`opt` only when branching is evidenced in code.
- Label messages with function names or operation labels (e.g. `getDashboard()`, `SELECT users`).
- Include at least one side-effect interaction (DB, API, or queue) if any exist.

---

## Step 7 — Write deliverable

Record `endTime` and compute `duration` (human-readable, e.g. `2m 18s`).

Branch on `outputFormat`:

---

### Format A — Markdown (`outputFormat: markdown`)

Write to `{proofDir}/e2e-flow-trace-report.md`.

Use this exact structure:

```markdown
# E2E Flow Trace Report

## Metadata

| Field                      | Value                             |
| -------------------------- | --------------------------------- |
| **Agent name**             | repo-e2e-flow-tracer              |
| **Started at**             | {startTime ISO 8601}              |
| **Completed at**           | {endTime ISO 8601}                |
| **Duration**               | {duration}                        |
| **Repository**             | {repoPath}                        |
| **Repo name**              | {derived name}                    |
| **Flow traced**            | {normalized flowTarget}           |
| **Flow kind**              | {http-inbound / event / cron / …} |
| **Stack detected**         | {e.g. React 18 + Spring Boot 3}   |
| **Output format**          | markdown                          |
| **Major steps documented** | {count}                           |
| **Side effects found**     | {count}                           |

## Summary

{2–4 sentences: what flow was traced, entry point, primary path, and terminal side effects.}

## Entry Point

| Field          | Value                          |
| -------------- | ------------------------------ |
| **Kind**       | {kind}                         |
| **Identifier** | {method + path / event / cron} |
| **File**       | `{path:line}`                  |
| **Function**   | `{name}`                       |
| **Trigger**    | {what starts the flow}         |

## Step-by-Step Call Path

| Step | File          | Function | Role       | Description | Next        |
| ---- | ------------- | -------- | ---------- | ----------- | ----------- |
| 1    | `{path:line}` | `{fn}`   | controller | {one line}  | `{next fn}` |

{Optional sub-sections per step for sub-call summaries when depth was collapsed.}

## Call Path Overview

{Optional ASCII or markdown table chart showing layer depth per step — e.g. Controller → Service → Repository → DB.}

## External Dependencies

| Dependency | Type   | Used in       | Purpose   | Config source  |
| ---------- | ------ | ------------- | --------- | -------------- |
| {name}     | {type} | `{path:line}` | {purpose} | `{config ref}` |

## Side Effects

### Database

| Op   | Target  | Method / query | File               | Confidence |
| ---- | ------- | -------------- | ------------------ | ---------- |
| READ | `users` | `findById()`   | `UserRepo.java:45` | confirmed  |

### Outbound APIs

| Method | Endpoint             | Client            | File           | Confidence |
| ------ | -------------------- | ----------------- | -------------- | ---------- |
| GET    | `/portfolio/v2/{id}` | `PortfolioClient` | `client.js:22` | confirmed  |

### Queues / Events

| Action  | Target           | Producer   | File           | Confidence |
| ------- | ---------------- | ---------- | -------------- | ---------- |
| PUBLISH | `sync.completed` | `EventBus` | `events.ts:12` | inferred   |

## Side Effect Summary

| Category | Read | Write | Publish | Total |
| -------- | ---- | ----- | ------- | ----- |
| Database | {n}  | {n}   | —       | {n}   |
| API      | {n}  | {n}   | —       | {n}   |
| Queue    | —    | —     | {n}     | {n}   |

## Sequence Diagram

\`\`\`mermaid
sequenceDiagram
{participants and messages}
\`\`\`

## Known Uncertainty

| #   | Area            | Description                                     | What was tried                                              |
| --- | --------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| 1   | Dynamic routing | Handler resolved via plugin registry at runtime | Searched `PluginLoader.java`, no static reference to target |

### Files examined

- `{path}` — {brief note}

### Not traced (out of scope)

- {e.g. downstream microservice implementation in another repo}
- {e.g. frontend sub-components unrelated to primary API call}
```

---

### Format B — Website (`outputFormat: website`)

Build at `{agentDir}/e2e-flow-site/`.

#### Bootstrap (do not edit template)

```bash
cp -R Task/agents/frontend/. {agentDir}/e2e-flow-site/
cd {agentDir}/e2e-flow-site
npm install
```

**Never modify files under `Task/agents/frontend/`** — only files inside `e2e-flow-site/`.

#### Required site features

1. **Overview page** — metadata (agent, duration, repo, flow, stack, step/side-effect counts), summary paragraph
2. **Entry point card** — kind, identifier, file citation, function, trigger
3. **Call path timeline** — numbered steps with role badges, file citations, expandable sub-call summaries
4. **External dependencies panel** — table with type icons and config sources
5. **Side effects tabs** — Database / Outbound APIs / Queues with confidence badges
6. **Sequence diagram** — render Mermaid `sequenceDiagram` (use `mermaid` package or embedded SVG)
7. **Known uncertainty section** — table + files examined list
8. **Stats cards / charts** — step count, side-effect breakdown, layer distribution
9. **Source citations** — copy-to-clipboard for every `path:line`
10. **Responsive UI** — clean layout, dark/light friendly

#### Data layer

Generate `{agentDir}/e2e-flow-site/data/e2e-flow-trace.json` (or typed TS constants) from trace results. Website must reflect **same completeness** as markdown report.

#### Run locally

```bash
cd {agentDir}/e2e-flow-site
npm run dev
```

Open **http://localhost:3000**. Fix build/lint errors until `npm run build` passes.

---

## Execution rules

1. **One flow only** — do not trace multiple endpoints or jobs unless user explicitly lists a chained flow.
2. **Evidence over guessing** — every step and side effect must cite a source file. Use `unknown` and list under **Known uncertainty** rather than inventing calls.
3. **Major hops only** — optimize for readability; collapse generic utilities unless they perform I/O or auth.
4. **Follow the happy path** — primary success path first; document error branches only if they short-circuit to a different side effect.
5. **Cross-repo calls** — when `includeSiblingRepos: true` and a local path exists, follow one level into the sibling; otherwise document the outbound contract and stop.
6. **Valid Mermaid** — the `sequenceDiagram` block must parse in Mermaid.
7. **No target-repo changes** — read-only on `repoPath`.

After writing deliverable, proceed to [verify.md](./verify.md).
