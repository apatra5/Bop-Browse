from typing import Optional
from pydantic import BaseModel
from typing import List

from schemas.item import ItemOut


class OutfitOut(BaseModel):
    """Schema for outfit output"""
    id: str
    image_url_suffix: Optional[str] = None
    items: Optional[List[ItemOut]] = []

    class Config:
        orm_mode = True
        from_attributes = True
