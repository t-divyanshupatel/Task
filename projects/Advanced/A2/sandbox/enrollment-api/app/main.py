from fastapi import FastAPI

from app.database import Base, engine
from app.routes import enrollments, registry, students

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Enrollment Service", version="1.0.0")
app.include_router(students.router)
app.include_router(enrollments.router)
app.include_router(registry.router)
