# fotoRaf - Backend & Frontend Entegrasyonu

Backend ve frontend başarıyla entegre edildi!

## Yapılan Değişiklikler

### Backend

1. **CORS Desteği Eklendi**
   - `@fastify/cors` paketi yüklendi
   - Tüm originlere izin verildi (geliştirme için)

2. **Dosya Yükleme API'si Eklendi**
   - `@fastify/multipart` ve `@fastify/static` paketleri yüklendi
   - `POST /v1/upload` endpoint'i eklendi
   - Upload edilen dosyalar `backend/uploads/` klasöründe saklanıyor
   - Dosyalar `/uploads/{filename}` URL'i ile erişilebilir

3. **Mevcut API Endpoint'leri**
   - `POST /v1/upload` - Dosya yükleme
   - `POST /v1/generate` - AI arka plan oluşturma
   - `POST /v1/descriptions/generate` - Ürün açıklaması oluşturma
   - `POST /v1/marketing/kit` - Pazarlama kiti oluşturma

### Frontend

1. **API Servisi Oluşturuldu**
   - `src/services/api.ts` - Backend ile iletişim için servis katmanı
   - Tüm API çağrıları TypeScript tipli ve tip güvenli

2. **Environment Değişkenleri**
   - `.env` dosyası oluşturuldu
   - Backend API URL'i: `http://localhost:3000`

3. **Componentler Güncellendi**
   - **UploadPanel**: Dosya yükleme özelliği korundu
   - **BackgroundPanel**: Backend'deki AI arka plan API'sine bağlandı
   - **DescriptionPanel**: Backend'deki pazarlama kiti API'sine bağlandı
   - **Index.tsx**: Dosya yükleme ve state yönetimi güncellendi

## Çalıştırma

### Backend'i Başlatın

```bash
cd backend
npm run dev
```

Backend şu adreste çalışacak: `http://localhost:3000`

### Frontend'i Başlatın

```bash
cd frontend
npm run dev
```

Frontend şu adreste çalışacak: `http://localhost:5173` (veya Vite'ın atadığı port)

### Environment Değişkenlerini Ayarlayın

Frontend'de `.env` dosyasını düzenleyin:

```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key_here
```

Backend'de `.env` dosyasını oluşturun (eğer yoksa):

```env
FAL_API_KEY=your_fal_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
PORT=3000
NODE_ENV=development
```

## Kullanım Akışı

1. **Görsel Yükleme**
   - Kullanıcı bir ürün görseli yükler
   - Görsel hem local önizleme için hem de backend'e yüklenir
   - Backend görseli `uploads/` klasörüne kaydeder ve URL döndürür

2. **Arka Plan Oluşturma**
   - Kullanıcı opsiyonel olarak bir arka plan prompt'u girebilir
   - Backend GPT-4o-mini ile prompt'u iyileştirir
   - Nano-banana AI modeli ile yeni arka plan oluşturulur
   - Sonuç kullanıcıya gösterilir (~7-12 saniye)

3. **Pazarlama İçerikleri**
   - Kullanıcı ürün başlığı, özellikleri ve endüstri bilgisi girer
   - Backend GPT-4o-mini ile şunları oluşturur:
     - Slogan
     - Özellik listesi
     - Hashtagler
     - Instagram ve TikTok içerikleri
     - Alt text (erişilebilirlik)
   - Tüm içerikler tek tıkla kopyalanabilir (~2-5 saniye)

## API Dökümanları

Detaylı API dökümanları için: `backend/API_DOCS.md`

## Özellikler

### Backend
- CORS desteği
- Dosya yükleme (max 10MB)
- AI arka plan oluşturma
- GPT-4o-mini ile prompt iyileştirme
- Pazarlama içeriği oluşturma
- Türkçe ve İngilizce dil desteği

### Frontend
- Modern React + TypeScript
- shadcn/ui bileşenleri
- Sürükle-bırak dosya yükleme
- Real-time önizleme
- Loading durumları
- Hata yönetimi
- Toast bildirimleri
- Responsive tasarım

## Sorun Giderme

### Backend bağlantı hatası
- Backend'in çalıştığından emin olun (`npm run dev`)
- CORS ayarlarını kontrol edin
- `.env` dosyasındaki `VITE_API_URL` değerini kontrol edin

### Dosya yükleme hatası
- Dosya boyutunun 10MB'dan küçük olduğundan emin olun
- Sadece görsel dosyaları desteklenir (JPG, PNG, WEBP)
- `backend/uploads/` klasörünün yazma izinleri olduğundan emin olun

### AI oluşturma hatası
- `FAL_API_KEY` environment değişkeninin ayarlı olduğundan emin olun
- İnternet bağlantınızı kontrol edin
- Backend loglarını kontrol edin

## Gereksinimler

### Backend
- Node.js 18+
- Python 3.x
- FAL AI API Key
- OpenRouter API Key (opsiyonel, GPT-4o-mini için)

### Frontend
- Node.js 18+
- Supabase hesabı (opsiyonel)

## Teknoloji Stack

### Backend
- Fastify
- TypeScript
- Zod (validation)
- Python (FAL AI entegrasyonu)

### Frontend
- React 18
- TypeScript
- Vite
- shadcn/ui
- TailwindCSS
- Lucide Icons
- Sonner (toast)

---

Herhangi bir sorun yaşarsanız backend ve frontend loglarını kontrol edin!

