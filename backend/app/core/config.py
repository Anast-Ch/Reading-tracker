from pathlib import Path

from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parents[2]  # папка backend/
STATIC_DIR = BASE_DIR / "static"
COVERS_DIR = STATIC_DIR / "covers"


class Settings(BaseSettings):
    database_url: str = (
        "postgresql+psycopg2://reading:reading@localhost:5433/reading_tracker"
    )
    secret_key: str = "CHANGE_ME_SECRET_KEY"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    cors_origin_regex: str = r"https?://(localhost|127\.0\.0\.1)(:\d+)?"
    max_cover_size_bytes: int = 2 * 1024 * 1024

    class Config:
        env_file = ".env"


settings = Settings()
