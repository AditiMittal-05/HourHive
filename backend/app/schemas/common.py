import math
from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel, model_validator

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int = 0

    @model_validator(mode="after")
    def _set_total_pages(self):
        if self.page_size > 0:
            self.total_pages = math.ceil(self.total / self.page_size)
        return self


class MessageResponse(BaseModel):
    message: str


class StatusToggleRequest(BaseModel):
    status: str
