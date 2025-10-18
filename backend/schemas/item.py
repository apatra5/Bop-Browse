from typing import Optional
from pydantic import BaseModel


class ItemOut(BaseModel):
    id: str
    name: Optional[str] = None
    image_url_suffix: Optional[str] = None

    class Config:
        orm_mode = True
