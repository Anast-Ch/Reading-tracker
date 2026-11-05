from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

BookStatus = Literal["want_to_read", "reading", "read"]


class BookCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=500)
    author: str = Field(min_length=1, max_length=300)
    publish_year: int | None = Field(default=None, gt=0, le=9999)
    status: BookStatus
    start_date: date | None = None
    finish_date: date | None = None
    rating: int | None = Field(default=None, ge=1, le=5)
    pages_count: int | None = Field(default=None, gt=0, le=100000)


class BookUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str | None = Field(default=None, min_length=1, max_length=500)
    author: str | None = Field(default=None, min_length=1, max_length=300)
    publish_year: int | None = Field(default=None, gt=0, le=9999)
    status: BookStatus | None = None
    start_date: date | None = None
    finish_date: date | None = None
    rating: int | None = Field(default=None, ge=1, le=5)
    pages_count: int | None = Field(default=None, gt=0, le=100000)

    @model_validator(mode="after")
    def not_null_fields(self):
        for name in ("title", "author", "status"):
            if name in self.model_fields_set and getattr(self, name) is None:
                raise ValueError(f"Поле {name} не может быть null")
        return self


class BookOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    author: str
    publish_year: int | None
    status: BookStatus
    start_date: date | None
    finish_date: date | None
    rating: int | None
    pages_count: int | None
    cover_path: str | None
    created_at: datetime
    updated_at: datetime


class BookCounts(BaseModel):
    want_to_read: int
    reading: int
    read: int
