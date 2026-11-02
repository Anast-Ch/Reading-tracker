class EmailAlreadyExistsError(Exception):
    """Пользователь с таким email уже существует."""


class InvalidCredentialsError(Exception):
    """Неверный email или пароль при входе."""
