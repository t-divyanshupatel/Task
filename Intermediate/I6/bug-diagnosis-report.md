# Bug Diagnosis Report

## Metadata

| Field | Value |
|-------|-------|
| **Agent name** | repo-seeded-bug-diagnosis |
| **Started at** | 2026-06-16T13:51:05Z |
| **Completed at** | 2026-06-16T13:52:41Z |
| **Duration** | 1m 36s |
| **Repository** | `/Users/divyanshupatel/Desktop/mf/rabbit` |
| **Repo name** | rabbit |
| **Branch** | main (uncommitted) |
| **Stack detected** | Node.js (ESM) + Express.js backend, React 18 + Vite frontend, MongoDB/Mongoose |
| **Symptom** | Invalid JWT tokens cause `isAuthenticated` middleware to hang — no HTTP response sent |
| **Root cause file** | `backend/middlewares/isAuthenticated.js:22-24` |
| **Fix status** | FIXED |
| **Verification result** | PASS |

## Summary

The `isAuthenticated` JWT middleware guards all protected LMS API routes (courses, profile, purchases, progress). When `jwt.verify` throws on a malformed or expired token, the `catch` block only called `console.log(error)` and returned nothing. Express therefore never sent a response, leaving clients waiting indefinitely. The fix returns a `401` JSON body (`Invalid token`, `success: false`) from the catch path, matching the other auth error responses. A colocated unit test (`backend/middlewares/isAuthenticated.test.js`) reproduces the failure on invalid tokens; all 3 tests pass after the fix.

## Expected vs actual

| | Description |
|---|-------------|
| **Expected** | Malformed or expired JWT cookies should receive `401` with `{ message: 'Invalid token', success: false }`, same as other auth failures |
| **Actual (before fix)** | `jwt.verify` throws → catch logs to stdout → `res.status` never called → client hangs with no response body |
| **Symptom source** | inferred (from code inspection + failing test on reverted committed version) |

## Reproduction steps

1. `cd /Users/divyanshupatel/Desktop/mf/rabbit`
2. Ensure dependencies are installed: `npm install` (from root `package.json`)
3. Restore the buggy committed version: `git checkout HEAD -- backend/middlewares/isAuthenticated.js`
4. Run the auth middleware unit test:

### Reproduction command

```bash
node --test backend/middlewares/isAuthenticated.test.js
```

### Before-fix output

```
TAP version 13
# JsonWebTokenError: jwt malformed
#     at module.exports [as verify] (.../node_modules/jsonwebtoken/verify.js:70:17)
#     at isAuthenticated (.../backend/middlewares/isAuthenticated.js:13:30)
#     at TestContext.<anonymous> (.../backend/middlewares/isAuthenticated.test.js:55:9)
# Subtest: returns 401 when token cookie is missing
ok 1 - returns 401 when token cookie is missing
# Subtest: returns 401 when token is invalid
not ok 2 - returns 401 when token is invalid
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly equal:
    
    undefined !== 401
  expected: 401
# Subtest: calls next and sets req.id when token is valid
ok 3 - calls next and sets req.id when token is valid
# tests 3
# pass 2
# fail 1
```

### Reproduction result

reproduced — invalid-token test fails with `undefined !== 401` because no response is sent from the catch block

## Root cause

### Explanation

`isAuthenticated` wraps `jwt.verify` in a try/catch. Missing tokens and null decode results are handled with explicit `401` returns. However, when `jwt.verify` throws (malformed token, wrong signature, expired token), execution enters the `catch` block which only logs the error. Because there is no `return res.status(...).json(...)` and `next()` is not called, the middleware chain stops without terminating the HTTP request. In production this manifests as a hung request on any protected route when the `token` cookie is invalid.

### Primary defect

| Field | Value |
|-------|-------|
| **File** | `backend/middlewares/isAuthenticated.js` |
| **Line(s)** | `22–24` |
| **Defect type** | missing-guard |

### Defective code (before)

```javascript
  } catch (error) {
    console.log(error);
  }
```

**Source:** `backend/middlewares/isAuthenticated.js:22-24`

### Call path

| # | Location | Role |
|---|----------|------|
| 1 | `backend/routes/course.route.js:7` | Example protected route — `POST /api/v1/course` |
| 2 | `backend/middlewares/isAuthenticated.js:5` | Reads `req.cookies.token` |
| 3 | `backend/middlewares/isAuthenticated.js:13` | Calls `jwt.verify(token, SECRET_KEY)` |
| 4 | `backend/middlewares/isAuthenticated.js:22` | **Defect** — catch logs only; no `res` response or `next()` |

## Minimal fix

### Rationale

Return the same `401` JSON shape already used for missing-token and null-decode cases. This is a 3-line production change inside the existing catch block — no new dependencies, no route changes, no refactors.

### Files changed

| # | File | Change |
|---|------|--------|
| 1 | `backend/middlewares/isAuthenticated.js` | Return `401` JSON from catch instead of only logging |
| 2 | `backend/middlewares/isAuthenticated.test.js` | Colocated unit tests (3 cases) — pre-existing untracked file |

### Diff

