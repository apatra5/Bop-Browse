from sqlalchemy import func
from models.user import User
from models.item import Item
from models.associations import UserLikeItems, user_dislike_items, item_category

def like_item(db, user_id: int, item_id: str):
    """Add an item to the user's liked items."""
    query = (
        db.query(UserLikeItems)
        .filter(UserLikeItems.user_id == user_id)
        .filter(UserLikeItems.item_id == item_id)
    )

    if query.first() is None:
        user_like_item = UserLikeItems(user_id=user_id, item_id=item_id, show_in_closet=True)
        db.add(user_like_item)
        db.commit()
    return query.first()


def dislike_item(db, user_id: int, item_id: str):
    """Add an item to the user's disliked items."""
    user = db.query(User).filter(User.id == user_id).first()
    item = db.query(Item).filter(Item.id == item_id).first()
    if item not in user.disliked_items:
        user.disliked_items.append(item)
        db.commit()
    return user


def get_user_liked_items(db, user_id: int):
    """Retrieve all items liked by the user."""
    user = db.query(User).filter(User.id == user_id).first()
    return user.liked_items

def get_user_liked_items_for_closet_display(db, user_id: int):
    """Retrieve items liked by the user that are marked to show in closet."""
    item_ids = (
        db.query(UserLikeItems.item_id)
        .filter(UserLikeItems.user_id == user_id)
        .filter(UserLikeItems.show_in_closet == True)
    ).all()
    items = (
        db.query(Item)
        .filter(Item.id.in_([item_id for (item_id,) in item_ids]))
    ).all()

    return items

def remove_liked_items_from_closet_display(db, user_id: int, item_id: str):
    """Set show_in_closet to False for a liked item."""
    user_like_item_row = db.query(UserLikeItems).filter(
        UserLikeItems.user_id == user_id,
        UserLikeItems.item_id == item_id
    ).first()
    print(f"user_like_item_row: {user_like_item_row}")
    if user_like_item_row:
        user_like_item_row.show_in_closet = False
        db.commit()
    return user_like_item_row

def remove_from_liked_items(db, user_id: int, item_id: str):
    """Remove an item from the user's liked items."""
    user = db.query(User).filter(User.id == user_id).first()
    item = db.query(Item).filter(Item.id == item_id).first()
    if item in user.liked_items:
        user.liked_items.remove(item)
        db.commit()
    return user


def get_user_liked_items_by_category(db, user_id: int, category_id: str):
    """Retrieve liked items for a user filtered by category."""
    # Get item IDs that the user has liked
    liked_item_ids = (
        db.query(UserLikeItems.item_id)
        .filter(UserLikeItems.user_id == user_id)
        .filter(UserLikeItems.show_in_closet == True)
    ).all()
    
    liked_item_ids = [item_id for (item_id,) in liked_item_ids]
    
    if not liked_item_ids:
        return []
    
    # Get items that match both: liked by user AND in the specified category
    items = (
        db.query(Item)
        .join(item_category)
        .filter(Item.id.in_(liked_item_ids))
        .filter(item_category.c.category_id == category_id)
        .all()
    )
    
    return items

def get_user_liked_items_randomized(db, user_id:int, limit:int=10):
    """Retrieve a randomized list of item IDs liked by the user."""
    query = (
        db.query(UserLikeItems.item_id)
        .filter(UserLikeItems.user_id == user_id)
        .order_by(func.random())
        .limit(limit)
    )
    return [item for (item,) in query.all()]


""""
Manual tests
"""
def _test_user_like_dislike_closet():
    from db.session import SessionLocal
    db = SessionLocal()
    ret = like_item(db, user_id=1, item_id="1555064075")
    print(f"Liked item: {ret}")
    user_1_liked_items = get_user_liked_items(db, user_id=1)
    print(f"User 1 liked items: {user_1_liked_items}")
    user_1_liked_items_closet = get_user_liked_items_for_closet_display(db, user_id=1)
    print(f"User 1 liked items for closet display: {user_1_liked_items_closet}")
    ret = remove_liked_items_from_closet_display(db, user_id=1, item_id="1555064075")
    print(f"Removed item from closet display: {ret}")
    user_1_liked_items_closet_after = get_user_liked_items_for_closet_display(db, user_id=1)
    print(f"User 1 liked items for closet display after removal: {user_1_liked_items_closet_after}")
    user_1_liked_items_after = get_user_liked_items(db, user_id=1)
    print(f"User 1 liked items after removal from closet display: {user_1_liked_items_after}")

def _test_get_random_liked_items():
    from db.session import SessionLocal
    db = SessionLocal()
    items = get_user_liked_items_randomized(db, user_id=1, limit=5)
    print(f"Random liked items for user 1: {items}")

if __name__ == "__main__":
    _test_get_random_liked_items()