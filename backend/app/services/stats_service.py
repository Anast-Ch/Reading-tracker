from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.core.exceptions import StatsParamsError
from app.repositories.stats_repository import StatsRepository


def _next_month(d: date) -> date:
    if d.month == 12:
        return date(d.year + 1, 1, 1)
    return date(d.year, d.month + 1, 1)


def resolve_period(
    period: str, year: int, month: int | None, season: str | None
) -> tuple[date, date]:
    """Возвращает (первый день периода, первый день после периода)."""
    if period == "month":
        if month is None or season is not None:
            raise StatsParamsError(
                "Для period=month укажите month и не передавайте season"
            )
        start = date(year, month, 1)
        return start, _next_month(start)

    if period == "season":
        if season is None or month is not None:
            raise StatsParamsError(
                "Для period=season укажите season и не передавайте month"
            )
        if season == "winter":
            return date(year - 1, 12, 1), date(year, 3, 1)
        if season == "spring":
            return date(year, 3, 1), date(year, 6, 1)
        if season == "summer":
            return date(year, 6, 1), date(year, 9, 1)
        return date(year, 9, 1), date(year, 12, 1)

    if month is not None or season is not None:
        raise StatsParamsError("Для period=year не передавайте month и season")
    return date(year, 1, 1), date(year + 1, 1, 1)


def _bucket_ranges(
    period: str, start: date, end_exclusive: date
) -> list[tuple[date, date]]:
    """Столбцы графика: месяц — блоки по 7 дней, сезон и год — по месяцам."""
    last = end_exclusive - timedelta(days=1)
    ranges: list[tuple[date, date]] = []
    d = start
    if period == "month":
        while d <= last:
            ranges.append((d, min(d + timedelta(days=6), last)))
            d += timedelta(days=7)
    else:
        while d < end_exclusive:
            nxt = _next_month(d)
            ranges.append((d, nxt - timedelta(days=1)))
            d = nxt
    return ranges


class StatsService:
    def __init__(self, db: Session):
        self.repo = StatsRepository(db)

    def get_stats(
        self,
        user_id: int,
        period: str,
        year: int,
        month: int | None,
        season: str | None,
    ) -> dict:
        start, end_excl = resolve_period(period, year, month, season)

        count_read, avg, rated_count, pages_total, books_with_pages = (
            self.repo.totals(user_id, start, end_excl)
        )

        ratings = {star: 0 for star in range(1, 6)}
        ratings.update(self.repo.ratings_distribution(user_id, start, end_excl))

        per_day = self.repo.counts_by_day(user_id, start, end_excl)
        buckets = [
            {
                "date_from": lo,
                "date_to": hi,
                "count": sum(c for day, c in per_day.items() if lo <= day <= hi),
            }
            for lo, hi in _bucket_ranges(period, start, end_excl)
        ]

        return {
            "period": period,
            "year": year,
            "month": month,
            "season": season,
            "date_from": start,
            "date_to": end_excl - timedelta(days=1),
            "count_read": count_read,
            "average_rating": round(avg, 2) if avg is not None else None,
            "rated_count": rated_count,
            "pages_total": pages_total,
            "books_with_pages": books_with_pages,
            "ratings": ratings,
            "buckets": buckets,
        }
