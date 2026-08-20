from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date
from collections import defaultdict
from database import get_db
from models import (
    LearningOrg, LearningOrgMember, LearningOrgSchedule, LearningOrgReport, User,
)
from deps import get_current_user

router = APIRouter(prefix="/api/learning-org", tags=["learning-org"])


class OrgCreate(BaseModel):
    name: str
    goal: str = ""


class ScheduleCreate(BaseModel):
    title: str
    date: date
    memo: str = ""


class ReportCreate(BaseModel):
    activity_date: date
    title: str
    participant_ids: list[int] = []
    content: str = ""


def _require_member(org_id: int, user_id: int, db: Session) -> LearningOrgMember:
    member = db.query(LearningOrgMember).filter(
        LearningOrgMember.org_id == org_id,
        LearningOrgMember.user_id == user_id,
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="학습조직 멤버가 아닙니다")
    return member


@router.get("/orgs")
def list_orgs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orgs = db.query(LearningOrg).order_by(LearningOrg.created_at.desc()).all()
    if not orgs:
        return []
    org_ids = [o.id for o in orgs]

    all_members = db.query(LearningOrgMember).filter(LearningOrgMember.org_id.in_(org_ids)).all()
    members_by = defaultdict(list)
    for m in all_members:
        members_by[m.org_id].append(m)

    schedule_counts = defaultdict(int)
    for row in db.query(LearningOrgSchedule.org_id).filter(LearningOrgSchedule.org_id.in_(org_ids)).all():
        schedule_counts[row.org_id] += 1

    report_counts = defaultdict(int)
    for row in db.query(LearningOrgReport.org_id).filter(LearningOrgReport.org_id.in_(org_ids)).all():
        report_counts[row.org_id] += 1

    result = []
    for o in orgs:
        my_membership = next((m for m in members_by[o.id] if m.user_id == current_user.id), None)
        result.append({
            "id": o.id,
            "name": o.name,
            "goal": o.goal or "",
            "year": o.year,
            "member_count": len(members_by[o.id]),
            "schedule_count": schedule_counts[o.id],
            "report_count": report_counts[o.id],
            "is_member": my_membership is not None,
            "is_leader": bool(my_membership and my_membership.is_leader),
        })
    return result


@router.post("/orgs")
def create_org(body: OrgCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="학습조직 이름을 입력하세요")
    org = LearningOrg(
        name=body.name.strip(),
        goal=body.goal.strip(),
        year=date.today().year,
        created_by=current_user.id,
    )
    db.add(org)
    db.flush()
    db.add(LearningOrgMember(org_id=org.id, user_id=current_user.id, is_leader=True))
    db.commit()
    return {"ok": True, "id": org.id}


