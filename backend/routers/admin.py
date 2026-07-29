from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func as sqlfunc
from datetime import date, datetime, timedelta, timezone
from database import get_db
from models import User, StudyMember, StudyPresence, AiceSubmission, StudyTimerStat, StudySession, StudyCheckin, StudyNote, CourseProgress
from deps import get_current_user
from collections import defaultdict
import os

router = APIRouter(prefix="/api/admin", tags=["admin"])

ADMIN_EMAILS = {e.strip().lower() for e in os.getenv("ADMIN_EMAILS", "").split(",") if e.strip()}


def _require_admin(current_user: User = Depends(get_current_user)):
    if current_user.email.lower() not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="관리자 권한이 없습니다")
    return current_user


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    if not users:
        return []

    user_ids = [u.id for u in users]
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    # 스터디 그룹 수 (user별)
    member_rows = db.query(StudyMember.user_id, sqlfunc.count(StudyMember.id)).filter(
        StudyMember.user_id.in_(user_ids)
    ).group_by(StudyMember.user_id).all()
    study_count = defaultdict(int, {r[0]: r[1] for r in member_rows})

    # AICE 정답 수
    aice_rows = db.query(AiceSubmission.user_id, sqlfunc.count(AiceSubmission.id)).filter(
        AiceSubmission.user_id.in_(user_ids),
        AiceSubmission.is_correct == True,
    ).group_by(AiceSubmission.user_id).all()
    aice_count = defaultdict(int, {r[0]: r[1] for r in aice_rows})

    # 이번 주 타이머 초
    timer_rows = db.query(StudyTimerStat.user_id, sqlfunc.sum(StudyTimerStat.total_seconds)).filter(
        StudyTimerStat.user_id.in_(user_ids),
        StudyTimerStat.date >= week_start,
    ).group_by(StudyTimerStat.user_id).all()
    timer_secs = defaultdict(int, {r[0]: (r[1] or 0) for r in timer_rows})

    # 이번 주 세션 분
    session_rows = db.query(StudySession.user_id, sqlfunc.sum(StudySession.duration_minutes)).filter(
        StudySession.user_id.in_(user_ids),
        StudySession.date >= week_start,
    ).group_by(StudySession.user_id).all()
    session_mins = defaultdict(int, {r[0]: (r[1] or 0) for r in session_rows})

    # 최근 스터디 접속 (last_seen)
    presence_rows = db.query(StudyPresence.user_id, sqlfunc.max(StudyPresence.last_seen)).filter(
        StudyPresence.user_id.in_(user_ids)
    ).group_by(StudyPresence.user_id).all()
    presence_map = defaultdict(lambda: None, {r[0]: r[1] for r in presence_rows})

    result = []
    for u in users:
        weekly_mins = (timer_secs[u.id] // 60) + session_mins[u.id]

        last_seen = presence_map[u.id]
        last_login = getattr(u, "last_login_at", None)

        # 최근 접속 = login_at vs presence last_seen 중 더 최신
        last_active = None
        for ts in [last_login, last_seen]:
            if ts is None:
                continue
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            if last_active is None or ts > last_active:
                last_active = ts

        result.append({
            "id": u.id,
            "nickname": u.nickname,
            "email": u.email,
            "is_admin": u.email.lower() in ADMIN_EMAILS,
            "kakao_linked": bool(u.kakao_id),
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "last_active_at": last_active.isoformat() if last_active else None,
            "weekly_minutes": weekly_mins,
            "study_groups": study_count[u.id],
            "solved_problems": aice_count[u.id],
        })

    return result


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(_require_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="본인 계정은 탈퇴시킬 수 없습니다")
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="회원을 찾을 수 없습니다")
    if target.email.lower() in ADMIN_EMAILS:
        raise HTTPException(status_code=400, detail="다른 관리자 계정은 탈퇴시킬 수 없습니다")

    for model in [AiceSubmission, StudySession, CourseProgress, StudyNote, StudyTimerStat,
                  StudyPresence, StudyCheckin, StudyMember]:
        db.query(model).filter(model.user_id == user_id).delete(synchronize_session=False)
    db.delete(target)
    db.commit()
    return {"ok": True}
