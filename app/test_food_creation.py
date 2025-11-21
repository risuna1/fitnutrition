import requests
import json

# Test data yang akan dikirim
test_data = {
    "name": "テスト食品",
    "category": "protein",
    "calories": 150.0,
    "protein": 25.0,
    "carbohydrates": 5.0,
    "fats": 3.0,
    "serving_size": 100.0
}

print("Testing Food Creation API")
print("=" * 50)
print("\nData to send:")
print(json.dumps(test_data, indent=2, ensure_ascii=False))
print("\n" + "=" * 50)
print("\nExpected fields by backend:")
print("- name (required)")
print("- category (required)")
print("- calories (required)")
print("- protein (required)")
print("- carbohydrates (required)")
print("- fats (required)")
print("- serving_size (optional, default=100)")
print("- brand (optional)")
print("- fiber, sugar, sodium (optional)")
print("- vitamins and minerals (optional)")
print("- description, image (optional)")
