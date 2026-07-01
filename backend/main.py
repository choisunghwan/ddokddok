from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import aice, auth, dashboard

models.Base.metadata.create_all(bind=engine)

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


@app.get("/health")
@app.head("/health")
def health():
    return {"status": "ok"}
