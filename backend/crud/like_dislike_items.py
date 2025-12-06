from sqlalchemy import func
from sqlalchemy.orm import selectinload
from models.outfit import Outfit
from models.user import User
from models.item import Item
from models.associations import UserLikeItems, user_dislike_items, item_category, UserPreferenceItems

def like_item(db, user_id: int, item_id: str):
    """Add an item to the user's liked items. Also add to preference items."""
    item_exist = db.query(Item).filter(Item.id == item_id).first()
    if not item_exist:
        return None
    query = (
        db.query(UserLikeItems)
        .filter(UserLikeItems.user_id == user_id)
        .filter(UserLikeItems.item_id == item_id)
    )

    if query.first() is None:
        user_like_item = UserLikeItems(user_id=user_id, item_id=item_id)
        db.add(user_like_item)
        user_preference_item = UserPreferenceItems(user_id=user_id, item_id=item_id)
        db.add(user_preference_item)
        db.commit()
    return query.first()

def like_outfit(db, user_id: int, outfit_id: str):
    """Add an outfit to the user's liked outfits."""
    user = db.query(User).filter(User.id == user_id).first()
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if outfit not in user.liked_outfits:
        user.liked_outfits.append(outfit)
        db.commit()
    return user

def get_user_liked_outfits(db, user_id: int) -> list[Outfit]:
    """Retrieve all outfits liked by the user."""
    user = (
        db.query(User)
        .options(selectinload(User.liked_outfits))
        .filter(User.id == user_id)
        .first()
    )
    if user:
        return user.liked_outfits
    return None

def remove_liked_outfit(db, user_id: int, outfit_id: str):
    """Remove an outfit from the user's liked outfits."""
    user = db.query(User).filter(User.id == user_id).first()
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if outfit in user.liked_outfits:
        user.liked_outfits.remove(outfit)
        db.commit()
    return user

def dislike_item(db, user_id: int, item_id: str):
    """Add an item to the user's disliked items."""
    user = db.query(User).filter(User.id == user_id).first()
    item = db.query(Item).filter(Item.id == item_id).first()
    if item not in user.disliked_items:
        user.disliked_items.append(item)
        db.commit()
    return user

def add_to_user_preferences(db, user_id: int, item_id: str):
    """Add an item to the user's preference items."""
    query = (
        db.query(UserPreferenceItems)
        .filter(UserPreferenceItems.user_id == user_id)
        .filter(UserPreferenceItems.item_id == item_id)
    )

    if query.first() is None:
        user_preference_item = UserPreferenceItems(user_id=user_id, item_id=item_id)
        db.add(user_preference_item)
        db.commit()
    return query.first()

def clear_user_preferences(db, user_id: int):
    """Clear all items from the user's preference items."""
    count = (
        db.query(UserPreferenceItems)
        .filter(UserPreferenceItems.user_id == user_id)
        .delete()
    )
    db.commit()
    return count

def get_user_preferences(db, user_id: int):
    """Retrieve all items from the user's preference items."""
    user = (
        db.query(User)
        .options(selectinload(User.preference_items).selectinload(UserPreferenceItems.item))
        .filter(User.id == user_id)
        .first()
    )
    if user:
        return [pref_item.item for pref_item in user.preference_items]
    return None

def get_user_liked_items(db, user_id: int):
    """Retrieve all items liked by the user from user's preference table."""
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )
    return user.preference_items

def get_user_liked_items_for_closet_display(db, user_id: int):
    """Retrieve items liked by the user that are marked to show in closet."""
    items = (
        db.query(Item)
        .join(UserLikeItems)
        .filter(UserLikeItems.user_id == user_id)
        .order_by(UserLikeItems.like_timestamp.desc())
        .all()
    )

    return items

def remove_liked_items_from_closet_display(db, user_id: int, item_id: str):
    """Remove an item from user's liked items closet display, but not remove from user's preference table."""
    user_like_item_row = db.query(UserLikeItems).filter(
        UserLikeItems.user_id == user_id,
        UserLikeItems.item_id == item_id
    ).first()
    if user_like_item_row:
        db.delete(user_like_item_row)
        db.commit()
    return True

