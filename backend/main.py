from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import engine
import models
from routers import aice, auth, dashboard, study, notes

models.Base.metadata.create_all(bind=engine)

# Column / table migrations — wrapped in try-except so a failed ALTER never crashes startup
try:
    with engine.connect() as _conn:
        _conn.execute(text("ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE"))
        _conn.execute(text("ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS password_hash VARCHAR(64)"))
        # study_presence upsert needs this index; safe to run even if it already exists
        _conn.execute(text(
            "CREATE UNIQUE INDEX IF NOT EXISTS uq_presence_user_group "
            "ON study_presence (user_id, group_id)"
        ))
        _conn.commit()
except Exception as _e:
    import logging
    logging.getLogger(__name__).warning("Migration warning (non-fatal): %s", _e)

app = FastAPI(title="똑똑 API")

ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(aice.router)
app.include_router(dashboard.router)
app.include_router(study.router)
app.include_router(notes.router)


@app.get("/health")
@app.head("/health")
def health():
    return {"status": "ok"}
