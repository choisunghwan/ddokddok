from fastapi import APIRouter, Depends, Body
from sqlalchemy import func as sqlfunc
from sqlalchemy.orm import Session
from datetime import date, timedelta
from database import get_db
from models import AiceSubmission, StudySession, CourseProgress, User, StudyTimerStat
from deps import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

DAYS_KR = ["월", "화", "수", "목", "금", "토", "일"]

COURSE_TOTALS = {
    "py": 9,
    "python": 9,  # legacy alias
    "java": 6,
    "aice": 50,
    "sql": 8,
}

COURSE_ID_ALIAS = {"python": "py"}


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

    # 이번 주 학습 분 (기존 세션)
    weekly_sessions = db.query(StudySession).filter(
        StudySession.user_id == current_user.id,
        StudySession.date >= week_start,
    ).all()

    # 이번 주 타이머 통계 (초 → 분 환산)
    timer_rows = db.query(StudyTimerStat).filter(
        StudyTimerStat.user_id == current_user.id,
        StudyTimerStat.date >= week_start,
    ).all()
    timer_minutes_by_date = {r.date: r.total_seconds // 60 for r in timer_rows}

    day_minutes = {}
    for s in weekly_sessions:
        day_minutes[s.date] = day_minutes.get(s.date, 0) + s.duration_minutes
    for d, m in timer_minutes_by_date.items():
        day_minutes[d] = day_minutes.get(d, 0) + m

    weekly_minutes = sum(day_minutes.values())
    weekly_chart = [
        {"day": DAYS_KR[i], "min": day_minutes.get(week_start + timedelta(days=i), 0)}
        for i in range(7)
    ]

    # 연속 학습일 (코딩 세션 + AICE 제출 + 타이머 사용일 통합)
    session_dates = [
        r[0] for r in db.query(sqlfunc.date(StudySession.created_at))
        .filter(StudySession.user_id == current_user.id).distinct().all()
    ]
    aice_dates = [
        r[0] for r in db.query(sqlfunc.date(AiceSubmission.created_at))
        .filter(AiceSubmission.user_id == current_user.id).distinct().all()
    ]
    timer_dates = [
        r.date for r in db.query(StudyTimerStat).filter(
            StudyTimerStat.user_id == current_user.id,
            StudyTimerStat.total_seconds > 0,
        ).all()
    ]
    streak = calc_streak(session_dates + aice_dates + timer_dates)

    # 오늘 타이머 누적 초
    today_timer = db.query(StudyTimerStat).filter(
        StudyTimerStat.user_id == current_user.id,
        StudyTimerStat.date == today,
    ).first()
    today_seconds = today_timer.total_seconds if today_timer else 0

    # 코스별 진행률
    progress_rows = db.query(CourseProgress).filter(
        CourseProgress.user_id == current_user.id
    ).all()
    course_progress = [
        {
            "course_id": COURSE_ID_ALIAS.get(r.course_id, r.course_id),
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
        "today_seconds": today_seconds,
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
        course_id=COURSE_ID_ALIAS.get(course_id, course_id),
    ))
    db.commit()
    return {"ok": True}


@router.get("/timer-stat")
def get_timer_stat(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = db.query(StudyTimerStat).filter(
        StudyTimerStat.user_id == current_user.id,
        StudyTimerStat.date == date.today(),
    ).first()
    return {"total_seconds": row.total_seconds if row else 0}


@router.post("/timer-stat")
def upsert_timer_stat(
    total_seconds: int = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = db.query(StudyTimerStat).filter(
        StudyTimerStat.user_id == current_user.id,
        StudyTimerStat.date == date.today(),
    ).first()
    if row:
        if total_seconds > row.total_seconds:
            row.total_seconds = total_seconds
    else:
        db.add(StudyTimerStat(
            user_id=current_user.id,
            date=date.today(),
            total_seconds=total_seconds,
        ))
    db.commit()
    return {"ok": True}


@router.post("/progress")
def update_progress(
    course_id: str,
    completed_lessons: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course_id = COURSE_ID_ALIAS.get(course_id, course_id)
    row = db.query(CourseProgress).filter(
        CourseProgress.user_id == current_user.id,
        CourseProgress.course_id == course_id,
    ).first()
    if row:
        if completed_lessons > row.completed_lessons:
            row.completed_lessons = completed_lessons
    else:
        db.add(CourseProgress(
            user_id=current_user.id,
            course_id=course_id,
            completed_lessons=completed_lessons,
        ))
    db.commit()
    return {"ok": True}
