from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import StudyNote, User
from deps import get_current_user

router = APIRouter(prefix="/api/notes", tags=["notes"])

CATEGORIES = ["Python", "Java", "SQL", "AICE", "ADsP", "기타"]


class NoteCreate(BaseModel):
    title: str
    content: str = ""
    tags: str = ""
    category: str = ""


class NoteUpdate(BaseModel):
    title: str
    content: str = ""
    tags: str = ""
    category: str = ""


def _serialize(note: StudyNote, author: str = "", is_mine: bool = False):
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "tags": note.tags,
        "category": note.category or "",
        "author": author,
        "is_mine": is_mine,
        "created_at": note.created_at.isoformat() if note.created_at else None,
        "updated_at": note.updated_at.isoformat() if note.updated_at else None,
    }


@router.get("")
def list_notes(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(StudyNote, User.nickname).join(User, StudyNote.user_id == User.id)
    if category:
        q = q.filter(StudyNote.category == category)
    results = q.order_by(StudyNote.updated_at.desc()).all()
    return [_serialize(note, author=nickname, is_mine=(note.user_id == current_user.id)) for note, nickname in results]


@router.get("/{note_id}")
def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = db.query(StudyNote, User.nickname).join(User, StudyNote.user_id == User.id).filter(StudyNote.id == note_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="노트를 찾을 수 없습니다")
    note, nickname = result
    return _serialize(note, author=nickname, is_mine=(note.user_id == current_user.id))


@router.post("")
def create_note(
    body: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = StudyNote(
        user_id=current_user.id,
        title=body.title,
        content=body.content,
        tags=body.tags,
        category=body.category,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return _serialize(note, author=current_user.nickname, is_mine=True)


@router.put("/{note_id}")
def update_note(
    note_id: int,
    body: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(StudyNote).filter(
        StudyNote.id == note_id,
        StudyNote.user_id == current_user.id,
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="노트를 찾을 수 없습니다")
    note.title = body.title
    note.content = body.content
    note.tags = body.tags
    note.category = body.category
    db.commit()
    db.refresh(note)
    return _serialize(note, author=current_user.nickname, is_mine=True)


@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(StudyNote).filter(
        StudyNote.id == note_id,
        StudyNote.user_id == current_user.id,
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="노트를 찾을 수 없습니다")
    db.delete(note)
    db.commit()
    return {"ok": True}
