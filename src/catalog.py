import json
from typing import List, Optional, Dict

class ProductCatalog:
    def __init__(self, data_path: str):
        self.data_path = data_path
        self.products = self._load_data()

    def _load_data(self) -> List[Dict]:
        """Loads the JSON catalog data."""
        try:
            with open(self.data_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Error: Catalog file not found at {self.data_path}")
            return []

    def get_all_products(self) -> List[Dict]:
        """Returns all products in the catalog."""
        return self.products

    def find_product_by_id(self, product_id: int) -> Optional[Dict]:
        """Finds a product using its PRODUCT (ID) field."""
        for p in self.products:
            if p.get("PRODUCT") == product_id:
                return p
        return None

    def find_products_by_spec(self, pitch: float = None, min_height: float = 0) -> List[Dict]:
        """
        Search for products based on specs.
        For now, this is a simple filter.
        """
        results = []
        for p in self.products:
            # Clean up JSON string fields if necessary (some are numbers, some might be strings in bad data)
            p_pitch = float(str(p.get("BID SPEC/PITCH", 999)))
            p_height = float(str(p.get("Active Display Size (Feet)/H", 0)))
            
            if pitch and p_pitch != pitch:
                continue
            if p_height < min_height:
                continue
            results.append(p)
        return results

if __name__ == "__main__":
    # Simple test
    catalog = ProductCatalog("/root/.gemini/antigravity/brain/19969d02-0a9d-4271-8642-fdc57ea4b842/mock_led_data.json")
    print(f"Loaded {len(catalog.products)} products.")
    item = catalog.find_product_by_id(11)
    if item:
        print(f"Found product 11: {item['OPTION']}")
