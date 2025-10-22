from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from db.session import SessionLocal
from crud import outfit as crud_outfit
from schemas.outfit import OutfitOut

router = APIRouter(prefix="/outfits", tags=["outfits"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=List[OutfitOut])
def get_outfits_by_item(
    item_id: str = Query(..., description="Item ID to find outfits for"),
    db: Session = Depends(get_db)
):
    """Get all outfits containing a specific item"""
    outfits = crud_outfit.get_outfits_by_item_id(db, item_id=item_id)
    return outfits
