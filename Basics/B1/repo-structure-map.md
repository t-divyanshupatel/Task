# Repo Structure Map Report

## Metadata

| Field | Value |
|-------|-------|
| **Agent name** | repo-structure-mapper |
| **Started at** | 2026-06-16T13:34:30Z |
| **Completed at** | 2026-06-16T13:38:45Z |
| **Duration** | 4m 15s |
| **Repository** | /Users/divyanshupatel/Desktop/mf/rabbit |
| **Repo name** | rabbit |
| **Stack detected** | Node.js (ESM) + Express 4 + MongoDB/Mongoose 8 (backend); React 18 + Vite 6 + Redux Toolkit + Tailwind CSS + shadcn/ui (frontend) |
| **Scope** | full repo |
| **Files scanned** | 85 |
| **Symbols found** | 68 |
| **Controllers** | 26 |
| **Services** | 4 |
| **Repositories** | 0 |
| **Models** | 5 |
| **Jobs** | 0 |
| **Consumers** | 0 |
| **Configs** | 8 |
| **Utilities** | 11 |
| **Classes** | 14 |
| **Interfaces** | 0 |

## Summary

**rabbit** is a full-stack Learning Management System (LMS) with role-based access for instructors and students. The backend is a monolithic Express API under `backend/` that talks directly to MongoDB via Mongoose models — there is no separate service or repository layer. The frontend is a React SPA in `frontend/` using Redux Toolkit Query for API calls, React Router for navigation, and Tailwind/shadcn for UI. Business logic lives primarily in backend controller functions and frontend page/feature components. The app supports course CRUD, lecture video upload (Cloudinary), Stripe checkout, and course progress tracking. No scheduled jobs or message consumers were found.

## Architecture Overview

The repo is a two-package monorepo: root `package.json` runs the backend via nodemon; `frontend/` is a standalone Vite app built into `frontend/dist` and served statically by Express in production.

```
rabbit/
├── backend/
│   ├── index.js              → Express bootstrap, CORS, route mounting, static SPA
│   ├── controllers/          → HTTP handler functions (business logic)
│   ├── routes/               → Express routers wiring paths → controllers
│   ├── models/               → Mongoose schemas (persistence)
│   ├── middlewares/          → JWT cookie auth
│   ├── database/             → MongoDB connection
│   └── utils/                → Cloudinary, JWT, multer
├── frontend/
│   └── src/
│       ├── features/api/     → RTK Query API clients (services)
│       ├── features/         → authSlice (Redux state)
│       ├── redux/            → store + root reducer
│       ├── pages/            → student + admin screens
│       ├── components/       → shared UI + route guards
│       └── layout/           → MainLayout shell
└── uploads/                  → local multer temp storage
```

**Layer flow:** React pages → RTK Query APIs → Express routes → controller handlers → Mongoose models → MongoDB. Media uploads go through multer → Cloudinary. Payments go through Stripe checkout + webhook.

## Controllers

