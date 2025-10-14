
from typing import List
from ..models.item import Item
from ..models.associations import item_category


"""
Operations prepared for the frontend-facing API endpoints to get basic item recommendations based on category filters.
"""

def get_items_by_categories_filter(db, category_ids: List[int], offset: int = 0, limit: int = 10):
    """
    Retrieve items that are associated with all specified category IDs, with pagination.
    Args:
        db: Database session.
        category_ids (List[int]): List of category IDs to filter items by. It will return items that belong to all these categories.
        offset (int): Number of items to skip (for pagination).
        limit (int): Maximum number of items to return.
    Returns:
        List of items matching the criteria.
    """
    if not category_ids:
        return db.query(Item).offset(offset).limit(limit).all()
    
    query = db.query(item_category.c.item_id).filter(item_category.c.category_id.in_(category_ids)).group_by(item_category.c.item_id).having(db.func.count(item_category.c.category_id) == len(category_ids)).offset(offset).limit(limit)
    item_ids = [row.item_id for row in query.all()]
    return db.query(Item).filter(Item.id.in_(item_ids)).all()


"""
Operations for database population/synchronization script.
"""
def add_item_with_categories(db, id: int, name: str, category_ids: List[int]) -> Item:
    """
    Create a new item and associate it with given categories.
    """
    # Check if the item is already in the database. If so, check if we need to associate this item with more categories.
    db_item = db.query(Item).filter(Item.id == id).first()
    if db_item:
        existing_item_categories = db.query(item_category.c.category_id).filter(item_category.c.item_id == id).all()
        existing_item_category_ids = {row.category_id for row in existing_item_categories}
        new_category_ids = set(category_ids) - existing_item_category_ids
        for category_id in new_category_ids:
            db.execute(item_category.insert().values(item_id=id, category_id=category_id))
        db.commit()
        return db_item
    
    # If the item is not in the database, create it and associate with categories.
    db_item = Item(id=id, name=name)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    for category_id in category_ids:
        db.execute(item_category.insert().values(item_id=id, category_id=category_id))
    db.commit()
    return db_item        
        

"""
Basic CRUD operations for Item model. These will be used by the database population/synchronization script
"""
def create_item(db, id: int, name: str) -> Item:
    """Create a new item."""
    db_item = Item(id=id, name=name)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_item_by_id(db, id: int) -> Item:
    """Retrieve an item by its ID."""
    return db.query(Item).filter(Item.id == id).first()

def get_all_items(db, offset: int = 0, limit: int = 10) -> List[Item]:
    """Retrieve all items with pagination."""
    return db.query(Item).offset(offset).limit(limit).all()

def get_items_count(db) -> int:
    """Get the total count of items."""
    return db.query(Item).count()

def update_item(db, id: int, name: str) -> Item:
    """Update an existing item."""
    db_item = db.query(Item).filter(Item.id == id).first()
    if db_item:
        db_item.name = name
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_item(db, id: int) -> bool:
    """Delete an item by its ID."""
    db_item = db.query(Item).filter(Item.id == id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False

def delete_all_items(db) -> int:
    """Delete all items. Returns the number of deleted items."""
    deleted = db.query(Item).delete()
    db.commit()
    return deleted
