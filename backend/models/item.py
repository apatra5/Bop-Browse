from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from db.base import Base
from .associations import item_category, item_outfit, user_dislike_items, UserLikeItems

class Item(Base):
    __tablename__ = "items"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    image_url_suffix = Column(String, nullable=True)
    product_detail_url = Column(String, nullable=True)
    designer_name = Column(String, nullable=True)
    price = Column(String, nullable=True)
    color = Column(String, nullable=True)
    stretch = Column(String, nullable=True)

    product_images = relationship("ProductImages", back_populates="item")


    embedding = Column(Vector(768), nullable=True)
    detailed_embedding = Column(Vector(768), nullable=True)

    categories = relationship("Category", secondary=item_category, back_populates="items")
    outfits = relationship("Outfit", secondary=item_outfit, back_populates="items")

    liked_by_users = relationship("UserLikeItems", back_populates="item")
    disliked_by_users = relationship("User", secondary=user_dislike_items, back_populates="disliked_items")
    preferred_by_users = relationship("UserPreferenceItems", back_populates="item")


    def __repr__(self):
        return f"<Item(id={self.id}, name={self.name})>"

class ProductImages(Base):
    __tablename__ = "product_images"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(String, ForeignKey(Item.id, ondelete="CASCADE"))
    image_url_suffix = Column(String)

    item = relationship("Item", back_populates="product_images")