"""
Add embeddings for each item in the database based on their text description.
"""
from asyncio import sleep
import asyncio
from typing import List
from sentence_transformers import SentenceTransformer
from db.session import SessionLocal
from crud.item import update_item, get_items_count, get_all_items, get_item_by_id, bulk_update_items
from models.item import Item
from pgvector.sqlalchemy import Vector
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Quiet very noisy third-party loggers that print batch/progress info
for noisy in ("sentence_transformers", "transformers", "torch", "urllib3", "httpx"):
    logging.getLogger(noisy).setLevel(logging.WARNING)

def compute_item_embedding(model: SentenceTransformer, item_descriptions: List[str]) -> List[float]:
    embedding = model.encode(item_descriptions)
    embedding = [float(x) for x in embedding.tolist()]


    return embedding

async def update_embeddings(start_offset=0, batch_size=50, skip_existing=False):
    # update every single item in the database with its embedding
    db = SessionLocal()
    total_items = get_items_count(db)
    logger.info(f"Total items to update: {total_items}")

    model = SentenceTransformer("all-mpnet-base-v2") 


    for offset in range(start_offset, total_items, batch_size):
        logger.info(f"Processing items from offset {offset} to {offset + batch_size}...")
        items = get_all_items(db, offset=offset, limit=batch_size)

        for i, item in enumerate(items):
            if item.detailed_embedding is not None and len(item.detailed_embedding) > 0 and skip_existing:
                continue
                
            item.detailed_embedding = compute_item_embedding(model, f"[{item.color}] {item.name} [{[c.name for c in item.categories]}]")

        print(f"Updating embeddings for items {offset} to {offset + batch_size}...")
        print(f"Sample embedding for item {items[0].id}: {items[0].detailed_embedding[:5]}...")
        bulk_update_items(db, [{'id': item.id, 'detailed_embedding': item.detailed_embedding} for item in items])
            

        logger.info(f"Updated items up to offset {offset + batch_size}.")

        # print validation for one item in this batch
        item = get_all_items(db, offset=offset, limit=1)[0]
        if item is None or item.detailed_embedding is None:
            # try again
            item = get_all_items(db, offset=offset, limit=1)[0]
            if item is None or item.detailed_embedding is None:
                logger.error(f"Failed to retrieve updated item at offset {offset}")
                continue
        await asyncio.sleep(1)  # avoid RDS rate limit

        logger.info(f"Sample updated item: ID={item.id}, Name={item.name}, Embedding (first 5 dims)={item.detailed_embedding[:5]}")


if __name__ == "__main__":
    asyncio.run(update_embeddings(0, 100, skip_existing=True))