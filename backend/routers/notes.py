from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import StudyNote, User
from deps import get_current_user

router = APIRouter(prefix="/api/notes", tags=["notes"])


class NoteCreate(BaseModel):
    title: str
    content: str = ""
    tags: str = ""


class NoteUpdate(BaseModel):
    title: str
    content: str = ""
    tags: str = ""


def _serialize(note: StudyNote):
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "tags": note.tags,
        "created_at": note.created_at.isoformat() if note.created_at else None,
        "updated_at": note.updated_at.isoformat() if note.updated_at else None,
    }


@router.get("")
def list_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notes = (
        db.query(StudyNote)
        .filter(StudyNote.user_id == current_user.id)
        .order_by(StudyNote.updated_at.desc())
        .all()
    )
    return [_serialize(n) for n in notes]


@router.get("/{note_id}")
def get_note(
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
    return _serialize(note)


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
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return _serialize(note)


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
    db.commit()
    db.refresh(note)
    return _serialize(note)


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
