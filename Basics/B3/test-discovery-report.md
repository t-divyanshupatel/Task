# Test Discovery Report

## Metadata

| Field | Value |
|-------|-------|
| **Agent name** | repo-test-discovery |
| **Started at** | 2026-06-16T13:42:27Z |
| **Completed at** | 2026-06-16T13:42:54Z |
| **Duration** | 27s |
| **Repository** | /Users/divyanshupatel/Desktop/mf/rabbit |
| **Repo name** | rabbit (Learning Management System) |
| **Stack detected** | Node.js 18.20.8 / Express 4 + MongoDB (backend); React 18 + Vite 6 + Redux Toolkit + Tailwind CSS (frontend) |
| **Scope** | full repo |
| **Tests executed** | yes |
| **Test files found** | 0 |
| **Frameworks found** | 0 (Jest documented in README but not installed or configured) |

## Summary

The **rabbit** repository is a full-stack LMS with a Node.js/Express backend (`backend/`, 21 source files) and a React/Vite frontend (`frontend/src/`, 60 source files). Despite the README claiming Jest-based backend API unit tests via `npm test`, **no test framework is installed**, **no test script exists** in either `package.json`, and **zero test files** were found anywhere in the repo. The primary documented command (`npm test`) fails immediately with `Missing script: "test"`. Running Jest via `npx jest` (framework default) also finds no tests across 91 non-node_modules files. The only automated quality check available is ESLint in the frontend (`npm run lint`), which reports 174 errors and 16 warnings but is not a test runner.

## Test Framework & Configuration

| Framework | Version | Config file(s) | Test runner / script | Coverage tool |
|-----------|---------|----------------|----------------------|---------------|
| Jest (documented only) | not installed | none | `npm test` (README only — script missing) | none |
| ESLint (lint, not tests) | 9.17.0 | `frontend/eslint.config.js` | `npm run lint` (frontend) | none |

### Config file details

#### `frontend/eslint.config.js`

- Flat ESLint config for `**/*.{js,jsx}` files
- Plugins: `@eslint/js`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Ignores `dist/` directory
- Browser globals via `globals.browser`; Node globals not configured for config files
- Not a test framework; used for static analysis only

#### Jest (expected per README, absent in repo)

- README.md lines 68–74 reference Jest and `npm test` for backend API unit tests
- No `jest.config.*` file present
- Jest is not listed in root or frontend `devDependencies`
- No `test` script in root `package.json` or `frontend/package.json`

## Relevant Test Files

| # | Path | Type | Framework | Tests |
|---|------|------|-----------|-------|
| — | *(none found)* | — | — | — |

**Total test files: 0**

### By directory

```
rabbit/
├── backend/          (0 test files — 21 .js files: controllers, routes, models, middleware)
├── frontend/src/       (0 test files — 60 .js/.jsx files: components and pages)
└── (no test/, __tests__/, e2e/, or *.test.* files anywhere)
```

Searched patterns: `**/*.{test,spec}.{js,ts,jsx,tsx}`, `**/__tests__/**`, `**/test/**`, `**/*Test.java`, `**/jest.config.*`, `describe(` / `it(` usage in source (excluding `node_modules`).

## Exact Commands

| # | Command | Purpose | Working dir | Source |
|---|---------|---------|-------------|--------|
| 1 | `npm test` | Run unit tests (documented) | `/Users/divyanshupatel/Desktop/mf/rabbit` | README.md:68–73 |
| 2 | `npx jest` | Jest default runner (no config) | `/Users/divyanshupatel/Desktop/mf/rabbit` | Framework default (README implies Jest) |
| 3 | `npm run lint` | ESLint static analysis (frontend) | `/Users/divyanshupatel/Desktop/mf/rabbit/frontend` | `frontend/package.json:scripts.lint` |

### Prerequisites

- **Node.js** v18.20.8 and **npm** v10.8.2 (verified at runtime)
- Root: `npm install` (161 packages; already installed)
- Frontend: `npm install --prefix frontend` or `cd frontend && npm install`
- Backend runtime for manual/API testing: MongoDB (`MONGO_URI`), JWT secret (`JWT_SECRET`) in `.env` — not required for test discovery but needed for `npm run dev`
- No CI configuration found (no `.github/workflows/`, `.gitlab-ci.yml`, etc.)

## Command Results

