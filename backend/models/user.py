from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.base import Base
from models.associations import user_like_items, user_dislike_items

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    liked_items = relationship("Item", secondary=user_like_items, back_populates="liked_by_users")
    disliked_items = relationship("Item", secondary=user_dislike_items, back_populates="disliked_by_users")

