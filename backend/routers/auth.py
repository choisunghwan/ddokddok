from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta, timezone
from database import get_db
from models import User, AiceSubmission, StudySession, CourseProgress, StudyMember, StudyCheckin, StudyNote, StudyTimerStat
from deps import get_current_user
import os, httpx

ADMIN_EMAILS = {e.strip().lower() for e in os.getenv("ADMIN_EMAILS", "").split(",") if e.strip()}

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 7
KAKAO_REST_KEY = os.getenv("KAKAO_REST_API_KEY", "")


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
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    return TokenResponse(access_token=create_token(user.id), nickname=user.nickname)


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "nickname": current_user.nickname,
        "kakao_linked": bool(current_user.kakao_id),
        "is_admin": current_user.email.lower() in ADMIN_EMAILS,
    }


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


class KakaoLoginRequest(BaseModel):
    code: str
    redirect_uri: str


def _kakao_exchange(code: str, redirect_uri: str):
    with httpx.Client() as c:
        token_res = c.post(
            "https://kauth.kakao.com/oauth/token",
            data={
                "grant_type": "authorization_code",
                "client_id": KAKAO_REST_KEY,
                "redirect_uri": redirect_uri,
                "code": code,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    token_data = token_res.json()
    if "access_token" not in token_data:
        raise HTTPException(status_code=400, detail=f"카카오 인증 실패: {token_data.get('error_description','')}")
    with httpx.Client() as c:
        info_res = c.get(
            "https://kapi.kakao.com/v2/user/me",
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
    info = info_res.json()
    kakao_id = str(info["id"])
    nickname = (info.get("kakao_account") or {}).get("profile", {}).get("nickname") or f"카카오유저{kakao_id[-4:]}"
    return kakao_id, nickname


@router.post("/kakao", response_model=TokenResponse)
def kakao_login(body: KakaoLoginRequest, db: Session = Depends(get_db)):
    kakao_id, nickname = _kakao_exchange(body.code, body.redirect_uri)
    email = f"kakao_{kakao_id}@kakao.local"

    user = db.query(User).filter(User.kakao_id == kakao_id).first()
    if not user:
        # 기존 이메일 방식으로 생성된 계정 마이그레이션
        user = db.query(User).filter(User.email == email).first()
        if user and not user.kakao_id:
            user.kakao_id = kakao_id
            db.commit()
    if not user:
        user = User(email=email, nickname=nickname, kakao_id=kakao_id,
                    password_hash=pwd_context.hash(f"kakao_{kakao_id}"))
        db.add(user); db.commit(); db.refresh(user)

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    return TokenResponse(access_token=create_token(user.id), nickname=user.nickname)


def _merge_kakao_account(db: Session, kakao_user: User, target_user: User):
    # 노트·학습 데이터 이전
    for model in [StudyNote, AiceSubmission, StudySession, CourseProgress]:
        db.query(model).filter(model.user_id == kakao_user.id).update(
            {"user_id": target_user.id}, synchronize_session=False
        )
    # 중복 가능한 테이블은 삭제 (카카오 전용 계정은 보통 비어있음)
    for model in [StudyMember, StudyCheckin, StudyTimerStat]:
        db.query(model).filter(model.user_id == kakao_user.id).delete(synchronize_session=False)
    db.delete(kakao_user)
    db.commit()


@router.post("/kakao/link")
def kakao_link(body: KakaoLoginRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    kakao_id, _ = _kakao_exchange(body.code, body.redirect_uri)

    existing = db.query(User).filter(User.kakao_id == kakao_id).first()
    if existing and existing.id != current_user.id:
        if existing.email.endswith("@kakao.local"):
            # 카카오 전용 계정 → 데이터 합치고 삭제
            _merge_kakao_account(db, kakao_user=existing, target_user=current_user)
        else:
            raise HTTPException(status_code=400, detail="이미 다른 계정에 연결된 카카오 계정입니다")

    current_user.kakao_id = kakao_id
    db.commit()
    return {"ok": True, "kakao_linked": True}


@router.delete("/kakao/link")
def kakao_unlink(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.kakao_id:
        raise HTTPException(status_code=400, detail="연결된 카카오 계정이 없습니다")
    current_user.kakao_id = None
    db.commit()
    return {"ok": True, "kakao_linked": False}


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
