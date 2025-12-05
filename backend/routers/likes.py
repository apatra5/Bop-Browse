from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from db.session import SessionLocal
from crud import like_dislike_items as crud_likes
from schemas.like import LikeRequest, LikeResponse, UserLikesResponse
from schemas.item import ItemOut, ItemWithCategories
from scripts.sync_items import SyncItems

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
        result = crud_likes.like_item(db, user_id=like_data.user_id, item_id=like_data.item_id)
        
        if result is None:
            if not SyncItems().addItemByProductSin(like_data.item_id):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Item out of stock"
                )
            print("Item added to database, retrying like operation.")
            result = crud_likes.like_item(db, user_id=like_data.user_id, item_id=like_data.item_id)
            if result is None:
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


@router.get("/{user_id}", response_model=List[ItemWithCategories])
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


@router.get("/by-category/{user_id}", response_model=List[ItemOut])
def get_user_likes_by_category(
    user_id: int,
    category_id: str = Query(..., description="Category ID to filter liked items"),
    db: Session = Depends(get_db)
):
    """Get all liked items for a user filtered by category"""
    try:
        liked_items = crud_likes.get_user_liked_items_by_category(
            db, 
            user_id=user_id, 
            category_id=category_id
        )
        
        return liked_items
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching liked items by category: {str(e)}"
        )
