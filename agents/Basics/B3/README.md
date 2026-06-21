# B3 — Repo Test Discovery

**Agent name:** `repo-test-discovery`  
**Tier:** Basics (read-only on source*)  
**Entry point:** [`agent/agent.md`](./agent/agent.md)

\* May run `yarn install` / `npm install` to enable test execution; does not edit test or production code.

---

## Purpose

Finds how tests work in a repository and **runs real commands**:

1. **Test framework & config** — Jest, Vitest, JUnit, pytest, etc.
2. **Relevant test files** — unit, integration, e2e
3. **Exact commands** — copy-paste ready, sourced from CI/scripts
4. **Actual command output** — real stdout/stderr
5. **Failure interpretation** — classification and next steps

---

## When to use

- "How do I run tests in this repo?"
- CI is failing — need framework and command map
- Onboarding — find test layout and prerequisites
- Document test strategy for a monorepo

**Example invocation:**

```
/basics-test-discovery on Task/medusa — markdown output
```

---

## How to run in Cursor

```
/basics-test-discovery

Analyze Task/medusa. Output format: markdown.
```

### Phase 1 — Planning ([`agent/planning.md`](./agent/planning.md))

| Question | Options |
|----------|---------|
| Repository path | Workspace **or** custom |
| Output format | **Markdown** or **Website** |

Optional: `scope` (unit/integration/e2e), `runTests` (default true), `maxTestFilesListed` (default 75).

### Phase 2 — Execute ([`agent/execute.md`](./agent/execute.md))

1. Repo recon + CI config scan
2. Framework detection (version, config paths)
3. Test file discovery by glob patterns
4. Derive exact commands (CI > package.json > build tool)
5. **Run commands** and capture output
6. Failure analysis and interpretation
7. Write deliverable with Mermaid charts

### Phase 3 — Verify ([`agent/verify.md`](./agent/verify.md))

Real command output required (or documented blocker). No fabricated pass/fail counts.

---

## Outputs

| Format | Path |
|--------|------|
| **Markdown** | `Task/agents/Basics/B3/proof/test-discovery-report.md` |
| **Website** | `Task/agents/Basics/B3/agent/test-discovery-site/` → http://localhost:3000 |

### Markdown report includes

- Framework table (version, config, runner script, coverage tool)
- Test file table + directory tree
- Exact commands with prerequisites
- Command results (exit code, duration, raw output)
- Failures & interpretation table
- Recommended next steps
- Mermaid: test type distribution, CI → command flow

---

## Framework detection signals

| Stack | Config | Patterns |
|-------|--------|----------|
| JS/TS | `jest.config.*`, `vitest.config.*` | `*.spec.ts`, `__tests__/` |
| Java | `pom.xml`, `build.gradle` | `*Test.java`, `src/test/` |
| Flutter | `pubspec.yaml` | `test/`, `integration_test/` |
| Python | `pytest.ini`, `pyproject.toml` | `test_*.py`, `conftest.py` |
| Go | `go.mod` | `*_test.go` |

---

## Constraints

- Prefer **CI-equivalent** primary command
- Monorepos: per-package commands documented
- Truncate output only if > ~500 lines (keep summary + failures)
- Reports in `proof/` — not inside analyzed repo

---

## Cursor skill

| Slash command | Skill file |
|---------------|------------|
| `/basics-test-discovery` | `.cursor/skills/basics-test-discovery/SKILL.md` |

---

## File layout

```
Basics/B3/
├── README.md
├── agent/
│   ├── agent.md
│   ├── planning.md
│   ├── execute.md
│   └── verify.md
└── proof/
    └── test-discovery-report.md    ← sample (Medusa / Jest)
```

---

## Known blockers (document honestly)

- Missing `node_modules` / failed `yarn install`
- TLS/proxy certificate errors
- Integration tests needing Postgres, Redis, Docker
- Wrong Node/Java version vs repo engines
