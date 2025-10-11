import fal_client
import json
import os
from datetime import datetime

print("=" * 60)
print("E-TİCARET ÜRÜN FOTOĞRAFI ARKA PLAN OLUŞTURUCU")
print("(Nano Banana - Image-to-Image)")
print("=" * 60)

# Kategori bilgilerini yükle
print("\n[1/5] Kategori bilgileri yükleniyor...")
with open("product_categories.json", 'r', encoding='utf-8') as f:
    categories = json.load(f)

print("✓ Kategoriler yüklendi:")
for key, value in categories.items():
    print(f"  • {key}: {value}")

# Orijinal fotoğrafı yükle
print("\n[2/5] Orijinal fotoğraf yükleniyor...")
original_url = fal_client.upload_file("photo.jpg")
print(f"✓ Fotoğraf yüklendi: {original_url}")
print("  ℹ️  Orijinal ürün görseli korunacak, sadece arka plan değişecek")

# GPT-5-mini ile prompt oluşturma fonksiyonu
def generate_prompt_with_gpt(categories, style_type):
    """GPT-5-mini kullanarak kategorilere göre özel prompt oluştur"""
    
    categories_text = "\n".join([f"- {key}: {value}" for key, value in categories.items()])
    
    gpt_prompt = f"""Based on these product categories:
{categories_text}

Generate a detailed, professional image generation prompt for an image-to-image background replacement task.

The style type is: {style_type}

Requirements:
- The prompt must START with "Change only the background to..."
- The prompt must be specific about keeping the original product unchanged
- The prompt must be suitable for e-commerce photography
- The prompt should be creative and detailed
- The prompt should match the product's categories and the requested style type
- Length: 2-3 sentences maximum

Return ONLY the prompt text, nothing else."""

    try:
        result = fal_client.subscribe(
            "fal-ai/any-llm/enterprise",
            arguments={
                "prompt": gpt_prompt,
                "model": "openai/gpt-5-mini"
            }
        )
        
        if result and 'output' in result:
            generated_prompt = result['output'].strip()
            # Eğer output dict ise
            if isinstance(generated_prompt, dict):
                generated_prompt = str(generated_prompt)
            return generated_prompt
        else:
            return None
            
    except Exception as e:
        print(f"   ⚠️ GPT prompt oluşturma hatası: {e}")
        return None

# Kategorilere göre 3 farklı arka plan stili için promptlar oluştur
print("\n[3/5] GPT-5-mini ile arka plan promptları oluşturuluyor...")

# Ürün bilgilerini al
product_type = categories.get("main_product_type", "product")
subcategory = categories.get("subcategory", "")

style_types = [
    {
        "name": "Studio_Clean",
        "type_description": "Clean white studio background for e-commerce, professional lighting, minimal shadows",
        "description": "Minimalist beyaz studio arka plan (E-ticaret standardı)"
    },
    {
        "name": "Lifestyle_Contextual",
        "type_description": "Lifestyle and contextual setting matching the product's use case and target audience",
        "description": "Kullanım senaryosuna uygun lifestyle arka plan"
    },
    {
        "name": "Premium_Artistic",
        "type_description": "Premium artistic backdrop with dramatic lighting and sophisticated atmosphere",
        "description": "Premium/artistik arka plan"
    }
]

background_styles = []

for i, style_type in enumerate(style_types, 1):
    print(f"   [{i}/3] {style_type['name']} promptu oluşturuluyor (GPT-5-mini)...")
    
    generated_prompt = generate_prompt_with_gpt(categories, style_type['type_description'])
    
    if generated_prompt:
        background_styles.append({
            "name": style_type['name'],
            "prompt": generated_prompt,
            "description": style_type['description']
        })
        print(f"   ✓ Prompt oluşturuldu")
        print(f"   📝 Prompt önizleme: {generated_prompt[:80]}...")
    else:
        # Fallback: Manuel prompt kullan
        print(f"   ⚠️ GPT prompt oluşturulamadı, varsayılan prompt kullanılıyor")
        fallback_prompt = f"Change only the background to a {style_type['type_description']} style. Keep the {subcategory} exactly as it is in the original image."
        background_styles.append({
            "name": style_type['name'],
            "prompt": fallback_prompt,
            "description": style_type['description']
        })

print(f"\n✓ 3 farklı arka plan promptu hazırlandı (GPT-5-mini ile oluşturuldu)")

# Her stil için görsel oluştur
print("\n[4/5] Görseller oluşturuluyor...\n")

generated_images = []
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

for i, bg_style in enumerate(background_styles, 1):
    print(f"▶ [{i}/3] {bg_style['name']} oluşturuluyor...")
    print(f"   {bg_style['description']}")
    print(f"   (Nano Banana ile ürün korunuyor, sadece arka plan değişiyor)")
    
    try:
        # Nano Banana Image-to-Image model ile arka plan değiştir
        result = fal_client.subscribe(
            "fal-ai/nano-banana/edit",
            arguments={
                "prompt": bg_style['prompt'],
                "image_urls": [original_url]
            }
        )
        
        if result and 'images' in result and len(result['images']) > 0:
            image_url = result['images'][0]['url']
            
            # Görseli kaydet
            image_info = {
                "style_name": bg_style['name'],
                "description": bg_style['description'],
                "image_url": image_url,
                "prompt": bg_style['prompt'],
                "timestamp": timestamp
            }
            generated_images.append(image_info)
            
            print(f"   ✓ Başarılı! URL: {image_url}")
            
            # Görseli indir ve kaydet
            import requests
            response = requests.get(image_url)
            if response.status_code == 200:
                filename = f"product_{bg_style['name']}_{timestamp}.jpg"
                with open(filename, 'wb') as f:
                    f.write(response.content)
                print(f"   ✓ Dosya kaydedildi: {filename}\n")
            
        else:
            print(f"   ✗ Hata: Görsel oluşturulamadı")
            print(f"   Sonuç: {result}\n")
            
    except Exception as e:
        print(f"   ✗ Hata: {str(e)}\n")

# Sonuçları JSON'a kaydet
print("\n[5/5] SONUÇLAR KAYDEDILIYOR")
print("=" * 60)

output_data = {
    "original_product_url": original_url,
    "categories": categories,
    "generated_images": generated_images,
    "timestamp": timestamp,
    "total_generated": len(generated_images)
}

output_file = f"background_generation_results_{timestamp}.json"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=4, ensure_ascii=False)

print(f"\n✓ Tüm sonuçlar '{output_file}' dosyasına kaydedildi.")
print(f"\n📊 ÖZET:")
print(f"   • Toplam oluşturulan görsel: {len(generated_images)}/3")
print(f"   • Orijinal ürün: {product_type} - {subcategory}")
print(f"   • Stil: {style}")

if generated_images:
    print(f"\n🎨 OLUŞTURULAN GÖRSELLER:")
    for i, img in enumerate(generated_images, 1):
        print(f"   {i}. {img['style_name']}")
        print(f"      → {img['description']}")
        
print("\n" + "=" * 60)
print("İŞLEM TAMAMLANDI!")
print("=" * 60)