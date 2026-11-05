from datetime import date

from sqlalchemy.orm import Session

from app.core.exceptions import BookNotFoundError, BookValidationError
from app.models.user_book import UserBook
from app.repositories.book_repository import BookRepository
from app.schemas.book import BookCreate, BookUpdate
from app.services.cover_service import delete_cover_file, save_cover

RULE_FIELDS = ("status", "start_date", "finish_date", "rating")


def validate_book_state(status, start_date, finish_date, rating) -> None:
    today = date.today()

    if status == "want_to_read":
        if start_date is not None or finish_date is not None or rating is not None:
            raise BookValidationError(
                "Для статуса «Хочу прочитать» даты и оценка должны быть пустыми"
            )
    elif status == "reading":
        if finish_date is not None or rating is not None:
            raise BookValidationError(
                "Для статуса «Читаю» дата завершения и оценка должны быть пустыми"
            )
    elif status == "read":
        if finish_date is None:
            raise BookValidationError(
                "Для статуса «Прочитано» нужна дата завершения"
            )

    if start_date is not None and start_date > today:
        raise BookValidationError("Дата начала не может быть в будущем")
    if finish_date is not None and finish_date > today:
        raise BookValidationError("Дата завершения не может быть в будущем")
    if start_date is not None and finish_date is not None and finish_date < start_date:
        raise BookValidationError(
            "Дата завершения не может быть раньше даты начала"
        )


class BookService:
    def __init__(self, db: Session):
        self.repo = BookRepository(db)

    def create_book(self, user_id: int, payload: BookCreate) -> UserBook:
        data = payload.model_dump()
        validate_book_state(
            data["status"], data["start_date"], data["finish_date"], data["rating"]
        )
        return self.repo.create(user_id, data)

    def get_book(self, user_id: int, book_id: int) -> UserBook:
        book = self.repo.get_for_user(book_id, user_id)
        if book is None:
            raise BookNotFoundError("Книга не найдена")
        return book

    def list_books(
        self, user_id: int, status: str | None, year: int | None
    ) -> list[UserBook]:
        if year is not None and status != "read":
            raise BookValidationError(
                "Фильтр по году работает только вместе со status=read"
            )
        return self.repo.list_for_user(user_id, status, year)

    def get_counts(self, user_id: int) -> dict[str, int]:
        counts = self.repo.count_by_status(user_id)
        return {
            "want_to_read": counts.get("want_to_read", 0),
            "reading": counts.get("reading", 0),
            "read": counts.get("read", 0),
        }

    def get_years(self, user_id: int) -> list[int]:
        return self.repo.read_years(user_id)

    def update_book(
        self, user_id: int, book_id: int, payload: BookUpdate
    ) -> UserBook:
        book = self.get_book(user_id, book_id)
        data = payload.model_dump(exclude_unset=True)
        state = {f: data.get(f, getattr(book, f)) for f in RULE_FIELDS}
        validate_book_state(**state)
        return self.repo.update(book, data)

    def delete_book(self, user_id: int, book_id: int) -> None:
        book = self.get_book(user_id, book_id)
        cover_path = book.cover_path
        self.repo.delete(book)
        delete_cover_file(cover_path)

    def set_cover(self, user_id: int, book_id: int, content: bytes) -> UserBook:
        book = self.get_book(user_id, book_id)
        new_path = save_cover(content)
        old_path = book.cover_path
        try:
            book = self.repo.update(book, {"cover_path": new_path})
        except Exception:
            delete_cover_file(new_path)
            raise
        delete_cover_file(old_path)
        return book

    def remove_cover(self, user_id: int, book_id: int) -> UserBook:
        book = self.get_book(user_id, book_id)
        old_path = book.cover_path
        if old_path is not None:
            book = self.repo.update(book, {"cover_path": None})
            delete_cover_file(old_path)
        return book
