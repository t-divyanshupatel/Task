# Route & API Map Report

## Metadata

| Field | Value |
|-------|-------|
| **Agent name** | repo-route-api-mapper |
| **Started at** | 2026-06-16T13:33:05Z |
| **Completed at** | 2026-06-16T13:37:13Z |
| **Duration** | 4m 8s |
| **Repository** | /Users/divyanshupatel/Desktop/mf/rabbit |
| **Repo name** | rabbit |
| **Stack detected** | React 18 + Vite 6 + React Router 7 + Redux Toolkit Query (frontend); Node.js + Express 4 + MongoDB/Mongoose (backend) |
| **Base URL / prefix** | Frontend dev: `http://localhost:5173`; Backend: `http://localhost:3000` (or `VITE_BACKEND_URL`); API prefix: `/api/v1` |
| **Files scanned** | 98 |
| **Routes found** | 14 |
| **API endpoints found** | 26 |

## Summary

Rabbit is a full-stack Learning Management System (LMS) with a React SPA frontend and an Express REST API backend. Frontend routing is centralized in `frontend/src/App.jsx` using `createBrowserRouter` with nested layouts (`MainLayout` for student pages, `Sidebar` + `Outlet` for admin). API calls are mostly centralized in four RTK Query slices under `frontend/src/features/api/`, with one direct `axios` call for video upload in the admin lecture editor. The backend mounts five route modules under `/api/v1/*` and serves the built SPA via a catch-all `GET *` handler. Auth is cookie-based JWT (`credentials: 'include'` on the frontend; `isAuthenticated` middleware on protected backend routes).

## Frontend Routes

| # | Path | Name / Key | Screen / Component | Auth | Source | Notes |
|---|------|------------|-------------------|------|--------|-------|
| 1 | `/` | — | HeroSection + Courses | no | frontend/src/App.jsx:33 | Home; published courses listing |
| 2 | `/login` | — | Login | guest-only | frontend/src/App.jsx:42 | `AuthenticatedUser` redirects to `/` if already logged in |
| 3 | `/my-learning` | — | MyLearning | yes | frontend/src/App.jsx:50 | `ProtectedRoute` — redirects to `/login` if no user |
| 4 | `/profile` | — | Profile | yes | frontend/src/App.jsx:58 | `ProtectedRoute` |
| 5 | `/course/search` | — | SearchPage | yes | frontend/src/App.jsx:66 | Accepts `?query=` search param (navigated from HeroSection) |
| 6 | `/course-details/:courseId` | — | CourseDetail | yes | frontend/src/App.jsx:74 | Dynamic `:courseId` param |
| 7 | `/course-progress/:courseId` | — | CourseProgress | yes + purchased | frontend/src/App.jsx:82 | `ProtectedRoute` + `PurchaseCourseProtectedRoute`; redirects to course details if not purchased |
| 8 | `/admin` | — | Sidebar (layout) | instructor | frontend/src/App.jsx:94 | `AdminRoute` requires `user.role === "instructor"`; no index child — Outlet may be empty |
| 9 | `/admin/dashboard` | — | Dashboard | instructor | frontend/src/App.jsx:102 | Admin child route |
| 10 | `/admin/course` | — | CourseTable | instructor | frontend/src/App.jsx:106 | Admin child route |
| 11 | `/admin/course/create` | — | AddCourse | instructor | frontend/src/App.jsx:110 | Admin child route |
| 12 | `/admin/course/:courseId` | — | EditCourse | instructor | frontend/src/App.jsx:114 | Dynamic `:courseId` param |
| 13 | `/admin/course/:courseId/lecture` | — | CreateLecture | instructor | frontend/src/App.jsx:118 | Lecture list + create |
| 14 | `/admin/course/:courseId/lecture/:lectureId` | — | EditLecture | instructor | frontend/src/App.jsx:122 | Dynamic `:lectureId` param |

### Route tree (if nested)

```
/
├── /                          (HeroSection + Courses)
├── /login
├── /my-learning
├── /profile
├── /course/search?query=
├── /course-details/:courseId
├── /course-progress/:courseId
└── /admin                     (Sidebar layout)
    ├── /admin/dashboard
    └── /admin/course
        ├── /admin/course/create
        ├── /admin/course/:courseId
        └── /admin/course/:courseId/lecture
            └── /admin/course/:courseId/lecture/:lectureId
```

## API Endpoints

