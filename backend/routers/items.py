from typing import List, Optional, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from db.session import SessionLocal
from crud import item as crud_item
from recommender import recommender
from schemas.item import ItemOut, PersonalizedFeedRequest

router = APIRouter(prefix="/items", tags=["items"])


def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()


@router.get("/feed", response_model=List[ItemOut])
def get_feed(
	category_id: Optional[str] = Query(None, description="Optional category filter. If not provided, returns items from all categories"),
	offset: int = Query(0, ge=0),
	limit: int = Query(10, ge=1, le=100),
	db: Session = Depends(get_db),
):
	"""Return items feed, optionally filtered by category. Returns all items if no category specified."""
	category_ids = [category_id] if category_id is not None else []
	items = crud_item.get_items_by_categories_filter(db, category_ids, offset=offset, limit=limit)
	return items

@router.post("/personalized-feed", response_model=List[ItemOut])
def get_personalized_feed(
	request: PersonalizedFeedRequest,
	db: Session = Depends(get_db),
	weighted_by_timestamp: bool = Query(False, description="Whether to weight liked items by recency")
):
	"""Return a personalized item feed for the user based on their like history and specified categories."""
	items = recommender.get_personalized_item_feed_for_user(
		db,
		user_id=request.user_id,
		category_ids=request.category_ids or [],
		limit=request.limit or 10
	)
	return items