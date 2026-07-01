from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date, timedelta
from database import get_db
from models import StudyGroup, StudyMember, StudyCheckin, User
from deps import get_current_user

router = APIRouter(prefix="/api/study", tags=["study"])


class GroupCreate(BaseModel):
    name: str
    topic: str = ""


def _calc_streak(group_id: int, db: Session) -> int:
    check_date = date.today()
    streak = 0
    while True:
        has = db.query(StudyCheckin).filter(
            StudyCheckin.group_id == group_id,
            StudyCheckin.date == check_date,
        ).first()
        if has:
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    return streak


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

    member_list = []
    for uid in member_ids:
        u = db.query(User).filter(User.id == uid).first()
        if u:
            member_list.append({
                "nickname": u.nickname,
                "checked_in_today": uid in today_checkin_ids,
            })

    return {
        "id": g.id,
        "name": g.name,
        "topic": g.topic or "",
        "member_count": len(member_ids),
        "members": member_list,
        "is_member": current_user_id in member_ids,
        "checked_in_today": current_user_id in today_checkin_ids,
        "streak": _calc_streak(g.id, db),
    }


@router.get("/groups")
def list_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    groups = db.query(StudyGroup).order_by(StudyGroup.created_at.desc()).all()
    return [_group_dict(g, current_user.id, db) for g in groups]


@router.post("/groups")
def create_group(
    body: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="그룹 이름을 입력하세요")
    group = StudyGroup(name=body.name.strip(), topic=body.topic.strip(), created_by=current_user.id)
    db.add(group)
    db.flush()
    db.add(StudyMember(group_id=group.id, user_id=current_user.id))
    db.add(StudyCheckin(group_id=group.id, user_id=current_user.id, date=date.today()))
    db.commit()
    return {"ok": True, "id": group.id}


@router.post("/groups/{group_id}/join")
def join_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not db.query(StudyGroup).filter(StudyGroup.id == group_id).first():
        raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다")
    if db.query(StudyMember).filter(
        StudyMember.group_id == group_id,
        StudyMember.user_id == current_user.id,
    ).first():
        raise HTTPException(status_code=400, detail="이미 참가한 그룹입니다")
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
    db.delete(member)
    db.commit()
    return {"ok": True}
