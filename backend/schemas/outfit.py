from typing import Optional
from pydantic import BaseModel


class OutfitOut(BaseModel):
    """Schema for outfit output"""
    id: str
    image_url_suffix: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True
