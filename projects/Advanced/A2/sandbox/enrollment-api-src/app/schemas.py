from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class StudentCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    program: str = Field(min_length=1, max_length=64)


class StudentResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    program: str
    registered_at: datetime

    model_config = {"from_attributes": True}


class EnrollmentCreate(BaseModel):
    student_id: int = Field(gt=0)
    course_code: str = Field(min_length=3, max_length=8)
    term: str = Field(min_length=1, max_length=32)


class EnrollmentResponse(BaseModel):
    id: int
    student_id: int
    course_code: str
    term: str
    enrolled_at: datetime

    model_config = {"from_attributes": True}


class RegistrySummary(BaseModel):
    student_count: int
    enrollment_count: int
