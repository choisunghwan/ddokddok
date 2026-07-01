from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date
from database import get_db
from models import AiceSubmission, StudySession, User
from deps import get_current_user

router = APIRouter(prefix="/api/aice", tags=["aice"])

AICE_KEYWORDS = {
    1:  ["read_json", "read_csv", "merge"],
    2:  ["fillna", "mean", "mode"],
    3:  ["quantile", "IQR"],
    4:  ["get_dummies"],
    5:  ["countplot"],
    6:  ["jointplot"],
    7:  ["corr", "heatmap"],
    8:  ["to_datetime", "dt."],
    9:  ["train_test_split", "test_size"],
    10: ["fit(", "Regressor"],
    11: ["predict(", "mean_absolute_error"],
    12: ["Dropout", "Dense", "compile"],
    13: ["model.fit", "history"],
    14: [],
}

AICE_TYPES = {
    1: "데이터 불러오기·병합", 2: "결측치 처리", 3: "이상치 탐색",
    4: "범주형 인코딩", 5: "시각화 (countplot)", 6: "시각화 (jointplot)",
    7: "상관관계 분석", 8: "파생변수 생성", 9: "Train/Test 분할",
    10: "머신러닝 모델링", 11: "머신러닝 평가", 12: "딥러닝 모델 설계",
    13: "딥러닝 학습·시각화", 14: "결과 해석 서술",
}


class SubmitRequest(BaseModel):
    question_no: int
    code: str


class SubmitResponse(BaseModel):
    is_correct: bool
    missing_keywords: list[str]


@router.post("/submit", response_model=SubmitResponse)
def submit_answer(
    body: SubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    keywords = AICE_KEYWORDS.get(body.question_no, [])
    if len(keywords) == 0:
        is_correct = len(body.code.strip()) > 15
        missing = []
    else:
        missing = [k for k in keywords if k not in body.code]
        is_correct = len(missing) == 0

    db.add(AiceSubmission(
        user_id=current_user.id,
        question_no=body.question_no,
        question_type=AICE_TYPES.get(body.question_no, ""),
        submitted_code=body.code,
        is_correct=is_correct,
        missing_keywords=",".join(missing) if missing else None,
    ))
    db.add(StudySession(
        user_id=current_user.id,
        date=date.today(),
        duration_minutes=5,
        course_id="aice",
    ))
    db.commit()

    return SubmitResponse(is_correct=is_correct, missing_keywords=missing)


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(AiceSubmission)
        .filter(AiceSubmission.user_id == current_user.id)
        .order_by(AiceSubmission.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": r.id,
            "question_no": r.question_no,
            "question_type": r.question_type,
            "is_correct": r.is_correct,
            "missing_keywords": r.missing_keywords.split(",") if r.missing_keywords else [],
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]
