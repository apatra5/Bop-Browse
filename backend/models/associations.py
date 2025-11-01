from sqlalchemy import Boolean, Column, String, ForeignKey, Table, Integer
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

user_like_items = Table(
    'user_like_items',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('item_id', String, ForeignKey('items.id'), primary_key=True),
    Column('show_in_closet', Boolean, default=True)
)

user_dislike_items = Table(
    'user_dislike_items',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('item_id', String, ForeignKey('items.id'), primary_key=True)
)