from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta, timezone
from collections import defaultdict
from database import get_db
from models import StudyGroup, StudyMember, StudyCheckin, StudyPresence, User
from deps import get_current_user
import hashlib

router = APIRouter(prefix="/api/study", tags=["study"])


def _hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


class GroupCreate(BaseModel):
    name: str
    topic: str = ""
    password: str = ""


class JoinGroup(BaseModel):
    password: str = ""


class PresenceUpdate(BaseModel):
    timer_running: bool = False
    timer_seconds: int = 0


def _calc_streak_from_dates(dates: list) -> int:
    if not dates:
        return 0
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


def _calc_streak(group_id: int, db: Session) -> int:
    rows = (
        db.query(StudyCheckin.date)
        .filter(StudyCheckin.group_id == group_id)
        .distinct()
        .order_by(StudyCheckin.date.desc())
        .all()
    )
    return _calc_streak_from_dates([r[0] for r in rows])


def _is_online(last_seen) -> bool:
    if not last_seen:
        return False
    try:
        now = datetime.now(timezone.utc)
        ls = last_seen if last_seen.tzinfo else last_seen.replace(tzinfo=timezone.utc)
        return (now - ls).total_seconds() < 25
    except Exception:
        return False


def _group_dict(g: StudyGroup, current_user_id: int, db: Session) -> dict:
    today = date.today()
    members = db.query(StudyMember).filter(StudyMember.group_id == g.id).all()
    member_ids = [m.user_id for m in members]

    today_checkin_ids = {
        c.user_id
        for c in db.query(StudyCheckin).filter(
            StudyCheckin.group_id == g.id,
            StudyCheckin.date == today,
        ).all()
    }

    presences = {
        p.user_id: p
        for p in db.query(StudyPresence).filter(StudyPresence.group_id == g.id).all()
    }

    users = {u.id: u for u in db.query(User).filter(User.id.in_(member_ids)).all()}

    member_list = []
    for uid in member_ids:
        u = users.get(uid)
        if u:
            p = presences.get(uid)
            online = _is_online(p.last_seen) if p else False
            member_list.append({
                "nickname": u.nickname,
                "user_id": uid,
                "checked_in_today": uid in today_checkin_ids,
                "online": online,
                "timer_running": bool(p.timer_running) if (p and online) else False,
                "timer_seconds": int(p.timer_seconds) if (p and online) else 0,
            })

    return {
        "id": g.id,
        "name": g.name,
        "topic": g.topic or "",
        "has_password": bool(getattr(g, "password_hash", None)),
        "member_count": len(member_ids),
        "members": member_list,
        "is_member": current_user_id in member_ids,
        "is_creator": g.created_by == current_user_id,
        "checked_in_today": current_user_id in today_checkin_ids,
        "streak": _calc_streak(g.id, db),
    }


@router.get("/groups")
def list_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    groups = db.query(StudyGroup).order_by(StudyGroup.created_at.desc()).all()
    if not groups:
        return []

    group_ids = [g.id for g in groups]
    today = date.today()

    # 6개 쿼리로 전체 배치 처리 (그룹 수에 무관)
    all_members   = db.query(StudyMember).filter(StudyMember.group_id.in_(group_ids)).all()
    all_checkins  = db.query(StudyCheckin).filter(StudyCheckin.group_id.in_(group_ids), StudyCheckin.date == today).all()
    all_presences = db.query(StudyPresence).filter(StudyPresence.group_id.in_(group_ids)).all()

    all_uid = list({m.user_id for m in all_members})
    users   = {u.id: u for u in db.query(User).filter(User.id.in_(all_uid)).all()}

    streak_rows = (
        db.query(StudyCheckin.group_id, StudyCheckin.date)
        .filter(StudyCheckin.group_id.in_(group_ids))
        .distinct()
        .order_by(StudyCheckin.group_id, StudyCheckin.date.desc())
        .all()
    )

    members_by   = defaultdict(list)
    for m in all_members:
        members_by[m.group_id].append(m.user_id)

    checkins_by  = defaultdict(set)
    for c in all_checkins:
        checkins_by[c.group_id].add(c.user_id)

    presences_by = defaultdict(dict)
    for p in all_presences:
        presences_by[p.group_id][p.user_id] = p

    streak_dates_by = defaultdict(list)
    for row in streak_rows:
        streak_dates_by[row.group_id].append(row.date)

    result = []
    for g in groups:
        uid_list        = members_by[g.id]
        today_checkins  = checkins_by[g.id]
        presences       = presences_by[g.id]

        member_list = []
        for uid in uid_list:
            u = users.get(uid)
            if u:
                p      = presences.get(uid)
                online = _is_online(p.last_seen) if p else False
                member_list.append({
                    "nickname":        u.nickname,
                    "user_id":         uid,
                    "checked_in_today": uid in today_checkins,
                    "online":          online,
                    "timer_running":   bool(p.timer_running) if (p and online) else False,
                    "timer_seconds":   int(p.timer_seconds)  if (p and online) else 0,
                })

        result.append({
            "id":             g.id,
            "name":           g.name,
            "topic":          g.topic or "",
            "has_password":   bool(getattr(g, "password_hash", None)),
            "member_count":   len(uid_list),
            "members":        member_list,
            "is_member":      current_user.id in set(uid_list),
            "is_creator":     g.created_by == current_user.id,
            "checked_in_today": current_user.id in today_checkins,
            "streak":         _calc_streak_from_dates(streak_dates_by[g.id]),
        })

    return result


