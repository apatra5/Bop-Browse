from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from db.base import Base
from models.associations import UserLikeItems, user_dislike_items

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_new_user = Column(Boolean, default=True)

    liked_items = relationship("UserLikeItems", back_populates="user")
    disliked_items = relationship("Item", secondary=user_dislike_items, back_populates="disliked_by_users")
    preference_items = relationship("UserPreferenceItems", back_populates="user")

