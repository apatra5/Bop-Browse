from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.base import Base
from .associations import item_category


class Category(Base):
    """"
    Category model representing item categories.
    Attributes:
        id (int): Primary key.
        name (str): Name of the category.
        itemCount (int): Number of items in this category.

        items (List[Item]): List of items associated with this category.
    """
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    itemCount = Column(Integer)

    items = relationship("Item", secondary=item_category, back_populates="categories")
