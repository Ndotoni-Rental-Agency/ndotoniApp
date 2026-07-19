export type TripTab = 'upcoming' | 'past' | 'cancelled';

export interface Booking {
  bookingId: string;
  propertyId?: string;
  status: string;
  paymentStatus?: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  numberOfGuests: number;
  hasReview?: boolean;
  pricing?: {
    total: number;
    currency: string;
    nightlyRate?: number;
    subtotal?: number;
    cleaningFee?: number;
    serviceFee?: number;
  };
  property?: {
    propertyId: string;
    title: string;
    thumbnail?: string;
    images?: string[];
    currency?: string;
    district?: string;
    region?: string;
  } | null;
  propertySnapshot?: {
    title: string;
    thumbnail?: string;
    propertyType: string;
    address?: {
      city?: string;
      district?: string;
      region?: string;
      street?: string;
    };
    nightlyRate: number;
    currency: string;
    images?: string[];
  } | null;
}

export interface TripColors {
  text: string;
  tint: string;
  card: string;
  border: string;
  subtle: string;
  bg: string;
}

export const getStatusColor = (b: Booking, subtle: string): string => {
  if (b.status === 'CONFIRMED' && b.paymentStatus !== 'CAPTURED' && b.paymentStatus !== 'AUTHORIZED') return '#f59e0b';
  if (b.status === 'CONFIRMED') return '#16a34a';
  if (b.status === 'PENDING') return '#f59e0b';
  if (b.status === 'CANCELLED') return '#ef4444';
  if (b.status === 'COMPLETED') return subtle;
  return subtle;
};

export const getStatusLabel = (b: Booking): string => {
  if (b.status === 'CONFIRMED' && b.paymentStatus !== 'CAPTURED' && b.paymentStatus !== 'AUTHORIZED') return 'Awaiting payment';
  if (b.status === 'CONFIRMED') return 'Confirmed';
  if (b.status === 'PENDING') return 'Pending approval';
  if (b.status === 'CANCELLED') return 'Cancelled';
  if (b.status === 'COMPLETED') return 'Completed';
  return b.status;
};

export const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export const getNights = (ci: string, co: string) => Math.ceil((new Date(co).getTime() - new Date(ci).getTime()) / 86400000);
