# fotoRaf

AI-powered product photos and marketing content — in seconds.

fotoRaf helps you turn raw product shots into polished, studio‑style visuals and ready‑to‑use copy. Upload a product image, generate professional backgrounds, and create SEO‑friendly descriptions and a one‑click marketing kit (tagline, bullets, hashtags, captions, alt text) in Turkish or English.

## Features

- Background generation for product photos with AI (custom prompt or smart defaults)
- Product image analysis with Vision AI (9+ useful categories)
- SEO-friendly product descriptions (concise or detailed, TR/EN)
- One‑click marketing kit: tagline, bullets, hashtags, IG/TikTok captions, alt text
- Fast, modern UI with real‑time previews and responsive design

## How it works

1. Upload a product image
2. Optionally enter a background prompt
3. Generate studio‑style product visuals
4. Create product descriptions or a complete marketing kit
5. Copy and use anywhere (e‑commerce, social media, etc.)

## Quick start

### Requirements
- Node.js 18+
- Python 3.x
- FAL AI API Key (for background generation)
- Optional: OpenRouter model for text generation (default: `openai/gpt-4o-mini`)

### Run backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:3000`.

### Run frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` (Vite default).

### Environment variables
Frontend (`.env`):
```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key_here
```

Backend (`.env`):
```env
FAL_API_KEY=your_fal_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
PORT=3000
NODE_ENV=development
```

## API
See detailed endpoints, bodies, and examples in:
- `backend/API_DOCS.md`

## Tech stack

### Backend
- Fastify (TypeScript), Zod validation
- Python worker for FAL AI integration
- Models: FAL `fal-ai/nano-banana` for images, OpenRouter LLM for text, Google Gemini 2.5 Flash for vision

### Frontend
- React 18 + TypeScript + Vite
- shadcn/ui, TailwindCSS, Lucide Icons, Sonner

## Notes
- For full end‑to‑end setup and integration details, see `INTEGRATION.md` (TR).
- Troubleshooting tips and usage flow are also documented in `INTEGRATION.md`.

---
