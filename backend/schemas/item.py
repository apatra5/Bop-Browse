from typing import Optional, List
from pydantic import BaseModel, field_validator

from schemas.category import CategoryOut


class ItemOut(BaseModel):
    id: str
    name: Optional[str] = None
    image_url_suffix: Optional[str] = None
    product_detail_url: Optional[str] = None
    designer_name: Optional[str] = None
    price: Optional[str] = None
    color: Optional[str] = None
    stretch: Optional[str] = None
    product_images: Optional[List[str]] = []

    @field_validator("product_images", mode="before")
    def collapse(cls, v):
        return [img.image_url_suffix for img in v]

    class Config:
        orm_mode = True
        from_attributes = True



class PersonalizedFeedRequest(BaseModel):
    user_id: int
    category_ids: Optional[List[str]] = []
    limit: Optional[int] = 10

class ItemWithCategories(ItemOut):
    categories: List[CategoryOut] = []

    class Config:
        orm_mode = True