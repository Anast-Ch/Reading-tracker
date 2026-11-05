from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import auth, books
from app.core.config import COVERS_DIR, STATIC_DIR, settings
from app.db.base import Base
from app.db.database import engine
from app.models import user, user_book  # noqa: F401

app = FastAPI(title="Reading Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
COVERS_DIR.mkdir(parents=True, exist_ok=True)

app.include_router(auth.router)
app.include_router(books.router)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
