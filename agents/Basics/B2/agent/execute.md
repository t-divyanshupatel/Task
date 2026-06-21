# Phase 2 — Execute

Run after [planning.md](./planning.md) inputs are confirmed. Discover frontend routes, backend API endpoints, and frontend→API call relationships. Write the deliverable.

**Read-only on `repoPath`**. Report writes go to `{proofDir}` and/or `{agentDir}/route-api-map-site/` only.

---

## Input (from planning)

| Field | Required | Description |
|-------|----------|-------------|
| `repoPath` | Yes | Repository root |
| `outputFormat` | Yes | `markdown` or `website` |
| `outputPath` | Yes | `{proofDir}/route-api-map.md` or `{agentDir}/route-api-map-site/` |
| `baseUrl` | No | Deployment base URL or path prefix |
| `scope` | No | Subdirectory or package limit in monorepos |
| `includeInternalApis` | No | `false` default — exclude internal-only routes |
| `includeMockServices` | No | `true` default — include mock/sibling API services |

Record `startTime` (ISO 8601) if not already set.

---

## Step 1 — Repo reconnaissance

1. Read `README.md`, `package.json`, `pom.xml`, `build.gradle`, routing config files.
2. Detect stack(s): React Router, Next.js App/Pages Router, Vue Router, Flutter `GoRoute`, Spring `@RequestMapping`, Express routers, Medusa `route.ts`, FastAPI routers, etc.
3. Note monorepo layout — identify which packages contain **frontend app** vs **backend API**.
4. Record: repo name, framework(s), default port/base path, auth model (JWT, session, API key).
5. Look for **OpenAPI/Swagger** specs (`openapi.yaml`, `swagger.json`, generated OAS) — use as cross-check, not sole source.
6. Exclude: `node_modules/`, `dist/`, `build/`, `.next/`, test-only routes unless `includeInternalApis`.

Apply `scope` if provided.

---

## Step 2 — Frontend route discovery

Find every **browser-navigable URL path**. Scan all applicable sources.

### Where to look

| Stack | Primary sources |
|-------|-----------------|
| React Router v6 | `<Route path=`, `createBrowserRouter`, `routes.tsx`, `RouterProvider` |
| Next.js App Router | `app/**/page.tsx`, `layout.tsx`, route groups `(group)/`, dynamic `[param]` |
| Next.js Pages Router | `pages/**/*.tsx`, `pages/api/*` (API — see Step 3) |
| Vue / Nuxt | `router/index.ts`, `pages/`, `nuxt.config` routes |
| Angular | `RouterModule.forRoot`, `path:` in routing modules |
| Flutter | `GoRoute`, `MaterialApp.routes`, `onGenerateRoute` |
| Medusa Admin | `packages/admin/**/routes/`, sidebar route config, `defineRouteConfig` |
| Static/legacy | `react-router-config`, `_routes.json`, `vercel.json` rewrites |

### Per frontend route capture

| Column | Description |
|--------|-------------|
| Path | Resolved URL path (include dynamic segments as `:id` or `[id]`) |
| Name | Route name or label if defined |
| Component / page | Target component or page file |
| Layout | Parent layout if nested |
| Auth | `protected`, `public`, `admin`, `unknown` |
| Package / app | Monorepo package name |
| File | Source file `path:line` |
| Notes | Lazy-loaded, redirect, alias, deprecated |

Resolve dynamic segments from folder/file naming conventions. Prefix with `baseUrl` when configured.

---

## Step 3 — Backend API endpoint discovery

Find every **externally reachable HTTP endpoint** the backend serves.

### Where to look

