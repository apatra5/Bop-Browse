from typing import List
from models.outfit import Outfit
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

def create_outfit(db, id: str) -> Outfit:
    """Create a new outfit."""
    db_outfit = Outfit(id=id)
    db.add(db_outfit)
    db.commit()
    db.refresh(db_outfit)
    return db_outfit