from typing import List
from sqlalchemy.orm import Session
from models.outfit import Outfit
from models.item import Item
from models.associations import item_outfit


def get_outfit_by_id(db, outfit_id: str):
    """
    Retrieve an outfit by its ID.
    Args:
        db: Database session.
        outfit_id (int): The ID of the outfit to retrieve.
    Returns:
        The outfit object if found, else None.
    """
    return db.query(Outfit).filter(Outfit.id == outfit_id).first()

def create_outfit(db, id: str, image_url_suffix: str = None) -> Outfit:
    """Create a new outfit."""
    db_outfit = Outfit(id=id, image_url_suffix=image_url_suffix)
    db.add(db_outfit)
    db.commit()
    db.refresh(db_outfit)
    return db_outfit

def get_all_outfits(db, offset: int = 0, limit: int = 10) -> List[Outfit]:
    """Retrieve all outfits with pagination."""
    return db.query(Outfit).offset(offset).limit(limit).all()

def get_outfits_count(db) -> int:
    """Get the total count of outfits."""
    return db.query(Outfit).count()

def update_outfit(db, outfit_id: str, image_url_suffix: str = None) -> Outfit:
    """Update an existing outfit."""
    db_outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if db_outfit:
        if image_url_suffix is not None:
            db_outfit.image_url_suffix = image_url_suffix
        db.add(db_outfit)
        db.commit()
        db.refresh(db_outfit)
    return db_outfit

def delete_outfit(db, outfit_id: str) -> bool:
    """Delete an outfit by its ID."""
    db_outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if db_outfit:
        db.delete(db_outfit)
        db.commit()
        return True
    return False

def delete_all_outfits(db) -> int:
    """Delete all outfits. Returns the number of deleted outfits."""
    count = db.query(Outfit).delete()
    db.commit()
    return count

def get_outfit_by_item_id(db: Session, item_id: str) -> List[Outfit]:
    """
    Retrieve all outfits that contain a specific item.
    Args:
        db: Database session.
        item_id (str): The ID of the item.
    Returns:
        List of outfit objects that contain the item.
    """
    return db.query(Outfit).join(item_outfit).filter(item_outfit.c.item_id == item_id).all()
