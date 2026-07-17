export interface CreateListingForm {
  propertyType: string;
  stayCategories: string[];
  region: string;
  district: string;
  ward: string;
  googleMapsLink: string;
  title: string;
  nightlyRate: string;
  currency: string;
  maxGuests: string;
  bedrooms: string;
  bathrooms: string;
  instantBookEnabled: boolean;
  images: string[];
  videos: string[];
}

export interface StepProps {
  form: CreateListingForm;
  updateField: (key: string, val: any) => void;
  colors: {
    text: string;
    tint: string;
    card: string;
    border: string;
    subtle: string;
  };
}

export const TOTAL_STEPS = 7;

export const PROPERTY_TYPES = [
  { value: 'APARTMENT', icon: '🏢', label: 'Apartment' },
  { value: 'HOUSE', icon: '🏠', label: 'House' },
  { value: 'VILLA', icon: '🏡', label: 'Villa' },
  { value: 'STUDIO', icon: '🎨', label: 'Studio' },
  { value: 'ROOM', icon: '🛏️', label: 'Room' },
  { value: 'GUESTHOUSE', icon: '🏘️', label: 'Guesthouse' },
  { value: 'HOTEL', icon: '🏨', label: 'Hotel' },
  { value: 'COTTAGE', icon: '🛖', label: 'Cottage' },
];

export const STAY_CATEGORIES = [
  { value: 'NIGHTLY_STAY', icon: '🏠', label: 'Nightly Stay' },
  { value: 'PARTY', icon: '🎉', label: 'Party & Events' },
  { value: 'PHOTOSHOOT', icon: '📸', label: 'Photoshoot' },
  { value: 'MEETING', icon: '💼', label: 'Meeting' },
  { value: 'GETAWAY', icon: '🌊', label: 'Getaway' },
  { value: 'SAFARI', icon: '🦁', label: 'Safari' },
  { value: 'BEACH', icon: '🏖️', label: 'Beach' },
  { value: 'WEDDING', icon: '💒', label: 'Wedding' },
];
