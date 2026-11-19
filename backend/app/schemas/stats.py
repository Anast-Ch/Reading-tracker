from datetime import date

from pydantic import BaseModel


class StatsBucket(BaseModel):
    date_from: date
    date_to: date
    count: int


class StatsOut(BaseModel):
    period: str
    year: int
    month: int | None
    season: str | None
    date_from: date
    date_to: date
    count_read: int
    average_rating: float | None
    rated_count: int
    pages_total: int
    books_with_pages: int
    ratings: dict[int, int]
    buckets: list[StatsBucket]