| # | Name | Package / Module | File | Description | Key dependencies | Notes |
|---|------|------------------|------|-------------|------------------|-------|
| 1 | register | backend/controllers | backend/controllers/user.controller.js:7 | User registration with bcrypt hashing | User, bcryptjs, generateToken | POST /api/v1/user/register |
| 2 | login | backend/controllers | backend/controllers/user.controller.js:44 | Authenticate user and set JWT cookie | User, bcryptjs, generateToken | POST /api/v1/user/login |
| 3 | logout | backend/controllers | backend/controllers/user.controller.js:80 | Clear auth cookie | — | GET /api/v1/user/logout |
| 4 | getUserProfile | backend/controllers | backend/controllers/user.controller.js:95 | Return authenticated user profile | User, isAuthenticated | GET /api/v1/user/profile |
| 5 | updateProfile | backend/controllers | backend/controllers/user.controller.js:119 | Update name/photo via Cloudinary | User, uploadMedia, multer | PUT /api/v1/user/profile/update |
| 6 | createCourse | backend/controllers | backend/controllers/course.controller.js:5 | Create course for instructor | Course | POST /api/v1/course |
| 7 | searchCourse | backend/controllers | backend/controllers/course.controller.js:36 | Search/filter published courses | Course | GET /api/v1/course/search |
| 8 | getPublishedCourse | backend/controllers | backend/controllers/course.controller.js:74 | List all published courses | Course | Public endpoint |
| 9 | getCreatorCourses | backend/controllers | backend/controllers/course.controller.js:96 | List courses created by logged-in user | Course | GET /api/v1/course |
| 10 | editCourse | backend/controllers | backend/controllers/course.controller.js:120 | Update course metadata/thumbnail | Course, uploadMedia | PUT /api/v1/course/:courseId |
| 11 | getCourseById | backend/controllers | backend/controllers/course.controller.js:177 | Fetch single course by ID | Course | GET /api/v1/course/:courseId |
| 12 | createLecture | backend/controllers | backend/controllers/course.controller.js:201 | Add lecture to course | Course, Lecture | POST /api/v1/course/:courseId/lecture |
| 13 | getCourseLecture | backend/controllers | backend/controllers/course.controller.js:234 | List lectures for a course | Course, Lecture | GET /api/v1/course/:courseId/lecture |
| 14 | editLecture | backend/controllers | backend/controllers/course.controller.js:258 | Update lecture title/video/preview flag | Lecture, uploadMedia | POST /api/v1/course/:courseId/lecture/:lectureId |
| 15 | removeLecture | backend/controllers | backend/controllers/course.controller.js:293 | Delete lecture and Cloudinary video | Lecture, deleteVideoFromCloudinary | DELETE /api/v1/course/lecture/:lectureId |
| 16 | getLectureById | backend/controllers | backend/controllers/course.controller.js:326 | Fetch single lecture | Lecture | GET /api/v1/course/lecture/:lectureId |
| 17 | publishCourse | backend/controllers | backend/controllers/course.controller.js:349 | Toggle course publish state | Course | PATCH /api/v1/course/:courseId |
| 18 | mediaCourseLecture | backend/controllers | backend/controllers/media.controller.js:3 | Upload video file to Cloudinary | uploadMedia, multer | POST /api/v1/media/upload-video |
| 19 | createCheckoutSession | backend/controllers | backend/controllers/purchaseCourse.controller.js:9 | Create Stripe checkout for course purchase | Stripe, Course, CoursePurchase | POST /api/v1/purchase/checkout/create-checkout-session |
| 20 | stripeWebhook | backend/controllers | backend/controllers/purchaseCourse.controller.js:71 | Handle Stripe payment webhook events | Stripe, CoursePurchase, User, Course | POST /api/v1/purchase/webhook |
| 21 | getCourseDetailWithPurchaseStatus | backend/controllers | backend/controllers/purchaseCourse.controller.js:136 | Course detail with purchase flag for user | Course, CoursePurchase, Lecture | GET /api/v1/purchase/course/:courseId/details-with-status |
| 22 | getAllPurchasedCourse | backend/controllers | backend/controllers/purchaseCourse.controller.js:161 | List all completed purchases | CoursePurchase, Course | GET /api/v1/purchase |
| 23 | getCourseProgress | backend/controllers | backend/controllers/courseProgress.controller.js:4 | Get user progress for a course | CourseProgress, Course | GET /api/v1/progress/:courseId |
| 24 | updateLectureProgress | backend/controllers | backend/controllers/courseProgress.controller.js:37 | Mark lecture as viewed | CourseProgress | POST /api/v1/progress/:courseId/lecture/:lectureId/view |
| 25 | markAsCompleted | backend/controllers | backend/controllers/courseProgress.controller.js:76 | Mark entire course completed | CourseProgress | POST /api/v1/progress/:courseId/complete |
| 26 | markAsInCompleted | backend/controllers | backend/controllers/courseProgress.controller.js:98 | Mark course incomplete | CourseProgress | POST /api/v1/progress/:courseId/incomplete |

## Services

| # | Name | Package / Module | File | Description | Key dependencies | Notes |
|---|------|------------------|------|-------------|------------------|-------|
| 1 | authApi | frontend/features/api | frontend/src/features/api/authApi.js:7 | RTK Query client for user auth/profile | fetchBaseQuery, authSlice | Endpoints: register, login, logout, loadUser, updateUser |
| 2 | courseApi | frontend/features/api | frontend/src/features/api/courseApi.js:6 | RTK Query client for course/lecture CRUD | fetchBaseQuery | Endpoints: create, search, publish, lecture CRUD |
| 3 | courseProgressApi | frontend/features/api | frontend/src/features/api/courseProgressApi.js:6 | RTK Query client for progress tracking | fetchBaseQuery | Endpoints: getProgress, updateLecture, complete/incomplete |
| 4 | purchaseApi | frontend/features/api | frontend/src/features/api/purchaseCourseApi.js:6 | RTK Query client for Stripe purchases | fetchBaseQuery | Endpoints: checkout session, purchase status, purchased list |

## Repositories

_No dedicated repository layer found. Controllers access Mongoose models directly._

## Models

