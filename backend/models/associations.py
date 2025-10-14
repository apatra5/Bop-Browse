from sqlalchemy import Column, Integer, ForeignKey, Table
from db.base import Base

item_category = Table(
    'item_category',
    Base.metadata,
    Column('item_id', Integer, ForeignKey('items.id'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id'), primary_key=True)
)