### Outbound (frontend → backend)

| # | Method | Path | Label / Purpose | Called from | Auth | Notes |
|---|--------|------|-----------------|-------------|------|-------|
| 1 | POST | /api/v1/user/register | registerUser | frontend/src/features/api/authApi.js:14 | no | Body: name, email, password |
| 2 | POST | /api/v1/user/login | loginUser | frontend/src/features/api/authApi.js:21 | no | Sets auth cookie on success |
| 3 | GET | /api/v1/user/logout | logoutUser | frontend/src/features/api/authApi.js:36 | cookie | — |
| 4 | GET | /api/v1/user/profile | loadUser | frontend/src/features/api/authApi.js:49 | cookie | Dispatches `userLoggedIn` on success |
| 5 | PUT | /api/v1/user/profile/update | updateUser | frontend/src/features/api/authApi.js:63 | cookie | Multipart: `profilePhoto` |
| 6 | POST | /api/v1/course/ | createCourse | frontend/src/features/api/courseApi.js:16 | cookie | Body: courseTitle, category |
| 7 | GET | /api/v1/course/search | getSearchCourse | frontend/src/features/api/courseApi.js:24 | cookie | Query: `query`, `categories`, `sortByPrice` |
| 8 | GET | /api/v1/course/published-courses | getPublishedCourse | frontend/src/features/api/courseApi.js:40 | no | Public listing |
| 9 | GET | /api/v1/course/ | getCreatorCourse | frontend/src/features/api/courseApi.js:47 | cookie | Instructor's courses |
| 10 | PUT | /api/v1/course/:courseId | editCourse | frontend/src/features/api/courseApi.js:55 | cookie | Multipart: `courseThumbnail` |
| 11 | GET | /api/v1/course/:courseId | getCourseById | frontend/src/features/api/courseApi.js:63 | cookie | — |
| 12 | POST | /api/v1/course/:courseId/lecture | createLecture | frontend/src/features/api/courseApi.js:69 | cookie | Body: lectureTitle |
| 13 | GET | /api/v1/course/:courseId/lecture | getCourseLecture | frontend/src/features/api/courseApi.js:76 | cookie | — |
| 14 | POST | /api/v1/course/:courseId/lecture/:lectureId | editLecture | frontend/src/features/api/courseApi.js:83 | cookie | Body: lectureTitle, videoInfo, isPreviewFree |
| 15 | DELETE | /api/v1/course/lecture/:lectureId | removeLecture | frontend/src/features/api/courseApi.js:90 | cookie | — |
| 16 | GET | /api/v1/course/lecture/:lectureId | getLectureById | frontend/src/features/api/courseApi.js:97 | cookie | — |
| 17 | PATCH | /api/v1/course/:courseId | publishCourse | frontend/src/features/api/courseApi.js:104 | cookie | Query: `publish=true\|false` |
| 18 | POST | /api/v1/purchase/checkout/create-checkout-session | createCheckoutSession | frontend/src/features/api/purchaseCourseApi.js:14 | cookie | Body: courseId; Stripe checkout |
| 19 | GET | /api/v1/purchase/course/:courseId/details-with-status | getCourseDetailWithStatus | frontend/src/features/api/purchaseCourseApi.js:21 | cookie | Used by purchase guard |
| 20 | GET | /api/v1/purchase/ | getPurchasedCourses | frontend/src/features/api/purchaseCourseApi.js:28 | cookie | My Learning page |
| 21 | GET | /api/v1/progress/:courseId | getCourseProgress | frontend/src/features/api/courseProgressApi.js:14 | cookie | — |
| 22 | POST | /api/v1/progress/:courseId/lecture/:lectureId/view | updateLectureProgress | frontend/src/features/api/courseProgressApi.js:21 | cookie | Frontend URL has trailing space typo in source |
| 23 | POST | /api/v1/progress/:courseId/complete | completeCourse | frontend/src/features/api/courseProgressApi.js:27 | cookie | — |
| 24 | POST | /api/v1/progress/:courseId/incomplete | inCompleteCourse | frontend/src/features/api/courseProgressApi.js:33 | cookie | — |
| 25 | POST | /api/v1/media/upload-video | mediaCourseLecture | frontend/src/pages/admin/lecture/LectureTab.jsx:60 | unknown | Direct axios; hardcoded `http://localhost:8080` (not `VITE_BACKEND_URL`) |

