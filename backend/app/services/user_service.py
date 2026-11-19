from sqlalchemy.orm import Session

from app.core.exceptions import EmailAlreadyExistsError, WrongPasswordError
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories.book_repository import BookRepository
from app.repositories.user_repository import UserRepository
from app.services.cover_service import delete_cover_file


class UserService:
    def __init__(self, db: Session):
        self.users = UserRepository(db)
        self.books = BookRepository(db)

    def update_profile(self, user: User, data: dict) -> User:
        new_email = data.get("email")
        if new_email is not None and new_email != user.email:
            if self.users.get_by_email(new_email) is not None:
                raise EmailAlreadyExistsError(
                    "Пользователь с таким email уже зарегистрирован"
                )
        return self.users.update(user, data)

    def change_password(
        self, user: User, current_password: str, new_password: str
    ) -> None:
        if not verify_password(current_password, user.password_hash):
            raise WrongPasswordError("Неверный текущий пароль")
        self.users.update(user, {"password_hash": hash_password(new_password)})

    def delete_account(self, user: User) -> None:
        # сначала собираем пути, потом удаляем записи, потом файлы
        cover_paths = self.books.cover_paths_for_user(user.id)
        self.users.delete(user)
        for path in cover_paths:
            delete_cover_file(path)
