from pydantic import BaseModel
from typing import List

from schemas.outfit import OutfitOut


class LikeRequest(BaseModel):
    """Schema for liking an item"""
    user_id: int
    item_id: str


class LikeResponse(BaseModel):
    """Schema for like response"""
    message: str
    user_id: int
    item_id: str

class LikeOutfitRequest(BaseModel):
    """Schema for liking an outfit"""
    user_id: int
    outfit_id: str

class LikeOutfitResponse(BaseModel):
    """Schema for like outfit response"""
    message: str
    user_id: int
    outfit_id: str

class UserLikesResponse(BaseModel):
    """Schema for getting user's liked items"""
    user_id: int
    liked_items: List[str]  

class UserLikesOutfitsResponse(BaseModel):
    """Schema for getting user's liked outfits"""
    user_id: int
    liked_outfits: List[OutfitOut]