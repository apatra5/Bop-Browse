from models.user import User
from models.item import Item
from models.associations import user_like_items, user_dislike_items

def like_item(db, user_id: int, item_id: str):
    """Add an item to the user's liked items."""
    user = db.query(User).filter(User.id == user_id).first()
    item = db.query(Item).filter(Item.id == item_id).first()
    if item not in user.liked_items:
        user.liked_items.append(item)
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


def get_user_liked_items(db, user_id: int):
    """Retrieve all items liked by the user."""
    user = db.query(User).filter(User.id == user_id).first()
    return user.liked_items

def get_user_liked_items_for_closet_display(db, user_id: int):
    """Retrieve items liked by the user that are marked to show in closet."""
    query = (
        db.query(user_like_items.c.item_id)
        .filter(user_like_items.c.user_id == user_id)
        .filter(user_like_items.c.show_in_closet == True)
    )
    return query.all()

def remove_liked_items_from_closet_display(db, user_id: int, item_id: str):
    """Set show_in_closet to False for a liked item."""
    item = db.query(user_like_items).filter(
        user_like_items.c.user_id == user_id,
        user_like_items.c.item_id == item_id
    ).first()
    if item:
        item.show_in_closet = False
        db.commit()
    return item

def remove_from_liked_items(db, user_id: int, item_id: str):
    """Remove an item from the user's liked items."""
    user = db.query(User).filter(User.id == user_id).first()
    item = db.query(Item).filter(Item.id == item_id).first()
    if item in user.liked_items:
        user.liked_items.remove(item)
        db.commit()
    return user