```diff
diff --git a/backend/middlewares/isAuthenticated.js b/backend/middlewares/isAuthenticated.js
index df9a9b3..131b23a 100644
--- a/backend/middlewares/isAuthenticated.js
+++ b/backend/middlewares/isAuthenticated.js
@@ -20,7 +20,10 @@ const isAuthenticated = async (req, res, next) => {
     req.id = decode.userId;
     next();
   } catch (error) {
-    console.log(error);
+    return res.status(401).json({
+      message: 'Invalid token',
+      success: false,
+    });
   }
 };
```

### Fixed code (after)

```javascript
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid token',
      success: false,
    });
  }
```

**Source:** `backend/middlewares/isAuthenticated.js:22-27`

## Verification

### Command

```bash
node --test backend/middlewares/isAuthenticated.test.js
```

### Exit code

0

### After-fix output

```
TAP version 13
# Subtest: returns 401 when token cookie is missing
ok 1 - returns 401 when token cookie is missing
# Subtest: returns 401 when token is invalid
ok 2 - returns 401 when token is invalid
# Subtest: calls next and sets req.id when token is valid
ok 3 - calls next and sets req.id when token is valid
# tests 3
# pass 3
# fail 0
```

### Before vs after

| Check | Before | After |
|-------|--------|-------|
| Test `returns 401 when token is invalid` | FAIL — `undefined !== 401` | PASS |
| Exit code | 1 | 0 |
| Invalid-token HTTP behavior | No response sent (hang) | `401` + `{ message: 'Invalid token', success: false }` |

### Interpretation

The same test command that failed before now passes all 3 cases. This proves the catch path returns a proper `401` for invalid JWTs. Only the middleware unit tests were run — not the full backend suite (no `npm test` script exists at root despite README claim).

## Agent suggested vs manually verified

| Item | Agent suggested / verified | Manually verified |
|------|---------------------------|-------------------|
| Bug is reproduced | yes — reverted to `HEAD`, test 2 failed with `undefined !== 401` | pending |
| Root cause is correct | yes — `backend/middlewares/isAuthenticated.js:22-24` | pending |
| Fix is minimal and targeted | yes — 3 lines changed in catch block only | pending |
| Verification command proves fix | yes — `node --test backend/middlewares/isAuthenticated.test.js` exit 0 | pending |
| No unrelated files changed | yes — only `isAuthenticated.js` modified; test file is new but scoped | pending |
| Safe to merge | yes — low blast radius, consistent with existing 401 patterns | pending |

### What the agent verified

- Read `README.md` and root `package.json` — confirmed Node/Express stack; `npm test` script missing
- Reverted `isAuthenticated.js` to committed `HEAD` and reproduced failure via `node --test`
- Traced protected routes in `backend/routes/*.route.js` — all use `isAuthenticated`
- Applied minimal catch-block fix and re-ran tests — 3/3 pass
- Captured `git diff` for production file

### What requires human verification

- End-to-end HTTP test with running server + invalid cookie via curl/Postman
- Full regression across all protected routes (`/api/v1/course`, `/api/v1/user/profile`, etc.)
- Behavior with expired (not just malformed) JWT tokens in a live environment
- Whether `npm test` script should be added to root `package.json` per README

## Risk assessment

| Dimension | Rating | Rationale |
|-----------|--------|-----------|
| Blast radius | medium | Middleware guards ~15 protected routes across 4 route files |
| Fix confidence | high | Root cause directly observable in catch block; test proves behavior |
| Test confidence | medium | 3 unit tests cover missing/invalid/valid paths; no integration tests |
| Regression risk | low | Fix aligns with existing 401 response pattern; valid-token path unchanged |

**Overall risk:** low — The change only affects the error path for invalid JWTs and returns the same response shape already used elsewhere in the middleware. Valid authentication flow is untouched.

## Discovery notes

### Files examined

- `README.md` — stack overview; claims `npm test` but no script defined
- `package.json` — root scripts: `dev`, `build`, `start` only
- `backend/middlewares/isAuthenticated.js` — primary defect
- `backend/middlewares/isAuthenticated.test.js` — reproduction + verification tests
- `backend/routes/course.route.js` — confirms middleware usage on course endpoints
- `backend/routes/user.route.js` — profile routes guarded
- `backend/routes/purchaseCourse.route.js` — purchase routes guarded
- `backend/routes/courseProgress.route.js` — progress routes guarded
- `backend/controllers/courseProgress.controller.js` — secondary logic bug noted below

### Secondary issues (not fixed)

- `backend/controllers/courseProgress.controller.js:52` — `if(!lectureIndex !== -1)` is a logic bug due to operator precedence (`(!lectureIndex) !== -1` is always true when index ≥ 0 and incorrectly true when index is -1). Should likely be `if (lectureIndex !== -1)`. Out of scope for this diagnosis.
- `backend/controllers/course.controller.js:11` — validation error returns `success: true` on 400 response
- Root `package.json` lacks `test` script despite README documentation

### Ambiguities

- No `BUG.md` or explicit seeded-bug marker in repo; symptom inferred from middleware catch-block behavior
- README documents `JWT_SECRET` env var but code uses `SECRET_KEY` — not the primary bug but inconsistent docs

## Known limitations

- Reproduction used unit tests with mocked `req`/`res`, not a live Express server
- MongoDB not required for this middleware test
- `npm test` at root still fails (`Missing script: "test"`)

## Blocked

N/A — diagnosis and fix completed successfully.
