from sqlalchemy import Boolean, Column, String, ForeignKey, Table, Integer, func, DateTime
from sqlalchemy.orm import relationship
from db.base import Base

item_category = Table(
    'item_category',
    Base.metadata,
    Column('item_id', String, ForeignKey('items.id'), primary_key=True),
    Column('category_id', String, ForeignKey('categories.id'), primary_key=True)
)

item_outfit = Table(
    'item_outfit',
    Base.metadata,
    Column('item_id', String, ForeignKey('items.id'), primary_key=True),
    Column('outfit_id', String, ForeignKey('outfits.id'), primary_key=True),
)

class UserLikeItems(Base):
    __tablename__ = 'user_like_items'
    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    item_id = Column(String, ForeignKey('items.id'), primary_key=True)
    show_in_closet = Column(Boolean, default=True)
    like_timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="liked_items")
    item = relationship("Item", back_populates="liked_by_users")

user_dislike_items = Table(
    'user_dislike_items',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('item_id', String, ForeignKey('items.id'), primary_key=True)
)