@router.post("/orgs/{org_id}/join")
def join_org(org_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    org = db.query(LearningOrg).filter(LearningOrg.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="학습조직을 찾을 수 없습니다")
    if db.query(LearningOrgMember).filter(
        LearningOrgMember.org_id == org_id,
        LearningOrgMember.user_id == current_user.id,
    ).first():
        raise HTTPException(status_code=400, detail="이미 신청한 학습조직입니다")
    db.add(LearningOrgMember(org_id=org_id, user_id=current_user.id))
    db.commit()
    return {"ok": True}


@router.delete("/orgs/{org_id}/leave")
def leave_org(org_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    org = db.query(LearningOrg).filter(LearningOrg.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="학습조직을 찾을 수 없습니다")
    member = _require_member(org_id, current_user.id, db)

    remaining = db.query(LearningOrgMember).filter(
        LearningOrgMember.org_id == org_id,
        LearningOrgMember.user_id != current_user.id,
    ).order_by(LearningOrgMember.joined_at.asc()).all()

    if not remaining:
        db.query(LearningOrgReport).filter(LearningOrgReport.org_id == org_id).delete()
        db.query(LearningOrgSchedule).filter(LearningOrgSchedule.org_id == org_id).delete()
        db.query(LearningOrgMember).filter(LearningOrgMember.org_id == org_id).delete()
        db.delete(org)
        db.commit()
        return {"ok": True, "org_deleted": True}

    if member.is_leader:
        remaining[0].is_leader = True
    db.delete(member)
    db.commit()
    return {"ok": True, "org_deleted": False}


@router.get("/orgs/{org_id}")
def get_org(org_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    org = db.query(LearningOrg).filter(LearningOrg.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="학습조직을 찾을 수 없습니다")
    _require_member(org_id, current_user.id, db)

    members = db.query(LearningOrgMember).filter(LearningOrgMember.org_id == org_id).all()
    users = {u.id: u for u in db.query(User).filter(User.id.in_([m.user_id for m in members])).all()}
    member_list = [
        {"user_id": m.user_id, "nickname": users[m.user_id].nickname, "is_leader": m.is_leader}
        for m in members if m.user_id in users
    ]

    schedules = (
        db.query(LearningOrgSchedule)
        .filter(LearningOrgSchedule.org_id == org_id)
        .order_by(LearningOrgSchedule.date.asc())
        .all()
    )
    schedule_list = [
        {"id": s.id, "title": s.title, "date": s.date.isoformat(), "memo": s.memo or "", "created_by": s.created_by}
        for s in schedules
    ]

    reports = (
        db.query(LearningOrgReport)
        .filter(LearningOrgReport.org_id == org_id)
        .order_by(LearningOrgReport.activity_date.desc(), LearningOrgReport.id.desc())
        .all()
    )
    report_list = [
        {
            "id": r.id,
            "activity_date": r.activity_date.isoformat(),
            "title": r.title,
            "participants": r.participants or "",
            "content": r.content or "",
            "author_id": r.author_id,
            "author_nickname": users.get(r.author_id).nickname if users.get(r.author_id) else "",
        }
        for r in reports
    ]

    my_membership = next((m for m in members if m.user_id == current_user.id), None)

    return {
        "id": org.id,
        "name": org.name,
        "goal": org.goal or "",
        "year": org.year,
        "is_leader": bool(my_membership and my_membership.is_leader),
        "my_user_id": current_user.id,
        "members": member_list,
        "schedules": schedule_list,
        "reports": report_list,
    }


@router.post("/orgs/{org_id}/schedules")
def create_schedule(
    org_id: int, body: ScheduleCreate,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user),
):
    _require_member(org_id, current_user.id, db)
    if not body.title.strip():
        raise HTTPException(status_code=400, detail="일정 제목을 입력하세요")
    schedule = LearningOrgSchedule(
        org_id=org_id, title=body.title.strip(), date=body.date,
        memo=body.memo.strip(), created_by=current_user.id,
    )
    db.add(schedule)
    db.commit()
    return {"ok": True, "id": schedule.id}


@router.delete("/orgs/{org_id}/schedules/{schedule_id}")
def delete_schedule(
    org_id: int, schedule_id: int,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user),
):
    member = _require_member(org_id, current_user.id, db)
    schedule = db.query(LearningOrgSchedule).filter(
        LearningOrgSchedule.id == schedule_id, LearningOrgSchedule.org_id == org_id,
    ).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다")
    if schedule.created_by != current_user.id and not member.is_leader:
        raise HTTPException(status_code=403, detail="작성자 또는 리더만 삭제할 수 있습니다")
    db.delete(schedule)
    db.commit()
    return {"ok": True}


@router.post("/orgs/{org_id}/reports")
def create_report(
    org_id: int, body: ReportCreate,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user),
):
    _require_member(org_id, current_user.id, db)
    if not body.title.strip():
        raise HTTPException(status_code=400, detail="활동명을 입력하세요")

    members = db.query(LearningOrgMember).filter(LearningOrgMember.org_id == org_id).all()
    users = {u.id: u for u in db.query(User).filter(User.id.in_([m.user_id for m in members])).all()}
    participant_names = [
        users[uid].nickname for uid in body.participant_ids if uid in users
    ]

    report = LearningOrgReport(
        org_id=org_id,
        author_id=current_user.id,
        activity_date=body.activity_date,
        title=body.title.strip(),
        participants=", ".join(participant_names),
        content=body.content.strip(),
    )
    db.add(report)
    db.commit()
    return {"ok": True, "id": report.id}


@router.delete("/orgs/{org_id}/reports/{report_id}")
def delete_report(
    org_id: int, report_id: int,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user),
):
    member = _require_member(org_id, current_user.id, db)
    report = db.query(LearningOrgReport).filter(
        LearningOrgReport.id == report_id, LearningOrgReport.org_id == org_id,
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="활동내역서를 찾을 수 없습니다")
    if report.author_id != current_user.id and not member.is_leader:
        raise HTTPException(status_code=403, detail="작성자 또는 리더만 삭제할 수 있습니다")
    db.delete(report)
    db.commit()
    return {"ok": True}
