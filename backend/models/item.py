from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from db.base import Base
from .associations import item_category, item_outfit

class Item(Base):
    __tablename__ = "items"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)

    categories = relationship("Category", secondary=item_category, back_populates="items")
    outfits = relationship("Outfit", secondary=item_outfit, back_populates="items")
