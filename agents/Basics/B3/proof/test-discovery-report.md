# Test Discovery Report

## Metadata

| Field | Value |
|-------|-------|
| **Agent name** | repo-test-discovery |
| **Started at** | 2026-06-22T14:30:00Z |
| **Completed at** | 2026-06-22T14:48:22Z |
| **Duration** | 18m 22s |
| **Repository** | Task/medusa |
| **Repo name** | Medusa |
| **Stack detected** | TypeScript monorepo — Yarn 3.2.1 workspaces, Turbo 1.6, Node ≥20, Jest 29.7 + @swc/jest, Supertest, Vitest 3 (docs/www only) |
| **Scope** | full repo (`packages/`, `integration-tests/`; excludes `www/` docs site) |
| **Tests executed** | yes — attempted; blocked by missing `node_modules` |
| **Test files found** | 1,021 (`*.spec.ts` / `*.spec.js`, excluding `www/`) |
| **Frameworks found** | 2 primary (Jest unit/integration; Vitest in `www/` only) |
| **Primary result** | ERROR — dependencies not installed; Jest cannot run |

## Summary

Medusa uses **Jest 29.7** as the primary test runner across a Yarn workspaces monorepo orchestrated by **Turbo**. Each package has its own `jest.config.js` extending a shared `define_jest_config.js` helper (`@swc/jest` transformer, Node environment). Tests split into **~540 unit specs** under `__tests__/`, **~111 module integration specs**, and **~185 top-level integration-tests** (HTTP/API/modules). The root `yarn test` runs `turbo run test` across all workspaces. **Tests could not execute** in this environment: `yarn install` failed with TLS certificate errors and `node_modules` is absent, so Jest reports missing `@swc/jest` and Yarn refuses to run scripts.

## Test Framework & Configuration

| Framework | Version | Config file(s) | Test runner / script | Coverage tool |
|-----------|---------|----------------|----------------------|---------------|
| Jest | ^29.7.0 | `jest.config.js`, `define_jest_config.js`, per-package `jest.config.js` (69 files) | `yarn test`, `yarn jest`, per-package `yarn test` | Optional via `GENERATE_JEST_REPORT` env (jest-junit commented out) |
| @swc/jest | ^0.2.36 | `define_jest_config.js` | Used as Jest `transform` for TS/decorators | — |
| Turbo | ^1.6.3 | — (orchestrator) | `yarn test` → `turbo run test` | — |
| Supertest | ^7.1.4 | — | HTTP integration tests in `integration-tests/http` | — |
| Vitest | ^3.0.5 | — (root devDep; used in `www/` apps) | `vitest` in `www/packages/docs-ui` | `@vitest/coverage-v8` |
| Storybook | ^8.3.5 | `.storybook/` configs | Component dev/testing (not CI unit runner) | Chromatic (devDep) |

### Config file details

#### `Task/medusa/jest.config.js`

- Multi-project Jest config: loads all `packages/*/jest.config.js`, `packages/core/*/`, `packages/modules/*/`, `packages/modules/providers/*/`.
- Ignores `dist/`, `__fixtures__/`, `examples/`.
- Coverage collected from `src/**/*.js` when `GENERATE_JEST_REPORT` is set.

#### `Task/medusa/define_jest_config.js`

- Shared factory for package-level configs.
- `@swc/jest` transform with TypeScript + legacy decorators + decorator metadata.
- `testEnvironment: node`; ignores `dist/`, `node_modules/`, `__fixtures__/`, `__mocks__/`.

#### `Task/medusa/integration-tests/jest.config.js`

- Aggregates `integration-tests/api`, `http`, `plugins`, `repositories` sub-projects.
- `setupFiles`: `integration-tests/setup-env.js`; `setupFilesAfterEnv`: `integration-tests/setup.js`.
- `testTimeout: 10000`; requires PostgreSQL/Redis for many HTTP tests.

#### `Task/medusa/packages/modules/auth/jest.config.js` (representative package)

- Extends `defineJest_config.js` with module path aliases (`@models`, `@services`, etc.).
- Package script: `jest --bail --passWithNoTests --forceExit --testPathPattern=src` (unit).
- Integration script: `jest --testPathPattern="integration-tests/__tests__/.*\.ts"`.

