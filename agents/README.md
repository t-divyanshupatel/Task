# Task Agents — Cursor Agent Library

A collection of **read-only and change-capable AI agents** for repository analysis, focused implementation, and code review. Each agent lives under `Task/agents/` with a consistent three-phase workflow: **Plan → Execute → Verify**.

Each agent has its **own Cursor skill** in `.cursor/skills/`. Invoke agents with a **`/` slash command** in Cursor Agent chat — not by `@`-mentioning agent folders.

---

## Folder structure

```
Task/agents/
├── README.md                 ← You are here
├── frontend/                 ← Shared Next.js template (DO NOT EDIT — copy only)
│   ├── app/
│   ├── package.json
│   └── README.md
├── Basics/                     ← Read-only repo discovery (B1–B3)
│   ├── B1/  Repo Structure Mapper
│   ├── B2/  Route & API Mapper
│   └── B3/  Test Discovery
├── Intermediate/               ← Deep analysis + small changes (I1–I3, I6)
│   ├── I1/  ER Diagram
│   ├── I2/  E2E Flow Tracer
│   ├── I3/  Focused Module Change
│   └── I6/  Seeded Bug Diagnosis
└── Advanced/                   ← Modernization, review, performance (A4–A6)
    ├── A4/  Repo Modernizer
    ├── A5/  PR Review
    └── A6/  Performance Bottleneck Optimizer
```

Every agent follows this layout:

```
{Tier}/{ID}/
├── README.md              ← Human guide (purpose, usage, outputs)
├── agent/
│   ├── agent.md           ← Entry point — agent reads this first
│   ├── planning.md        ← Phase 1: MCQ inputs
│   ├── execute.md         ← Phase 2: detailed task instructions
│   └── verify.md          ← Phase 3: completion checklist
└── proof/                 ← Markdown deliverables (sample reports)
    └── *-report.md
```

Website deliverables (when chosen) are copied from `Task/agents/frontend/` into `{agent}/agent/{site-name}/` and served at **http://localhost:3000**.

---

## How to use Cursor skills (detailed)

### What is a skill?

A **Cursor skill** is a project-level instruction file at `.cursor/skills/{skill-name}/SKILL.md`. It tells the agent which workflow to run, where the agent files live, and what constraints apply. **One skill = one agent** — there are no combined or shared skills.

Skills use `disable-model-invocation: true`, so they **guide** the agent when you invoke them explicitly; they do not auto-run in the background.

### Step 1 — Open Agent chat

1. Open this workspace in **Cursor**.
2. Switch to **Agent** mode (not Ask mode) — agents need tool access to read files, run commands, and write reports.
3. Open a new Agent chat.

### Step 2 — Invoke with `/`

Type `/` in the chat input. Cursor shows available skills from `.cursor/skills/`. Pick the agent you want, or type the full name:

```
/basics-test-discovery
```

Each agent has exactly one slash command (see catalog below).

### Step 3 — Provide the target repository

After the skill loads, tell the agent **which repo to analyze** in the same message or the next reply:

```
/basics-test-discovery

Analyze Task/medusa. Output format: markdown.
```

| Part | Meaning |
|------|---------|
| `/basics-test-discovery` | Loads the B3 Test Discovery skill and agent instructions |
| `Task/medusa` | Repository path relative to workspace root (or an absolute path) |
| `markdown` | Output format — `markdown` (report in `proof/`) or `website` (Next.js on localhost) |

You do **not** need to `@`-mention `Task/agents/Basics/B3` — the skill already points to the correct agent files.

### Step 4 — Answer planning questions

Most agents ask two MCQ questions via **AskQuestion**:

1. **Repository path** — confirm workspace root or a custom path
2. **Output format** — `markdown` or `website`

Some agents ask extra inputs:

| Agent | Extra input |
|-------|-------------|
| I2 | Flow target (endpoint, event, or cron job) |
| I6 | Symptom / failure description |
| A5 | PR URL, branch name, or diff scope |
| I3 | Change scope (user-specified or agent selects) |

### Step 5 — Let the agent run all three phases

The agent must:

1. Read `agent.md` → `planning.md` → `execute.md` → `verify.md` in order
2. Never skip planning or verification
3. Write deliverables to `proof/` (or build a website under `agent/`)

Do not interrupt mid-phase unless you need to change inputs.

### Step 6 — Read the output

| Format | Location |
|--------|----------|
| Markdown | `Task/agents/{Tier}/{ID}/proof/*-report.md` |
| Website | `Task/agents/{Tier}/{ID}/agent/*-site/` → `npm run dev` → http://localhost:3000 |

### Skill file locations

All skills live under `.cursor/skills/` in this repo:

```
.cursor/skills/
├── basics-repo-structure-mapper/SKILL.md      → /basics-repo-structure-mapper
├── basics-route-api-mapper/SKILL.md           → /basics-route-api-mapper
├── basics-test-discovery/SKILL.md             → /basics-test-discovery
├── intermediate-repo-er-diagram/SKILL.md      → /intermediate-repo-er-diagram
├── intermediate-repo-e2e-flow-tracer/SKILL.md → /intermediate-repo-e2e-flow-tracer
├── intermediate-focused-module-change/SKILL.md→ /intermediate-focused-module-change
├── intermediate-seeded-bug-diagnosis/SKILL.md → /intermediate-seeded-bug-diagnosis
├── advance-repo-modernizer/SKILL.md           → /advance-repo-modernizer
├── advance-pr-review/SKILL.md                 → /advance-pr-review
└── advance-perf-optimizer/SKILL.md            → /advance-perf-optimizer
```

