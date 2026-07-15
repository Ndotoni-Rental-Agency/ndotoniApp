export type Subpage = 'home' | 'bookings' | 'reviews' | 'payouts' | 'whatsapp' | 'stats';

export interface DashboardColors {
  bg: string;
  text: string;
  tint: string;
  card: string;
  border: string;
  subtle: string;
}

export interface HostProperty {
  propertyId: string;
  title: string;
  district: string;
  region: string;
  currency: string;
  nightlyRate: number;
  status?: string | null;
  thumbnail?: string | null;
  images?: (string | null)[] | null;
}
