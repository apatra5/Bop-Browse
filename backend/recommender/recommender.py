"""
Logic for recommending items based on user's like history and item similarities.
Using crud operations to fetch data from the database.
"""

from ast import List
from crud.like_dislike_items import get_user_liked_items_randomized
from crud.item import get_similar_unseen_items_for_user, get_random_unseen_items_from_categories


def get_personalized_item_feed_for_user(db, user_id: str, category_ids: List[str], limit: int = 10):
    """
    Get a personalized item feed for user by getting unseen items that are similar to their liked items and is within the specified categories.
    It will also contain some random items to add diversity.
    """
    recommended_items = []
    liked_item_number = int(limit * 0.3) # the number of items that the user has already liked to base recommendations on
    random_liked_items = get_user_liked_items_randomized(db, user_id=user_id, limit=liked_item_number)

    similar_items_limit = int(limit * 0.7) # number of items to get based on similarity

    # Get similar items based on liked items
    for item_id in random_liked_items:
        similar_items = get_similar_unseen_items_for_user(
            db,
            item_id=item_id,
            user_id=user_id,
            top_k=similar_items_limit // liked_item_number
        )
        recommended_items.extend(similar_items)


    explore_items_limit = limit - len(recommended_items) # number of random items to explore
    # Get random items to explore
    if explore_items_limit > 0:
        random_explore_items = get_random_unseen_items_from_categories(
            db,
            user_id=user_id,
            category_ids=category_ids,
            limit=explore_items_limit
        )
        recommended_items.extend(random_explore_items)

    return recommended_items[:limit]

if __name__ == "__main__":
    from db.session import SessionLocal
    db = SessionLocal()
    user_id = "1"
    items = get_personalized_item_feed_for_user(db, user_id=user_id, category_ids=[], limit=10)
    print(f"Personalized item feed for user {user_id}: {items}")
    
