from sqlalchemy import Column, Integer, ForeignKey, Table

item_category = Table(
    'item_category',
    Column('item_id', Integer, ForeignKey('items.id'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id'), primary_key=True)
)