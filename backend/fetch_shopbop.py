import requests
import json

BASE_URL = "https://api.shopbop.com/public"

# Get all folders/categories
print("Fetching all categories...")
folders_response = requests.get(f"{BASE_URL}/folders?lang=en-US&dept=MENs")
folders_data = folders_response.json()

# Recursively extract all category info
def get_all_categories(categories, parent_name="", level=0):
    result = []
    for category in categories:
        full_name = f"{parent_name} > {category['name']}" if parent_name else category['name']
        
        result.append({
            'id': category['id'],
            'name': category['name'],
            'full_path': full_name,
            'level': level,
            'count': category['count'],
            'suppressed': category.get('suppressed', False)
        })
        
        # Get nested children
        if 'children' in category:
            result.extend(get_all_categories(category['children'], full_name, level + 1))
    
    return result

all_categories = get_all_categories(folders_data['categories'])

print(f"\nFound {len(all_categories)} total categories")
print(f"Total items across all categories: {sum(cat['count'] for cat in all_categories)}")

# Save to JSON
with open('shopbop_categories.json', 'w') as f:
    json.dump(all_categories, f, indent=2)

# Save to CSV for easy viewing
import csv
with open('shopbop_categories.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'name', 'full_path', 'level', 'count', 'suppressed'])
    writer.writeheader()
    writer.writerows(all_categories)

print("\n✓ Saved categories to:")
print("  - shopbop_categories.json")
print("  - shopbop_categories.csv")

# Show some examples
print("\nTop 10 categories by product count:")
sorted_cats = sorted(all_categories, key=lambda x: x['count'], reverse=True)[:10]
for cat in sorted_cats:
    print(f"  {cat['full_path']}: {cat['count']} items")