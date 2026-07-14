import { UpdateShortTermPropertyInput } from '@/lib/API';

export interface EditFormData {
  title: string; description: string; propertyType: string; stayCategories: string[];
  region: string; district: string;
  nightlyRate: string; cleaningFee: string; serviceFeePercentage: string; currency: string;
  maxGuests: string; maxAdults: string; maxChildren: string; maxInfants: string;
  bedrooms: string; bathrooms: string;
  minimumStay: string; maximumStay: string; advanceBookingDays: string;
  instantBookEnabled: boolean;
  checkInTime: string; checkOutTime: string;
  ciWifi: string; ciWifiPassword: string; ciAccessCode: string; ciDirections: string;
  ciParking: string; ciContactPhone: string; ciContactName: string; ciNotes: string;
  cancellationPolicy: string;
  allowsPets: boolean; allowsSmoking: boolean; allowsChildren: boolean; allowsInfants: boolean;
  houseRules: string;
  amenities: string[];
}

export interface EditTabProps {
  form: EditFormData;
  upd: (key: string, val: any) => void;
  toggleCat: (cat: string) => void;
  saving: boolean;
  saveSec: (label: string, input: Partial<UpdateShortTermPropertyInput>) => void;
  // Colors
  text: string;
  tint: string;
  card: string;
  border: string;
  subtle: string;
  bg: string;
}

export interface PhotosTabProps {
  images: string[];
  setImages: (imgs: string[]) => void;
  saving: boolean;
  saveSec: (label: string, input: Partial<UpdateShortTermPropertyInput>) => void;
  text: string;
  tint: string;
  subtle: string;
}