### Tips

- **Combine skill + context in one message** for fastest start: `/basics-test-discovery on Task/medusa, markdown output`.
- **Optional `@` mentions** — you may `@Task/medusa` to attach the repo folder as context, but the `/` skill is the required invocation method.
- **Re-run safely** — each run overwrites the report in `proof/` for that agent; change-capable agents (I3, I6, A4, A6) do not commit unless you ask.
- **Skills not showing?** — Reload the window or confirm `.cursor/skills/{name}/SKILL.md` exists with a valid `name:` in the YAML frontmatter.

---

## Agent catalog

### Basics — read-only discovery

| ID | Name | Slash command | Modifies repo? | Report |
|----|------|---------------|----------------|--------|
| **B1** | [Repo Structure Mapper](./Basics/B1/README.md) | `/basics-repo-structure-mapper` | No | `proof/repo-structure-map.md` |
| **B2** | [Route & API Mapper](./Basics/B2/README.md) | `/basics-route-api-mapper` | No | `proof/route-api-map.md` |
| **B3** | [Test Discovery](./Basics/B3/README.md) | `/basics-test-discovery` | No* | `proof/test-discovery-report.md` |

\* B3 may run `yarn install` to enable tests but does not edit source.

### Intermediate — analysis and small changes

| ID | Name | Slash command | Modifies repo? | Report |
|----|------|---------------|----------------|--------|
| **I1** | [ER Diagram](./Intermediate/I1/README.md) | `/intermediate-repo-er-diagram` | No | `proof/er-diagram-report.md` |
| **I2** | [E2E Flow Tracer](./Intermediate/I2/README.md) | `/intermediate-repo-e2e-flow-tracer` | No | `proof/e2e-flow-trace-report.md` |
| **I3** | [Focused Module Change](./Intermediate/I3/README.md) | `/intermediate-focused-module-change` | **Yes** | `proof/focused-module-change-report.md` |
| **I6** | [Seeded Bug Diagnosis](./Intermediate/I6/README.md) | `/intermediate-seeded-bug-diagnosis` | **Yes** | `proof/bug-diagnosis-report.md` |

### Advanced — modernization, review, performance

| ID | Name | Slash command | Modifies repo? | Report |
|----|------|---------------|----------------|--------|
| **A4** | [Repo Modernizer](./Advanced/A4/README.md) | `/advance-repo-modernizer` | **Yes** (1 step) | `proof/modernization-report.md` |
| **A5** | [PR Review](./Advanced/A5/README.md) | `/advance-pr-review` | No (default) | `proof/pr-review-report.md` |
| **A6** | [Performance Optimizer](./Advanced/A6/README.md) | `/advance-perf-optimizer` | **Yes** | `proof/performance-optimization-report.md` |

---

## Shared rules (all agents)

1. **Never edit `Task/agents/frontend/`** — copy to `{agent}/agent/*-site/` for website output.
2. **Reports go to `proof/`** — not inside the analyzed repository (unless agent explicitly allows).
3. **Evidence required** — cite `path:line`, config files, or command output; use `unknown` when missing.
4. **Three phases mandatory** — Plan (MCQ) → Execute → Verify before claiming done.
5. **Single deliverable** — markdown **or** website per run unless user asks for both.
6. **No commits by default** — change-capable agents (I3, I6, A4, A6) stage edits but do not commit unless asked.

---

## Website output workflow

When user selects **website** format:

```bash
# Agent runs (conceptually):
cp -R Task/agents/frontend/. Task/agents/{Tier}/{ID}/agent/{site-name}/
cd Task/agents/{Tier}/{ID}/agent/{site-name}
npm install
npm run dev
# Open http://localhost:3000
```

The site embeds discovery data as JSON/TS under `data/` and replaces the default Next.js page with an explorer dashboard (charts, tables, search, Mermaid diagrams).

---

## Example invocations

```text
# Map repo structure (markdown)
/basics-repo-structure-mapper on Task/medusa — markdown output

# Find all routes and APIs
/basics-route-api-mapper on my-app

# Test framework discovery
/basics-test-discovery on Task/medusa

# ER diagram for a backend
/intermediate-repo-er-diagram on Task/medusa

# Trace POST /store/carts flow
/intermediate-repo-e2e-flow-tracer on Task/medusa
Trace POST /store/carts/{id}/complete

# Small fix in one module
/intermediate-focused-module-change on Task/medusa

# Diagnose a failing test
/intermediate-seeded-bug-diagnosis on Task/medusa
Symptom: verification token hash accepts empty string

# Modernization analysis + first step
/advance-repo-modernizer on Task/medusa

# Review a PR
/advance-pr-review
Review branch feature/auth-fix vs main in Task/medusa

# Performance bottleneck fix
/advance-perf-optimizer on Task/medusa
```

---

## Adding a new agent

1. Create `Task/agents/{Tier}/{ID}/agent/` with `agent.md`, `planning.md`, `execute.md`, `verify.md`.
2. Create `Task/agents/{Tier}/{ID}/proof/` for sample reports.
3. Add `Task/agents/{Tier}/{ID}/README.md` following existing agents (document the `/` slash command).
4. Add a **dedicated** `.cursor/skills/{skill-name}/SKILL.md` — one skill per agent, no shared skills.
5. Update this README catalog table with the new slash command.

---

## Related paths

| Path | Purpose |
|------|---------|
| `Task/medusa/` | Sample commerce monorepo used in proof reports |
| `Task/projects/` | Separate project sandboxes (not agent definitions) |
| `.cursor/skills/` | Cursor skill entry points — invoke with `/skill-name` |
