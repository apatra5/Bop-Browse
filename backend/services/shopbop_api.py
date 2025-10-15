import httpx

class ShopbopAPIClient:
    BASE_URL = "https://api.shopbop.com/"
    headers = {
        'accept':'application/json',
        'Client-Id':'Shopbop-UW-Team1-2025',
        'Client-Version':'1.0.0'
    }

    def __init__(self):
        self._client = httpx.Client(
            base_url=self.BASE_URL, 
            headers=self.headers,
            timeout=10.0
        )

    def get_categories(self, dept: str = "WOMENS", lang: str = "en-US"):
        response = self._client.get(f"/public/folders?lang={lang}&dept={dept}")
        response.raise_for_status()
        return response.json()
    
    def browse_by_category(self, categoryId: str, allowOutOfStockItems: bool = None, colors: str = None, lang: str = "en-US", sort: str = None, minPrice: str = None, maxPrice: str = None, limit: int = None, dept: str = "WOMENS", q: str = None, offset: int = None):
        params = {
            "categoryId": categoryId,
            "allowOutOfStockItems": allowOutOfStockItems,
            "colors": colors,
            "lang": lang,
            "sort": sort,
            "minPrice": minPrice,
            "maxPrice": maxPrice,
            "limit": limit,
            "dept": dept,
            "q": q,
            "offset": offset
        }
        # Remove None values from params
        params = {k: v for k, v in params.items() if v is not None}
        
        response = self._client.get("/public/categories/{categoryId}/products", params=params)
        response.raise_for_status()
        return response.json()
    
    def get_outfit(self, productSin, lang: str = "en-US"):
        response = self._client.get(f"/public/outfits?productSin={productSin}&lang={lang}")
        response.raise_for_status()
        return response.json()
    
    def close(self):
        self._client.close()