@router.post("/groups")
def create_group(
    body: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="그룹 이름을 입력하세요")
    pw = body.password.strip() if body.password else ""
    group = StudyGroup(
        name=body.name.strip(),
        topic=body.topic.strip(),
        password_hash=_hash_pw(pw) if pw else None,
        created_by=current_user.id,
    )
    db.add(group)
    db.flush()
    db.add(StudyMember(group_id=group.id, user_id=current_user.id))
    db.add(StudyCheckin(group_id=group.id, user_id=current_user.id, date=date.today()))
    db.commit()
    return {"ok": True, "id": group.id}


@router.post("/groups/{group_id}/presence")
def update_presence(
    group_id: int,
    body: PresenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not db.query(StudyMember).filter(
        StudyMember.group_id == group_id,
        StudyMember.user_id == current_user.id,
    ).first():
        raise HTTPException(status_code=403, detail="그룹 멤버가 아닙니다")

    p = db.query(StudyPresence).filter(
        StudyPresence.group_id == group_id,
        StudyPresence.user_id == current_user.id,
    ).first()

    now = datetime.now(timezone.utc)
    if p:
        p.last_seen = now
        p.timer_running = body.timer_running
        p.timer_seconds = body.timer_seconds
    else:
        p = StudyPresence(
            user_id=current_user.id,
            group_id=group_id,
            last_seen=now,
            timer_running=body.timer_running,
            timer_seconds=body.timer_seconds,
        )
        db.add(p)
    db.commit()
    return {"ok": True}


@router.post("/groups/{group_id}/join")
def join_group(
    group_id: int,
    body: JoinGroup,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = db.query(StudyGroup).filter(StudyGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다")
    if db.query(StudyMember).filter(
        StudyMember.group_id == group_id,
        StudyMember.user_id == current_user.id,
    ).first():
        raise HTTPException(status_code=400, detail="이미 참가한 그룹입니다")
    if group.password_hash:
        if not body.password or _hash_pw(body.password.strip()) != group.password_hash:
            raise HTTPException(status_code=403, detail="비밀번호가 틀렸습니다")
    db.add(StudyMember(group_id=group_id, user_id=current_user.id))
    db.commit()
    return {"ok": True}


@router.post("/groups/{group_id}/checkin")
def checkin(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not db.query(StudyMember).filter(
        StudyMember.group_id == group_id,
        StudyMember.user_id == current_user.id,
    ).first():
        raise HTTPException(status_code=403, detail="그룹 멤버가 아닙니다")
    if db.query(StudyCheckin).filter(
        StudyCheckin.group_id == group_id,
        StudyCheckin.user_id == current_user.id,
        StudyCheckin.date == date.today(),
    ).first():
        raise HTTPException(status_code=400, detail="오늘 이미 체크인했습니다")
    db.add(StudyCheckin(group_id=group_id, user_id=current_user.id, date=date.today()))
    db.commit()
    return {"ok": True}


@router.delete("/groups/{group_id}")
def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = db.query(StudyGroup).filter(StudyGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다")
    if group.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="그룹 생성자만 삭제할 수 있습니다")
    db.query(StudyPresence).filter(StudyPresence.group_id == group_id).delete()
    db.query(StudyCheckin).filter(StudyCheckin.group_id == group_id).delete()
    db.query(StudyMember).filter(StudyMember.group_id == group_id).delete()
    db.delete(group)
    db.commit()
    return {"ok": True}


@router.delete("/groups/{group_id}/leave")
def leave_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = db.query(StudyMember).filter(
        StudyMember.group_id == group_id,
        StudyMember.user_id == current_user.id,
    ).first()
    if not member:
        raise HTTPException(status_code=400, detail="그룹 멤버가 아닙니다")
    db.query(StudyPresence).filter(
        StudyPresence.group_id == group_id,
        StudyPresence.user_id == current_user.id,
    ).delete()
    db.delete(member)
    db.commit()
    return {"ok": True}
