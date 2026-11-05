class EmailAlreadyExistsError(Exception):
    """Пользователь с таким email уже существует."""


class InvalidCredentialsError(Exception):
    """Неверный email или пароль при входе."""


class BookNotFoundError(Exception):
    """Книга не найдена (или принадлежит другому пользователю)."""


class BookValidationError(Exception):
    """Нарушены правила статуса, дат или оценки книги."""


class CoverValidationError(Exception):
    """Файл обложки не прошёл проверку (формат, размер, содержимое)."""
