from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)


def _check_password_bytes(value: str) -> str:
    # bcrypt учитывает только первые 72 БАЙТА пароля (кириллица — 2 байта)
    if len(value.encode("utf-8")) > 72:
        raise ValueError(
            "Пароль слишком длинный: максимум 72 байта "
            "(кириллица — 2 байта на символ)"
        )
    return value


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def password_fits_bcrypt(cls, value: str) -> str:
        return _check_password_bytes(value)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str | None = Field(default=None, min_length=1, max_length=150)
    email: EmailStr | None = None

    @model_validator(mode="after")
    def email_not_null(self):
        if "email" in self.model_fields_set and self.email is None:
            raise ValueError("Поле email не может быть null")
        return self


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)

    @field_validator("new_password")
    @classmethod
    def password_fits_bcrypt(cls, value: str) -> str:
        return _check_password_bytes(value)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    name: str | None = None
