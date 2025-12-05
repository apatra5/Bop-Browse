from typing import Optional
from pydantic import BaseModel


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int
    is_new_user: bool = True

    class Config:
        orm_mode = True


class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    is_new_user: Optional[bool] = None
