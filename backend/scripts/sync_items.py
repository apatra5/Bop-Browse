from asyncio import sleep
from sqlalchemy.orm import Session
import logging
from typing import List, Dict

from services.shopbop_api import ShopbopAPIClient
from db.session import SessionLocal
from crud import item as crud_item, category as crud_category, outfit as crud_outfit

logging.basicConfig(level=logging.INFO)

class CategoryInfo:
    def __init__(self, category_name: str, category_id: int):
        self.name = category_name
        self.id = category_id
    
    def __str__(self):
        return f"CategoryInfo(name={self.name}, id={self.id})"
    
    def __repr__(self):
        return self.__str__()

class LeafCategoryInfo(CategoryInfo):
    def __init__(self, category_name: str, category_id: int, item_count: int, path: List[CategoryInfo]):
        super().__init__(category_name, category_id)
        self.item_count = item_count
        self.path = path  # List of CategoryInfo from root to this leaf

    def __str__(self):
        path_str = " > ".join([f"{cat.name}({cat.id})" for cat in self.path])
        return f"LeafCategoryInfo(name={self.name}, id={self.id}, item_count={self.item_count}, path=[{path_str}])"

    def __repr__(self):
        return self.__str__()
    
class ProductInfo:
    # Info: ProductSin (str), ShortDescription (str)
    def __init__(self, 
            product_sin: str, 
            short_description: str, 
            image_url_suffix: str = None, 
            product_detail_url: str = None,
            designer_name: str = None,
            price: str = None,
            color: str = None,
            stretch: str = None,
            product_images: List[str] = [],
            inStock: bool = True
            ):
        self.product_sin = product_sin
        self.short_description = short_description
        self.image_url_suffix = image_url_suffix
        self.product_detail_url = product_detail_url
        self.designer_name = designer_name
        self.price = price
        self.color = color
        self.stretch = stretch
        self.product_images = product_images
        self.inStock = inStock

    @classmethod
    def from_product_dict(cls, product: Dict):
        return cls(
            product_sin=product["productSin"],
            short_description=product["shortDescription"],
            image_url_suffix=product["colors"][0]["images"][0]["src"],
            product_detail_url=product["productDetailUrl"],
            designer_name=product["designerName"],
            price=product["retailPrice"]["price"],
            color=product["colors"][0]["name"],
            stretch=product.get("displayStretchAmount", None),
            product_images=[img["src"] for img in product["colors"][0]["images"]]
        )

    @classmethod
    def from_product_sin(cls, product_sin: str, api_client: ShopbopAPIClient):
        productresponse = api_client.get_product_by_product_sin(productSin=product_sin)
        product = productresponse.get("products", [])[0]
        print(product.get("inStock"))
        if product.get("inStock") is False:
            return cls(inStock=False, product_sin=product_sin, short_description=product.get("shortDescription", ""))
        if not product:
            return None
        return cls.from_product_dict(product)
    
    def detailed_str(self):
        return f"ProductInfo(product_sin={self.product_sin}, short_description={self.short_description}, image_url_suffix={self.image_url_suffix}, product_detail_url={self.product_detail_url}, designer_name={self.designer_name}, price={self.price}, color={self.color}, stretch={self.stretch}, product_images={self.product_images})"

    def __str__(self):
        return f"ProductInfo(product_sin={self.product_sin}, short_description={self.short_description})"

    def __repr__(self):
        return self.__str__()