| # | Name | Package / Module | File | Description | Key dependencies | Notes |
|---|------|------------------|------|-------------|------------------|-------|
| 1 | User | backend/models | backend/models/user.model.js:34 | User account with role and enrolled courses | mongoose | Roles: instructor, student |
| 2 | Course | backend/models | backend/models/course.model.js:53 | Course with lectures, pricing, publish flag | mongoose | Refs User, Lecture |
| 3 | Lecture | backend/models | backend/models/lecture.model.js:22 | Video lecture with Cloudinary publicId | mongoose | Embedded in Course.lectures |
| 4 | CourseProgress | backend/models | backend/models/courseProgress.model.js:15 | Per-user lecture view/completion tracking | mongoose | Nested lectureProgress sub-schema |
| 5 | CoursePurchase | backend/models | backend/models/purchaseCourse.model.js:32 | Stripe payment record for course enrollment | mongoose | Status: pending/completed/failed |

## Jobs

_No scheduled jobs or background workers found._

## Consumers

_No message consumers found._

## Configs

| # | Name | Package / Module | File | Description | Notes |
|---|------|------------------|------|-------------|-------|
| 1 | Express app bootstrap | backend | backend/index.js:15 | Express server, CORS, route mounting, SPA fallback | PORT, MONGO_URI via dotenv |
| 2 | package.json (root) | rabbit | package.json:1 | Root npm scripts and backend dependencies | `npm run dev` starts backend |
| 3 | package.json (frontend) | frontend | frontend/package.json:1 | Frontend dependencies and Vite scripts | React, RTK, Tailwind |
| 4 | vite.config.js | frontend | frontend/vite.config.js:6 | Vite build config with @ alias | Injects BACKEND_URL |
| 5 | tailwind.config.js | frontend | frontend/tailwind.config.js:2 | Tailwind theme tokens (shadcn) | darkMode: class |
| 6 | postcss.config.js | frontend | frontend/postcss.config.js:1 | PostCSS plugins for Tailwind | tailwindcss, autoprefixer |
| 7 | eslint.config.js | frontend | frontend/eslint.config.js:1 | ESLint flat config for React | — |
| 8 | components.json | frontend | frontend/components.json:1 | shadcn/ui component registry config | — |

## Utilities

| # | Name | Package / Module | File | Description | Notes |
|---|------|------------------|------|-------------|-------|
| 1 | connectDB | backend/database | backend/database/db.js:3 | MongoDB connection helper | Uses MONGO_URI env var |
| 2 | isAuthenticated | backend/middlewares | backend/middlewares/isAuthenticated.js:3 | JWT cookie verification middleware | Sets req.id from token |
| 3 | upload (multer) | backend/utils | backend/utils/multer.js:3 | File upload middleware | Stores to uploads/ |
| 4 | generateToken | backend/utils | backend/utils/generateToken.js:3 | Issue JWT and set httpOnly cookie | SECRET_KEY env var |
| 5 | cloudinary | backend/utils | backend/utils/cloudinary.js:10 | Configured Cloudinary v2 client | API_KEY, API_SECRET, CLOUD_NAME |
| 6 | uploadMedia | backend/utils | backend/utils/cloudinary.js:12 | Upload file to Cloudinary | auto resource_type |
| 7 | deleteMediaFromCloudinary | backend/utils | backend/utils/cloudinary.js:23 | Delete image from Cloudinary | — |
| 8 | deleteVideoFromCloudinary | backend/utils | backend/utils/cloudinary.js:31 | Delete video from Cloudinary | resource_type: video |
| 9 | cn | frontend/lib | frontend/src/lib/utils.js:4 | Tailwind class merge helper | clsx + tailwind-merge |
| 10 | ProtectedRoute | frontend/components | frontend/src/components/ProtectedRoutes.jsx:5 | Redirect unauthenticated users to login | React Router guard |
| 11 | AdminRoute | frontend/components | frontend/src/components/ProtectedRoutes.jsx:27 | Restrict routes to instructor role | Checks user.role |

## Classes

| # | Name | Package / Module | File | Description | Notes |
|---|------|------------------|------|-------------|-------|
| 1 | App | frontend/src | frontend/src/App.jsx:131 | Root component with React Router config | Defines all routes |
| 2 | MainLayout | frontend/layout | frontend/src/layout/MainLayout.jsx:16 | Shell layout with Navbar | Wraps all pages |
| 3 | Login | frontend/pages | frontend/src/pages/Login.jsx:215 | Login/register form page | — |
| 4 | HeroSection | frontend/pages/student | frontend/src/pages/student/HeroSection.jsx:59 | Landing hero banner | Public home page |
| 5 | Courses | frontend/pages/student | frontend/src/pages/student/Courses.jsx:46 | Published courses listing | — |
| 6 | CourseDetails | frontend/pages/student | frontend/src/pages/student/CourseDetails.jsx:111 | Course detail + buy flow | Uses purchaseApi |
| 7 | CourseProgress | frontend/pages/student | frontend/src/pages/student/CourseProgress.jsx:163 | Video player + progress UI | Requires purchase |
| 8 | MyLearning | frontend/pages/student | frontend/src/pages/student/MyLearning.jsx:29 | Enrolled courses dashboard | — |
| 9 | Profile | frontend/pages/student | frontend/src/pages/student/Profile.jsx:216 | User profile editor | — |
| 10 | Dashboard | frontend/pages/admin | frontend/src/pages/admin/Dashboard.jsx:82 | Instructor analytics dashboard | recharts |
| 11 | CourseTable | frontend/pages/admin | frontend/src/pages/admin/course/CourseTable.jsx:59 | Instructor course list/management | — |
| 12 | AddCourse | frontend/pages/admin | frontend/src/pages/admin/course/AddCourse.jsx:150 | Create new course form | — |
| 13 | EditCourse | frontend/pages/admin | frontend/src/pages/admin/course/EditCourse.jsx:20 | Edit course wrapper | Loads CourseTab |
| 14 | Navbar | frontend/components | frontend/src/components/Navbar.jsx:169 | Top navigation bar | Auth-aware links |

