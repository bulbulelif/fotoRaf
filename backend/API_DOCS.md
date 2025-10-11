# FotoRaf API Documentation

## Base URL
```
http://localhost:3000
```

---

## 1. Background Image Generation

Generate product images with custom or default backgrounds using AI.

### Endpoint
```
POST /v1/generate
```

### Request Body
```json
{
  "inputImageUrl": "https://example.com/product.jpg",  // Required: Product image URL
  "prompt": "beach background, sunny weather",          // Optional: Custom background prompt
  "removeBg": true                                      // Optional: Remove background (default: true)
}
```

### Response
```json
{
  "preset": "custom",                                   // "custom" or "studio-soft"
  "resultUrl": "https://v3b.fal.media/files/...",      // Generated image URL
  "width": 512,
  "height": 512,
  "usedPrompt": "Sun-drenched beach backdrop..."       // Final prompt used
}
```

### Example - With Custom Prompt
```bash
curl -X POST http://localhost:3000/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "inputImageUrl": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
    "prompt": "lüks oturma odası, modern dekorasyon"
  }' | jq '.'
```

### Example - Without Prompt (Random Default)
```bash
curl -X POST http://localhost:3000/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "inputImageUrl": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400"
  }' | jq '.'
```

### Features
- ✅ Auto-refines user prompts with GPT-4o-mini for professional photography style
- ✅ 5 default professional backgrounds if no prompt provided
- ✅ Uses nano-banana model for fast, high-quality image generation
- ✅ Response time: ~7-12 seconds

---

## 2. Product Description Generation

Generate SEO-friendly product descriptions in Turkish or English.

### Endpoint
```
POST /v1/descriptions/generate
```

### Request Body
```json
{
  "title": "Ergonomik Seramik Kupa 300ml",              // Required: Product title
  "features": [                                          // Optional: Product features
    "ergonomik sap",
    "bulaşık makinesinde yıkanabilir",
    "ısıyı iyi muhafaza eder"
  ],
  "industry": "housewares",                              // Optional: Industry category
  "tone": "concise",                                     // Optional: "concise" or "detailed" (default: "concise")
  "language": "tr",                                      // Optional: "tr" or "en" (default: "tr")
  "maxTokens": 120,                                      // Optional: 50-400 (default: 120)
  "temperature": 0.7                                     // Optional: 0-1 (default: 0.7)
}
```

### Response
```json
{
  "model": "openai/gpt-4o-mini",
  "language": "tr",
  "tone": "concise",
  "description": "Ergonomik Seramik Kupa 300ml, rahat tutuşu sayesinde uzun süreli kullanımlarda bile konfor sunar...",
  "meta": {
    "maxTokens": 120,
    "temperature": 0.7,
    "reasoning": null
  }
}
```

### Example - Turkish Concise
```bash
curl -X POST http://localhost:3000/v1/descriptions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ergonomik Seramik Kupa 300ml",
    "features": ["ergonomik sap","bulaşık makinesinde yıkanabilir","ısıyı iyi muhafaza eder"],
    "industry": "housewares",
    "tone": "concise",
    "language": "tr"
  }' | jq '.'
```

### Example - English Concise
```bash
curl -X POST http://localhost:3000/v1/descriptions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ergonomic Ceramic Mug 300ml",
    "features": ["ergonomic handle","dishwasher safe","great heat retention"],
    "industry": "housewares",
    "tone": "concise",
    "language": "en"
  }' | jq '.'
```

### Example - Turkish Detailed
```bash
curl -X POST http://localhost:3000/v1/descriptions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Akıllı Bluetooth Kulaklık X500",
    "features": ["aktif gürültü engelleme","40 saat pil ömrü","hızlı şarj"],
    "industry": "electronics",
    "tone": "detailed",
    "language": "tr",
    "maxTokens": 200
  }' | jq '.'
```

### Features
- ✅ Supports Turkish and English
- ✅ Two tone options: concise (2-3 sentences) or detailed (4-6 sentences)
- ✅ SEO-friendly, honest, and trustworthy copy
- ✅ Industry-aware descriptions
- ✅ Configurable creativity (temperature) and length (maxTokens)
- ✅ Response time: ~1-3 seconds

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation error details..."
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_error"
}
```

### 502 Bad Gateway - AI Service Error
```json
{
  "error": "generation_failed" | "llm_failed",
  "detail": "Error details..."
}
```

---

## Environment Variables

```bash
# Required
FAL_API_KEY=sk-...                           # FAL AI API key

# Optional
OPENROUTER_MODEL=openai/gpt-4o-mini         # LLM model for text generation
PORT=3000                                    # Server port (default: 3000)
NODE_ENV=development                         # Environment
```

---

## AI Models Used

### Background Generation
- **Image Generation:** `fal-ai/nano-banana`
  - Fast inference (4 steps)
  - Square HD output
  - Product photography optimized

- **Prompt Refinement:** `openai/gpt-4o-mini`
  - Converts user prompts to professional photography style
  - Fast and cost-effective

### Description Generation
- **Text Generation:** `openai/gpt-4o-mini` (configurable via `OPENROUTER_MODEL`)
  - E-commerce copywriting expert
  - Multilingual support
  - SEO-friendly output

---

## Rate Limits & Timeouts

- **Background Generation:** 120s timeout
- **Description Generation:** 120s timeout
- **LLM Refinement:** 30s timeout

---

## Development

### Start Server
```bash
cd backend
npm run dev
```

### Install Dependencies
```bash
# Node.js
npm install

# Python
pip3 install -r requirements.txt
```

### Test All Endpoints
```bash
# Background generation
curl -X POST http://localhost:3000/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"inputImageUrl": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400"}'

# Description generation
curl -X POST http://localhost:3000/v1/descriptions/generate \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Product"}'
```

---

## Support

For issues or questions, check the logs:
```bash
# Server is running, check console output
# Python errors are returned as JSON with "error" field
```