### Framework distribution

```mermaid
pie title Test files by area (excluding www/)
    "Unit (__tests__/*.spec.ts)" : 540
    "Top-level integration-tests/" : 185
    "Module integration-tests/" : 111
    "Other *.spec.ts/js" : 185
```

```mermaid
flowchart LR
  subgraph Commands["Root scripts"]
    YT[yarn test]
    YTC[yarn test:chunk]
    YIH[yarn test:integration:http]
  end
  subgraph Orchestration["Orchestration"]
    TB[Turbo]
    JK[Jest per-package]
  end
  subgraph Config["Config"]
    DJC[define_jest_config.js]
    SWC[@swc/jest]
  end
  YT --> TB --> JK
  YTC --> TB
  DJC --> SWC --> JK
  YIH --> JK
```

## Relevant Test Files

> 1,021 spec files found (excluding `www/`). Top directories below; representative samples listed.

### Count by directory

| Directory | Spec files |
|-----------|------------|
| `packages/core/utils/src/common/__tests__/` | 43 |
| `packages/core/utils/src/dml/__tests__/` | 18 |
| `integration-tests/modules/__tests__/order/workflows/` | 10 |
| `integration-tests/modules/__tests__/link-modules/` | 10 |
| `packages/modules/order/integration-tests/__tests__/` | 9 |
| `packages/core/framework/src/http/__tests__/` | 9 |
| `integration-tests/http/__tests__/` | ~80+ (across admin/store/http) |
| `packages/modules/*/src/**/__tests__/` | ~400+ (all commerce modules) |

### Representative test files

| # | Path | Type | Framework | Tests |
|---|------|------|-----------|-------|
| 1 | `packages/modules/auth/src/utils/__tests__/verification-token.spec.ts` | unit | Jest | Auth verification token hash/TTL utils |
| 2 | `packages/modules/auth/integration-tests/__tests__/auth-module-service/` | integration | Jest | AuthModuleService with DB |
| 3 | `packages/modules/cart/src/**/__tests__/` | unit | Jest | Cart module business logic |
| 4 | `packages/modules/order/integration-tests/__tests__/` | integration | Jest | Order module service + workflows |
| 5 | `packages/core/utils/src/dml/__tests__/` | unit | Jest | DML entity builder |
| 6 | `packages/core/framework/src/http/__tests__/` | unit | Jest | HTTP router/middleware |
| 7 | `packages/core/core-flows/src/**/__tests__/` | unit | Jest | Workflow steps |
| 8 | `integration-tests/http/__tests__/product/admin/` | integration | Jest + Supertest | Admin product HTTP API |
| 9 | `integration-tests/http/__tests__/order/admin/` | integration | Jest + Supertest | Admin order HTTP API |
| 10 | `integration-tests/modules/__tests__/cart/store/` | integration | Jest | Store cart module flows |
| 11 | `integration-tests/api/` | integration | Jest | Legacy API integration suite |
| 12 | `packages/medusa/src/**/__tests__/` | unit | Jest | Main app routes, loaders |
| 13 | `packages/eslint-plugin/src/rules/**/__tests__/` | unit | Jest | Custom ESLint rule tests |
| 14 | `packages/cli/create-medusa-app/` | unit | Jest | CLI scaffolding |
| 15 | `packages/design-system/icons/src/components/__tests__/` | unit | Jest + RTL | Icon components |

### By directory tree

```
Task/medusa/
├── packages/
│   ├── core/
│   │   ├── utils/src/**/__tests__/          # DML, DAL, common utils (largest unit cluster)
│   │   ├── framework/src/http/__tests__/    # HTTP layer
│   │   └── core-flows/src/**/__tests__/     # Workflow unit tests
│   ├── modules/
│   │   └── {auth,cart,order,...}/
│   │       ├── src/**/__tests__/            # Per-module unit tests
│   │       └── integration-tests/__tests__/ # Module DB integration
│   └── medusa/src/**/__tests__/             # App-level tests
└── integration-tests/
    ├── http/__tests__/                      # HTTP API integration (Supertest)
    ├── modules/__tests__/                     # Cross-module integration
    └── api/__tests__/                         # API integration suite
```

