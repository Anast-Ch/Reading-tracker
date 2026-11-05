import io
import uuid
from pathlib import Path

from PIL import Image, UnidentifiedImageError

from app.core.config import COVERS_DIR, settings
from app.core.exceptions import CoverValidationError

COVERS_URL_PREFIX = "/static/covers/"
ALLOWED_FORMATS = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp"}
MAX_PIXELS = 25_000_000


def save_cover(content: bytes) -> str:
    """Проверяет файл по содержимому, сохраняет и возвращает cover_path."""
    if len(content) > settings.max_cover_size_bytes:
        raise CoverValidationError("Файл больше 2 МБ")

    try:
        with Image.open(io.BytesIO(content)) as img:
            image_format = img.format
            width, height = img.size
            if width * height > MAX_PIXELS:
                raise CoverValidationError("Изображение слишком большое")
            img.verify()
    except (UnidentifiedImageError, OSError, SyntaxError, Image.DecompressionBombError):
        raise CoverValidationError("Файл не является изображением")

    extension = ALLOWED_FORMATS.get(image_format)
    if extension is None:
        raise CoverValidationError("Допустимы только JPG, PNG и WEBP")

    COVERS_DIR.mkdir(parents=True, exist_ok=True)
    name = f"{uuid.uuid4().hex}.{extension}"
    (COVERS_DIR / name).write_bytes(content)
    return COVERS_URL_PREFIX + name


def delete_cover_file(cover_path: str | None) -> None:
    """Удаляет файл обложки; отсутствие файла или ошибка ФС не считаются ошибкой."""
    if not cover_path or not cover_path.startswith(COVERS_URL_PREFIX):
        return
    try:
        (COVERS_DIR / Path(cover_path).name).unlink(missing_ok=True)
    except OSError:
        pass
