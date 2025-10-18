from typing import Optional
from pydantic import BaseModel


class CategoryOut(BaseModel):
    id: str
    name: Optional[str] = None
    itemCount: Optional[int] = None

    class Config:
        orm_mode = True