### Run 1 — Primary: `npm test` (README-documented)

| Field | Value |
|-------|-------|
| **Command** | `npm test` |
| **Exit code** | 1 |
| **Duration** | ~0.6s |
| **Result** | ERROR |

```
npm error Missing script: "test"
npm error
npm error To see a list of scripts, run:
npm error   npm run
```

### Run 2 — Jest default: `npx jest`

| Field | Value |
|-------|-------|
| **Command** | `npx --yes jest` |
| **Exit code** | 1 |
| **Duration** | ~9s (includes on-demand Jest install) |
| **Result** | ERROR (no tests found) |

```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /Users/divyanshupatel/Desktop/mf/rabbit
  91 files checked.
  testMatch: **/__tests__/**/*.?([mc])[jt]s?(x), **/?(*.)+(spec|test).?([mc])[jt]s?(x) - 0 matches
  testPathIgnorePatterns: /node_modules/ - 91 matches
  testRegex:  - 0 matches
Pattern:  - 0 matches
```

### Run 3 — Optional: frontend ESLint

| Field | Value |
|-------|-------|
| **Command** | `npm run lint` |
| **Exit code** | 1 |
| **Duration** | ~2.2s |
| **Result** | FAILED (lint errors, not test failures) |

```
✖ 190 problems (174 errors, 16 warnings)
```

Output truncated in report (190 lines). Representative issues:

- `no-unused-vars`: unused `React` imports across many JSX files
- `react/prop-types`: missing PropTypes on component props
- `react-hooks/exhaustive-deps`: missing hook dependencies
- `no-undef` in `tailwind.config.js` and `vite.config.js` (Node globals not configured for ESLint)

## Failures & Interpretation

No test assertions ran — the repository has **no automated tests**. Failures below are **infrastructure/documentation gaps**, not test assertion failures.

| # | Test / Error | File | Classification | Interpretation |
|---|--------------|------|----------------|----------------|
| 1 | `Missing script: "test"` | `package.json` (root) | env/config | README documents `npm test` but the root `package.json` has no `test` script and no Jest dependency. Documentation is out of sync with the codebase. |
| 2 | `No tests found, exiting with code 1` | repo root | missing dependency / config | Jest is not installed or configured; zero `*.test.js` / `*.spec.js` / `__tests__/` files exist. README claim of Jest unit tests is aspirational or removed. |
| 3 | ESLint 190 problems | `frontend/src/**` | env/config (lint) | Frontend has ESLint configured but widespread rule violations. This is static analysis, not unit/integration testing. |

### Recommended next steps

1. **Align README with reality** — Remove or update the Testing section; currently it misleads developers into expecting `npm test` to work.
2. **Add Jest (or Vitest) to the backend** — Install `jest` + `supertest` as devDependencies, add a `test` script, create `jest.config.js` (or use `"type": "module"` compatible setup), and write API tests under `backend/__tests__/` or `backend/tests/`.
3. **Add frontend tests** — Consider Vitest (pairs well with Vite) + React Testing Library; add `test` script to `frontend/package.json`.
4. **Add CI** — No CI config exists; add a workflow that runs `npm test` (once tests exist) and optionally `npm run lint`.
5. **Manual testing** — README correctly notes Postman/frontend manual testing as the current approach until automated tests are added.

## Discovery Notes

### Files examined

- `README.md` — setup, testing claims (`npm test` + Jest), tech stack
- `package.json` (root) — scripts: `dev`, `build`, `start` only; no test deps
- `frontend/package.json` — scripts: `dev`, `build`, `lint`, `preview`; no test deps
- `frontend/eslint.config.js` — ESLint flat config
- `frontend/vite.config.js` — Vite + React plugin
- `backend/` — 21 source files (controllers, routes, models, middleware); no test directory
- CI configs — none found (`.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`, etc.)

### Ambiguities & gaps

- README states "Run unit tests for backend APIs using Jest" but no Jest setup or test files exist — likely planned but never implemented, or removed without updating docs.
- No `supertest`, `mongodb-memory-server`, or test database configuration for isolated API testing.
- Frontend has no Vitest/Jest/RTL/Cypress/Playwright setup.
- Manual testing via Postman is the only documented alternative; no Postman collection found in repo.

### CI vs local differences

- No CI configuration detected — nothing to compare against local commands.
