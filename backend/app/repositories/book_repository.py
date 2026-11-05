from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user_book import UserBook


class BookRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, data: dict) -> UserBook:
        book = UserBook(user_id=user_id, **data)
        self.db.add(book)
        self.db.commit()
        self.db.refresh(book)
        return book

    def get_for_user(self, book_id: int, user_id: int) -> UserBook | None:
        return (
            self.db.query(UserBook)
            .filter(UserBook.id == book_id, UserBook.user_id == user_id)
            .first()
        )

    def list_for_user(
        self, user_id: int, status: str | None = None, year: int | None = None
    ) -> list[UserBook]:
        query = self.db.query(UserBook).filter(UserBook.user_id == user_id)
        if status is not None:
            query = query.filter(UserBook.status == status)
        if year is not None:
            query = query.filter(
                UserBook.finish_date >= date(year, 1, 1),
                UserBook.finish_date < date(year + 1, 1, 1),
            )
        if status == "read":
            query = query.order_by(
                UserBook.finish_date.desc(), UserBook.id.desc()
            )
        else:
            query = query.order_by(
                UserBook.created_at.desc(), UserBook.id.desc()
            )
        return query.all()

    def count_by_status(self, user_id: int) -> dict[str, int]:
        rows = (
            self.db.query(UserBook.status, func.count(UserBook.id))
            .filter(UserBook.user_id == user_id)
            .group_by(UserBook.status)
            .all()
        )
        return {status: count for status, count in rows}

    def read_years(self, user_id: int) -> list[int]:
        year = func.extract("year", UserBook.finish_date)
        rows = (
            self.db.query(year)
            .filter(
                UserBook.user_id == user_id,
                UserBook.status == "read",
                UserBook.finish_date.isnot(None),
            )
            .distinct()
            .order_by(year.desc())
            .all()
        )
        return [int(row[0]) for row in rows]

    def update(self, book: UserBook, data: dict) -> UserBook:
        for field, value in data.items():
            setattr(book, field, value)
        self.db.commit()
        self.db.refresh(book)
        return book

    def delete(self, book: UserBook) -> None:
        self.db.delete(book)
        self.db.commit()
