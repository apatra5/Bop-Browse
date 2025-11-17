
from typing import List

from sqlalchemy import desc, func, text
from models.item import Item, ProductImages
from models.associations import item_category, item_outfit


"""
Operations prepared for the frontend-facing API endpoints to get basic item recommendations based on category filters.
"""

def get_items_by_categories_filter(db, category_ids: List[int], offset: int = 0, limit: int = 10):
    """
    Retrieve items that are associated with any of the specified category IDs, with pagination.
    Args:
        db: Database session.
        category_ids (List[int]): List of category IDs to filter items by. It will return items that belong to any of these categories.
        offset (int): Number of items to skip (for pagination).
        limit (int): Maximum number of items to return.
    Returns:
        List of items matching the criteria.
    """
    if not category_ids:
        return (
            db.query(Item)
            .order_by(func.random())
            .limit(limit)
            .all()
        )
    
    query = (
        db.query(Item)
        .filter(Item.categories.any(item_category.c.category_id.in_(category_ids)))
        .order_by(func.random())
        .limit(limit)

    )
    item_ids = [row.id for row in query.all()]
    return (
        db.query(Item)
        .filter(Item.id.in_(item_ids))
        .all()
    )  
        

"""
Basic CRUD operations for Item model. These will be used by the database population/synchronization script
"""
def create_item(db, id: str, name: str, image_url_suffix: str = None, product_detail_url: str = None, embedding = None) -> Item:
    """Create a new item."""
    db_item = Item(id=id, name=name, image_url_suffix=image_url_suffix, product_detail_url=product_detail_url, embedding=embedding)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_item_by_id(db, id: str) -> Item:
    """Retrieve an item by its ID."""
    return db.query(Item).filter(Item.id == id).first()

def get_all_items(db, offset: int = 0, limit: int = 10) -> List[Item]:
    """Retrieve all items with pagination."""
    return db.query(Item).offset(offset).limit(limit).all()

def get_items_count(db) -> int:
    """Get the total count of items."""
    return db.query(Item).count()

