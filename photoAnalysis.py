import fal_client
import json
import os
from dotenv import load_dotenv

# .env dosyasından environment değişkenlerini yükle
load_dotenv()

# Fotoğrafı yükle
print("Fotoğraf yükleniyor...")
url = fal_client.upload_file("photo.jpg")
print(f"Fotoğraf yüklendi: {url}")

# Prompt: Ürün kategorilerini belirlemek için - İyileştirilmiş versiyon
prompt = """You are an expert product analyst for e-commerce. Analyze the product image provided.

STEP 1: First, carefully describe what you see in the image. What is the main product?

STEP 2: Then categorize the product into exactly 9 categories with specific classifications.

Categories to determine:
1. Main Product Type - Be very specific (Examples: Footwear, Electronics, Clothing, Food, Furniture, Accessories, Sports Equipment, Home Decor, Beauty Products, etc.)
2. Subcategory - Detailed classification (Examples for Footwear: Sneakers, High-top Sneakers, Low-top Sneakers, Boots, Running Shoes, Sandals, Formal Shoes; for Electronics: Smartphone, Laptop, Camera, Headphones; for Clothing: T-shirt, Jeans, Dress, Jacket)
3. Target Audience (Examples: Men, Women, Kids, Unisex, Teenagers, Adults, Professional, Athletes)
4. Price Range (Budget, Mid-range, Premium, Luxury)
5. Use Case (Daily Use, Professional, Sports/Athletic, Casual Lifestyle, Formal, Outdoor, Indoor, etc.)
6. Style/Design (Modern, Classic, Vintage/Retro, Minimalist, Bold/Statement, Streetwear, Athletic, Elegant, etc.)
7. Season/Occasion (All Season, Spring/Summer, Fall/Winter, Casual Daily, Formal Events, Sports/Active, etc.)
8. Industrial Type (Footwear Manufacturing, Fashion/Apparel, Food & Beverage, Electronics Manufacturing, Furniture, Textile, etc.)
9. Vibe (Fun, Relaxing, Energetic, Professional, Casual, Urban/Street, Sporty, Sophisticated, Youthful, etc.)

CRITICAL INSTRUCTIONS:
- Look VERY CAREFULLY at the actual product in the image
- Only consider most exposed product in the image
- Do NOT make assumptions - only categorize what you actually see
- Be as specific and accurate as possible
- If you see shoes, they are NOT clothing or swimwear - they are Footwear
- If you see electronics, specify the exact type
- Match all 9 categories to the actual product you see

Respond with a JSON object in this EXACT format (no additional text):
{{
    "main_product_type": "category_value",
    "subcategory": "specific_subcategory",
    "target_audience": "audience_value",
    "price_range": "price_value",
    "use_case": "use_case_value",
    "style_design": "style_value",
    "season_occasion": "season_value",
    "industrial_type": "industry_value",
    "vibe": "vibe_value"
}}"""

# Queue update callback
def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
            print(f"İşlem durumu: {log['message']}")

# Analiz isteğini gönder - Gemini 2.5 Pro ile
print("\nFotoğraf analiz ediliyor...")
print("Model: Google Gemini 2.5 Pro (Enterprise LLM with Vision)")

# Görüntü URL'ini prompt'a ekle (Gemini multimodal için)
multimodal_prompt = f"Image URL: {url}\n\n{prompt}"

# Gemini 2.5 Pro kullan (any-llm/enterprise endpoint)
handler = fal_client.submit(
    "fal-ai/any-llm/enterprise",
    arguments={
        "prompt": multimodal_prompt,
        "model": "google/gemini-2.5-pro",
        "temperature": 0.3,
        "max_tokens": 2000
    },
)

request_id = handler.request_id
print(f"İstek ID: {request_id}")

# Sonucu bekle ve al
result = fal_client.result("fal-ai/any-llm/enterprise", request_id)

print("\nAnaliz tamamlandı!")
print("Ham sonuç:", result)

# Sonuçtan kategori bilgisini çıkar
if result and 'output' in result:
    output_text = result['output']
    
    # JSON formatındaki kategori bilgisini çıkar
    try:
        # Eğer output direkt JSON ise
        if isinstance(output_text, dict):
            categories = output_text
        else:
            # Eğer string içinde JSON varsa parse et
            import re
            json_match = re.search(r'\{[\s\S]*\}', output_text)
            if json_match:
                categories = json.loads(json_match.group())
            else:
                categories = {"error": "JSON formatı bulunamadı", "raw_output": output_text}
        
        # Kategorileri JSON dosyasına kaydet
        output_file = "product_categories.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(categories, f, indent=4, ensure_ascii=False)
        
        print(f"\n✓ Kategoriler '{output_file}' dosyasına kaydedildi.")
        print("\nBelirenen Kategoriler:")
        for key, value in categories.items():
            print(f"  - {key}: {value}")
            
    except Exception as e:
        print(f"\nHata: Sonuç işlenirken hata oluştu: {e}")
        # Yine de ham sonucu kaydet
        with open("product_categories.json", 'w', encoding='utf-8') as f:
            json.dump({"error": str(e), "raw_result": str(result)}, f, indent=4, ensure_ascii=False)
else:
    print("Hata: Sonuç alınamadı")
    with open("product_categories.json", 'w', encoding='utf-8') as f:
        json.dump({"error": "Sonuç alınamadı", "raw_result": str(result)}, f, indent=4, ensure_ascii=False)