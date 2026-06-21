# Enrollment Contract — Student Enrollment Service

See [A1 proof/enrollment-contract.md](../../A1/proof/enrollment-contract.md) for the full specification.

## Data models

### Student

| Field          | Type     | Required | Rules                          |
|----------------|----------|----------|--------------------------------|
| id             | int      | yes      | Auto-increment primary key     |
| full_name      | string   | yes      | 1–120 characters               |
| email          | string   | yes      | Valid email; unique            |
| program        | string   | yes      | Degree or program code         |
| registered_at  | datetime | yes      | Set on insert                  |

### Enrollment

| Field        | Type     | Required | Rules                              |
|--------------|----------|----------|------------------------------------|
| id           | int      | yes      | Auto-increment primary key         |
| student_id   | int      | yes      | FK to students.id                  |
| course_code  | string   | yes      | 3–8 characters                     |
| term         | string   | yes      | e.g. `2026-FALL`                   |
| enrolled_at  | datetime | yes      | Set on insert                      |

## HTTP contract

| Method | Route               | Body / response |
|--------|---------------------|-----------------|
| POST   | `/students`         | `{ full_name, email, program }` → student |
| GET    | `/students`         | list of students |
| POST   | `/enrollments`      | `{ student_id, course_code, term }` → enrollment |
| GET    | `/enrollments`      | list of enrollments |
| GET    | `/registry/summary` | `{ student_count, enrollment_count }` |

## Stack

Python 3.9+ · FastAPI · SQLAlchemy · SQLite · pytest · port 8000
