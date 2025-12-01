from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db.session import SessionLocal
from crud import like_dislike_items as crud_likes
from schemas.preference import PreferenceRequest, PreferenceResponse
from schemas.item import ItemWithCategories

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
        result = crud_likes.add_to_user_preferences(
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


@router.get("/{user_id}", response_model=List[ItemWithCategories])
def get_user_preferences(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all preferences (liked items) for a user"""
    try:
        preferences = crud_likes.get_user_preferences(db, user_id=user_id)
        
        if preferences is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return preferences
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching preferences: {str(e)}"
        )


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user_preferences(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Delete all preferences for a user"""
    try:
        count = crud_likes.clear_user_preferences(db, user_id=user_id)
        
        return {
            "message": f"Successfully deleted {count} preference(s)",
            "user_id": user_id,
            "deleted_count": count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting preferences: {str(e)}"
        )
