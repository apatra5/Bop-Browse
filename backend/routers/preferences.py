from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import SessionLocal
from crud import like_dislike_items as crud_likes
from schemas.preference import PreferenceRequest, PreferenceResponse

router = APIRouter(prefix="/preferences", tags=["preferences"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=PreferenceResponse, status_code=status.HTTP_201_CREATED)
def add_preference(
    preference_data: PreferenceRequest,
    db: Session = Depends(get_db)
):
    """Add a preference - adds the item to the user's likes table"""
    try:
        result = crud_likes.like_item(
            db, 
            user_id=preference_data.user_id, 
            item_id=preference_data.item_id
        )
        
        if result is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User or item not found"
            )
        
        return PreferenceResponse(
            message="Preference added successfully",
            user_id=preference_data.user_id,
            item_id=preference_data.item_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding preference: {str(e)}"
        )
