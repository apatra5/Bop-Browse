from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from db.base import Base
from .associations import item_category, item_outfit, user_dislike_items, UserLikeItems

class Item(Base):
    __tablename__ = "items"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    image_url_suffix = Column(String, nullable=True)
    embedding = Column(Vector(768), nullable=True)

    categories = relationship("Category", secondary=item_category, back_populates="items")
    outfits = relationship("Outfit", secondary=item_outfit, back_populates="items")

    liked_by_users = relationship("UserLikeItems", back_populates="item")
    disliked_by_users = relationship("User", secondary=user_dislike_items, back_populates="disliked_items")


    def __repr__(self):
        return f"<Item(id={self.id}, name={self.name})>"
