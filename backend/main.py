from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import aice, auth, dashboard

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="똑똑 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(aice.router)
app.include_router(dashboard.router)


@app.get("/health")
def health():
    return {"status": "ok"}
