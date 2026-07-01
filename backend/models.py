from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, Date, ForeignKey
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    nickname = Column(String(50), nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AiceSubmission(Base):
    __tablename__ = "aice_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    question_no = Column(Integer, nullable=False)
    question_type = Column(String(100), nullable=False)
    submitted_code = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    missing_keywords = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    duration_minutes = Column(Integer, default=5)
    course_id = Column(String(20), nullable=True)  # py, java, aice, sql
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CourseProgress(Base):
    __tablename__ = "course_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(String(20), nullable=False)
    completed_lessons = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
