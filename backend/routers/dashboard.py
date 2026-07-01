from fastapi import APIRouter, Depends
from sqlalchemy import func as sqlfunc
from sqlalchemy.orm import Session
from datetime import date, timedelta
from database import get_db
from models import AiceSubmission, StudySession, CourseProgress, User
from deps import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

DAYS_KR = ["월", "화", "수", "목", "금", "토", "일"]

COURSE_TOTALS = {
    "py": 80,
    "java": 60,
    "aice": 14,
    "sql": 50,
}


def calc_streak(dates: list) -> int:
    if not dates:
        return 0
    dates = sorted(set(dates), reverse=True)
    today = date.today()
    if dates[0] < today - timedelta(days=1):
        return 0
    streak = 0
    expected = dates[0]
    for d in dates:
        if d == expected:
            streak += 1
            expected = d - timedelta(days=1)
        else:
            break
    return streak


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()
    week_start = today - timedelta(days=today.weekday())  # 이번 주 월요일

    # 완료 문제 수 (AICE 정답)
    completed_problems = db.query(AiceSubmission).filter(
        AiceSubmission.user_id == current_user.id,
        AiceSubmission.is_correct == True,
    ).count()

    # 이번 주 학습 분
    weekly_sessions = db.query(StudySession).filter(
        StudySession.user_id == current_user.id,
        StudySession.date >= week_start,
    ).all()
    weekly_minutes = sum(s.duration_minutes for s in weekly_sessions)

    # 주간 차트 (월~일)
    day_minutes = {}
    for s in weekly_sessions:
        day_minutes[s.date] = day_minutes.get(s.date, 0) + s.duration_minutes
    weekly_chart = [
        {"day": DAYS_KR[i], "min": day_minutes.get(week_start + timedelta(days=i), 0)}
        for i in range(7)
    ]

    # 연속 학습일
    session_dates = [
        r[0] for r in db.query(sqlfunc.date(StudySession.created_at))
        .filter(StudySession.user_id == current_user.id).distinct().all()
    ]
    aice_dates = [
        r[0] for r in db.query(sqlfunc.date(AiceSubmission.created_at))
        .filter(AiceSubmission.user_id == current_user.id).distinct().all()
    ]
    streak = calc_streak(session_dates + aice_dates)

    # 코스별 진행률
    progress_rows = db.query(CourseProgress).filter(
        CourseProgress.user_id == current_user.id
    ).all()
    course_progress = [
        {
            "course_id": r.course_id,
            "completed_lessons": r.completed_lessons,
            "total_lessons": COURSE_TOTALS.get(r.course_id, 0),
        }
        for r in progress_rows
    ]

    return {
        "streak": streak,
        "weekly_minutes": weekly_minutes,
        "completed_problems": completed_problems,
        "weekly_chart": weekly_chart,
        "course_progress": course_progress,
    }


@router.post("/session")
def record_session(
    course_id: str,
    duration_minutes: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.add(StudySession(
        user_id=current_user.id,
        date=date.today(),
        duration_minutes=duration_minutes,
        course_id=course_id,
    ))
    db.commit()
    return {"ok": True}
