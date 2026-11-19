from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user_book import UserBook


class StatsRepository:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _conditions(user_id: int, date_from: date, date_to_exclusive: date):
        return (
            UserBook.user_id == user_id,
            UserBook.status == "read",
            UserBook.finish_date >= date_from,
            UserBook.finish_date < date_to_exclusive,
        )

    def totals(
        self, user_id: int, date_from: date, date_to_exclusive: date
    ) -> tuple[int, float | None, int, int, int]:
        """(count_read, avg_rating, rated_count, pages_total, books_with_pages)"""
        row = (
            self.db.query(
                func.count(UserBook.id),
                func.avg(UserBook.rating),
                func.count(UserBook.rating),
                func.coalesce(func.sum(UserBook.pages_count), 0),
                func.count(UserBook.pages_count),
            )
            .filter(*self._conditions(user_id, date_from, date_to_exclusive))
            .one()
        )
        avg = float(row[1]) if row[1] is not None else None
        return int(row[0]), avg, int(row[2]), int(row[3]), int(row[4])

    def ratings_distribution(
        self, user_id: int, date_from: date, date_to_exclusive: date
    ) -> dict[int, int]:
        rows = (
            self.db.query(UserBook.rating, func.count(UserBook.id))
            .filter(
                *self._conditions(user_id, date_from, date_to_exclusive),
                UserBook.rating.isnot(None),
            )
            .group_by(UserBook.rating)
            .all()
        )
        return {int(rating): int(count) for rating, count in rows}

    def counts_by_day(
        self, user_id: int, date_from: date, date_to_exclusive: date
    ) -> dict[date, int]:
        rows = (
            self.db.query(UserBook.finish_date, func.count(UserBook.id))
            .filter(*self._conditions(user_id, date_from, date_to_exclusive))
            .group_by(UserBook.finish_date)
            .all()
        )
        return {day: int(count) for day, count in rows}
