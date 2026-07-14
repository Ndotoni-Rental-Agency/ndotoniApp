/**
 * AI Service for ndotoni Stays mobile app.
 * Calls ndotonistays API routes (backed by Anthropic Claude).
 */

const BASE_URL = 'https://www.ndotonistays.com';

interface GenerateTitleInput {
  propertyType: string;
  district: string;
  region: string;
  maxGuests?: string;
  bedrooms?: string;
  bathrooms?: string;
  stayCategories?: string[];
  currency?: string;
  nightlyRate?: string;
  images?: string[];
  userContext?: string;
}

interface PricePredictionInput {
  propertyType: string;
  district: string;
  region: string;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  userContext?: string;
}

interface PricePredictionResult {
  suggestedPrice: number;
  currency: string;
  reasoning: string;
  range: { min: number; max: number };
}

interface GenerateDescriptionInput {
  title: string;
  propertyType: string;
  district: string;
  region: string;
  maxGuests?: number;
  nightlyRate?: number;
  currency?: string;
  amenities?: string[];
  userContext?: string;
}

class AIServiceClass {
  async generateTitle(input: GenerateTitleInput): Promise<string> {
    const res = await fetch(`${BASE_URL}/api/generate-title`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to generate title');
    const data = await res.json();
    return data.title || '';
  }

  async predictPrice(input: PricePredictionInput): Promise<PricePredictionResult> {
    const res = await fetch(`${BASE_URL}/api/ai/predict-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to predict price');
    return res.json();
  }

  async generateDescription(input: GenerateDescriptionInput): Promise<string> {
    const res = await fetch(`${BASE_URL}/api/ai/generate-description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to generate description');
    const data = await res.json();
    return data.description || '';
  }
}

export const AIService = new AIServiceClass();
