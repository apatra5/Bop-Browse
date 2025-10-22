from pydantic import BaseModel
from typing import List


class DislikeRequest(BaseModel):
    """Schema for disliking an item"""
    user_id: int
    item_id: str


class DislikeResponse(BaseModel):
    """Schema for dislike response"""
    message: str
    user_id: int
    item_id: str


class UserDislikesResponse(BaseModel):
    """Schema for getting user's disliked items"""
    user_id: int
    disliked_items: List[str]  # List of item IDs
