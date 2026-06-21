# I2 — Repo E2E Flow Tracer

**Agent name:** `repo-e2e-flow-tracer`  
**Tier:** Intermediate (read-only)  
**Entry point:** [`agent/agent.md`](./agent/agent.md)

---

## Purpose

Traces **one** execution path end-to-end from entry point to final side effect:

| Entry type | Examples |
|------------|----------|
| HTTP endpoint | `POST /store/carts`, Spring `@PostMapping` |
| Event handler | Kafka consumer, Medusa subscriber |
| Cron / job | `@Scheduled`, Bull processor |

Delivers step-by-step call path, external dependencies, DB/API/queue side effects, and a **Mermaid sequence diagram**.

---

## When to use

- Debug a specific API or event flow
- Onboarding — understand one critical path deeply
- Incident response — trace where data is written
- Design review — verify layering on one feature

**Example invocation:**

```
/intermediate-repo-e2e-flow-tracer on Task/medusa
Trace POST /store/carts/{id}/complete
```

---

## How to run in Cursor

```
/intermediate-repo-e2e-flow-tracer

Analyze Task/medusa. Trace POST /store/carts/{id}/complete. Markdown output.
```

### Phase 1 — Planning ([`agent/planning.md`](./agent/planning.md))

| Question | Options |
|----------|---------|
| Repository path | Workspace **or** custom |
| **Flow target** | One endpoint, event name, or cron job (required) |
| Output format | **Markdown** or **Website** |

### Phase 2 — Execute ([`agent/execute.md`](./agent/execute.md))

1. Resolve entry point (file, function, line)
2. Follow calls: controller → workflow → service → repository/DAL
3. Document external deps (Redis, HTTP, queue)
4. List side effects (INSERT, UPDATE, publish event)
5. Mermaid sequence diagram
6. Known uncertainty section

### Phase 3 — Verify ([`agent/verify.md`](./agent/verify.md))

Single flow only; every step has file citation; diagram renders.

---

## Outputs

| Format | Path |
|--------|------|
| **Markdown** | `Task/agents/Intermediate/I2/proof/e2e-flow-trace-report.md` |
| **Website** | `Task/agents/Intermediate/I2/agent/e2e-flow-site/` → http://localhost:3000 |

### Markdown report includes

- Entry point metadata
- Step-by-step call path table (file, function, line)
- Side effects table (DB table, API, queue topic)
- External dependencies
- Mermaid sequence diagram
- Known uncertainty / dynamic dispatch gaps

---

## Constraints

- **One flow per run** unless user specifies chained flow
- **Read-only** — no code changes
- Mark dynamic/reflection wiring as `inferred`
- Reports in `proof/`

---

## Cursor skill

| Slash command | Skill file |
|---------------|------------|
| `/intermediate-repo-e2e-flow-tracer` | `.cursor/skills/intermediate-repo-e2e-flow-tracer/SKILL.md` |

---

## File layout

```
Intermediate/I2/
├── README.md
├── agent/
│   ├── agent.md
│   ├── planning.md
│   ├── execute.md
│   └── verify.md
└── proof/
    └── e2e-flow-trace-report.md
```

---

## Medusa example flow

```
POST store/carts/[id]/complete/route.ts
  → completeCartWorkflow (core-flows)
  → CartModuleService / OrderModuleService
  → PaymentModuleService
  → MikroORM persist + event bus publish
```
