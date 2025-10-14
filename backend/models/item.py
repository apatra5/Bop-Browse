from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.base import Base
from .associations import item_category

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

    categories = relationship("Category", secondary=item_category, back_populates="items")
