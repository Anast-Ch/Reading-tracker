from sqlalchemy import (
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.sql import func

from app.db.base import Base


class UserBook(Base):
    __tablename__ = "user_books"
    __table_args__ = (
        CheckConstraint(
            "status IN ('want_to_read', 'reading', 'read')",
            name="ck_user_books_status",
        ),
        CheckConstraint(
            "rating IS NULL OR (rating >= 1 AND rating <= 5)",
            name="ck_user_books_rating",
        ),
        CheckConstraint(
            "pages_count IS NULL OR pages_count > 0",
            name="ck_user_books_pages",
        ),
        CheckConstraint(
            "publish_year IS NULL OR publish_year > 0",
            name="ck_user_books_year",
        ),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(500), nullable=False)
    author = Column(String(300), nullable=False)
    publish_year = Column(Integer, nullable=True)
    status = Column(String(20), nullable=False)
    start_date = Column(Date, nullable=True)
    finish_date = Column(Date, nullable=True)
    rating = Column(Integer, nullable=True)
    pages_count = Column(Integer, nullable=True)
    cover_path = Column(String(500), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
