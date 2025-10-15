from models.category import Category
from models.associations import item_category


"""
Basic CRUD operations for Category model. 
"""
def get_category(db, category_id: int) -> Category:
    """Retrieve a category by its ID."""
    return db.query(Category).filter(Category.id == category_id).first()

def get_all_categories(db) -> list[Category]:
    """Retrieve all categories."""
    return db.query(Category).all()

def create_category(db, id: int, name: str, itemCount: int) -> Category:
    """Create a new category."""
    db_category = Category(id=id, name=name, itemCount=itemCount)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db, id: int, name: str = None, itemCount: int = None) -> Category:
    """Update an existing category."""
    db_category = db.query(Category).filter(Category.id == id).first()
    if db_category:
        if name is not None:
            db_category.name = name
        if itemCount is not None:
            db_category.itemCount = itemCount
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_category(db, id: int) -> bool:
    """Delete a category by its ID."""
    db_category = db.query(Category).filter(Category.id == id).first()
    if db_category:
        db.delete(db_category)
        db.commit()
        return True
    return False

def delete_all_categories(db) -> int:
    """Delete all categories. Returns the number of deleted categories."""
    count = db.query(Category).delete()
    db.commit()
    return count

def get_categories_count(db) -> int:
    """Get the total count of categories."""
    return db.query(Category).count()


