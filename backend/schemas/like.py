from pydantic import BaseModel
from typing import List


class LikeRequest(BaseModel):
    """Schema for liking an item"""
    user_id: int
    item_id: str


class LikeResponse(BaseModel):
    """Schema for like response"""
    message: str
    user_id: int
    item_id: str


class UserLikesResponse(BaseModel):
    """Schema for getting user's liked items"""
    user_id: int
    liked_items: List[str]  