class SyncItems:

    # Do dfs on the category tree ("clothing" as the root) to get to all leaf categories. Record the path to each leaf category.
    # Then for each leaf category, fetch items in that category.
    # For each item, first fetch its outfit. Skip this item if there's no outfit associated with it.
    # Then check if this item is already in the database. If yes, update. If not, create.

    def __init__(self):
        self.api_client = ShopbopAPIClient()
        self.db: Session = SessionLocal()
        self.skipped_items = 0
        self.updated_existing_items = 0
        self.added_items = 0

    def _get_dfs_root(self, category_root_id:str = "13266", dept: str = "WOMENS", lang: str = "en-US") -> Dict: 
        category_tree = self.api_client.get_categories(dept=dept, lang=lang)
        for category in category_tree.get("categories", []):
            if category.get("id") == category_root_id:
                return category
            
        return None

    def _category_dfs(self, current_category: Dict, path: List[CategoryInfo]) -> List[LeafCategoryInfo]:
        """
        Perform DFS on category tree to find all leaf categories and their paths. 
        return: List of tuples (leaf_category, path_to_leaf_category)
        - Path is a list of (name, id) tuples from root to the leaf.
        """
        children = current_category.get("children", [])

        # If there's no children, then this category is a leaf category
        if not children:
            return [LeafCategoryInfo(current_category["name"], current_category["id"], current_category["count"], path)]
        
        ret = []
        for child in children:
            ret.extend(self._category_dfs(child, path + [CategoryInfo(child["name"], child["id"])]))

        return ret


    def _scan_category_items(self, category: LeafCategoryInfo):
        total_item_scanned = 0
        while (total_item_scanned < category.item_count):
            response = self.api_client.browse_by_category(categoryId=category.id, offset=total_item_scanned)
            total_item_scanned += len(response.get("products", []))
            products = response.get("products", [])

            if not products or len(products) == 0:
                break

            for product in products:
                item = ProductInfo(product["product"])
                self._add_or_update_item(item, category_path=category.path)

    def _add_or_update_item(self, item: ProductInfo, category_path: List[CategoryInfo]):
        # Check if the item has any outfit associated with it
        outfit_response = self.api_client.get_outfit(productSin=item.product_sin)
        style_color_outfits = outfit_response.get("styleColorOutfits", [])
        if not style_color_outfits or len(style_color_outfits) == 0:
            self.skipped_items += 1
            return

        # Add all categories in the path to the database if they don't exist
        for category in category_path:
            db_category = crud_category.get_category(self.db, category.id)
            if not db_category:
                # Create the category if it doesn't exist
                db_category = crud_category.create_category(self.db, id=category.id, name=category.name, itemCount=0)

        # Check if the item is already in the database. If not, add it
        db_item = crud_item.get_item_by_id(self.db, id=item.product_sin)
        if not db_item:
            self.added_items += 1
            db_item = crud_item.create_item(self.db, 
                    id=item.product_sin, 
                    name=item.short_description, 
                    image_url_suffix=item.image_url_suffix, 
                    product_detail_url=item.product_detail_url,
                    designer_name=item.designer_name,
                    price=item.price,
                    color=item.color,
                    stretch=item.stretch,
                    product_images_urls=item.product_images
            )
        
        else: 
            # update existing item
            self.updated_existing_items += 1
            db_item = crud_item.update_item(self.db, 
                    id=item.product_sin, 
                    name=item.short_description, 
                    image_url_suffix=item.image_url_suffix, 
                    product_detail_url=item.product_detail_url, 
                    designer_name=item.designer_name, 
                    price=item.price, 
                    color=item.color, 
                    stretch=item.stretch, 
                    product_images_urls=item.product_images
            )

        # Update category associations
        for category in category_path:
            db_category = crud_category.get_category(self.db, category.id)
            if db_category not in db_item.categories:
                db_item.categories.append(db_category)
                db_category.itemCount += 1
                self.db.add(db_item)
                self.db.add(db_category)
                self.db.commit()

        # Check if we need to update outfits associated with this item
        for sc_outfit in style_color_outfits:
            outfits = sc_outfit.get("outfits", [])
            for outfit in outfits:
                outfit_id = outfit.get("id")
                outfit_image_url_suffix = outfit.get("primaryImage", {}).get("src")
                if crud_outfit.get_outfit_by_id(self.db, outfit_id) is None:
                    # Create the outfit if it doesn't exist
                    crud_outfit.create_outfit(self.db, id=outfit_id, image_url_suffix=outfit_image_url_suffix)

                if outfit_id and outfit_id not in [o.id for o in db_item.outfits]:
                    # Associate this outfit with the item
                    db_item.outfits.append(crud_outfit.get_outfit_by_id(self.db, outfit_id))
                    self.db.add(db_item)
                    self.db.commit()
        

    def update_existing_items(self, offset: int = 0, batch_size: int = 100):
        total_items = crud_item.get_items_count(self.db)
        current_count = 0
        for start in range(offset, total_items, batch_size):
            items = crud_item.get_all_items(self.db, offset=start, limit=batch_size)
            for db_item in items:
                product_info = ProductInfo.from_product_sin(db_item.id, self.api_client)
                if product_info:
                    if product_info.inStock is False:
                        continue
                    crud_item.update_item(self.db, 
                        id=db_item.id, 
                        name=product_info.short_description, 
                        image_url_suffix=product_info.image_url_suffix, 
                        product_detail_url=product_info.product_detail_url,
                        designer_name=product_info.designer_name,
                        price=product_info.price,
                        color=product_info.color,
                        stretch=product_info.stretch,
                        product_images_urls=product_info.product_images
                    )
                    logging.info(f"Updated item :{current_count} {db_item.id} - {product_info.short_description}")
                    current_count += 1
            logging.info(f"Finished updating items from {start} to {start + batch_size}.")
    

    def sync(self):
        # Get a list of leaf categories
        root = self._get_dfs_root(category_root_id = "13266", dept = "WOMENS", lang = "en-US")
        if not root:
            logging.error("Failed to find root category.")
            return
        logging.info(f"Found root category: {root['name']}({root['id']})")
        
        all_categories = self._category_dfs(root, path=[CategoryInfo(root["name"], root["id"])])
        logging.info(f"Found {len(all_categories)} leaf categories.")

        # Scan each leaf category
        for category in all_categories:
            logging.info(f"Scanning items in category: {category.name}: {category.id} - {category.item_count} items")
            # logging data
            old_added = self.added_items
            old_updated = self.updated_existing_items
            old_skipped = self.skipped_items
            
            self._scan_category_items(category)

            logging.info(f"Finished scanning category: {category.name}: {category.id}. Added {self.added_items - old_added}, Updated {self.updated_existing_items - old_updated}, Skipped {self.skipped_items - old_skipped}. Total so far - Added: {self.added_items}, Updated: {self.updated_existing_items}, Skipped: {self.skipped_items}")

        
        logging.info(f"Sync complete. Total items added: {self.added_items}, updated: {self.updated_existing_items}, skipped: {self.skipped_items}")

    def cleanTables(self):
        # Clean all tables
        deleted_items = crud_item.delete_all_items(self.db)
        deleted_categories = crud_category.delete_all_categories(self.db)
        deleted_outfits = crud_outfit.delete_all_outfits(self.db)
        logging.info(f"Deleted {deleted_items} items, {deleted_categories} categories, {deleted_outfits} outfits from the database.")



if __name__ == "__main__":
    syncer = SyncItems()
    syncer.update_existing_items(offset=200, batch_size=100)
