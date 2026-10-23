from fastapi import FastAPI

from app.api.routes import auth
from app.db.base import Base
from app.db.database import engine
from app.models import user  # noqa: F401

app = FastAPI(title="Reading Tracker API")

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
