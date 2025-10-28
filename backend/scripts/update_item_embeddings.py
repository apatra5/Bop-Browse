"""
Add embeddings for each item in the database based on their text description.
"""
from asyncio import sleep
from typing import List
from sentence_transformers import SentenceTransformer
from db.session import SessionLocal
from crud.item import update_item, get_items_count, get_all_items, get_item_by_id
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

def update_embeddings(start_offset=0, batch_size=50, skip_existing=False):
    # update every single item in the database with its embedding
    db = SessionLocal()
    total_items = get_items_count(db)
    logger.info(f"Total items to update: {total_items}")

    model = SentenceTransformer("all-mpnet-base-v2") 


    for offset in range(start_offset, total_items, batch_size):
        logger.info(f"Processing items from offset {offset} to {offset + batch_size}...")
        items = get_all_items(db, offset=offset, limit=batch_size)

        for i, item in enumerate(items):
            if item.embedding is not None and len(item.embedding) > 0 and skip_existing:
                continue
                
            embedding = compute_item_embedding(model, item.name)
            result = update_item(db, id=item.id, embedding=embedding)
            sleep(0.5)  # avoid RDS rate limit

            # double check when we're adding embeddings for items that previously had None, to ensure the update is successful for each individual item
            if skip_existing:
                result = get_item_by_id(db, item.id)
                logger.info(f"Re-checked: index={offset + i} item ID={item.id}, Name={item.name}, embedding={result.embedding[:5] if result.embedding is not None else 'None'}")

            if result.embedding is None:
                logger.error(f"Failed to update embedding for item ID={item.id}, Name={item.name}")

        logger.info(f"Updated items up to offset {offset + batch_size}.")

        # print validation for one item in this batch
        item = get_all_items(db, offset=offset, limit=1)[0]
        if item is None or item.embedding is None:
            # try again
            item = get_all_items(db, offset=offset, limit=1)[0]
            if item is None or item.embedding is None:
                logger.error(f"Failed to retrieve updated item at offset {offset}")
                continue
        sleep(1)  # avoid RDS rate limit

        logger.info(f"Sample updated item: ID={item.id}, Name={item.name}, Embedding (first 5 dims)={item.embedding[:5]}")


if __name__ == "__main__":
    update_embeddings(0, 100, skip_existing=True)