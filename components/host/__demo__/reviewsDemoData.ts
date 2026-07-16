/**
 * Demo data for HostReviews component.
 * Toggle USE_DEMO_DATA in HostReviews.tsx to true to use this data locally.
 * DO NOT commit with USE_DEMO_DATA = true.
 */

export interface DemoReview {
  reviewId: string;
  guestName: string;
  overallRating: number;
  accuracy: number;
  cleanliness: number;
  communication: number;
  location: number;
  value: number;
  comment: string;
  createdAt: string;
  propertyId: string;
  hostResponse?: string;
  verifiedStay: boolean;
  photos: string[];
}

export const DEMO_REVIEWS: DemoReview[] = [
  {
    reviewId: 'demo-1', guestName: 'Sarah M.', overallRating: 4.8,
    accuracy: 5, cleanliness: 5, communication: 4.5, location: 5, value: 4.5,
    comment: 'Absolutely stunning property! The view was incredible and the host was super responsive. Would definitely come back.',
    createdAt: '2026-07-10T08:00:00Z', propertyId: 'prop-1',
    hostResponse: 'Thank you so much Sarah! We loved having you.', verifiedStay: true, photos: [],
  },
  {
    reviewId: 'demo-2', guestName: 'James K.', overallRating: 4.0,
    accuracy: 4, cleanliness: 4.5, communication: 3.5, location: 4, value: 4,
    comment: 'Great location, clean space. The Wi-Fi was a bit slow but otherwise perfect for a weekend getaway.',
    createdAt: '2026-07-05T12:00:00Z', propertyId: 'prop-2',
    hostResponse: undefined, verifiedStay: true, photos: [],
  },
  {
    reviewId: 'demo-3', guestName: 'Amina H.', overallRating: 5.0,
    accuracy: 5, cleanliness: 5, communication: 5, location: 5, value: 5,
    comment: 'Best experience in Dar. The pool area is amazing and check-in was seamless.',
    createdAt: '2026-06-28T10:00:00Z', propertyId: 'prop-1',
    hostResponse: undefined, verifiedStay: true, photos: [],
  },
  {
    reviewId: 'demo-4', guestName: 'David L.', overallRating: 3.2,
    accuracy: 3, cleanliness: 3.5, communication: 3, location: 4, value: 2.5,
    comment: 'Decent place but the AC wasn\'t working properly on the second day. Host tried to fix it but took a while.',
    createdAt: '2026-06-20T14:00:00Z', propertyId: 'prop-2',
    hostResponse: 'Sorry about the AC issue David. We\'ve since replaced the unit. Hope to host you again!', verifiedStay: false, photos: [],
  },
  {
    reviewId: 'demo-5', guestName: 'Grace N.', overallRating: 4.6,
    accuracy: 4.5, cleanliness: 5, communication: 4.5, location: 4.5, value: 4,
    comment: 'Perfect for our family vacation. Kids loved the garden and the neighborhood felt very safe.',
    createdAt: '2026-06-15T09:00:00Z', propertyId: 'prop-1',
    hostResponse: undefined, verifiedStay: true, photos: [],
  },
];