| Stack | Primary sources |
|-------|-----------------|
| Medusa v2 | `packages/*/src/api/**/route.ts` — `export function GET/POST/...` |
| Express / Node | `app.get/post/put/delete`, `router.*`, `fastify.get/post` |
| Spring Boot | `@GetMapping`, `@PostMapping`, `@RequestMapping` on `@RestController` |
| NestJS | `@Controller`, `@Get`, `@Post`, decorators + `main.ts` global prefix |
| Next.js API | `app/api/**/route.ts`, `pages/api/**/*.ts` |
| FastAPI | `@router.get/post`, `@app.get/post`, `APIRouter` includes |
| Django | `urlpatterns`, `path()`, `re_path()` |
| Flask | `@app.route`, Blueprint routes |
| Go | `http.HandleFunc`, `chi.Router`, `gin` routes in `handlers/` |
| OpenAPI | `paths:` section — validate against code |

Also check:
- Plugin/module `api/` directories loaded at runtime
- Webhook/hook routes (`/hooks/*`)
- Auth routes (`/auth/*`)
- GraphQL: list queries/mutations if exposed (separate subsection)

### Per API endpoint capture

| Column | Description |
|--------|-------------|
| Method | GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD (or ALL) |
| Path | Full path including global prefix (e.g. `/admin/products/:id`) |
| Handler | Function or controller method name |
| Auth / middleware | Middleware chain, `@Authenticated`, role guards |
| Package / module | Source package |
| File | `path:line` of handler export |
| Description | Doc comment or inferred purpose — `unknown` if unclear |
| Notes | Deprecated, internal, feature-flagged |

Deduplicate by `METHOD + path`. If same path has multiple methods, one row per method.

---

## Step 4 — Frontend → API call mapping

Trace which frontend routes/components call which API endpoints.

### Where to look

| Signal | Location |
|--------|----------|
| fetch/axios | `fetch(`, `axios.get/post`, `apiClient.` |
| RTK Query | `createApi`, `endpoints:`, `builder.query/mutation` |
| React Query | `useQuery`, `useMutation` with URL strings |
| Medusa JS SDK | `@medusajs/js-sdk`, `sdk.admin.*`, `sdk.store.*` |
| OpenAPI clients | Generated client method → path mapping |
| Constants | `API_URL`, `BASE_PATH`, route constant files |

### Per mapping capture

| Column | Description |
|--------|-------------|
| Frontend route / component | Page or component initiating call |
| HTTP method | GET, POST, etc. |
| API path | Called endpoint (template if dynamic) |
| Client | fetch, axios, sdk.admin.products.list, etc. |
| File | `path:line` of call site |
| Confidence | `explicit` (literal URL) or `inferred` (variable/builder) |

---

## Step 5 — Write deliverable

Record `endTime` and compute `duration` (e.g. `4m 30s`).

Branch on `outputFormat`:

---

### Format A — Markdown (`outputFormat: markdown`)

Write to `{proofDir}/route-api-map.md`.

Use this exact structure:

