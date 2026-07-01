# 똑똑 (DDOK_DDOK)

코딩 학습 + AI 자격증 준비 플랫폼. 회원별 학습 통계, AICE 모의 채점, 아키텍처 시각화를 제공합니다.

---

## 배포 인프라

| 역할 | 서비스 | URL |
|------|--------|-----|
| 프론트엔드 | Vercel (무료) | https://ddokddok-96y2rwmcr-ddokddok.vercel.app |
| 백엔드 API | Render (무료) | https://ddokddok.onrender.com |
| 데이터베이스 | Supabase PostgreSQL (무료) | ap-northeast-2 (서울) |

---

## 주요 기능

| 탭 | 기능 |
|----|------|
| 홈 | 연속 학습일 · 주간 학습 분 · 완료 문제 수 · 주간 차트 · 코스별 진행률 |
| 코딩 학습 | Python / Java 언어 → 챕터 → 레슨 3단계 구조, 코드 실행 단계별 시각화 |
| 자격증 | AICE Associate 모의고사 회차별 제공, 키워드 기반 자동 채점 |
| 아키텍처 | JWT 인증 흐름 9단계 SVG 애니메이션 |
| 스터디 | 스터디 그룹 현황 (개발 예정) |

---

## 기술 스택

**Frontend**
- React 19 + Vite
- Recharts (주간 차트)
- Lucide React (아이콘)
- Pretendard / JetBrains Mono 폰트

**Backend**
- FastAPI (Python)
- SQLAlchemy 1.4 + PyMySQL
- MariaDB / MySQL
- JWT 인증 (python-jose)
- bcrypt 비밀번호 해싱 (passlib)

---

## 프로젝트 구조

```
DDOK_DDOK/
├── backend/
│   ├── main.py              # FastAPI 앱, CORS, 라우터 등록
│   ├── database.py          # SQLAlchemy 엔진 및 세션
│   ├── models.py            # DB 모델 (User, AiceSubmission, StudySession, CourseProgress)
│   ├── deps.py              # JWT 인증 의존성
│   ├── routers/
│   │   ├── auth.py          # 회원가입 · 로그인 · /me
│   │   ├── aice.py          # AICE 채점 · 제출 이력
│   │   └── dashboard.py     # 대시보드 통계 · 학습 세션 기록
│   ├── .env                 # 환경변수 (git 제외)
│   └── .env.example         # 환경변수 템플릿
├── frontend/
│   └── src/
│       └── App.jsx          # 전체 프론트엔드 (단일 파일)
├── dev.ps1                  # 프론트 + 백 동시 실행 스크립트
└── .gitignore
```

---

## 로컬 실행

### 1. 환경변수 설정

```bash
cp backend/.env.example backend/.env
```

`backend/.env`를 열어 DB 정보와 시크릿 키를 입력합니다.

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ddokddok
SECRET_KEY=your-random-secret-key
```

### 2. DB 생성

```sql
CREATE DATABASE ddokddok CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 백엔드 실행

```bash
cd backend
pip install fastapi uvicorn sqlalchemy pymysql python-jose passlib python-dotenv
uvicorn main:app --reload
```

→ http://localhost:8000 · API 문서: http://localhost:8000/docs

### 4. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

→ http://localhost:5173

### 5. 동시 실행 (Windows PowerShell)

```powershell
.\dev.ps1
```

---

## API 엔드포인트

| Method | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 (JWT 반환) |
| GET | `/api/auth/me` | 내 정보 |
| GET | `/api/dashboard/stats` | 대시보드 통계 |
| POST | `/api/dashboard/session` | 학습 세션 기록 |
| POST | `/api/aice/submit` | AICE 답안 채점 |
| GET | `/api/aice/history` | 제출 이력 조회 |

> 인증이 필요한 엔드포인트는 `Authorization: Bearer <token>` 헤더를 포함해야 합니다.

---

## 환경 요구사항

- Python 3.10+
- Node.js 18+
- MariaDB 10.x 또는 MySQL 8.x
