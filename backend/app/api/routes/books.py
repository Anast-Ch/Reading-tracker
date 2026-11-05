from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    Response,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.exceptions import (
    BookNotFoundError,
    BookValidationError,
    CoverValidationError,
)
from app.db.database import get_db
from app.models.user import User
from app.schemas.book import (
    BookCounts,
    BookCreate,
    BookOut,
    BookStatus,
    BookUpdate,
)
from app.services.book_service import BookService

router = APIRouter(prefix="/books", tags=["books"])


@router.post("", response_model=BookOut, status_code=status.HTTP_201_CREATED)
def create_book(
    data: BookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return BookService(db).create_book(current_user.id, data)
    except BookValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=list[BookOut])
def list_books(
    status_filter: BookStatus | None = Query(default=None, alias="status"),
    year: int | None = Query(default=None, ge=1, le=9998),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return BookService(db).list_books(current_user.id, status_filter, year)
    except BookValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# counts и years объявлены ДО /{book_id}, иначе их перехватит /{book_id}
@router.get("/counts", response_model=BookCounts)
def get_counts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BookService(db).get_counts(current_user.id)


@router.get("/years", response_model=list[int])
def get_years(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BookService(db).get_years(current_user.id)


@router.get("/{book_id}", response_model=BookOut)
def get_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return BookService(db).get_book(current_user.id, book_id)
    except BookNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{book_id}", response_model=BookOut)
def update_book(
    book_id: int,
    data: BookUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return BookService(db).update_book(current_user.id, book_id, data)
    except BookNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except BookValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        BookService(db).delete_book(current_user.id, book_id)
    except BookNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{book_id}/cover", response_model=BookOut)
def upload_cover(
    book_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # читаем на 1 байт больше лимита, чтобы заметить превышение
    content = file.file.read(settings.max_cover_size_bytes + 1)
    try:
        return BookService(db).set_cover(current_user.id, book_id, content)
    except BookNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except CoverValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{book_id}/cover", response_model=BookOut)
def delete_cover(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return BookService(db).remove_cover(current_user.id, book_id)
    except BookNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
