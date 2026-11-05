from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def password_fits_bcrypt(cls, value: str) -> str:
        # bcrypt учитывает только первые 72 БАЙТА пароля (кириллица — 2 байта)
        if len(value.encode("utf-8")) > 72:
            raise ValueError(
                "Пароль слишком длинный: максимум 72 байта "
                "(кириллица — 2 байта на символ)"
            )
        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    name: str | None = None