## Exact Commands

| # | Command | Purpose | Working dir | Source |
|---|---------|---------|-------------|--------|
| 1 | `yarn install` | Install all workspace dependencies | `Task/medusa/` | Required prerequisite; Yarn 3 workspace |
| 2 | `yarn test` | Run all unit tests across monorepo via Turbo | `Task/medusa/` | `package.json:scripts.test` |
| 3 | `yarn test:chunk` | Run unit tests in CI chunks (parallel jobs) | `Task/medusa/` | `package.json:scripts.test:chunk` + `scripts/run-workspace-unit-tests-in-chunks.sh` |
| 4 | `yarn jest` | Run root multi-project Jest directly | `Task/medusa/` | `package.json:scripts.jest` |
| 5 | `yarn workspace @medusajs/auth test` | Auth module unit tests only | `Task/medusa/` | `packages/modules/auth/package.json:scripts.test` |
| 6 | `yarn workspace @medusajs/auth test:integration` | Auth module integration tests | `Task/medusa/` | `packages/modules/auth/package.json:scripts.test:integration` |
| 7 | `yarn test:integration:http` | HTTP integration test suite | `Task/medusa/` | `package.json:scripts.test:integration:http` |
| 8 | `yarn test:integration:modules` | Modules integration test suite | `Task/medusa/` | `package.json:scripts.test:integration:modules` |
| 9 | `yarn test:integration:api` | API integration test suite | `Task/medusa/` | `package.json:scripts.test:integration:api` |
| 10 | `cd packages/modules/auth && ../../../node_modules/.bin/jest --testPathPattern=verification-token` | Single-file scoped unit test | `packages/modules/auth/` | Derived from package test script |

### Prerequisites

- **Node.js ≥ 20** (per `@medusajs/auth` engines; repo uses Node 20+ APIs)
- **Yarn 3.2.1** (Berry; `.yarnrc.yml` in repo)
- **`yarn install`** must succeed before any test command
- **Integration tests** typically need PostgreSQL, Redis, and env from `integration-tests/setup-env.js`
- **CI chunking** uses `CHUNKS` + `CHUNK` env vars (see `scripts/run-workspace-unit-tests-in-chunks.sh`)

## Command Results

### Run 1 — Primary: `yarn install` (prerequisite)

| Field | Value |
|-------|-------|
| **Command** | `yarn install` |
| **Exit code** | 1 |
| **Duration** | ~21s |
| **Result** | ERROR |

```
➤ YN0001: │ RequestError: unable to get local issuer certificate
    at ClientRequest.<anonymous> (.../yarn.js:195:14361)
    ...
    at TLSSocket.onConnectSecure (node:_tls_wrap:1659:34)
➤ YN0000: Failed with errors in 21s 137ms
```

### Run 2 — Primary: `yarn test` (CI-equivalent unit test entry)

| Field | Value |
|-------|-------|
| **Command** | `yarn test` |
| **Exit code** | 1 |
| **Duration** | ~2s |
| **Result** | ERROR — cannot run without install |

```
Usage Error: Couldn't find the node_modules state file - running an install might help (findPackageLocation)

$ yarn run [--inspect] [--inspect-brk] [-T,--top-level] [-B,--binaries-only] <scriptName> ...
```

### Run 3 — Scoped: Jest on auth verification-token (via npx)

| Field | Value |
|-------|-------|
| **Command** | `npx --yes jest@29.7.0 --testPathPattern=verification-token --no-cache` |
| **Working dir** | `Task/medusa/packages/modules/auth` |
| **Exit code** | 1 |
| **Duration** | ~11s |
| **Result** | ERROR — missing @swc/jest (no node_modules) |

```
● Validation Error:

  Module @swc/jest in the transform option was not found.
         <rootDir> is: /Users/divyanshupatel/Desktop/mf/Task/medusa/packages/modules/auth

  Configuration Documentation:
  https://jestjs.io/docs/configuration
```

