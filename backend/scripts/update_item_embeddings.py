"""
Add embeddings for each item in the database based on their text description.
"""
from typing import List
from sentence_transformers import SentenceTransformer
from db.session import SessionLocal
from crud.item import update_item, get_items_count, get_all_items
from models.item import Item
from pgvector.sqlalchemy import Vector
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Quiet very noisy third-party loggers that print batch/progress info
for noisy in ("sentence_transformers", "transformers", "torch", "urllib3", "httpx"):
    logging.getLogger(noisy).setLevel(logging.WARNING)

def compute_item_embedding(model: SentenceTransformer, item_descriptions: List[str]):
    embedding = model.encode(item_descriptions)
    embedding = [float(x) for x in embedding.tolist()]


    return embedding

START_OFFSET = 1400

if __name__ == "__main__":
    # update every single item in the database with its embedding
    db = SessionLocal()
    total_items = get_items_count(db)
    logger.info(f"Total items to update: {total_items}")

    batch_size = 100
    model = SentenceTransformer("all-mpnet-base-v2") 


    for offset in range(START_OFFSET, total_items, batch_size):
        logger.info(f"Processing items from offset {offset} to {offset + batch_size}...")
        items = get_all_items(db, offset=offset, limit=batch_size)

        for i, item in enumerate(items):
            embedding = compute_item_embedding(model, item.name)
            update_item(db, id=item.id, embedding=embedding)

        logger.info(f"Updated items up to offset {offset + batch_size}.")

        # print validation for one item in this batch
        item = get_all_items(db, offset=offset, limit=1)[0]
        logger.info(f"Sample updated item: ID={item.id}, Name={item.name}, Embedding (first 5 dims)={item.embedding[:5]}")