> Base URL for RTK Query slices: `${import.meta.env.VITE_BACKEND_URL}/api/v1/{module}`

### Inbound (backend / mock service exposes)

| # | Method | Path | Handler / Fixture | Source | Notes |
|---|--------|------|-------------------|--------|-------|
| 1 | POST | /api/v1/user/register | register | backend/routes/user.route.js:7 | — |
| 2 | POST | /api/v1/user/login | login | backend/routes/user.route.js:8 | Sets JWT cookie |
| 3 | GET | /api/v1/user/logout | logout | backend/routes/user.route.js:9 | — |
| 4 | GET | /api/v1/user/profile | getUserProfile | backend/routes/user.route.js:10 | `isAuthenticated` |
| 5 | PUT | /api/v1/user/profile/update | updateProfile | backend/routes/user.route.js:11 | `isAuthenticated`; multer `profilePhoto` |
| 6 | POST | /api/v1/course/ | createCourse | backend/routes/course.route.js:7 | `isAuthenticated` |
| 7 | GET | /api/v1/course/search | searchCourse | backend/routes/course.route.js:8 | `isAuthenticated` |
| 8 | GET | /api/v1/course/published-courses | getPublishedCourse | backend/routes/course.route.js:9 | Public |
| 9 | GET | /api/v1/course/ | getCreatorCourses | backend/routes/course.route.js:10 | `isAuthenticated` |
| 10 | PUT | /api/v1/course/:courseId | editCourse | backend/routes/course.route.js:11 | `isAuthenticated`; multer `courseThumbnail` |
| 11 | GET | /api/v1/course/:courseId | getCourseById | backend/routes/course.route.js:12 | `isAuthenticated` |
| 12 | POST | /api/v1/course/:courseId/lecture | createLecture | backend/routes/course.route.js:13 | `isAuthenticated` |
| 13 | GET | /api/v1/course/:courseId/lecture | getCourseLecture | backend/routes/course.route.js:14 | `isAuthenticated` |
| 14 | POST | /api/v1/course/:courseId/lecture/:lectureId | editLecture | backend/routes/course.route.js:15 | `isAuthenticated` |
| 15 | DELETE | /api/v1/course/lecture/:lectureId | removeLecture | backend/routes/course.route.js:16 | `isAuthenticated` |
| 16 | GET | /api/v1/course/lecture/:lectureId | getLectureById | backend/routes/course.route.js:17 | `isAuthenticated` |
| 17 | PATCH | /api/v1/course/:courseId | publishCourse | backend/routes/course.route.js:18 | `isAuthenticated`; `?publish=` query |
| 18 | POST | /api/v1/media/upload-video | mediaCourseLecture | backend/routes/media.route.js:7 | multer `file`; no auth middleware |
| 19 | POST | /api/v1/purchase/checkout/create-checkout-session | createCheckoutSession | backend/routes/purchaseCourse.route.js:13 | `isAuthenticated` |
| 20 | POST | /api/v1/purchase/webhook | stripeWebhook | backend/routes/purchaseCourse.route.js:16 | Stripe webhook; `express.raw` body parser |
| 21 | GET | /api/v1/purchase/course/:courseId/details-with-status | getCourseDetailWithPurchaseStatus | backend/routes/purchaseCourse.route.js:19 | `isAuthenticated` |
| 22 | GET | /api/v1/purchase/ | getAllPurchasedCourse | backend/routes/purchaseCourse.route.js:21 | `isAuthenticated` |
| 23 | GET | /api/v1/progress/:courseId | getCourseProgress | backend/routes/courseProgress.route.js:8 | `isAuthenticated` |
| 24 | POST | /api/v1/progress/:courseId/lecture/:lectureId/view | updateLectureProgress | backend/routes/courseProgress.route.js:9 | `isAuthenticated` |
| 25 | POST | /api/v1/progress/:courseId/complete | markAsCompleted | backend/routes/courseProgress.route.js:10 | `isAuthenticated` |
| 26 | POST | /api/v1/progress/:courseId/incomplete | markAsInCompleted | backend/routes/courseProgress.route.js:11 | `isAuthenticated` |

> Backend also exposes `GET *` (SPA fallback) at `backend/index.js:38` — serves `frontend/dist/index.html` for non-API paths in production.

## Route ↔ API Correlations