```markdown
# Route & API Map Report

## Metadata

| Field | Value |
|-------|-------|
| **Agent name** | repo-route-api-mapper |
| **Started at** | {startTime ISO 8601} |
| **Completed at** | {endTime ISO 8601} |
| **Duration** | {duration} |
| **Repository** | {repoPath} |
| **Repo name** | {derived name} |
| **Stack detected** | {e.g. Medusa v2 + React Admin + Next.js} |
| **Base URL / prefix** | {baseUrl or "/"} |
| **Scope** | {scope or "full repo"} |
| **Output format** | markdown |
| **Frontend routes** | {count} |
| **API endpoints** | {count} |
| **Frontend→API mappings** | {count} |
| **GET** | {count} |
| **POST** | {count} |
| **PUT** | {count} |
| **PATCH** | {count} |
| **DELETE** | {count} |

## Summary

{2–4 sentences: routing architecture, admin vs store vs public split, dominant frameworks, notable patterns.}

## Route Architecture

{ASCII or bullet overview of frontend apps and API namespaces.}

## Method Distribution

\`\`\`mermaid
pie title API Methods
    "GET" : {n}
    "POST" : {n}
    "PUT" : {n}
    "PATCH" : {n}
    "DELETE" : {n}
\`\`\`

## Route Tree Overview

\`\`\`mermaid
flowchart TD
    ROOT["App Root"] --> ADMIN["/admin/*"]
    ROOT --> STORE["/store/*"]
    ADMIN --> A1["/admin/products"]
    STORE --> S1["/store/carts"]
\`\`\`

## Frontend Routes

| # | Path | Component / Page | Auth | Package | File | Notes |
|---|------|------------------|------|---------|------|-------|
| 1 | /dashboard | DashboardPage | protected | admin | src/routes/dashboard.tsx:12 | — |

{Group by app/package with subheadings when > 30 routes.}

## API Endpoints

### {namespace e.g. Admin API}

| # | Method | Path | Handler | Auth | Package | File | Description | Notes |
|---|--------|------|---------|------|---------|------|-------------|-------|
| 1 | GET | /admin/products | GET | admin | medusa | .../route.ts:14 | List products | — |

{Repeat per namespace: admin, store, auth, hooks, custom.}

## Frontend → API Call Map

| # | Frontend route / component | Method | API path | Client | File | Confidence |
|---|----------------------------|--------|----------|--------|------|------------|
| 1 | ProductListPage | GET | /admin/products | sdk.admin.product.list | src/pages/products.tsx:45 | explicit |

## OpenAPI Cross-Reference

{If spec found: table comparing spec paths vs discovered paths; note mismatches.}

{If none: "_No OpenAPI/Swagger spec found._"}

## Discovery Notes

### Files examined
- `{path}` — {why it mattered}

### Dynamic / runtime routes
- {Plugin-loaded routes, file-based routing caveats}

### Excluded from scan
- `{dir}` — {reason}

### Ambiguities & gaps
- {Unresolved dynamic imports, env-dependent base URLs, etc.}

### Recommendations
- {Missing route docs, duplicate paths, unprotected endpoints, etc.}
```

#### Large repos

If frontend routes or API endpoints exceed **100 rows** per section:
- Add per-namespace count table at section top
- Full listing still required for API endpoints under primary namespaces (admin, store, public)
- Secondary namespaces may be summarized by directory with counts

---

### Format B — Website (`outputFormat: website`)

Build at `{agentDir}/route-api-map-site/`.

#### Bootstrap (do not edit template)

```bash
cp -R Task/agents/frontend/. {agentDir}/route-api-map-site/
cd {agentDir}/route-api-map-site
npm install
```

**Never modify files under `Task/agents/frontend/`** — only files inside `route-api-map-site/`.

#### Required site features

1. **Overview** — metadata, summary, route/API count stats cards
2. **Frontend routes tab** — searchable list, auth badges, source citations
3. **API endpoints tab** — filter by method and namespace, handler details
4. **Call map tab** — frontend→API relationships with confidence badges
5. **Route tree** — Mermaid or nested visual tree
6. **Method chart** — bar/pie chart of HTTP methods
7. **Responsive UI** — clean layout, copy-to-clipboard citations

#### Data layer

Generate `{agentDir}/route-api-map-site/data/route-api-map.json` from discovery. Website must reflect **same completeness** as markdown report.

#### Run locally

```bash
cd {agentDir}/route-api-map-site
npm run dev
```

Open **http://localhost:3000**. Fix build/lint errors until `npm run build` passes.

---

## Execution rules

1. **Evidence over guessing** — every route/endpoints must cite `path:line`. Use `[INFERRED]` with supporting evidence when path is built dynamically.
2. **External only** — focus on browser/HTTP client reachable surfaces unless `includeInternalApis`.
3. **Method accuracy** — read actual exported HTTP method handlers; do not assume GET for all routes.
4. **Monorepos** — scan all apps/packages; add Package/App column.
5. **Mock services** — if embedded mock API exists, document separately with relationship note.
6. **No target-repo changes** — read-only analysis only.
7. **Charts required** — markdown must include Mermaid method chart and route tree; website must include equivalent visuals.

After writing deliverable, proceed to [verify.md](./verify.md).
