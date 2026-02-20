import { useState, useEffect } from 'react';
import { CreatePropertyInput, PropertyType } from '@/lib/API';

export type FormData = Omit<CreatePropertyInput, 'media' | 'availability'> & {
  availability: {
    available: boolean;
    availableFrom?: string;
    minimumLeaseTerm?: number;
    maximumLeaseTerm?: number;
  };
  media: {
    images: string[];
    videos: string[];
    floorPlan: string;
    virtualTour: string;
  };
};

export function useCreatePropertyForm(initialData?: Partial<FormData>) {
  const defaultFormData: FormData = {
    title: '',
    description: '',
    propertyType: 'APARTMENT' as PropertyType,
    address: {
      region: '',
      district: '',
      ward: '',
      street: '',
      coordinates: { latitude: 0, longitude: 0 }
    },
    specifications: {
      bedrooms: 1,
      bathrooms: 1,
      squareMeters: 0,
      furnished: false,
      parkingSpaces: 0,
      floors: 1
    },
    pricing: {
      monthlyRent: 0,
      deposit: 0,
      currency: 'TZS',
      serviceCharge: 0,
      utilitiesIncluded: false
    },
    availability: {
      available: true,
      availableFrom: undefined,
      minimumLeaseTerm: 12,
      maximumLeaseTerm: 24
    },
    amenities: [],
    media: {
      images: [],
      videos: [],
      floorPlan: '',
      virtualTour: ''
    }
  };

  // Merge initial data with defaults, handling nested objects properly
  const mergedFormData: FormData = {
    ...defaultFormData,
    ...initialData,
    address: {
      ...defaultFormData.address,
      ...initialData?.address
    },
    specifications: {
      ...defaultFormData.specifications,
      ...initialData?.specifications
    },
    pricing: {
      ...defaultFormData.pricing,
      ...initialData?.pricing
    },
    availability: {
      ...defaultFormData.availability,
      ...initialData?.availability
    },
    media: {
      ...defaultFormData.media,
      images: initialData?.media?.images ?? defaultFormData.media.images,
      videos: initialData?.media?.videos ?? defaultFormData.media.videos,
      floorPlan: initialData?.media?.floorPlan ?? defaultFormData.media.floorPlan,
      virtualTour: initialData?.media?.virtualTour ?? defaultFormData.media.virtualTour
    }
  };

  const [formData, setFormData] = useState<FormData>(mergedFormData);

  // Update form data when initialData changes (for async loading scenarios like duplicate)
  useEffect(() => {
    if (initialData) {
      const updatedFormData: FormData = {
        ...defaultFormData,
        ...initialData,
        address: {
          ...defaultFormData.address,
          ...initialData?.address
        },
        specifications: {
          ...defaultFormData.specifications,
          ...initialData?.specifications
        },
        pricing: {
          ...defaultFormData.pricing,
          ...initialData?.pricing
        },
        availability: {
          ...defaultFormData.availability,
          ...initialData?.availability
        },
        media: {
          ...defaultFormData.media,
          images: initialData?.media?.images ?? defaultFormData.media.images,
          videos: initialData?.media?.videos ?? defaultFormData.media.videos,
          floorPlan: initialData?.media?.floorPlan ?? defaultFormData.media.floorPlan,
          virtualTour: initialData?.media?.virtualTour ?? defaultFormData.media.virtualTour
        }
      };
      setFormData(updatedFormData);
    }
  }, [initialData]);

  // Type-safe section updates
  function updateSection<K extends keyof FormData>(
    section: K,
    value: Partial<FormData[K]>
  ) {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...prev[section], ...value }
        : value
    }));
  }

  // Direct field updates for simple cases
  function updateField<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  // Amenity management
  function toggleAmenity(amenity: string) {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...(prev.amenities || []), amenity]
    }));
  }

  return {
    formData,
    setFormData,
    updateSection,
    updateField,
    toggleAmenity
  };
}