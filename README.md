# fotoRaf

**E-ticaret ürün fotoğrafları için AI destekli arka plan ve pazarlama içeriği üretim platformu**

fotoRaf, ürün fotoğraflarınıza profesyonel arka planlar ekleyen ve otomatik pazarlama içeriği üreten modern bir platformdur. Yapay zeka teknolojileriyle e-ticaret işletmelerinin görsel içerik üretim süreçlerini hızlandırır ve optimize eder.

**team orbit tarafından SaaSBridge Buildathon sırasında geliştirilmiştir.**
Sponsorlar: Lovable, FAL

## Özellikler

### AI Arka Plan Üretimi
- Nano-banana AI modeli ile hızlı ve kaliteli arka plan üretimi
- GPT-4o-mini ile kullanıcı promptlarını profesyonel fotoğrafçılık diline çevirme
- Prompt girmeden varsayılan profesyonel arka planlar
- 7-12 saniyede işlem sonucu

### Pazarlama İçeriği Üretimi
- Tek tıkla pazarlama kiti: Slogan, özellik listesi, hashtagler, sosyal medya içerikleri
- Instagram, TikTok ve genel e-ticaret platformları için optimize içerik
- Erişilebilirlik için otomatik alt metin üretimi
- Türkçe ve İngilizce dil desteği
- Kısa veya detaylı içerik seçenekleri

### Ürün Görsel Analizi
- AI vision ile 9 kategori sınıflandırması
- Google Gemini 2.5 Flash multimodal model
- Ürün tipi, hedef kitle, fiyat aralığı, kullanım senaryosu ve daha fazlası

### Modern Teknik Altyapı
- React + TypeScript ile modern, hızlı ve tip güvenli kullanıcı arayüzü
- Fastify ile yüksek performanslı Node.js API sunucusu
- FAL AI entegrasyonu ile güçlü AI özellikleri
- shadcn/ui ile şık ve erişilebilir UI bileşenleri

---

## Mimari Genel Bakış

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui    │
│  • Sürükle-bırak dosya yükleme                              │
│  • Real-time önizleme                                        │
│  • Toast bildirimleri                                        │
│  • Responsive tasarım                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│         Fastify + TypeScript + Python Services              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ API Endpoints (Fastify + TypeScript)                  │  │
│  │  • /v1/upload - Dosya yükleme                         │  │
│  │  • /v1/generate - Arka plan oluşturma                 │  │
│  │  • /v1/analyze-product - Görsel analizi               │  │
│  │  • /v1/descriptions/generate - Açıklama üretimi       │  │
│  │  • /v1/marketing/kit - Pazarlama kiti                 │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Python AI Services (fal_service.py)                   │  │
│  │  • FAL AI Client wrapper                              │  │
│  │  • Multimodal vision (Gemini 2.5)                     │  │
│  │  • Background replacement (nano-banana)               │  │
│  │  • LLM text generation (GPT-4o-mini)                  │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ API Calls
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL AI SERVICES                      │
│  • FAL AI (nano-banana, vision models)                      │
│  • OpenRouter / OpenAI (GPT-4o-mini)                        │
│  • Google Gemini 2.5 Flash/Pro (via FAL AI)                │
└─────────────────────────────────────────────────────────────┘
```

### Supabase Entegrasyonu (Opsiyonel)
`frontend/supabase/` altında Edge Functions ve config bulunur. Projeyi yerel geliştirme için Supabase olmadan da çalıştırabilirsiniz.

---

## FAL AI Entegrasyonu

Bu proje, görsel işleme ve AI özellikleri için FAL AI platformunu kullanmaktadır. FAL AI, çeşitli AI modellerine hızlı ve güvenilir erişim sağlayan bir servistir.

### FAL AI Kullanım Alanları

**1. Arka Plan Değiştirme (nano-banana model)**
- Ürün görsellerinin arka planını koruyarak değiştirme
- Image-to-image dönüşüm ile hızlı sonuç
- Ortalama işlem süresi: 7-12 saniye
- 4 inference step ile optimize edilmiş

**2. Ürün Analizi (Gemini 2.5 Flash/Pro)**
- Multimodal vision ile görsel analiz
- 9 kategori sınıflandırması
- JSON formatında yapılandırılmış çıktı
- Ortalama işlem süresi: 3-5 saniye

**3. Prompt İyileştirme (GPT-4o-mini via OpenRouter)**
- Kullanıcı promptlarını profesyonel fotoğrafçılık diline çevirme
- E-ticaret odaklı optimizasyon
- Ortalama işlem süresi: 1-2 saniye

### FAL AI Hesabı ve API Key

1. [fal.ai](https://fal.ai) adresinden ücretsiz hesap oluşturun
2. Dashboard'dan API key alın ([fal.ai/dashboard/keys](https://fal.ai/dashboard/keys))
3. Ücretsiz tier ile test edebilirsiniz
4. Kullanım başına ödeme modeli, esnek fiyatlandırma

### Python FAL Client

Backend'de `fal-client` Python paketi kullanılmaktadır:

```python
from services.fal_service import FalClient