| Route | APIs used | Confidence |
|-------|-----------|------------|
| `/` | GET /api/v1/course/published-courses | inferred |
| `/login` | POST /api/v1/user/login, POST /api/v1/user/register | inferred |
| `/my-learning` | GET /api/v1/purchase/ | inferred |
| `/profile` | GET /api/v1/user/profile, PUT /api/v1/user/profile/update | inferred |
| `/course/search` | GET /api/v1/course/search | inferred |
| `/course-details/:courseId` | GET /api/v1/purchase/course/:courseId/details-with-status, POST /api/v1/purchase/checkout/create-checkout-session | inferred |
| `/course-progress/:courseId` | GET /api/v1/progress/:courseId, POST /api/v1/progress/:courseId/lecture/:lectureId/view, POST /api/v1/progress/:courseId/complete, POST /api/v1/progress/:courseId/incomplete | inferred |
| `/admin/dashboard` | GET /api/v1/course/ (creator courses) | inferred |
| `/admin/course` | GET /api/v1/course/ | inferred |
| `/admin/course/create` | POST /api/v1/course/ | inferred |
| `/admin/course/:courseId` | GET /api/v1/course/:courseId, PUT /api/v1/course/:courseId, PATCH /api/v1/course/:courseId | inferred |
| `/admin/course/:courseId/lecture` | GET /api/v1/course/:courseId/lecture, POST /api/v1/course/:courseId/lecture | inferred |
| `/admin/course/:courseId/lecture/:lectureId` | GET /api/v1/course/lecture/:lectureId, POST /api/v1/course/:courseId/lecture/:lectureId, POST /api/v1/media/upload-video | inferred |

## Discovery notes

### Files examined
- `README.md` — project overview, stack, env vars (`MONGO_URI`, `JWT_SECRET`)
- `package.json` — monorepo root; scripts run backend via nodemon
- `frontend/package.json` — React 18, React Router 7, RTK Query, Vite
- `frontend/vite.config.js` — path alias `@`; `BACKEND_URL` define (unused by API slices)
- `frontend/src/App.jsx` — all browser routes via `createBrowserRouter`
- `frontend/src/components/ProtectedRoutes.jsx` — auth guards (`ProtectedRoute`, `AuthenticatedUser`, `AdminRoute`)
- `frontend/src/components/PurchaseCourseProtectedRoute.jsx` — purchase check via RTK Query
- `frontend/src/features/api/*.js` — centralized outbound API definitions (4 RTK Query slices)
- `frontend/src/pages/admin/lecture/LectureTab.jsx` — direct axios media upload (hardcoded URL)
- `backend/index.js` — Express app, `/api/v1/*` mounts, SPA catch-all
- `backend/routes/*.route.js` — all inbound REST endpoints (5 modules)
- `backend/middlewares/isAuthenticated.js` — JWT cookie auth middleware

### Ambiguities & gaps
- `VITE_BACKEND_URL` is required at build/runtime but no `.env.example` is committed; actual deployment URL is unknown.
- Media upload in `LectureTab.jsx` hardcodes `http://localhost:8080/api/v1/media` while backend default port is `3000` — likely env mismatch in local dev.
- `courseProgressApi.js` `updateLectureProgress` URL includes a trailing space (`/view `) that may not match the backend route.
- `/admin` has no index/default child route — visiting `/admin` alone renders an empty Outlet.
- `SliderPage.jsx`, `Filter.jsx` exist but are not registered as routes (SliderPage is commented out in HeroSection).
- Stripe webhook (`POST /api/v1/purchase/webhook`) is server-to-server only — not called from frontend.
- `GET /api/v1/user/logout` is defined in frontend RTK Query but `onQueryStarted` handler appears syntactically misplaced outside the mutation block in `authApi.js`.
- No OpenAPI/Swagger spec, deeplink manifests, or mobile route configs found.

### Recommendations
- Add a committed `.env.example` documenting `VITE_BACKEND_URL`, `MONGO_URI`, `SECRET_KEY`, Stripe keys, and Cloudinary vars.
- Consolidate media upload to use `VITE_BACKEND_URL` like other API slices; add `isAuthenticated` to `/api/v1/media/upload-video`.
- Fix trailing-space typo in `courseProgressApi.js` lecture progress URL.
- Add an `/admin` index redirect (e.g. to `/admin/dashboard`) to avoid empty admin landing.
- Consider generating an OpenAPI spec from Express routes for contract documentation.
