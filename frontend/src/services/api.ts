// API servisi - Backend ile iletişim için

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Dosya yükleme
export interface UploadFileResponse {
  success: boolean;
  url: string;
  filename: string;
}

export async function uploadFile(file: File): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/v1/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Dosya yükleme başarısız');
  }

  return response.json();
}

// Arka plan görüntüsü oluşturma
export interface GenerateBackgroundRequest {
  inputImageUrl: string;
  prompt?: string;
  removeBg?: boolean;
  categories?: {
    main_product_type: string;
    subcategory: string;
    target_audience: string;
    price_range: string;
    use_case: string;
    style_design: string;
    season_occasion: string;
    industrial_type: string;
    vibe: string;
  };
}

export interface GenerateBackgroundResponse {
  preset: string;
  resultUrl: string;
  width: number;
  height: number;
  usedPrompt: string;
}

export async function generateBackground(
  data: GenerateBackgroundRequest
): Promise<GenerateBackgroundResponse> {
  const response = await fetch(`${API_URL}/v1/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Arka plan oluşturma başarısız');
  }

  return response.json();
}

// Ürün açıklaması oluşturma
export interface GenerateDescriptionRequest {
  title: string;
  features?: string[];
  industry?: string;
  tone?: 'concise' | 'detailed';
  language?: 'tr' | 'en';
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateDescriptionResponse {
  model: string;
  language: string;
  tone: string;
  description: string;
  meta: {
    maxTokens: number;
    temperature: number;
    reasoning: string | null;
  };
}

export async function generateDescription(
  data: GenerateDescriptionRequest
): Promise<GenerateDescriptionResponse> {
  const response = await fetch(`${API_URL}/v1/descriptions/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Açıklama oluşturma başarısız');
  }

  return response.json();
}

// Pazarlama kiti oluşturma
export interface GenerateMarketingKitRequest {
  title: string;
  features?: string[];
  industry?: string;
  tone?: 'concise' | 'detailed';
  language?: 'tr' | 'en';
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateMarketingKitResponse {
  language: string;
  tone: string;
  model: string;
  kit: {
    tagline: string;
    bullets: string[];
    hashtags: string[];
    captions: {
      ig: string;
      tt: string;
    };
    altText: string;
  };
  meta: {
    maxTokens: number;
    temperature: number;
    reasoning: string | null;
  };
}

export async function generateMarketingKit(
  data: GenerateMarketingKitRequest
): Promise<GenerateMarketingKitResponse> {
  const response = await fetch(`${API_URL}/v1/marketing/kit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Pazarlama kiti oluşturma başarısız');
  }

  return response.json();
}

// Ürün analizi (kategoriler)
export interface AnalyzeProductRequest {
  imageUrl: string;
  model?: string;
  temperature?: number;
}

export interface AnalyzeProductResponse {
  main_product_type: string;
  subcategory: string;
  target_audience: string;
  price_range: string;
  use_case: string;
  style_design: string;
  season_occasion: string;
  industrial_type: string;
  vibe: string;
}

export async function analyzeProduct(
  data: AnalyzeProductRequest
): Promise<AnalyzeProductResponse> {
  const response = await fetch(`${API_URL}/v1/analyze-product`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.error || 'Ürün analizi başarısız');
  }

  return response.json();
}

// Görüntüyü base64'e çevirme yardımcı fonksiyonu
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Base64'ü blob URL'e çevirme
export function base64ToUrl(base64: string): string {
  return base64;
}