def update_item(
        db, 
        id: str, 
        name: str = None, 
        image_url_suffix: str = None, 
        product_detail_url: str = None, 
        designer_name: str = None,
        price: str = None,
        color: str = None,
        stretch: str = None,
        product_images_urls: List[tuple[str, str]] = None,
        embedding = None,
        ) -> Item:
    """Update an existing item."""
    db_item = db.query(Item).filter(Item.id == id).first()
    if db_item:
        if name is not None:
            db_item.name = name
        if image_url_suffix is not None:
            db_item.image_url_suffix = image_url_suffix
        if product_detail_url is not None:
            db_item.product_detail_url = product_detail_url
        if embedding is not None:
            db_item.embedding = embedding
        if designer_name is not None:
            db_item.designer_name = designer_name
        if price is not None:
            db_item.price = price
        if color is not None:
            db_item.color = color
        if stretch is not None:
            db_item.stretch = stretch
        if product_images_urls is not None:
            db_item.product_images = []
            for image_id, url in product_images_urls:
                pi = ProductImages(item_id=id, id=image_id, image_url_suffix=url)
                db_item.product_images.append(pi)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_item(db, id: str) -> bool:
    """Delete an item by its ID."""
    db_item = db.query(Item).filter(Item.id == id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False

def delete_all_items(db) -> int:
    """Delete all items. Returns the number of deleted items."""
    # first delete all items in all associations
    db.execute(item_category.delete())
    db.execute(item_outfit.delete())
    db.commit()

    deleted = db.query(Item).delete()
    db.commit()
    return deleted

"""
CRUD for POC recommender prototype
"""
def get_items_by_category(db, category_id: str, limit: int = 10) -> List[Item]:
    """Retrieve items by category ID with a limit."""
    return (
        db.query(Item)
        .filter(Item.categories.any(item_category.c.category_id == category_id))
        .order_by(Item.id)
        .limit(limit)
        .all()
    )

def get_random_unseen_items_from_categories(db, user_id:str, category_ids: List[str], limit: int = 10) -> List[Item]:
    """Retrieve random items from specified categories with a limit."""
    query = db.query(Item)
    if category_ids and len(category_ids) > 0:
        query = query.filter(Item.categories.any(item_category.c.category_id.in_(category_ids)))

    query = (
        query
        .filter(~Item.liked_by_users.any(user_id=user_id))
        .filter(~Item.disliked_by_users.any(id=user_id))
        .order_by(func.random())
        .limit(limit)
    )
    
    return query.all()

"""
CRUD with vector lookup. Mostly just for POC but can be useful in the future to build the recommendation system
"""
def get_kNN_by_vector(db, query_vector: List[float], top_k: int = 10) -> List[Item]:
    """
    Retrieve kNN for a given vector. Only for POC to see if a centroid vector of user's likes can work well with this lookup method as a standalone recommendation algorithm.
    If this doesn't work, I'll consider using an engineering approach like randomly choosing liked items and find their kNNs, then aggregate the results, and also add some random items to prevent local convergence. 
    """
     # Perform vector similarity search
    return (
        db.query(Item)
        .filter(Item.embedding != None)
        .order_by(text(f"embedding <-> {query_vector}::vector"))
        .limit(top_k)
        .all()
    )

def get_kNN_by_item_id(db, item_id: str, top_k: int = 10) -> List[Item]:
    """
    Given an item ID, retrieve top-k similar items based on embedding.
    Might be useful for a lot of scenarios, like similar item recommendations, or use as a building block for the item feed. 
    """
    lookup_by_item = get_item_by_id(db, item_id)
    if lookup_by_item is None or lookup_by_item.embedding is None:
        return []

    vec_literal = '\'[' + ','.join(map(str, lookup_by_item.embedding)) + ']\''

    # Perform vector similarity search
    return (
        db.query(Item)
        .filter(Item.embedding != None)
        .filter(Item.id != item_id)
        .order_by(text(f"embedding <-> {vec_literal}::vector"))
        .limit(top_k)
        .all()
    )

def get_similar_unseen_items_for_user(db, item_id: str, user_id: str, top_k: int = 10, category_ids: List[str] = []) -> List[Item]:
    """
    Given an item ID and a user ID, retrieve top-k similar items based on embedding,
    excluding items that the user has already liked or disliked.
    """
    lookup_by_item = get_item_by_id(db, item_id)
    if lookup_by_item is None or lookup_by_item.embedding is None:
        return []

    vec_literal = '\'[' + ','.join(map(str, lookup_by_item.embedding)) + ']\''

    query = db.query(Item)

    if category_ids and len(category_ids) > 0:
        query = query.filter(Item.categories.any(item_category.c.category_id.in_(category_ids)))

     # Perform vector similarity search

    query = (
        query
        .filter(Item.embedding != None)
        .filter(Item.id != item_id)
        .filter(~Item.liked_by_users.any(user_id=user_id))
        .filter(~Item.disliked_by_users.any(id=user_id))
        .order_by(text(f"embedding <-> {vec_literal}::vector"))
        .limit(top_k)
    )


    return query.all()


"""
Manual tests
"""

def _test_get_by_category():
    from db.session import SessionLocal
    from models.category import Category
    db = SessionLocal()

    # test get by category
    category_ids = []
    category_names = [cat.name for cat in db.query(Category).filter(Category.id.in_(category_ids)).all()]
    print("Categories:", category_names)
    items = get_items_by_categories_filter(db, category_ids=category_ids, offset=0, limit=2)
    for item in items:
        print(item.id, item.name)
        print("\t", [cat.name for cat in item.categories])

def _test_get_kNN_by_item():
    from db.session import SessionLocal
    db = SessionLocal()

    item_id = "1551231198"  
    similar_items = get_kNN_by_item_id(db, item_id=item_id, top_k=10)
    print(f"Top 5 items similar to item ID {item_id}:")
    for item in similar_items:
        print(f"Item ID: {item.id}, Name: {item.name}")

def _test_similar_unseen_items():
    from db.session import SessionLocal
    db = SessionLocal()

    item_id = "1551231198" 
    user_id = 1

    similar_unseen_items = get_similar_unseen_items_for_user(db, item_id=item_id, user_id=user_id, top_k=10)
    print(f"Top 10 similar unseen items for user ID {user_id} based on item ID {item_id}:")
    for item in similar_unseen_items:
        print(f"Item ID: {item.id}, Name: {item.name}")

def _test_multiple_image_urls():
    from db.session import SessionLocal
    db = SessionLocal()

    item = get_item_by_id(db, "1571990997")
    print("Item:", item)
    print("Product image URLs:")
    for img in item.product_images:
        print("\t", img.image_url_suffix)
    
    product_images = [
        ("10157196", "/prod/products/rthir/rthir21453215d2/rthir21453215d2_1701450023062_2-0.jpg"),
        ("10157197", "/prod/products/rthir/rthir21453215d2/rthir21453215d2_1701450023041_2-0.jpg"),
        ("10157195", "/prod/products/rthir/rthir21453215d2/rthir21453215d2_1701450023077_2-0.jpg"),
        ("10157189", "/prod/products/rthir/rthir21453215d2/rthir21453215d2_1701450022013_2-0.jpg"),
        ("10157198", "/prod/products/rthir/rthir21453215d2/rthir21453215d2_1701450023508_2-0.jpg"),
        ("10157192", "/prod/products/rthir/rthir21453215d2/rthir21453215d2_1701450022229_2-0.jpg"),
    ]
    update_item(db, id=item.id, product_images_urls=product_images)

    item = get_item_by_id(db, "1571990997")
    print("After update, product image URLs:")
    for img in item.product_images:
        print("\t", img.image_url_suffix)

if __name__ == "__main__":
    _test_multiple_image_urls()