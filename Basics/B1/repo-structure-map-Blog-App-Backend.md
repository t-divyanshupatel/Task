# Repo Structure Map Report

## Metadata

| Field | Value |
|-------|-------|
| **Agent name** | repo-structure-mapper |
| **Started at** | 2026-06-16T12:00:00.000Z |
| **Completed at** | 2026-06-16T12:02:15.000Z |
| **Duration** | 2m 15s |
| **Repository** | https://github.com/Harikrish58/Blog-App-Backend |
| **Repo name** | Blog-App-Backend (backend_blog / DevHub Backend) |
| **Stack detected** | Node.js (ES modules) + Express 5 + MongoDB/Mongoose 8 |
| **Scope** | full repo |
| **Files scanned** | 13 |
| **Symbols found** | 22 |
| **Controllers** | 9 |
| **Services** | 0 |
| **Repositories** | 0 |
| **Models** | 2 |
| **Jobs** | 0 |
| **Consumers** | 0 |
| **Configs** | 2 |
| **Utilities** | 2 |
| **Classes** | 0 |
| **Interfaces** | 0 |

## Summary

[Blog-App-Backend](https://github.com/Harikrish58/Blog-App-Backend) is a small MERN-style REST API for the DevHub blog app. It uses a flat Express folder layout: `Routers/` wire HTTP paths, `Controllers/` hold request handlers, `Models/` define Mongoose schemas, and `Middleware/` provides JWT auth. There is no dedicated service or repository layer — controllers call Mongoose models directly. Auth covers email/password registration, sign-in, and Google OAuth (Firebase profile data passed from client). Post management is admin-gated for create/delete; search is supported on list. Two GET post routes are wired without auth middleware despite README marking them protected.

## Architecture Overview

Single-package Express app with functional controllers (no TypeScript, no class-based services). Entry point `index.js` loads env, connects MongoDB, mounts three routers under `/api/auth`, `/api/user`, and `/api/post`.

```
Blog-App-Backend/
├── index.js              → app bootstrap, CORS, global error handler
├── Routers/              → Express routers (HTTP wiring)
│   ├── authRouter.js
│   ├── userRouter.js
│   └── postRouter.js
├── Controllers/          → request handlers (business + DB access)
│   ├── authControllers.js
│   ├── userController.js
│   └── postControllers.js
├── Models/               → Mongoose schemas (model + persistence)
│   ├── userModel.js
│   └── postModel.js
├── Middleware/           → JWT verification
│   └── MiddleWare.js
├── Database/             → MongoDB connection
│   └── config.js
└── Utils/                → shared helpers
    └── Error.js
```

## Controllers

| # | Name | Package / Module | File | Description | Key dependencies | Notes |
|---|------|------------------|------|-------------|------------------|-------|
| 1 | registerUser | Controllers/authControllers | Controllers/authControllers.js:11 | Register new user with hashed password | User, bcryptjs, validator, errorHandler | Public |
| 2 | signinUser | Controllers/authControllers | Controllers/authControllers.js:47 | Email/password login; returns JWT | User, bcryptjs, jwt, errorHandler | Public |
| 3 | googleAuth | Controllers/authControllers | Controllers/authControllers.js:89 | Google OAuth sign-in or auto-register | User, bcryptjs, jwt, errorHandler | Public; expects email, name, picture from client |
| 4 | createPost | Controllers/postControllers | Controllers/postControllers.js:5 | Create blog post (admin only) | Post, errorHandler | Checks req.user.isAdmin |
| 5 | getAllPosts | Controllers/postControllers | Controllers/postControllers.js:43 | List posts with optional search query | Post, errorHandler | Regex search on title, content, category |
| 6 | getPostById | Controllers/postControllers | Controllers/postControllers.js:75 | Fetch single post by ID | Post, errorHandler | — |
| 7 | deletePost | Controllers/postControllers | Controllers/postControllers.js:97 | Delete post by ID (admin only) | Post, errorHandler | Wired in router but not in README table |
| 8 | updateUser | Controllers/userController | Controllers/userController.js:6 | Update own profile (username, email, password, picture) | User, bcryptjs, errorHandler | Self-only via req.params.id === req.user.id |
| 9 | deleteUser | Controllers/userController | Controllers/userController.js:80 | Delete own account | User, errorHandler | Self-only |

### Route modules (Express routers)

| # | Name | Package / Module | File | Description | Key dependencies | Notes |
|---|------|------------------|------|-------------|------------------|-------|
| 1 | authRoute | Routers/authRouter | Routers/authRouter.js:8 | Auth endpoints under `/api/auth` | registerUser, signinUser, googleAuth | 3 POST routes |
| 2 | userRoute | Routers/userRouter | Routers/userRouter.js:5 | User profile endpoints under `/api/user` | middleware, updateUser, deleteUser | All routes protected |
| 3 | postRoute | Routers/postRouter | Routers/postRouter.js:10 | Post CRUD under `/api/post` | middleware, postControllers | Partial auth — see discovery notes |

## Services

_No dedicated service layer found. Business logic lives in controller functions._

## Repositories

_No separate repository/DAO layer. Mongoose models (`User`, `Post`) are used directly from controllers._

## Models

| # | Name | Package / Module | File | Description | Key dependencies | Notes |
|---|------|------------------|------|-------------|------------------|-------|
| 1 | User | Models/userModel | Models/userModel.js:52 | User document schema | mongoose | Fields: username, email, password, profilePicture, isAdmin; timestamps |
| 2 | Post | Models/postModel | Models/postModel.js:53 | Blog post document schema | mongoose | Fields: title, content, image, category (enum); indexed title/content |

## Jobs

_No scheduled jobs or background workers found._

## Consumers

_No message/event consumers found._

## Configs

| # | Name | Package / Module | File | Description | Notes |
|---|------|------------------|------|-------------|-------|
| 1 | connectDB | Database/config | Database/config.js:12 | MongoDB connection via Mongoose | Uses `process.env.MONGODB_URL` |
| 2 | app bootstrap | — | index.js:10 | Express app, CORS, JSON/cookie parsers, route mounting, global error handler | CORS origins: devhub-blogapp.netlify.app, localhost:5173; PORT from env |

## Utilities

| # | Name | Package / Module | File | Description | Notes |
|---|------|------------------|------|-------------|-------|
| 1 | errorHandler | Utils/Error | Utils/Error.js:2 | Creates Error with statusCode and message | Used across controllers and middleware |
| 2 | middleware | Middleware/MiddleWare | Middleware/MiddleWare.js:8 | JWT verification for protected routes | Bearer token or `token` header; sets req.user |

## Classes

_No ES6/JavaScript class definitions found. Application uses exported functions and Mongoose models._

## Interfaces

_No TypeScript interfaces or explicit contract types (plain JavaScript repo)._

## Layer Relationships

| From | To | Relationship | Confidence |
|------|-----|--------------|------------|
| index.js | connectDB | calls | explicit |
| index.js | authRoute, userRoute, postRoute | mounts | explicit |
| authRouter | registerUser, signinUser, googleAuth | routes to | explicit |
| userRouter | middleware → updateUser, deleteUser | routes to | explicit |
| postRouter | middleware → createPost, deletePost | routes to | explicit |
| postRouter | getAllPosts, getPostById | routes to (no middleware) | explicit |
| authControllers | User | queries via Mongoose | explicit |
| userController | User | queries via Mongoose | explicit |
| postControllers | Post | queries via Mongoose | explicit |
| middleware | errorHandler, jwt | uses | explicit |

## Discovery notes

### Files examined
- `package.json` — stack, dependencies, scripts (`start`, `dev`)
- `README.md` — feature list, API route overview, tech stack
- `index.js` — app entry, middleware chain, route mounting
- `Controllers/authControllers.js` — auth handlers
- `Controllers/postControllers.js` — post CRUD handlers
- `Controllers/userController.js` — user update/delete handlers
- `Routers/authRouter.js`, `Routers/userRouter.js`, `Routers/postRouter.js` — HTTP routing
- `Models/userModel.js`, `Models/postModel.js` — Mongoose schemas
- `Database/config.js` — DB connection
- `Middleware/MiddleWare.js` — JWT auth middleware
- `Utils/Error.js` — error factory

### Excluded from scan
- `node_modules/` — not present (not installed)
- `package-lock.json` — lockfile only
- `setShowModal(false)}`, `setShowModal(true)}` — stray filenames in repo root (not JavaScript source)

### Ambiguities & gaps
- `getAllPosts` and `getPostById` routes in `postRouter.js` are **not** wrapped with `middleware`, while README lists them as protected (✅).
- `deletePost` exists in controller and router (`DELETE /api/post/:id`) but is omitted from README API table.
- No `.env.example` in repo — required vars inferred from code: `MONGODB_URL`, `JWT_SECRET_KEY`, `PORT`.
- Firebase is mentioned in README for Google OAuth and image URLs, but no Firebase SDK usage in backend — client sends profile data to `/api/auth/googleauth`.
- No tests, CI config, or OpenAPI spec present.

### Recommendations
- Add a service layer if business logic grows beyond thin controllers.
- Apply `middleware` consistently to all routes documented as protected.
- Add `.env.example` documenting `MONGODB_URL`, `JWT_SECRET_KEY`, and `PORT`.
- Remove or relocate stray root files (`setShowModal(true)}`, etc.).
- Add `deletePost` to README if it is an intentional public API surface.
