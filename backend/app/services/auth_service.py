from sqlalchemy.orm import Session

from app.core.exceptions import EmailAlreadyExistsError, InvalidCredentialsError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository


class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def register(self, email: str, password: str) -> User:
        if self.repo.get_by_email(email) is not None:
            raise EmailAlreadyExistsError(
                "Пользователь с таким email уже зарегистрирован"
            )
        password_hash = hash_password(password)
        return self.repo.create(email=email, password_hash=password_hash)

    def authenticate(self, email: str, password: str) -> User:
        user = self.repo.get_by_email(email)
        if user is None or not verify_password(password, user.password_hash):
            raise InvalidCredentialsError("Неверный email или пароль")
        return user

    def create_token_for_user(self, user: User) -> str:
        return create_access_token(data={"sub": str(user.id)})
