import { useState } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { createShortTermPropertyDraft } from '@/lib/graphql/mutations';
import { ShortTermPropertyType } from '@/lib/API';
import { useAuth } from '@/contexts/AuthContext';

interface CreateShortTermPropertyDraftInput {
  title: string;
  region: string;
  district: string;
  propertyType: ShortTermPropertyType;
  nightlyRate: number;
  currency: string;
  cleaningFee?: number;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  minimumStay?: number;
  latitude?: number;
  longitude?: number;
  images?: string[];
  videos?: string[];
  guestPhoneNumber?: string;
  guestWhatsappNumber?: string;
  guestEmail?: string;
}

interface CreateDraftResult {
  success: boolean;
  propertyId?: string;
  message: string;
  isGuestUser?: boolean;
  status?: string;
}

export function useCreateShortTermProperty() {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  const createDraft = async (
    input: CreateShortTermPropertyDraftInput
  ): Promise<CreateDraftResult> => {
    setIsCreating(true);

    try {
      console.log('[useCreateShortTermProperty] Creating draft with input:', {
        title: input.title,
        region: input.region,
        district: input.district,
        propertyType: input.propertyType,
        nightlyRate: input.nightlyRate,
        currency: input.currency,
      });

      // Use appropriate GraphQL method based on authentication status
      const response = user
        ? await GraphQLClient.executeAuthenticated(
            createShortTermPropertyDraft,
            {
              input: {
                title: input.title,
                region: input.region,
                district: input.district,
                propertyType: input.propertyType,
                nightlyRate: input.nightlyRate,
                currency: input.currency,
                ...(input.cleaningFee !== undefined && { cleaningFee: input.cleaningFee }),
                ...(input.maxGuests !== undefined && { maxGuests: input.maxGuests }),
                ...(input.bedrooms !== undefined && { bedrooms: input.bedrooms }),
                ...(input.bathrooms !== undefined && { bathrooms: input.bathrooms }),
                ...(input.minimumStay !== undefined && { minimumStay: input.minimumStay }),
                ...(input.latitude !== undefined && { latitude: input.latitude }),
                ...(input.longitude !== undefined && { longitude: input.longitude }),
                ...(input.images && { images: input.images }),
                ...(input.videos && { videos: input.videos }),
                ...(input.guestPhoneNumber && { guestPhoneNumber: input.guestPhoneNumber }),
                ...(input.guestWhatsappNumber && { guestWhatsappNumber: input.guestWhatsappNumber }),
                ...(input.guestEmail && { guestEmail: input.guestEmail }),
              },
            }
          )
        : await GraphQLClient.executePublic(
            createShortTermPropertyDraft,
            {
              input: {
                title: input.title,
                region: input.region,
                district: input.district,
                propertyType: input.propertyType,
                nightlyRate: input.nightlyRate,
                currency: input.currency,
                ...(input.cleaningFee !== undefined && { cleaningFee: input.cleaningFee }),
                ...(input.maxGuests !== undefined && { maxGuests: input.maxGuests }),
                ...(input.bedrooms !== undefined && { bedrooms: input.bedrooms }),
                ...(input.bathrooms !== undefined && { bathrooms: input.bathrooms }),
                ...(input.minimumStay !== undefined && { minimumStay: input.minimumStay }),
                ...(input.latitude !== undefined && { latitude: input.latitude }),
                ...(input.longitude !== undefined && { longitude: input.longitude }),
                ...(input.images && { images: input.images }),
                ...(input.videos && { videos: input.videos }),
                ...(input.guestPhoneNumber && { guestPhoneNumber: input.guestPhoneNumber }),
                ...(input.guestWhatsappNumber && { guestWhatsappNumber: input.guestWhatsappNumber }),
                ...(input.guestEmail && { guestEmail: input.guestEmail }),
              },
            }
          );

      const result = response.createShortTermPropertyDraft;

      console.log('[useCreateShortTermProperty] Draft created successfully:', result);

      return {
        success: true,
        propertyId: result.propertyId || undefined,
        message: result.message || 'Short-term property draft created successfully',
        isGuestUser: result.isGuestUser,
        status: result.status,
      };
    } catch (error) {
      console.error('[useCreateShortTermProperty] Error creating draft:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create property draft',
      };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createDraft,
    isCreating,
  };
}