def remove_from_liked_items(db, user_id: int, item_id: str):
    """Remove an item from the user's liked items, and also from preference items."""

    user_like_item_row = db.query(UserLikeItems).filter(
        UserLikeItems.user_id == user_id,
        UserLikeItems.item_id == item_id
    ).first()

    user_preference_item_row = db.query(UserPreferenceItems).filter(
        UserPreferenceItems.user_id == user_id,
        UserPreferenceItems.item_id == item_id
    ).first()

    if user_like_item_row:
        db.delete(user_like_item_row)
        db.commit()
        
    if user_preference_item_row:
        db.delete(user_preference_item_row)
        db.commit()

    user = db.query(User).filter(User.id == user_id).first()
    item = db.query(Item).filter(Item.id == item_id).first()
    
    if item in user.liked_items:
        user.liked_items.remove(item)
        db.commit()
    if item in user.preference_items:
        user.preference_items.remove(item)
        db.commit()
    return user


def get_user_liked_items_by_category(db, user_id: int, category_id: str):
    """Retrieve liked items for a user filtered by category."""
    # Get item IDs that the user has liked
    liked_item_ids = (
        db.query(UserLikeItems.item_id)
        .filter(UserLikeItems.user_id == user_id)
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

def get_user_liked_items_randomized(db, user_id:int, limit:int=10, weighted_by_timestamp:bool=True):
    """
    Retrieve a randomized list of item IDs from user's preferred items.
    If weighted_by_timestamp is True, more recently liked items have higher chance of being selected.
    """
    query = (
        db.query(UserPreferenceItems.item_id)
        .filter(UserPreferenceItems.user_id == user_id)
    )
    # To calculate weighted random selection, newest items will be more likely to be selected.
    if weighted_by_timestamp:
        # First calculate the weight based on time difference from now. 
        subquery = (
            db.query(
                UserPreferenceItems.item_id,
                (func.extract('epoch', func.now()) - func.extract('epoch', UserPreferenceItems.set_timestamp)).label('time_diff')
            )
            .filter(UserPreferenceItems.user_id == user_id)
            .subquery()
        )
        # Then the weighted randomized value will be time_diff * random() and sorted ascendingly.
        query = (
            db.query(subquery.c.item_id)
            .order_by((subquery.c.time_diff * func.random()).asc())
            .limit(limit)
        )
        # Then get the items from the item IDs
        item_ids = [item_id for (item_id,) in query.all()]
        return item_ids
    else:
        query = (
            db.query(UserPreferenceItems.item_id)
            .filter(UserPreferenceItems.user_id == user_id)
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

def _test_user_like_item_timestamp():
    from db.session import SessionLocal
    db = SessionLocal()
    item_ids = [
        "1501599302",
        "1593916693",
        "1536117314",
        "1543679714",
        "1582218454",
        "1592644365",
        "1562062486",
        "1596973394",
        "1578597604",
        "1519888602"
    ]
    for item_id in item_ids:
        remove_from_liked_items(db, user_id=18, item_id=item_id)
    for item_id in item_ids:
        like_item(db, user_id=18, item_id=item_id)
        print(f"Liked item {item_id} for user 18")
    liked_items = get_user_liked_items_for_closet_display(db, user_id=18)
    print("Liked items in order:")
    for index, item in enumerate(liked_items):
        if item.id != item_ids[len(item_ids) - 1 - index]:
            print(f"Order mismatch at index {index}: expected {item_ids[len(item_ids) - 1 - index]}, got {item.id}")
        else:
            print(f"Item ID: {item.id}")
            
"""
Migrate from the aggregated liked table to preference table
"""
def _migrate_liked_to_preference():
    from db.session import SessionLocal
    db = SessionLocal()
    all_liked = db.query(UserLikeItems).all()
    for liked in all_liked:
        user_id = liked.user_id
        item_id = liked.item_id
        existing_pref = (
            db.query(UserPreferenceItems)
            .filter(UserPreferenceItems.user_id == user_id)
            .filter(UserPreferenceItems.item_id == item_id)
            .first()
        )
        if existing_pref is None:
            new_pref = UserPreferenceItems(user_id=user_id, item_id=item_id, set_timestamp=liked.like_timestamp)
            db.add(new_pref)
            print(f"Added preference for user {user_id}, item {item_id}")
    db.commit()

def _remove_liked_rows_not_shown_in_closet():
    from db.session import SessionLocal
    db = SessionLocal()
    all_liked = db.query(UserLikeItems).filter(UserLikeItems.show_in_closet == False).all()
    for liked in all_liked:
        db.delete(liked)
        print(f"Deleted liked item row for user {liked.user_id}, item {liked.item_id}")
    db.commit()

if __name__ == "__main__":
    _remove_liked_rows_not_shown_in_closet()