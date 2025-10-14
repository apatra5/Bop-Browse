from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.base import Base
from associations import item_category


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)
    itemCount = Column(Integer)

    items = relationship("Item", secondary=item_category, back_populates="categories")
