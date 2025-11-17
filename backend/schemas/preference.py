from pydantic import BaseModel


class PreferenceRequest(BaseModel):
    """Schema for adding a preference (item to likes)"""
    user_id: int
    item_id: str


class PreferenceResponse(BaseModel):
    """Schema for preference response"""
    message: str
    user_id: int
    item_id: str
