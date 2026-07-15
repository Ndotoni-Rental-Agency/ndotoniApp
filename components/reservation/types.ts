export interface ReservationColors {
  text: string;
  tint: string;
  card: string;
  border: string;
  subtle: string;
  bg: string;
}

export interface PriceBreakdown {
  nights: number;
  pricePerNight: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  currency: string;
}

export type BookingStep = 'dates' | 'auth-choice' | 'guest-info' | 'payment' | 'processing' | 'success' | 'failed';
