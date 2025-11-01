from models.user import User
from models.item import Item
from models.associations import UserLikeItems, user_dislike_items

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

if __name__ == "__main__":
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