## Interfaces

_None found. Project uses JavaScript (no TypeScript interfaces or abstract contracts)._

## Layer Relationships

| From | To | Relationship | Confidence |
|------|-----|--------------|------------|
| user.route.js | user.controller.js handlers | wires HTTP paths | explicit |
| course.route.js | course.controller.js handlers | wires HTTP paths | explicit |
| user.controller.js | User model | direct Mongoose queries | explicit |
| course.controller.js | Course, Lecture models | direct Mongoose queries | explicit |
| purchaseCourse.controller.js | Stripe SDK | payment API calls | explicit |
| purchaseCourse.controller.js | CoursePurchase model | persists purchase records | explicit |
| media.controller.js | uploadMedia (cloudinary) | video upload | explicit |
| isAuthenticated middleware | user.controller handlers | guards protected routes | explicit |
| authApi | /api/v1/user/* endpoints | HTTP fetch | explicit |
| courseApi | /api/v1/course/* endpoints | HTTP fetch | explicit |
| courseProgressApi | /api/v1/progress/* endpoints | HTTP fetch | explicit |
| purchaseApi | /api/v1/purchase/* endpoints | HTTP fetch | explicit |
| App.jsx pages | RTK Query hooks | UI calls API services | explicit |
| appStore | authApi, courseApi, purchaseApi, courseProgressApi | Redux middleware registration | explicit |
| backend/index.js | frontend/dist | serves built SPA | explicit |
| CourseDetails page | purchaseApi | checkout initiation | inferred |
| CourseProgress page | courseProgressApi | tracks lecture views | inferred |

## Discovery notes

### Files examined
- `README.md` — project overview, stack, setup instructions
- `package.json` (root + frontend) — dependencies and scripts
- `backend/index.js` — Express bootstrap and route mounting
- `backend/controllers/*.js` — all HTTP handler functions
- `backend/routes/*.js` — Express router wiring
- `backend/models/*.js` — Mongoose schemas
- `backend/utils/*.js`, `backend/middlewares/isAuthenticated.js`, `backend/database/db.js` — cross-cutting utilities
- `frontend/src/features/api/*.js` — RTK Query service definitions
- `frontend/src/App.jsx` — React Router route tree
- `frontend/vite.config.js`, `tailwind.config.js` — build and styling config

### Excluded from scan
- `node_modules/` — third-party dependencies
- `uploads/` — runtime upload temp files (not source code)
- `frontend/src/components/ui/*` — shadcn/ui primitives (18 generated wrapper components, no business logic)
- `*Test.*`, `test/` — no test files present in repo
- `package-lock.json` — lockfile, not application logic

### Ambiguities & gaps
- No `.env` or `.env.example` committed; required env vars inferred from code: `MONGO_URI`, `SECRET_KEY`, `PORT`, `API_KEY`, `API_SECRET`, `CLOUD_NAME`, `STRIPE_SECRET_KEY`, `VITE_BACKEND_URL`
- README mentions Jest tests (`npm test`) but no test files exist in the repository
- No formal repository/service layer on backend — controllers contain both HTTP and business logic
- `isAuthenticated` middleware swallows errors silently (catch block only logs)
- Admin role referenced in frontend `AdminRoute` but User model enum only lists `instructor` and `student`
- Stripe webhook route uses `express.raw` middleware inline rather than a dedicated config

### Recommendations
- Extract business logic from controllers into a `services/` layer for testability and separation of concerns
- Add a `repositories/` or data-access module if the codebase grows beyond current size
- Commit `.env.example` documenting all required environment variables
- Add actual test files or remove testing instructions from README
- Consider TypeScript for shared request/response contracts between frontend API slices and backend
- shadcn/ui components in `components/ui/` could be documented as design-system primitives rather than rescanned on each run
