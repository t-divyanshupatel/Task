from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    program = Column(String(64), nullable=False)
    registered_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    course_code = Column(String(8), nullable=False)
    term = Column(String(32), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow, nullable=False)
