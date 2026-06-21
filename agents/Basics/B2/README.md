# B2 — Route & API Mapper

**Agent name:** `repo-route-api-mapper`  
**Tier:** Basics (read-only)  
**Entry point:** [`agent/agent.md`](./agent/agent.md)

---

## Purpose

Maps **every externally exposed frontend route** and **every HTTP API endpoint** the app calls or serves:

1. **Frontend routes** — browser URLs, deep links, app URL schemes
2. **API endpoints** — outbound (frontend → backend) and inbound (controllers, mocks)
3. **Route ↔ API correlations** — which pages call which APIs (with confidence)

Supports React Router, Next.js, Flutter GoRouter, Spring Boot, Express, mock services, OpenAPI specs.

---

## When to use

- Documenting SPA routing and API surface
- Security review of exposed routes
- Finding duplicate or orphaned endpoints
- Correlating UI screens to backend calls

**Example invocation:**

```
/basics-route-api-mapper on my-frontend — markdown output
```

---

## How to run in Cursor

```
/basics-route-api-mapper

Analyze path/to/repo. Output format: markdown.
```

### Phase 1 — Planning ([`agent/planning.md`](./agent/planning.md))

| Question | Options |
|----------|---------|
| Repository path | Workspace **or** custom |
| Output format | **Markdown** or **Website** |

Optional: `baseUrl` (path prefix), `scope`, `includeInternalApis`, `includeMockServices`.

### Phase 2 — Execute ([`agent/execute.md`](./agent/execute.md))

1. Repo reconnaissance (stack, routing framework)
2. Frontend route discovery (resolve constants, wildcards)
3. API endpoint discovery (inbound + outbound)
4. Route ↔ API correlation
5. Write deliverable

### Phase 3 — Verify ([`agent/verify.md`](./agent/verify.md))

Every route and endpoint has a source file reference; wildcards preserved.

---

## Outputs

| Format | Path |
|--------|------|
| **Markdown** | `Task/agents/Basics/B2/proof/route-api-map.md` |
| **Website** | `Task/agents/Basics/B2/agent/route-api-map-site/` → http://localhost:3000 |

### Markdown report includes

- Metadata (route count, API count, base URL)
- Frontend routes table + route tree
- Outbound and inbound API tables
- HTTP method distribution chart (Mermaid)
- Route ↔ API correlation table
- Discovery notes and recommendations

---

## Constraints

- **Read-only** — no source edits
- Expand route constants to resolved paths
- Include sibling mock API services when present
- Monorepos: single combined report with Package/App column

---

## Cursor skill

| Slash command | Skill file |
|---------------|------------|
| `/basics-route-api-mapper` | `.cursor/skills/basics-route-api-mapper/SKILL.md` |

---

## File layout

```
Basics/B2/
├── README.md
├── agent/
│   ├── agent.md          ← also contains full inline spec (legacy)
│   ├── planning.md
│   ├── execute.md
│   └── verify.md
└── proof/
    └── route-api-map.md
```

---

## Supported stacks

| Stack | Route sources | API sources |
|-------|---------------|-------------|
| React / SPA | `routes.tsx`, React Router | `apiUrls`, axios, RTK Query |
| Next.js | `app/**/page.tsx`, `pages/` | `route.ts`, server actions |
| Spring Boot | — | `@RestController`, OpenAPI |
| Express / Medusa | — | `router.*`, `route.ts` |
| Flutter | GoRouter, routes | `*Api.dart`, repositories |
