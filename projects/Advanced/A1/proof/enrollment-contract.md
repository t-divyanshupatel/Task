# Enrollment Contract — Student Enrollment Service

Frozen contract committed on `main` **before** any parallel lane starts.
Every worktree agent prompt references this file as the single source of truth.

## Data models

### Student

| Field          | Type     | Required | Rules                                      |
|----------------|----------|----------|--------------------------------------------|
| id             | int      | yes      | Auto-increment primary key                 |
| full_name      | string   | yes      | 1–120 characters                           |
| email          | string   | yes      | Valid email format; **unique** in database |
| program        | string   | yes      | e.g. `"CS"`, `"MBA"`, `"Design"`           |
| registered_at  | datetime | yes      | Set automatically on insert                |

### Enrollment

| Field        | Type     | Required | Rules                                |
|--------------|----------|----------|--------------------------------------|
| id           | int      | yes      | Auto-increment primary key           |
| student_id   | int      | yes      | Must reference an existing student   |
| course_code  | string   | yes      | 3–8 uppercase letters/digits         |
| term         | string   | yes      | e.g. `"2026-FALL"`, `"2027-SPRING"`  |
| enrolled_at  | datetime | yes      | Set automatically on insert          |

## HTTP contract

| Method | Route                 | Request body                                      | Success response        |
|--------|-----------------------|---------------------------------------------------|-------------------------|
| POST   | `/students`           | `{ full_name, email, program }`                   | `201` Created student   |
| GET    | `/students`           | —                                                 | `200` List of students  |
| POST   | `/enrollments`        | `{ student_id, course_code, term }`               | `201` Created enrollment |
| GET    | `/enrollments`        | —                                                 | `200` List of enrollments |
| GET    | `/registry/summary`   | —                                                 | `200` `{ student_count, enrollment_count }` |

### Error cases (minimum)

| Case                         | Status |
|------------------------------|--------|
| Duplicate student email      | `409`  |
| Unknown `student_id` on enroll | `404` |
| Invalid payload (validation) | `422`  |

## Repository layout

| Concern        | Path                          |
|----------------|-------------------------------|
| ORM models     | `app/models.py`               |
| DB session     | `app/database.py`             |
| Settings       | `app/config.py`               |
| Pydantic DTOs  | `app/schemas.py`              |
| FastAPI app    | `app/main.py`                 |
| Route modules  | `app/routes/`                 |
| Tests          | `tests/`                      |

## Stack

- Python 3.9+
- FastAPI + Uvicorn
- SQLAlchemy + SQLite (`sqlite:///./enrollment.db`)
- pytest + httpx TestClient
- Default port: **8000**
