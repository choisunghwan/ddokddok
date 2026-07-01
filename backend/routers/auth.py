from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from database import get_db
from models import User, AiceSubmission, StudySession, CourseProgress, StudyMember, StudyCheckin
from deps import get_current_user
import os

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 7


def create_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": str(user_id), "exp": expire}, os.getenv("SECRET_KEY"), algorithm=ALGORITHM)


class SignupRequest(BaseModel):
    email: str
    nickname: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    nickname: str


@router.post("/signup", response_model=TokenResponse)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다")
    user = User(
        email=body.email,
        nickname=body.nickname,
        password_hash=pwd_context.hash(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(access_token=create_token(user.id), nickname=user.nickname)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not pwd_context.verify(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸습니다")
    return TokenResponse(access_token=create_token(user.id), nickname=user.nickname)


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email, "nickname": current_user.nickname}


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


class NicknameChangeRequest(BaseModel):
    nickname: str


@router.put("/password")
def change_password(
    body: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not pwd_context.verify(body.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="현재 비밀번호가 올바르지 않습니다")
    current_user.password_hash = pwd_context.hash(body.new_password)
    db.commit()
    return {"ok": True}


@router.put("/nickname")
def change_nickname(
    body: NicknameChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.nickname = body.nickname
    db.commit()
    return {"ok": True, "nickname": current_user.nickname}


@router.delete("/me")
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(AiceSubmission).filter(AiceSubmission.user_id == current_user.id).delete()
    db.query(StudySession).filter(StudySession.user_id == current_user.id).delete()
    db.query(CourseProgress).filter(CourseProgress.user_id == current_user.id).delete()
    db.query(StudyMember).filter(StudyMember.user_id == current_user.id).delete()
    db.query(StudyCheckin).filter(StudyCheckin.user_id == current_user.id).delete()
    db.delete(current_user)
    db.commit()
    return {"ok": True}