client = FalClient()

# Arka plan değiştirme
result = client.background_replace(
    image_url="https://example.com/product.jpg",
    prompt="modern studio background",
    remove_bg=True
)

# Ürün analizi
analysis = client.analyze_product_image("https://example.com/product.jpg")
categories = analysis["categories"]
```

Detaylı kullanım için: [backend/src/services/README.md](backend/src/services/README.md)

---


#### Environment Değişkenleri

`backend/` klasöründe `.env` dosyası oluşturun:

```bash
# FAL AI API Key (zorunlu)
FAL_KEY=your_fal_key_here

# OpenRouter Model (opsiyonel, varsayılan: openai/gpt-4o-mini)
OPENROUTER_MODEL=openai/gpt-4o-mini

# Server Port (opsiyonel, varsayılan: 3000)
PORT=3000
```

#### Backend'i Başlatın

```bash
npm run dev
```

Backend `http://localhost:3000` adresinde çalışmaya başlayacak.

###  Frontend Kurulumu

Yeni bir terminal penceresi açın.

```bash
cd frontend
npm install
```

#### Environment Değişkenleri

`frontend/` klasöründe `.env` dosyası oluşturun:

```bash
# Backend API URL (zorunlu)
VITE_API_URL=http://localhost:3000

# Supabase (opsiyonel - sadece Supabase özellikleri için)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

#### Frontend'i Başlatın

```bash
npm run dev
```

Frontend `http://localhost:5173` (veya Vite'ın atadığı port) adresinde çalışacak.

### 4. Uygulamayı Kullanın

1. Tarayıcınızda `http://localhost:5173` adresine gidin
2. Bir ürün görseli yükleyin
3. Arka plan değiştirme veya pazarlama içeriği üretimi için ilgili panelleri kullanın

---

## Kullanım Akışı

### 1. Görsel Yükleme
Kullanıcı sürükle-bırak veya dosya seçici ile ürün görseli yükler. Görsel hem ön izleme için local'de hem de backend'e gönderilir. Backend görseli `backend/uploads/` klasörüne kaydeder ve URL döndürür.

### 2. Arka Plan Oluşturma
Kullanıcı opsiyonel olarak arka plan açıklaması (prompt) girebilir. Prompt girilmezse 5 hazır profesyonel stilden biri rastgele seçilir. Backend GPT-4o-mini ile prompt'u profesyonel fotoğrafçılık diline çevirir. Nano-banana AI modeli ile yeni arka plan oluşturulur. Sonuç yaklaşık 7-12 saniyede kullanıcıya gösterilir.

### 3. Pazarlama İçeriği Üretimi
Kullanıcı ürün başlığı, özellikleri ve endüstri bilgisi girer. Backend GPT-4o-mini ile kapsamlı pazarlama kiti oluşturur:

- **Slogan**: Çekici tek cümlelik başlık
- **Özellik Listesi**: 3-5 özellik ve fayda odaklı madde
- **Hashtagler**: 6-10 platform-agnostik etiket
- **Instagram İçeriği**: 2-5 cümle
- **TikTok İçeriği**: Kısa, enerjik 1-3 cümle
- **Alt Text**: Erişilebilirlik için objektif görsel açıklaması

Tüm içerikler tek tıkla kopyalanabilir, işlem yaklaşık 2-5 saniye sürer.

---

## Dokümantasyon

### API Dökümanları
Detaylı API endpoint dökümanları için:
- [backend/API_DOCS.md](backend/API_DOCS.md) - Tüm API endpoint'lerinin detaylı kullanım kılavuzu

### Geliştirici Dökümanları
Entegrasyon ve geliştirme detayları için:
- [INTEGRATION.md](INTEGRATION.md) - Backend-Frontend entegrasyon rehberi ve teknik detaylar
- [backend/src/services/README.md](backend/src/services/README.md) - Python FAL AI servisleri kullanım kılavuzu

### API Endpoint'leri Özet

| Endpoint | Method | Açıklama | Yanıt Süresi |
|----------|--------|----------|--------------|
| `/v1/upload` | POST | Dosya yükleme | yaklaşık 1s |
| `/v1/generate` | POST | AI arka plan oluşturma | yaklaşık 7-12s |
| `/v1/analyze-product` | POST | Ürün görsel analizi (9 kategori) | yaklaşık 3-5s |
| `/v1/descriptions/generate` | POST | Ürün açıklaması üretimi | yaklaşık 1-3s |
| `/v1/marketing/kit` | POST | Tam pazarlama kiti üretimi | yaklaşık 2-5s |

---

## Teknoloji Stack

### Frontend
- React 18 - Modern UI kütüphanesi
- TypeScript - Tip güvenli JavaScript
- Vite - Hızlı build tool
- TailwindCSS - Utility-first CSS framework
- shadcn/ui - Yüksek kaliteli UI bileşenleri
- Lucide Icons - Modern icon seti
- Sonner - Toast bildirimleri
- React Router - Sayfa yönlendirme
- TanStack Query - Server state yönetimi

### Backend
- Fastify - Yüksek performanslı web framework
- TypeScript - Tip güvenli Node.js
- Zod - Runtime type validation
- Python 3.x - AI servis entegrasyonu
- FAL Client - FAL AI Python SDK

### AI ve Makine Öğrenmesi
- Nano-banana - Hızlı image-to-image arka plan değiştirme
- Google Gemini 2.5 Flash/Pro - Multimodal vision ve ürün analizi (via FAL AI)
- OpenAI GPT-4o-mini - Metin üretimi ve prompt iyileştirme (via OpenRouter)

---

## Ortam Değişkenleri Referansı

### Backend (`backend/.env`)

| Değişken | Zorunlu | Varsayılan | Açıklama |
|----------|---------|------------|----------|
| `FAL_KEY` | Evet | - | FAL AI API anahtarı |
| `OPENROUTER_MODEL` | Hayır | `openai/gpt-4o-mini` | LLM model seçimi |
| `PORT` | Hayır | `3000` | Backend server portu |
| `NODE_ENV` | Hayır | `development` | Çalışma ortamı |

### Frontend (`frontend/.env`)

| Değişken | Zorunlu | Varsayılan | Açıklama |
|----------|---------|------------|----------|
| `VITE_API_URL` | Evet | - | Backend API URL'i |
| `VITE_SUPABASE_URL` | Hayır | - | Supabase proje URL'i |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Hayır | - | Supabase anon/public key |

---

## Katkıda Bulunma

Geliştirmelerinizi fork atarak gerçekleştirebilirsiniz.

---

## Lisans

Bu proje özel lisanslıdır. Kullanım hakları için lütfen proje sahipleri ile iletişime geçin.

---

## İletişim

tugrapefedikpinar@gmail.com

---

fotoRaf ile evinizden stüdyo kalitesinde fotoğraflar elde edin.