### Run 4 — Fallback: Node built-in test runner + tsx (not Jest)

| Field | Value |
|-------|-------|
| **Command** | `npx --yes tsx --test src/utils/__tests__/verification-token.spec.ts` |
| **Working dir** | `Task/medusa/packages/modules/auth` |
| **Exit code** | 1 |
| **Duration** | ~0.3s |
| **Result** | ERROR — Jest globals not available |

```
ReferenceError: describe is not defined
    at .../verification-token.spec.ts:7:1
```

## Failures & Interpretation

| # | Test / Error | File | Classification | Interpretation |
|---|--------------|------|----------------|----------------|
| 1 | `unable to get local issuer certificate` | `yarn install` | infrastructure / env | Yarn cannot fetch packages from npm registry due to TLS/CA trust issue on this machine. Blocks all Jest runs. |
| 2 | `Couldn't find the node_modules state file` | `yarn test` | missing dependency | Yarn Berry requires successful install before scripts run. No `.yarn/cache` link / `node_modules` present. |
| 3 | `Module @swc/jest ... was not found` | `packages/modules/auth/jest.config.js` | missing dependency | Jest config references `@swc/jest` from root devDependencies; without install, transform module is absent. |
| 4 | `describe is not defined` | `verification-token.spec.ts` | env/config | File uses Jest globals (`describe`, `it`, `expect`); Node/tsx native runner cannot execute without Jest or a Jest-compatible shim. |

**All executed test commands failed before running assertions.** No unit or integration test pass/fail counts are available until `yarn install` succeeds.

### Recommended next steps

1. Fix TLS/CA for Yarn: configure corporate proxy CA, or temporarily `export NODE_EXTRA_CA_CERTS=/path/to/ca.pem`, then re-run `yarn install` from `Task/medusa/`.
2. After install, run scoped unit tests first: `yarn workspace @medusajs/auth test` (fast feedback).
3. Run full unit suite: `yarn test` or CI-equivalent `yarn test:chunk` with `CHUNK=0`.
4. For integration tests, start PostgreSQL/Redis per Medusa docs, then `yarn test:integration:http` or `yarn test:integration:modules`.
5. Use Node ≥ 20 (repo requirement); current shell reported Node v18.20.8 for tsx fallback — upgrade if running full suite locally.

## Discovery Notes

### Files examined

- `Task/medusa/package.json` — root scripts, Jest/Vitest/Turbo versions
- `Task/medusa/jest.config.js` — multi-project Jest root
- `Task/medusa/define_jest_config.js` — shared @swc/jest transform
- `Task/medusa/integration-tests/jest.config.js` — integration test aggregator
- `Task/medusa/packages/modules/auth/package.json` — representative per-package test scripts
- `Task/medusa/packages/modules/auth/jest.config.js` — representative package Jest config
- `Task/medusa/scripts/run-workspace-unit-tests-in-chunks.sh` — CI chunk runner
- `Task/medusa/integration-tests/http/package.json` — HTTP integration Jest scripts

### Excluded from scan

- `www/` — separate docs site with Vitest (not commerce runtime tests)
- `node_modules/` — not present
- `**/__fixtures__/`, `**/__mocks__/` — fixture dirs, not test runners

### Ambiguities & gaps

- **No `.github/workflows/`** in this checkout — CI test steps inferred from `package.json` scripts and chunk script comments (GitHub Actions).
- **Full `yarn test`** runs entire monorepo; duration and resource needs are high; use workspace-scoped commands for local dev.
- **Integration tests** require external services (Postgres, Redis); not attempted without install.
- **Vitest** in root `devDependencies` appears primarily for `www/` sub-tree, not main `packages/` commerce code.

### CI vs local differences

- CI likely uses `yarn test:chunk` with `CHUNKS`/`CHUNK` env for parallel jobs (`scripts/run-workspace-unit-tests-in-chunks.sh`).
- Local quick loop: `yarn workspace @medusajs/<module> test` from repo root after `yarn install`.
- Integration CI scripts use `--filter=integration-tests-http` etc. via Turbo (`test:integration:chunk`).
