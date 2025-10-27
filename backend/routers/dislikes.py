from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db.session import SessionLocal
from crud import like_dislike_items as crud_likes
from schemas.dislike import DislikeRequest, DislikeResponse
from schemas.item import ItemOut

router = APIRouter(prefix="/dislikes", tags=["dislikes"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=DislikeResponse, status_code=status.HTTP_201_CREATED)
def dislike_item(
    dislike_data: DislikeRequest,
    db: Session = Depends(get_db)
):
    """Dislike an item - adds it to the user's disliked items"""
    try:
        user = crud_likes.dislike_item(db, user_id=dislike_data.user_id, item_id=dislike_data.item_id)
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User or item not found"
            )
        
        return DislikeResponse(
            message="Item disliked successfully",
            user_id=dislike_data.user_id,
            item_id=dislike_data.item_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error disliking item: {str(e)}"
        )


@router.get("/{user_id}", response_model=List[ItemOut])
def get_user_dislikes(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all items disliked by a user"""
    try:
        # Get user to access disliked_items
        from models.user import User
        user = db.query(User).filter(User.id == user_id).first()
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user.disliked_items
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching disliked items: {str(e)}"
        )
