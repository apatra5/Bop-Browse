"""
POC recommender prototype
A small scale prototype to do the proof of concept of how accurate the kNN based on text embeddings can be. 
Choose three categories that are very different, get 10 items for each category.
Then compute the embedding vectors of their descriptions with a sentence embedding model. 
I will then use one of the knitted top's embedding to look up for the closet 10 items, see if there's any leggings/dresses in there.
"""

from crud.item import get_items_by_category
from db.session import SessionLocal 
from models.item import Item
from typing import List
from sentence_transformers import SentenceTransformer
import numpy as np
import pandas as pd



def compute_item_embedding(model: SentenceTransformer, item_descriptions: List[str]):
    embeddings = model.encode(item_descriptions)
    print(embeddings.shape)
    return embeddings


def get_items_from_category(category_id, limit=10) -> List[Item]:
    db = SessionLocal()
    items = get_items_by_category(db, category_id, limit)
    return items

def get_closest_items(item_vector, embeddings, items, top_k=5):
    similarities = np.dot(embeddings, item_vector)
    closest_indices = similarities.argsort()[-top_k:][::-1]
    return [(items[i], similarities[i]) for i in closest_indices]

if __name__ == "__main__":
    # 1. get items from chosen categories
    # Choose three categories that are really different for this POC
    # Clothing > Activewear > Leggings
    # Clothing > Dresses
    # Clothing > Sweaters & Knits
    categories = ['13266']
    print("Getting items from categories:", categories)

    # get items from these categories
    items = []
    for category in categories:
        new_items = get_items_from_category(category, limit=500)
        items.extend([(item.id, f"[{item.color}] {item.name} [{[c.name for c in item.categories]}]", item.image_url_suffix) for item in new_items])
    print(items)

    df = pd.DataFrame(items, columns=['item_id', 'item_name', 'item_image_url'])
    print(df.head())

    
    # 2. compute embeddings for these items
    model = SentenceTransformer("all-MiniLM-L6-v2") # load the model once
    item_descriptions = df['item_name'].tolist()
    item_embeddings = compute_item_embedding(model, item_descriptions)

    df['item_embedding'] = item_embeddings.tolist()

    for index, row in df.iterrows():
        print(f"Item ID: {row['item_id']}, Name: {row['item_name']}, Embedding Vector (first 5 dims): {row['item_embedding'][:5]}")

    # 3. for POC, just take the first item (a knitted top), and find closest items
    test_item_vector = df.iloc[0]['item_embedding']
    print("Test item:", df.iloc[0]['item_name'])
    closest_items = get_closest_items(test_item_vector, item_embeddings, items, top_k=100)
    print("Closest items:")
    for item, sim in closest_items:
        print(f"Item ID: {item[0]}, Name: {item[1]}, Similarity: {sim:.4f}")
    with open("poc_recommender_output.html", "w") as f:
        f.write("<html><body>\n")
        f.write(f"<h2>Test item: {df.iloc[0]['item_name']}</h2>\n")
        f.write(f"<img src='https://m.media-amazon.com/images/G/01/Shopbop/p{df.iloc[0]['item_image_url']}' alt='{df.iloc[0]['item_name']}' width='200'><br>\n")
        f.write("<h3>Closest items:</h3>\n")
        for item, sim in closest_items:
            f.write(f"<div style='margin-bottom:20px;'>\n")
            f.write(f"<strong>Item ID:</strong> {item[0]}<br>\n")
            f.write(f"<strong>Name:</strong> {item[1]}<br>\n")
            f.write(f"<strong>Similarity:</strong> {sim:.4f}<br>\n")
            f.write(f"<img src='https://m.media-amazon.com/images/G/01/Shopbop/p{item[2]}' alt='{item[1]}' width='200'><br>\n")
            f.write("</div>\n")
        f.write("</body></html>\n")
    """
    Output:
    Test item: Spacedye Trophy High Waisted Midi Leggings
    Closest items:
    Item ID: 1501435234, Name: Spacedye Trophy High Waisted Midi Leggings, Similarity: 1.0000
    Item ID: 1511542393, Name: Spacedye Caught In the Midi High Waist Leggings, Similarity: 0.7801
    Item ID: 1505957642, Name: Spacedye Caught In The Midi Leggings, Similarity: 0.7653
    Item ID: 1508038415, Name: Freesoft High Rise Leggings 25, Similarity: 0.6251
    Item ID: 1508106271, Name: Magica Leggings, Similarity: 0.6228
    Item ID: 1503055427, Name: Clare High Waist Rigor Leggings 7/8, Similarity: 0.6020
    Item ID: 1516969624, Name: Airweight 7/8 Pocket Leggings, Similarity: 0.5753
    Item ID: 1506792695, Name: Ella High Waist Airweight 7/8 Leggings, Similarity: 0.5718
    Item ID: 1510206208, Name: Sculptflex Breathe High Rise Leggings, Similarity: 0.5499
    Item ID: 1500111308, Name: Poplin Stripe Open Back Midi Dress, Similarity: 0.5082
    Q.E.D.
    """