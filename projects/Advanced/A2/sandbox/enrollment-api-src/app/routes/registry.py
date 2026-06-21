from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Enrollment, Student
from app.schemas import RegistrySummary

router = APIRouter()


@router.get("/registry/summary", response_model=RegistrySummary)
def registry_summary(db: Session = Depends(get_db)):
    student_count = db.query(Student).count()
    enrollment_count = db.query(Enrollment).count()
    return RegistrySummary(
        student_count=student_count,
        enrollment_count=enrollment_count,
    )
