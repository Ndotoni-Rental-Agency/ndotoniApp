/**
 * AI Service for ndotoni Stays mobile app.
 *
 * Uses the centralized backend `generateAISuggestion` GraphQL mutation
 * which fetches real market data from DynamoDB and generates unique,
 * non-duplicate suggestions via Anthropic Claude.
 *
 * Single entry point: AIService.suggest({ type, ...context })
 * The `type` field determines what gets generated:
 *   - TITLE: just a title
 *   - DESCRIPTION: just a description
 *   - PRICE: pricing with range and reasoning
 *   - CHECKIN_INSTRUCTIONS: check-in directions/tips
 *   - ALL: everything in one shot
 */

import { GraphQLClient } from '@/lib/graphql-client';

// ─── Types ───

export type AISuggestionType = 'TITLE' | 'DESCRIPTION' | 'PRICE' | 'CHECKIN_INSTRUCTIONS' | 'ALL';

export interface AISuggestionInput {
  type: AISuggestionType;
  propertyType: string;
  stayCategories?: string[];
  region: string;
  district: string;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  images?: string[];
  currency?: string;
  nightlyRate?: number;
  title?: string;
  userContext?: string;
  language?: string;
}

export interface AIPriceRange {
  min: number;
  max: number;
}

export interface AIMarketStats {
  totalListingsInArea: number;
  averagePrice?: number;
  medianPrice?: number;
}

export interface AICheckinInstructions {
  directions?: string;
  parkingInfo?: string;
  additionalNotes?: string;
  contactName?: string;
}

export interface AISuggestionResult {
  type: AISuggestionType;
  title?: string;
  description?: string;
  suggestedPrice?: number;
  priceRange?: AIPriceRange;
  priceReasoning?: string;
  checkinInstructions?: AICheckinInstructions;
  existingTitlesInArea?: string[];
  marketStats?: AIMarketStats;
}

// ─── GraphQL Mutation ───

const GENERATE_AI_SUGGESTION = /* GraphQL */ `
  mutation GenerateAISuggestion($input: AISuggestionInput!) {
    generateAISuggestion(input: $input) {
      type
      title
      description
      suggestedPrice
      priceRange {
        min
        max
      }
      priceReasoning
      checkinInstructions {
        directions
        parkingInfo
        additionalNotes
        contactName
      }
      existingTitlesInArea
      marketStats {
        totalListingsInArea
        averagePrice
        medianPrice
      }
    }
  }
`;

// ─── Service ───

class AIServiceClass {
  /**
   * Unified AI suggestion method.
   * Call with a `type` to get the specific suggestion you need,
   * or use `ALL` to get title + description + price + check-in in one call.
   */
  async suggest(input: AISuggestionInput): Promise<AISuggestionResult> {
    const result = await GraphQLClient.execute<{ generateAISuggestion: AISuggestionResult }>(
      GENERATE_AI_SUGGESTION,
      { input }
    );
    return result.generateAISuggestion;
  }

  // ─── Convenience methods (backwards-compatible wrappers) ───

  async generateTitle(input: {
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
  }): Promise<string> {
    const result = await this.suggest({
      type: 'TITLE',
      propertyType: input.propertyType,
      region: input.region,
      district: input.district,
      maxGuests: input.maxGuests ? parseInt(input.maxGuests) : undefined,
      bedrooms: input.bedrooms ? parseInt(input.bedrooms) : undefined,
      bathrooms: input.bathrooms ? parseInt(input.bathrooms) : undefined,
      stayCategories: input.stayCategories,
      currency: input.currency,
      nightlyRate: input.nightlyRate ? parseFloat(input.nightlyRate) : undefined,
      images: input.images,
      userContext: input.userContext,
    });
    return result.title || '';
  }

  async predictPrice(input: {
    propertyType: string;
    district: string;
    region: string;
    maxGuests?: number;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
    userContext?: string;
  }): Promise<{ suggestedPrice: number; currency: string; reasoning: string; range: { min: number; max: number } }> {
    const result = await this.suggest({
      type: 'PRICE',
      propertyType: input.propertyType,
      region: input.region,
      district: input.district,
      maxGuests: input.maxGuests,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      amenities: input.amenities,
      userContext: input.userContext,
    });
    return {
      suggestedPrice: result.suggestedPrice || 0,
      currency: 'TZS',
      reasoning: result.priceReasoning || '',
      range: result.priceRange || { min: 0, max: 0 },
    };
  }

  async generateDescription(input: {
    title: string;
    propertyType: string;
    district: string;
    region: string;
    maxGuests?: number;
    nightlyRate?: number;
    currency?: string;
    amenities?: string[];
    userContext?: string;
  }): Promise<string> {
    const result = await this.suggest({
      type: 'DESCRIPTION',
      propertyType: input.propertyType,
      region: input.region,
      district: input.district,
      maxGuests: input.maxGuests,
      nightlyRate: input.nightlyRate,
      currency: input.currency,
      title: input.title,
      amenities: input.amenities,
      userContext: input.userContext,
    });
    return result.description || '';
  }
}

export const AIService = new AIServiceClass();
