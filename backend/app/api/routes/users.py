from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.exceptions import EmailAlreadyExistsError, WrongPasswordError
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import PasswordChange, UserOut, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_me(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return UserService(db).update_profile(
            current_user, data.model_dump(exclude_unset=True)
        )
    except EmailAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        UserService(db).change_password(
            current_user, data.current_password, data.new_password
        )
    except WrongPasswordError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    UserService(db).delete_account(current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
