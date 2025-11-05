from typing import Optional, List
from pydantic import BaseModel


class ItemOut(BaseModel):
    id: str
    name: Optional[str] = None
    image_url_suffix: Optional[str] = None
    product_detail_url: Optional[str] = None

    class Config:
        orm_mode = True

class PersonalizedFeedRequest(BaseModel):
    user_id: int
    category_ids: Optional[List[str]] = []
    limit: Optional[int] = 10