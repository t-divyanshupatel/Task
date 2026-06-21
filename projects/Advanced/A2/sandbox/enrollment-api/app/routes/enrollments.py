from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Enrollment, Student
from app.schemas import EnrollmentCreate, EnrollmentResponse

router = APIRouter()


@router.post(
    "/enrollments",
    response_model=EnrollmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_enrollment(payload: EnrollmentCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")

    enrollment = Enrollment(
        student_id=payload.student_id,
        course_code=payload.course_code.upper(),
        term=payload.term,
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.get("/enrollments", response_model=List[EnrollmentResponse])
def list_enrollments(db: Session = Depends(get_db)):
    return db.query(Enrollment).order_by(Enrollment.id).all()
