from sqlalchemy import Column, String, ForeignKey, Table
from db.base import Base

item_category = Table(
    'item_category',
    Base.metadata,
    Column('item_id', String, ForeignKey('items.id'), primary_key=True),
    Column('category_id', String, ForeignKey('categories.id'), primary_key=True)
)