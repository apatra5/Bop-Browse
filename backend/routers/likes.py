from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db.session import SessionLocal
from crud import like_dislike_items as crud_likes
from schemas.like import LikeRequest, LikeResponse, UserLikesResponse
from schemas.item import ItemOut

router = APIRouter(prefix="/likes", tags=["likes"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=LikeResponse, status_code=status.HTTP_201_CREATED)
def like_item(
    like_data: LikeRequest,
    db: Session = Depends(get_db)
):
    """Like an item - adds it to the user's liked items"""
    try:
        user = crud_likes.like_item(db, user_id=like_data.user_id, item_id=like_data.item_id)
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User or item not found"
            )
        
        return LikeResponse(
            message="Item liked successfully",
            user_id=like_data.user_id,
            item_id=like_data.item_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error liking item: {str(e)}"
        )


@router.get("/{user_id}", response_model=List[ItemOut])
def get_user_likes(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all items liked by a user"""
    try:
        liked_items = crud_likes.get_user_liked_items_for_closet_display(db, user_id=user_id)
        
        if liked_items is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return liked_items
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching liked items: {str(e)}"
        )

##Make sure to test endpoint
@router.delete("/", response_model=LikeResponse)
def unlike_item(
    like_data: LikeRequest,
    db: Session = Depends(get_db)
):
    """Unlike an item - removes it from the user's liked items"""
    try:
        item = crud_likes.remove_liked_items_from_closet_display(db, user_id=like_data.user_id, item_id=like_data.item_id)
        
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User or item not found"
            )
        
        return LikeResponse(
            message="Item unliked successfully",
            user_id=like_data.user_id,
            item_id=like_data.item_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error unliking item: {str(e)}"
        )
