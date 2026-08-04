export interface CreateListingForm {
  propertyType: string;
  stayCategories: string[];
  region: string;
  district: string;
  ward: string;
  street: string;
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

// Icon values are Ionicons glyph names (rendered via <Ionicons name={...} />),
// not emoji, so listing type/category chips read as ndotoni UI, not a texting app.
export const PROPERTY_TYPES = [
  { value: 'APARTMENT', icon: 'business', label: 'Apartment' },
  { value: 'HOUSE', icon: 'home', label: 'House' },
  { value: 'VILLA', icon: 'home-outline', label: 'Villa' },
  { value: 'STUDIO', icon: 'color-palette-outline', label: 'Studio' },
  { value: 'ROOM', icon: 'bed-outline', label: 'Room' },
  { value: 'GUESTHOUSE', icon: 'people-outline', label: 'Guesthouse' },
  { value: 'HOTEL', icon: 'business-outline', label: 'Hotel' },
  { value: 'COTTAGE', icon: 'leaf-outline', label: 'Cottage' },
];

export const STAY_CATEGORIES = [
  { value: 'NIGHTLY_STAY', icon: 'moon', label: 'Nightly Stay' },
  { value: 'PARTY', icon: 'musical-notes', label: 'Party & Events' },
  { value: 'PHOTOSHOOT', icon: 'camera', label: 'Photoshoot' },
  { value: 'MEETING', icon: 'briefcase', label: 'Meeting' },
  { value: 'GETAWAY', icon: 'water', label: 'Getaway' },
  { value: 'SAFARI', icon: 'paw', label: 'Safari' },
  { value: 'BEACH', icon: 'sunny', label: 'Beach' },
  { value: 'WEDDING', icon: 'heart', label: 'Wedding' },
];
