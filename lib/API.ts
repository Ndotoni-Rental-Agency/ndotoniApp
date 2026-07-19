/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type BusyBlockRecurrenceInput = {
  days?: Array< number > | null,
  endDate: string,
  type: string,
};

export type BusyBlock = {
  __typename: "BusyBlock",
  createdAt: string,
  endUtc: string,
  id: string,
  recurrence?: BusyBlockRecurrence | null,
  startUtc: string,
  title?: string | null,
  userId: string,
};

export type BusyBlockRecurrence = {
  __typename: "BusyBlockRecurrence",
  days?: Array< number > | null,
  endDate: string,
  type: string,
};

export type SuccessResponse = {
  __typename: "SuccessResponse",
  message: string,
  success: boolean,
};

export enum ApplicationStatus {
  APPROVED = "APPROVED",
  EXPIRED = "EXPIRED",
  REJECTED = "REJECTED",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  WITHDRAWN = "WITHDRAWN",
}


export type Application = {
  __typename: "Application",
  applicant?: TenantBasicInfo | null,
  applicantDetails: ApplicantDetails,
  applicationId: string,
  createdAt?: string | null,
  landlord?: LandlordBasicInfo | null,
  landlordNotes?: string | null,
  property?: Property | null,
  propertyId: string,
  rejectionReason?: string | null,
  status: ApplicationStatus,
  submittedAt?: string | null,
  updatedAt?: string | null,
};

export type TenantBasicInfo = {
  __typename: "TenantBasicInfo",
  firstName?: string | null,
  lastName?: string | null,
  profileImage?: string | null,
};

export type ApplicantDetails = {
  __typename: "ApplicantDetails",
  emergencyContact: EmergencyContact,
  hasPets: boolean,
  leaseDuration: number,
  monthlyIncome: number,
  moveInDate: string,
  numberOfOccupants: number,
  occupation: string,
  petDetails?: string | null,
  smokingStatus: SmokingStatus,
};

export type EmergencyContact = {
  __typename: "EmergencyContact",
  email?: string | null,
  name: string,
  phoneNumber: string,
  relationship: string,
};

export enum SmokingStatus {
  NON_SMOKER = "NON_SMOKER",
  OCCASIONAL = "OCCASIONAL",
  SMOKER = "SMOKER",
}


export type LandlordBasicInfo = {
  __typename: "LandlordBasicInfo",
  businessName?: string | null,
  firstName?: string | null,
  lastName?: string | null,
  profileImage?: string | null,
};

export type Property = {
  __typename: "Property",
  address: Address,
  agent?: PropertyUser | null,
  agentId?: string | null,
  amenities?: Array< string | null > | null,
  availability?: PropertyAvailability | null,
  createdAt?: string | null,
  description?: string | null,
  googleMapsUrl?: string | null,
  landlord?: PropertyUser | null,
  media?: PropertyMedia | null,
  pricing?: PropertyPricing | null,
  propertyId: string,
  propertyType: PropertyType,
  specifications?: PropertySpecifications | null,
  status: PropertyStatus,
  title: string,
  updatedAt?: string | null,
  verified: boolean,
  version?: number | null,
};

export type Address = {
  __typename: "Address",
  coordinates?: Coordinates | null,
  district: string,
  postalCode?: string | null,
  region: string,
  street?: string | null,
  ward?: string | null,
};

export type Coordinates = {
  __typename: "Coordinates",
  latitude: number,
  longitude: number,
};

export type PropertyUser = {
  __typename: "PropertyUser",
  firstName: string,
  lastName: string,
  profileImage?: string | null,
  whatsappNumber?: string | null,
};

export type PropertyAvailability = {
  __typename: "PropertyAvailability",
  available: boolean,
  availableFrom?: string | null,
  maximumLeaseTerm?: number | null,
  minimumLeaseTerm?: number | null,
};

export type PropertyMedia = {
  __typename: "PropertyMedia",
  floorPlan?: string | null,
  images?: Array< string > | null,
  videos?: Array< string > | null,
  virtualTour?: string | null,
};

export type PropertyPricing = {
  __typename: "PropertyPricing",
  currency: string,
  deposit?: number | null,
  monthlyRent: number,
  serviceCharge?: number | null,
  utilitiesIncluded?: boolean | null,
};

export enum PropertyType {
  APARTMENT = "APARTMENT",
  COMMERCIAL = "COMMERCIAL",
  HOUSE = "HOUSE",
  LAND = "LAND",
  ROOM = "ROOM",
  STUDIO = "STUDIO",
}


export type PropertySpecifications = {
  __typename: "PropertySpecifications",
  bathrooms?: number | null,
  bedrooms?: number | null,
  floors?: number | null,
  furnished?: boolean | null,
  parkingSpaces?: number | null,
  squareMeters?: number | null,
};

export enum PropertyStatus {
  AVAILABLE = "AVAILABLE",
  DELETED = "DELETED",
  DRAFT = "DRAFT",
  INACTIVE = "INACTIVE",
  MAINTENANCE = "MAINTENANCE",
  RENTED = "RENTED",
}


export type Booking = {
  __typename: "Booking",
  bookingId: string,
  bookingType: BookingType,
  cancellationReason?: string | null,
  cancelledAt?: string | null,
  checkInDate: string,
  checkOutDate: string,
  completedAt?: string | null,
  confirmedAt?: string | null,
  createdAt: string,
  guest?: PropertyUser | null,
  guestEmail?: string | null,
  guestId: string,
  guestName?: string | null,
  guestPhone?: string | null,
  hostNotes?: string | null,
  numberOfAdults: number,
  numberOfChildren: number,
  numberOfGuests: number,
  numberOfInfants: number,
  numberOfNights: number,
  paymentIntentId?: string | null,
  paymentStatus: PaymentStatus,
  pricing: BookingPricing,
  property?: ShortTermProperty | null,
  propertyId: string,
  propertySnapshot?: PropertySnapshot | null,
  specialRequests?: string | null,
  status: BookingStatus,
  updatedAt: string,
};

export enum BookingType {
  INSTANT = "INSTANT",
  REQUEST = "REQUEST",
}


export enum PaymentStatus {
  AUTHORIZED = "AUTHORIZED",
  CANCELLED = "CANCELLED",
  CAPTURED = "CAPTURED",
  FAILED = "FAILED",
  PAID = "PAID",
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  REFUNDED = "REFUNDED",
}


export type BookingPricing = {
  __typename: "BookingPricing",
  cleaningFee: number,
  currency: string,
  nightlyRate: number,
  numberOfNights: number,
  refundAmount?: number | null,
  refundPercentage?: number | null,
  serviceFee: number,
  subtotal: number,
  taxes: number,
  total: number,
};

export type ShortTermProperty = {
  __typename: "ShortTermProperty",
  address?: ShortTermAddress | null,
  advanceBookingDays?: number | null,
  allowsChildren?: boolean | null,
  allowsInfants?: boolean | null,
  allowsPets?: boolean | null,
  allowsSmoking?: boolean | null,
  amenities?: Array< string > | null,
  averageRating?: number | null,
  bathrooms?: number | null,
  bedrooms?: number | null,
  cancellationPolicy?: CancellationPolicy | null,
  checkInInstructions?: CheckInInstructions | null,
  checkInTime?: string | null,
  checkOutTime?: string | null,
  cleaningFee?: number | null,
  coordinates?: Coordinates | null,
  createdAt: string,
  currency: string,
  description?: string | null,
  district: string,
  googleMapsUrl?: string | null,
  host?: PropertyUser | null,
  hostId: string,
  houseRules?: Array< string > | null,
  images?: Array< string > | null,
  instantBookEnabled?: boolean | null,
  maxAdults?: number | null,
  maxChildren?: number | null,
  maxGuests?: number | null,
  maxInfants?: number | null,
  maximumStay?: number | null,
  minimumStay?: number | null,
  nightlyRate: number,
  propertyId: string,
  propertyType: ShortTermPropertyType,
  publishedAt?: string | null,
  ratingSummary?: PropertyRatingSummary | null,
  region: string,
  serviceFeePercentage?: number | null,
  status: PropertyStatus,
  stayCategories?: Array< StayCategory > | null,
  taxPercentage?: number | null,
  thumbnail?: string | null,
  title: string,
  updatedAt: string,
  videos?: Array< string > | null,
};

export type ShortTermAddress = {
  __typename: "ShortTermAddress",
  city: string,
  country: string,
  district?: string | null,
  postalCode?: string | null,
  region: string,
  street: string,
};

export enum CancellationPolicy {
  FLEXIBLE = "FLEXIBLE",
  MODERATE = "MODERATE",
  STRICT = "STRICT",
}


export type CheckInInstructions = {
  __typename: "CheckInInstructions",
  accessCode?: string | null,
  additionalNotes?: string | null,
  contactName?: string | null,
  contactPhone?: string | null,
  directions?: string | null,
  houseRules?: Array< string > | null,
  parkingInfo?: string | null,
  wifiName?: string | null,
  wifiPassword?: string | null,
};

export enum ShortTermPropertyType {
  APARTMENT = "APARTMENT",
  BUNGALOW = "BUNGALOW",
  COTTAGE = "COTTAGE",
  GUESTHOUSE = "GUESTHOUSE",
  HOSTEL = "HOSTEL",
  HOTEL = "HOTEL",
  HOUSE = "HOUSE",
  LODGE = "LODGE",
  OTHER = "OTHER",
  RESORT = "RESORT",
  ROOM = "ROOM",
  STUDIO = "STUDIO",
  VILLA = "VILLA",
}


export type PropertyRatingSummary = {
  __typename: "PropertyRatingSummary",
  accuracy?: number | null,
  averageRating: number,
  cleanliness?: number | null,
  communication?: number | null,
  fiveStars?: number | null,
  fourStars?: number | null,
  location?: number | null,
  oneStar?: number | null,
  threeStars?: number | null,
  totalReviews: number,
  twoStars?: number | null,
  value?: number | null,
};

export enum StayCategory {
  BEACH = "BEACH",
  CITY_LIFE = "CITY_LIFE",
  FILMING = "FILMING",
  GETAWAY = "GETAWAY",
  GROUP_TRIP = "GROUP_TRIP",
  MEETING = "MEETING",
  NATURE = "NATURE",
  NIGHTLY_STAY = "NIGHTLY_STAY",
  PARTY = "PARTY",
  PHOTOSHOOT = "PHOTOSHOOT",
  RETREAT = "RETREAT",
  ROMANTIC = "ROMANTIC",
  SAFARI = "SAFARI",
  WEDDING = "WEDDING",
}


export type PropertySnapshot = {
  __typename: "PropertySnapshot",
  address?: PropertySnapshotAddress | null,
  currency: string,
  images?: Array< string > | null,
  nightlyRate: number,
  propertyType: string,
  thumbnail?: string | null,
  title: string,
};

export type PropertySnapshotAddress = {
  __typename: "PropertySnapshotAddress",
  city?: string | null,
  district?: string | null,
  region?: string | null,
  street?: string | null,
};

export enum BookingStatus {
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  CONFIRMED = "CONFIRMED",
  DECLINED = "DECLINED",
  NO_SHOW = "NO_SHOW",
  PENDING = "PENDING",
}


export type PropertyMediaInput = {
  floorPlan?: string | null,
  images?: Array< string > | null,
  videos?: Array< string > | null,
  virtualTour?: string | null,
};

export type BlockDatesInput = {
  endDate: string,
  propertyId: string,
  reason?: string | null,
  startDate: string,
};

export type CancelBookingResponse = {
  __typename: "CancelBookingResponse",
  booking: Booking,
  message: string,
  refundAmount: number,
  refundPercentage: number,
};

export type AssociateWhatsAppResponse = {
  __typename: "AssociateWhatsAppResponse",
  message: string,
  success: boolean,
};

export type CreateBookingInput = {
  checkInDate: string,
  checkOutDate: string,
  guestEmail?: string | null,
  guestName?: string | null,
  guestPhone?: string | null,
  numberOfAdults: number,
  numberOfChildren: number,
  numberOfGuests: number,
  numberOfInfants: number,
  paymentMethodId: string,
  propertyId: string,
  specialRequests?: string | null,
};

export type CreateBookingResponse = {
  __typename: "CreateBookingResponse",
  booking: Booking,
  message: string,
  paymentStatus: PaymentStatus,
};

export enum HousingRequestSource {
  ADMIN = "ADMIN",
  WEB = "WEB",
  WHATSAPP = "WHATSAPP",
}


export type HousingRequest = {
  __typename: "HousingRequest",
  adminNotes?: string | null,
  assignedAdmin?: string | null,
  bedrooms?: number | null,
  contactName?: string | null,
  createdAt: string,
  currency: string,
  description: string,
  district?: string | null,
  fulfilledPropertyId?: string | null,
  matchedLandlords?: Array< string > | null,
  maxBudget?: number | null,
  minBudget?: number | null,
  moveInDate?: string | null,
  phone: string,
  propertyType?: string | null,
  region?: string | null,
  requestId: string,
  source: HousingRequestSource,
  status: HousingRequestStatus,
  street?: string | null,
  updatedAt: string,
  userId?: string | null,
  ward?: string | null,
};

export enum HousingRequestStatus {
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  FULFILLED = "FULFILLED",
  MATCHED = "MATCHED",
  OPEN = "OPEN",
}


export type CreateLocationInput = {
  name: string,
  parent?: string | null,
  type: LocationType,
};

export enum LocationType {
  DISTRICT = "DISTRICT",
  REGION = "REGION",
  STREET = "STREET",
  WARD = "WARD",
}


export type LocationCreateResponse = {
  __typename: "LocationCreateResponse",
  location: LocationResult,
  message: string,
  success: boolean,
};

export type LocationResult = District | Region | Street | Ward


export type District = {
  __typename: "District",
  id: string,
  name: string,
  regionId: string,
};

export type Region = {
  __typename: "Region",
  id: string,
  name: string,
};

export type Street = {
  __typename: "Street",
  id: string,
  name: string,
  wardId: string,
};

export type Ward = {
  __typename: "Ward",
  districtId: string,
  id: string,
  name: string,
};

export type CreatePropertyInput = {
  address: AddressInput,
  amenities?: Array< string > | null,
  availability: PropertyAvailabilityInput,
  description?: string | null,
  media?: PropertyMediaInput | null,
  pricing: PropertyPricingInput,
  propertyType: PropertyType,
  specifications: PropertySpecificationsInput,
  title: string,
};

export type AddressInput = {
  coordinates?: CoordinatesInput | null,
  district: string,
  postalCode?: string | null,
  region: string,
  street?: string | null,
  ward?: string | null,
};

export type CoordinatesInput = {
  latitude: number,
  longitude: number,
};

export type PropertyAvailabilityInput = {
  available: boolean,
  availableFrom?: string | null,
  maximumLeaseTerm?: number | null,
  minimumLeaseTerm?: number | null,
};

export type PropertyPricingInput = {
  currency: string,
  deposit?: number | null,
  monthlyRent: number,
  serviceCharge?: number | null,
  utilitiesIncluded?: boolean | null,
};

export type PropertySpecificationsInput = {
  bathrooms?: number | null,
  bedrooms?: number | null,
  floors?: number | null,
  furnished?: boolean | null,
  parkingSpaces?: number | null,
  squareMeters?: number | null,
};

export type CreatePropertyResponse = {
  __typename: "CreatePropertyResponse",
  isGuestUser: boolean,
  message: string,
  propertyId: string,
  status: PropertyStatus,
  success: boolean,
};

export type CreatePropertyDraftInput = {
  available: boolean,
  bathrooms?: number | null,
  bedrooms?: number | null,
  currency: string,
  district: string,
  guestEmail?: string | null,
  guestPhoneNumber?: string | null,
  guestWhatsappNumber?: string | null,
  images?: Array< string > | null,
  latitude: number,
  longitude: number,
  monthlyRent: number,
  propertyType: PropertyType,
  region: string,
  street?: string | null,
  title: string,
  videos?: Array< string > | null,
  ward?: string | null,
};

export type CreateReviewInput = {
  accuracy: number,
  bookingId: string,
  cleanliness: number,
  comment: string,
  communication: number,
  location: number,
  overallRating: number,
  photos?: Array< string > | null,
  propertyId: string,
  value: number,
};

export type Review = {
  __typename: "Review",
  accuracy: number,
  bookingId: string,
  cleanliness: number,
  comment: string,
  communication: number,
  createdAt: string,
  guest?: PropertyUser | null,
  guestId: string,
  hostResponse?: string | null,
  hostResponseDate?: string | null,
  location: number,
  overallRating: number,
  photos?: Array< string > | null,
  propertyId: string,
  reviewId: string,
  updatedAt: string,
  value: number,
  verifiedStay: boolean,
};

export type CreateShortTermPropertyInput = {
  address: ShortTermAddressInput,
  advanceBookingDays: number,
  allowsChildren: boolean,
  allowsInfants: boolean,
  allowsPets: boolean,
  allowsSmoking: boolean,
  amenities: Array< string >,
  cancellationPolicy: CancellationPolicy,
  checkInInstructions?: CheckInInstructionsInput | null,
  checkInTime: string,
  checkOutTime: string,
  cleaningFee?: number | null,
  coordinates?: CoordinatesInput | null,
  currency: string,
  description: string,
  district: string,
  houseRules?: Array< string > | null,
  images: Array< string >,
  instantBookEnabled: boolean,
  maxAdults?: number | null,
  maxChildren?: number | null,
  maxGuests: number,
  maxInfants?: number | null,
  maximumStay?: number | null,
  minimumStay: number,
  nightlyRate: number,
  propertyType: ShortTermPropertyType,
  region: string,
  serviceFeePercentage: number,
  stayCategories?: Array< StayCategory > | null,
  taxPercentage: number,
  thumbnail: string,
  title: string,
  videos?: Array< string > | null,
};

export type ShortTermAddressInput = {
  city: string,
  country: string,
  district?: string | null,
  postalCode?: string | null,
  region: string,
  street: string,
};

export type CheckInInstructionsInput = {
  accessCode?: string | null,
  additionalNotes?: string | null,
  contactName?: string | null,
  contactPhone?: string | null,
  directions?: string | null,
  houseRules?: Array< string > | null,
  parkingInfo?: string | null,
  wifiName?: string | null,
  wifiPassword?: string | null,
};

export type CreateShortTermPropertyDraftInput = {
  bathrooms?: number | null,
  bedrooms?: number | null,
  cleaningFee?: number | null,
  currency: string,
  district: string,
  googleMapsLink?: string | null,
  guestEmail?: string | null,
  guestPhoneNumber?: string | null,
  guestWhatsappNumber?: string | null,
  images?: Array< string > | null,
  instantBookEnabled?: boolean | null,
  latitude?: number | null,
  longitude?: number | null,
  maxGuests?: number | null,
  minimumStay?: number | null,
  nightlyRate: number,
  propertyType: ShortTermPropertyType,
  region: string,
  stayCategories?: Array< StayCategory > | null,
  title: string,
  videos?: Array< string > | null,
};

export type CreateShortTermPropertyResponse = {
  __typename: "CreateShortTermPropertyResponse",
  isGuestUser: boolean,
  message: string,
  propertyId?: string | null,
  status: PropertyStatus,
  success: boolean,
};

export type StripePaymentIntentResponse = {
  __typename: "StripePaymentIntentResponse",
  amount: number,
  clientSecret: string,
  currency: string,
  paymentIntentId: string,
};

export type DeleteResponse = {
  __typename: "DeleteResponse",
  message: string,
  success: boolean,
};

export type MediaItem = {
  __typename: "MediaItem",
  actionTime: number,
  additionalFiles?:  Array<MediaFile | null > | null,
  media?: PropertyMedia | null,
  userId: string,
};

export type MediaFile = {
  __typename: "MediaFile",
  contentType: string,
  fileName?: string | null,
  fileUrl: string,
};

export enum DataType {
  LOCATIONS = "LOCATIONS",
  PROPERTIES = "PROPERTIES",
}


export type UploadUrlResponse = {
  __typename: "UploadUrlResponse",
  fileKey: string,
  uploadUrl: string,
};

export type MediaUploadResponse = {
  __typename: "MediaUploadResponse",
  fileUrl: string,
  key: string,
  uploadUrl: string,
};

export type LocationImportResponse = {
  __typename: "LocationImportResponse",
  errors?: Array< string > | null,
  imported: number,
  message: string,
  skipped: number,
  success: boolean,
};

export type PropertyImportResult = {
  __typename: "PropertyImportResult",
  errors: Array< string >,
  imported: number,
  message: string,
  skipped: number,
  success: boolean,
  updated: number,
};

export type DirectChatInitializationResponse = {
  __typename: "DirectChatInitializationResponse",
  conversationId: string,
  targetUserInfo: ChatUser,
};

export type ChatUser = {
  __typename: "ChatUser",
  businessName?: string | null,
  firstName: string,
  lastName: string,
  profileImage?: string | null,
  userId: string,
  userType: UserType,
};

export enum UserType {
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  GUEST = "GUEST",
  LANDLORD = "LANDLORD",
  TENANT = "TENANT",
}


export type ChatInitializationResponse = {
  __typename: "ChatInitializationResponse",
  conversationId: string,
  landlordInfo: ChatLandlordInfo,
  propertyId: string,
  propertyTitle: string,
};

export type ChatLandlordInfo = {
  __typename: "ChatLandlordInfo",
  businessName?: string | null,
  firstName: string,
  lastName: string,
  profileImage?: string | null,
};

export type InitiatePaymentInput = {
  bookingId?: string | null,
  listingPlan?: ListingPlan | null,
  phoneNumber: string,
};

export enum ListingPlan {
  MONTHLY = "MONTHLY",
  PER_LISTING = "PER_LISTING",
  YEARLY = "YEARLY",
}


export type InitiatePaymentResponse = {
  __typename: "InitiatePaymentResponse",
  amount: number,
  currency: string,
  message: string,
  reference: string,
  status: string,
};

export type Conversation = {
  __typename: "Conversation",
  conversationType?: string | null,
  createdAt: string,
  id: string,
  lastMessage: string,
  lastMessageTime: string,
  otherPartyImage?: string | null,
  otherPartyName: string,
  propertyTitle: string,
  unreadCount: number,
  updatedAt: string,
};

export type SubscriptionPublishResponse = {
  __typename: "SubscriptionPublishResponse",
  message?: string | null,
  propertyId?: string | null,
  success: boolean,
};

export type PropertyUpdateEventInput = {
  changes: Array< PropertyChangeInput >,
  eventType: PropertyEventType,
  property: string,
  propertyId: string,
  timestamp: string,
};

export type PropertyChangeInput = {
  field: string,
  newValue: string,
  oldValue?: string | null,
};

export enum PropertyEventType {
  ARCHIVED = "ARCHIVED",
  AVAILABILITY_CHANGED = "AVAILABILITY_CHANGED",
  CREATED = "CREATED",
  DELETED = "DELETED",
  DESCRIPTION_UPDATED = "DESCRIPTION_UPDATED",
  MEDIA_UPDATED = "MEDIA_UPDATED",
  PRICE_CHANGED = "PRICE_CHANGED",
  PROPERTY_CREATED = "PROPERTY_CREATED",
  PUBLISHED = "PUBLISHED",
  STATUS_CHANGED = "STATUS_CHANGED",
  UPDATED = "UPDATED",
}


export type PropertyUpdateEvent = {
  __typename: "PropertyUpdateEvent",
  changes:  Array<PropertyChange >,
  eventType: PropertyEventType,
  property: Property,
  propertyId: string,
  timestamp: string,
};

export type PropertyChange = {
  __typename: "PropertyChange",
  field: string,
  newValue: string,
  oldValue?: string | null,
};

export type RefundResponse = {
  __typename: "RefundResponse",
  amount: number,
  currency: string,
  refundId: string,
  success: boolean,
};

export type LocationJsonResponse = {
  __typename: "LocationJsonResponse",
  cloudfrontUrl: string,
  message: string,
  success: boolean,
};

export type RespondToReviewInput = {
  response: string,
  reviewId: string,
};

export enum LandlordApplicationStatus {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  UNDER_REVIEW = "UNDER_REVIEW",
}


export type LandlordApplication = {
  __typename: "LandlordApplication",
  address?: string | null,
  adminNotes?: string | null,
  alternatePhone?: string | null,
  applicant?: TenantBasicInfo | null,
  applicationId: string,
  birthDate?: string | null,
  createdAt?: string | null,
  nationalId?: string | null,
  phoneNumber?: string | null,
  rejectionReason?: string | null,
  reviewedAt?: string | null,
  status?: LandlordApplicationStatus | null,
  submittedAt?: string | null,
  updatedAt?: string | null,
  userId: string,
};

export type TeamMeeting = {
  __typename: "TeamMeeting",
  attendeeIds: Array< string >,
  createdAt: string,
  createdBy: string,
  createdByName: string,
  description?: string | null,
  endUtc: string,
  id: string,
  link?: string | null,
  startUtc: string,
  title: string,
};

export type SendCheckInInstructionsInput = {
  bookingId: string,
  customAccessCode?: string | null,
  customAdditionalNotes?: string | null,
  customContactName?: string | null,
  customContactPhone?: string | null,
  customDirections?: string | null,
  customHouseRules?: Array< string > | null,
  customParkingInfo?: string | null,
  customWifiName?: string | null,
  customWifiPassword?: string | null,
};

export type SendCheckInInstructionsResponse = {
  __typename: "SendCheckInInstructionsResponse",
  message: string,
  sentVia: Array< string >,
  success: boolean,
};

export type SendMessageInput = {
  content: string,
  conversationId: string,
};

export type ChatMessage = {
  __typename: "ChatMessage",
  content: string,
  conversationId: string,
  id: string,
  isMine: boolean,
  isRead: boolean,
  senderId?: string | null,
  senderName: string,
  timestamp: string,
};

export type AuthResponse = {
  __typename: "AuthResponse",
  accessToken: string,
  refreshToken: string,
};

export type SignUpInput = {
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  phoneNumber: string,
};

export type SubmitApplicationInput = {
  applicantDetails: ApplicantDetailsInput,
  propertyId: string,
};

export type ApplicantDetailsInput = {
  emergencyContact: EmergencyContactInput,
  employmentStatus: EmploymentStatus,
  hasPets: boolean,
  leaseDuration: number,
  monthlyIncome: number,
  moveInDate: string,
  numberOfOccupants: number,
  occupation: string,
  petDetails?: string | null,
  smokingStatus: SmokingStatus,
};

export type EmergencyContactInput = {
  email?: string | null,
  name: string,
  phoneNumber: string,
  relationship: string,
};

export enum EmploymentStatus {
  CONTRACT = "CONTRACT",
  EMPLOYED_FULL_TIME = "EMPLOYED_FULL_TIME",
  EMPLOYED_PART_TIME = "EMPLOYED_PART_TIME",
  RETIRED = "RETIRED",
  SELF_EMPLOYED = "SELF_EMPLOYED",
  STUDENT = "STUDENT",
  UNEMPLOYED = "UNEMPLOYED",
}


export type SubmitContactInquiryInput = {
  email: string,
  inquiryType: InquiryType,
  message: string,
  name: string,
  phone?: string | null,
  subject: string,
};

export enum InquiryType {
  GENERAL = "GENERAL",
  PARTNERSHIP = "PARTNERSHIP",
  PROPERTY = "PROPERTY",
  SUPPORT = "SUPPORT",
}


export type ContactInquiryResponse = {
  __typename: "ContactInquiryResponse",
  createdAt: string,
  inquiryId: string,
  message: string,
};

export type LandlordApplicationInput = {
  address: AddressInput,
  alternatePhone?: string | null,
  birthDate: string,
  nationalId: string,
  phoneNumber: string,
};

export type ApplicationResponse = {
  __typename: "ApplicationResponse",
  applicationId?: string | null,
  message: string,
  status?: string | null,
  submittedAt?: string | null,
  success: boolean,
};

export type LandlordRegistration = {
  __typename: "LandlordRegistration",
  adminNotes?: Array< string > | null,
  area?: string | null,
  assignedTo?: string | null,
  createdAt: string,
  name: string,
  notes?: string | null,
  phone: string,
  registrationId: string,
  status: string,
  updatedAt?: string | null,
};

export type ReferralSubmission = {
  __typename: "ReferralSubmission",
  adminNotes?: Array< string > | null,
  assignedTo?: string | null,
  createdAt: string,
  landlordArea: string,
  landlordName: string,
  landlordNotes?: string | null,
  landlordPhone: string,
  listingRewardStatus: string,
  profitShareRewardStatus: string,
  referralId: string,
  referrerName: string,
  referrerNida?: string | null,
  referrerPhone: string,
  status: string,
  updatedAt?: string | null,
};

export type FavoriteResponse = {
  __typename: "FavoriteResponse",
  isFavorited: boolean,
  message?: string | null,
  success: boolean,
};

export type UnblockDatesInput = {
  endDate: string,
  propertyId: string,
  startDate: string,
};

export type UpdateApplicationInput = {
  applicantDetails?: ApplicantDetailsInput | null,
};

export type UpdateApplicationStatusInput = {
  landlordNotes?: string | null,
  rejectionReason?: string | null,
  status: ApplicationStatus,
};

export enum InquiryStatus {
  CLOSED = "CLOSED",
  IN_PROGRESS = "IN_PROGRESS",
  PENDING = "PENDING",
  RESOLVED = "RESOLVED",
}


export type ContactInquiry = {
  __typename: "ContactInquiry",
  adminNotes?: string | null,
  createdAt: string,
  email: string,
  handledBy?: string | null,
  inquiryId: string,
  inquiryType: InquiryType,
  message: string,
  name: string,
  phone?: string | null,
  status: InquiryStatus,
  subject: string,
  updatedAt: string,
};

export type LocationUpdateResponse = {
  __typename: "LocationUpdateResponse",
  location?: Region | null,
  message?: string | null,
  success: boolean,
};

export type UpdatePropertyInput = {
  address?: AddressInput | null,
  amenities?: Array< string > | null,
  availability?: PropertyAvailabilityInput | null,
  description?: string | null,
  googleMapsUrl?: string | null,
  media?: PropertyMediaInput | null,
  pricing?: PropertyPricingInput | null,
  propertyType?: PropertyType | null,
  specifications?: PropertySpecificationsInput | null,
  status?: PropertyStatus | null,
  title?: string | null,
  verified?: boolean | null,
};

export type UpdateShortTermPropertyInput = {
  address?: ShortTermAddressInput | null,
  advanceBookingDays?: number | null,
  allowsChildren?: boolean | null,
  allowsInfants?: boolean | null,
  allowsPets?: boolean | null,
  allowsSmoking?: boolean | null,
  amenities?: Array< string > | null,
  bathrooms?: number | null,
  bedrooms?: number | null,
  cancellationPolicy?: CancellationPolicy | null,
  checkInInstructions?: CheckInInstructionsInput | null,
  checkInTime?: string | null,
  checkOutTime?: string | null,
  cleaningFee?: number | null,
  coordinates?: CoordinatesInput | null,
  currency?: string | null,
  description?: string | null,
  district?: string | null,
  googleMapsUrl?: string | null,
  houseRules?: Array< string > | null,
  images?: Array< string > | null,
  instantBookEnabled?: boolean | null,
  maxAdults?: number | null,
  maxChildren?: number | null,
  maxGuests?: number | null,
  maxInfants?: number | null,
  maximumStay?: number | null,
  minimumStay?: number | null,
  nightlyRate?: number | null,
  propertyType?: ShortTermPropertyType | null,
  region?: string | null,
  serviceFeePercentage?: number | null,
  status?: PropertyStatus | null,
  stayCategories?: Array< StayCategory > | null,
  taxPercentage?: number | null,
  thumbnail?: string | null,
  title?: string | null,
  videos?: Array< string > | null,
};

export type UpdateUserInput = {
  address?: string | null,
  city?: string | null,
  dateOfBirth?: string | null,
  district?: string | null,
  emergencyContactName?: string | null,
  emergencyContactPhone?: string | null,
  firstName?: string | null,
  gender?: string | null,
  hasProperties?: boolean | null,
  lastName?: string | null,
  nationalId?: string | null,
  occupation?: string | null,
  payoutBankAccountName?: string | null,
  payoutBankAccountNumber?: string | null,
  payoutBankBranch?: string | null,
  payoutBankName?: string | null,
  payoutMethod?: PayoutMethod | null,
  payoutMpesaName?: string | null,
  payoutMpesaPhone?: string | null,
  phoneNumber?: string | null,
  preferences?: string | null,
  profileImage?: string | null,
  region?: string | null,
  street?: string | null,
  ward?: string | null,
  whatsappNumber?: string | null,
};

export enum PayoutMethod {
  BANK = "BANK",
  MPESA = "MPESA",
}


export enum AccountStatus {
  ACTIVE = "ACTIVE",
  PENDING_LANDLORD_VERIFICATION = "PENDING_LANDLORD_VERIFICATION",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  SUSPENDED = "SUSPENDED",
}


export type PropertyAvailabilityRange = {
  __typename: "PropertyAvailabilityRange",
  available: boolean,
  endDate: string,
  propertyId: string,
  startDate: string,
  unavailableDates: Array< string >,
};

export type ListingEntitlement = {
  __typename: "ListingEntitlement",
  activePlan?: string | null,
  canList: boolean,
  freeListingsRemaining: number,
  message: string,
};

export type ApplicationStats = {
  __typename: "ApplicationStats",
  approved: number,
  rejected: number,
  submitted: number,
  total: number,
  underReview: number,
  withdrawn: number,
};

export type PropertyStats = {
  __typename: "PropertyStats",
  availableProperties: number,
  deletedProperties: number,
  draftProperties: number,
  maintenanceProperties: number,
  newPropertiesThisMonth: number,
  newPropertiesThisWeek: number,
  rentedProperties: number,
  totalProperties: number,
};

export type BlockedDatesResponse = {
  __typename: "BlockedDatesResponse",
  blockedRanges:  Array<BlockedDateRange >,
  propertyId: string,
};

export type BlockedDateRange = {
  __typename: "BlockedDateRange",
  endDate: string,
  reason?: string | null,
  startDate: string,
};

export type Payment = {
  __typename: "Payment",
  amount: number,
  bookingId: string,
  completedAt?: string | null,
  conversationID?: string | null,
  createdAt: string,
  currency: string,
  customerEmail?: string | null,
  customerPhone?: string | null,
  errorMessage?: string | null,
  paymentId: string,
  provider: PaymentProvider,
  refundAmount?: number | null,
  refundReason?: string | null,
  refundedAt?: string | null,
  status: PaymentStatus,
  thirdPartyConversationID: string,
  transactionID?: string | null,
  updatedAt: string,
};

export enum PaymentProvider {
  MPESA = "MPESA",
  PAYPAL = "PAYPAL",
  STRIPE = "STRIPE",
}


export type CategorizedPropertiesResponse = {
  __typename: "CategorizedPropertiesResponse",
  favorites?: CategoryPropertyResponse | null,
  lowestPrice: CategoryPropertyResponse,
  more?: CategoryPropertyResponse | null,
  mostViewed?: CategoryPropertyResponse | null,
  nearby: CategoryPropertyResponse,
  recentlyViewed?: CategoryPropertyResponse | null,
};

export type CategoryPropertyResponse = {
  __typename: "CategoryPropertyResponse",
  category: PropertyCategory,
  count: number,
  nextToken?: string | null,
  properties:  Array<PropertyCard >,
};

export enum PropertyCategory {
  FAVORITES = "FAVORITES",
  LOWEST_PRICE = "LOWEST_PRICE",
  MORE = "MORE",
  MOST_VIEWED = "MOST_VIEWED",
  NEARBY = "NEARBY",
  RECENTLY_VIEWED = "RECENTLY_VIEWED",
}


export type PropertyCard = {
  __typename: "PropertyCard",
  bedrooms?: number | null,
  currency: string,
  district: string,
  monthlyRent: number,
  propertyId: string,
  propertyType: PropertyType,
  region: string,
  thumbnail?: string | null,
  title: string,
  verified: boolean,
};

export type ContactInquiryStats = {
  __typename: "ContactInquiryStats",
  byType:  Array<InquiryTypeCount >,
  inProgress: number,
  pending: number,
  resolved: number,
  total: number,
};

export type InquiryTypeCount = {
  __typename: "InquiryTypeCount",
  count: number,
  type: InquiryType,
};

export type InitialAppState = {
  __typename: "InitialAppState",
  categorizedProperties: CategorizedPropertiesResponse,
};

export type LandlordApplicationStats = {
  __typename: "LandlordApplicationStats",
  approved: number,
  pending: number,
  rejected: number,
  total: number,
  underReview: number,
};

export type LandlordPropertiesInfo = {
  __typename: "LandlordPropertiesInfo",
  count: number,
  landlord: LandlordPublicInfo,
  nextToken?: string | null,
  properties:  Array<Property >,
};

export type LandlordPublicInfo = {
  __typename: "LandlordPublicInfo",
  businessName?: string | null,
  createdAt?: string | null,
  district?: string | null,
  email?: string | null,
  firstName?: string | null,
  lastName?: string | null,
  phoneNumber?: string | null,
  profileImage?: string | null,
  region?: string | null,
  whatsappNumber?: string | null,
};

export type UserProfile = Admin | Agent | Landlord | Tenant


export type Admin = {
  __typename: "Admin",
  accountStatus?: AccountStatus | null,
  address?: string | null,
  city?: string | null,
  createdAt?: string | null,
  currency?: string | null,
  dateOfBirth?: string | null,
  district?: string | null,
  email?: string | null,
  emailNotifications?: boolean | null,
  emergencyContactName?: string | null,
  emergencyContactPhone?: string | null,
  firstName?: string | null,
  gender?: string | null,
  hasProperties?: boolean | null,
  isEmailVerified?: boolean | null,
  language?: string | null,
  lastName?: string | null,
  nationalIdLast4?: string | null,
  occupation?: string | null,
  payoutBankAccountName?: string | null,
  payoutBankAccountNumber?: string | null,
  payoutBankBranch?: string | null,
  payoutBankName?: string | null,
  payoutMethod?: PayoutMethod | null,
  payoutMpesaName?: string | null,
  payoutMpesaPhone?: string | null,
  permissions?: Array< string > | null,
  phoneNumber?: string | null,
  profileImage?: string | null,
  pushNotifications?: boolean | null,
  region?: string | null,
  smsNotifications?: boolean | null,
  street?: string | null,
  updatedAt?: string | null,
  userType: UserType,
  ward?: string | null,
  whatsappNumber?: string | null,
};

export type Agent = {
  __typename: "Agent",
  accountStatus?: AccountStatus | null,
  address?: string | null,
  agencyName?: string | null,
  city?: string | null,
  createdAt?: string | null,
  currency?: string | null,
  dateOfBirth?: string | null,
  district?: string | null,
  email?: string | null,
  emailNotifications?: boolean | null,
  emergencyContactName?: string | null,
  emergencyContactPhone?: string | null,
  firstName?: string | null,
  gender?: string | null,
  hasProperties?: boolean | null,
  isEmailVerified?: boolean | null,
  language?: string | null,
  lastName?: string | null,
  licenseNumber?: string | null,
  nationalIdLast4?: string | null,
  occupation?: string | null,
  phoneNumber?: string | null,
  profileImage?: string | null,
  pushNotifications?: boolean | null,
  region?: string | null,
  smsNotifications?: boolean | null,
  specializations?: Array< string > | null,
  street?: string | null,
  updatedAt?: string | null,
  userType: UserType,
  ward?: string | null,
  whatsappNumber?: string | null,
};

export type Landlord = {
  __typename: "Landlord",
  accountStatus?: AccountStatus | null,
  address?: string | null,
  businessLicense?: string | null,
  businessName?: string | null,
  city?: string | null,
  createdAt?: string | null,
  currency?: string | null,
  dateOfBirth?: string | null,
  district?: string | null,
  email?: string | null,
  emailNotifications?: boolean | null,
  emergencyContactName?: string | null,
  emergencyContactPhone?: string | null,
  firstName?: string | null,
  gender?: string | null,
  hasProperties?: boolean | null,
  isEmailVerified?: boolean | null,
  language?: string | null,
  lastName?: string | null,
  nationalIdLast4?: string | null,
  occupation?: string | null,
  payoutBankAccountName?: string | null,
  payoutBankAccountNumber?: string | null,
  payoutBankBranch?: string | null,
  payoutBankName?: string | null,
  payoutMethod?: PayoutMethod | null,
  payoutMpesaName?: string | null,
  payoutMpesaPhone?: string | null,
  phoneNumber?: string | null,
  profileImage?: string | null,
  pushNotifications?: boolean | null,
  region?: string | null,
  smsNotifications?: boolean | null,
  street?: string | null,
  taxId?: string | null,
  updatedAt?: string | null,
  userType: UserType,
  verificationDocuments?: Array< string > | null,
  ward?: string | null,
  whatsappNumber?: string | null,
};

export type Tenant = {
  __typename: "Tenant",
  accountStatus?: AccountStatus | null,
  address?: string | null,
  city?: string | null,
  createdAt?: string | null,
  currency?: string | null,
  dateOfBirth?: string | null,
  district?: string | null,
  email?: string | null,
  emailNotifications?: boolean | null,
  emergencyContactName?: string | null,
  emergencyContactPhone?: string | null,
  firstName?: string | null,
  gender?: string | null,
  hasProperties?: boolean | null,
  isEmailVerified?: boolean | null,
  language?: string | null,
  lastName?: string | null,
  nationalIdLast4?: string | null,
  occupation?: string | null,
  payoutBankAccountName?: string | null,
  payoutBankAccountNumber?: string | null,
  payoutBankBranch?: string | null,
  payoutBankName?: string | null,
  payoutMethod?: PayoutMethod | null,
  payoutMpesaName?: string | null,
  payoutMpesaPhone?: string | null,
  phoneNumber?: string | null,
  profileImage?: string | null,
  pushNotifications?: boolean | null,
  region?: string | null,
  smsNotifications?: boolean | null,
  street?: string | null,
  updatedAt?: string | null,
  userType: UserType,
  ward?: string | null,
  whatsappNumber?: string | null,
};

export enum PropertySortOption {
  NEWEST_FIRST = "NEWEST_FIRST",
  PRICE_HIGH_LOW = "PRICE_HIGH_LOW",
  PRICE_LOW_HIGH = "PRICE_LOW_HIGH",
}


export type PropertyCardsResponse = {
  __typename: "PropertyCardsResponse",
  count: number,
  nextToken?: string | null,
  properties:  Array<PropertyCard >,
};

export type ReviewListResponse = {
  __typename: "ReviewListResponse",
  count: number,
  nextToken?: string | null,
  reviews:  Array<Review >,
};

export type RelatedPropertiesResponse = {
  __typename: "RelatedPropertiesResponse",
  landlordProperties:  Array<PropertyCard >,
  similarLocationProperties:  Array<PropertyCard >,
  similarPriceProperties:  Array<PropertyCard >,
};

export type SuggestedLandlord = {
  __typename: "SuggestedLandlord",
  landlord: LandlordProfile,
  matchReasons: Array< string >,
};

export type LandlordProfile = {
  __typename: "LandlordProfile",
  businessName?: string | null,
  createdAt?: string | null,
  currency?: string | null,
  district?: string | null,
  firstName?: string | null,
  lastName?: string | null,
  maxPrice?: number | null,
  minPrice?: number | null,
  operatingDistricts: Array< string >,
  operatingRegions: Array< string >,
  phoneNumber?: string | null,
  profileImage?: string | null,
  propertyCount: number,
  propertyTypes: Array< string >,
  region?: string | null,
  userId: string,
  ward?: string | null,
  whatsappNumber?: string | null,
};

export type TeamAvailabilityResponse = {
  __typename: "TeamAvailabilityResponse",
  busyBlocks:  Array<BusyBlock >,
  meetings:  Array<TeamMeeting >,
};

export type UserStats = {
  __typename: "UserStats",
  activeUsers: number,
  newUsersThisMonth: number,
  newUsersThisWeek: number,
  totalAdmins: number,
  totalAgents: number,
  totalLandlords: number,
  totalTenants: number,
  totalUsers: number,
};

export type WhatsAppConversationSummary = {
  __typename: "WhatsAppConversationSummary",
  contactName?: string | null,
  entries:  Array<WhatsAppChatEntry >,
  hasMore?: boolean | null,
  lastMessageAt?: string | null,
  linkedUser?: WhatsAppLinkedUser | null,
  messageCount: number,
  oldestTs?: string | null,
  phone: string,
};

export type WhatsAppChatEntry = {
  __typename: "WhatsAppChatEntry",
  direction: string,
  lang?: string | null,
  phone: string,
  replyId?: string | null,
  source?: string | null,
  step?: string | null,
  text?: string | null,
  ts: string,
  type: string,
};

export type WhatsAppLinkedUser = {
  __typename: "WhatsAppLinkedUser",
  email?: string | null,
  firstName: string,
  lastName: string,
  phoneNumber?: string | null,
  userId: string,
  userType: string,
  whatsappNumber?: string | null,
};

export type PropertyListResponse = {
  __typename: "PropertyListResponse",
  count: number,
  nextToken?: string | null,
  properties:  Array<Property >,
};

export type ApplicationListResponse = {
  __typename: "ApplicationListResponse",
  applications:  Array<Application >,
  count: number,
  nextToken?: string | null,
};

export type LandlordApplicationListResponse = {
  __typename: "LandlordApplicationListResponse",
  applications:  Array<LandlordApplication >,
  count: number,
  nextToken?: string | null,
};

export type CombinedPropertyListResponse = {
  __typename: "CombinedPropertyListResponse",
  longTermProperties:  Array<Property >,
  nextToken?: string | null,
  shortTermProperties:  Array<ShortTermProperty >,
  totalCount: number,
};

export type UserListResponse = {
  __typename: "UserListResponse",
  count: number,
  nextToken?: string | null,
  users:  Array<UserWithId >,
};

export type UserWithId = {
  __typename: "UserWithId",
  profile: UserProfile,
  userId: string,
};

export type ContactInquiryListResponse = {
  __typename: "ContactInquiryListResponse",
  count: number,
  items:  Array<ContactInquiry >,
  nextToken?: string | null,
};

export type HousingRequestListResponse = {
  __typename: "HousingRequestListResponse",
  count: number,
  nextToken?: string | null,
  requests:  Array<HousingRequest >,
};

export type LandlordRegistrationListResponse = {
  __typename: "LandlordRegistrationListResponse",
  count: number,
  nextToken?: string | null,
  registrations:  Array<LandlordRegistration >,
};

export type BookingListResponse = {
  __typename: "BookingListResponse",
  bookings:  Array<Booking >,
  count: number,
  nextToken?: string | null,
};

export type ShortTermPropertyListResponse = {
  __typename: "ShortTermPropertyListResponse",
  nextToken?: string | null,
  properties:  Array<ShortTermProperty >,
};

export type LandlordProfileListResponse = {
  __typename: "LandlordProfileListResponse",
  count: number,
  landlords:  Array<LandlordProfile >,
  nextToken?: string | null,
};

export type ReferralSubmissionListResponse = {
  __typename: "ReferralSubmissionListResponse",
  count: number,
  nextToken?: string | null,
  submissions:  Array<ReferralSubmission >,
};

export type WhatsAppConversationRow = {
  __typename: "WhatsAppConversationRow",
  contactName?: string | null,
  createdAt: string,
  lang?: string | null,
  lastMessageAt: string,
  phoneNumber: string,
  step: string,
};

export type ShortTermSearchInput = {
  amenities?: Array< string > | null,
  bedrooms?: number | null,
  checkInDate: string,
  checkOutDate: string,
  district?: string | null,
  instantBookOnly?: boolean | null,
  limit?: number | null,
  maxPrice?: number | null,
  minPrice?: number | null,
  minRating?: number | null,
  nextToken?: string | null,
  numberOfAdults?: number | null,
  numberOfChildren?: number | null,
  numberOfGuests: number,
  numberOfInfants?: number | null,
  propertyType?: ShortTermPropertyType | null,
  region: string,
  sortBy?: ShortTermSortOption | null,
  stayCategory?: StayCategory | null,
};

export enum ShortTermSortOption {
  NEWEST_FIRST = "NEWEST_FIRST",
  PRICE_HIGH_LOW = "PRICE_HIGH_LOW",
  PRICE_LOW_HIGH = "PRICE_LOW_HIGH",
  RATING_HIGH_LOW = "RATING_HIGH_LOW",
  ROTATION = "ROTATION",
}


export type AddBusyBlockMutationVariables = {
  endUtc: string,
  recurrence?: BusyBlockRecurrenceInput | null,
  startUtc: string,
  title?: string | null,
};

export type AddBusyBlockMutation = {
  addBusyBlock:  {
    __typename: "BusyBlock",
    createdAt: string,
    endUtc: string,
    id: string,
    recurrence?:  {
      __typename: "BusyBlockRecurrence",
      days?: Array< number > | null,
      endDate: string,
      type: string,
    } | null,
    startUtc: string,
    title?: string | null,
    userId: string,
  },
};

export type AddLandlordRegistrationNoteMutationVariables = {
  createdAt: string,
  note: string,
  registrationId: string,
};

export type AddLandlordRegistrationNoteMutation = {
  addLandlordRegistrationNote:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type AddReferralNoteMutationVariables = {
  createdAt: string,
  note: string,
  referralId: string,
};

export type AddReferralNoteMutation = {
  addReferralNote:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type AdminDeleteApplicationMutationVariables = {
  applicationId: string,
};

export type AdminDeleteApplicationMutation = {
  adminDeleteApplication:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type AdminDeleteLandlordApplicationMutationVariables = {
  applicationId: string,
};

export type AdminDeleteLandlordApplicationMutation = {
  adminDeleteLandlordApplication:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type AdminDeletePropertyMutationVariables = {
  propertyId: string,
};

export type AdminDeletePropertyMutation = {
  adminDeleteProperty:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type AdminUpdateApplicationStatusMutationVariables = {
  applicationId: string,
  notes?: string | null,
  status: ApplicationStatus,
};

export type AdminUpdateApplicationStatusMutation = {
  adminUpdateApplicationStatus:  {
    __typename: "Application",
    applicant?:  {
      __typename: "TenantBasicInfo",
      firstName?: string | null,
      lastName?: string | null,
      profileImage?: string | null,
    } | null,
    applicantDetails:  {
      __typename: "ApplicantDetails",
      emergencyContact:  {
        __typename: "EmergencyContact",
        email?: string | null,
        name: string,
        phoneNumber: string,
        relationship: string,
      },
      hasPets: boolean,
      leaseDuration: number,
      monthlyIncome: number,
      moveInDate: string,
      numberOfOccupants: number,
      occupation: string,
      petDetails?: string | null,
      smokingStatus: SmokingStatus,
    },
    applicationId: string,
    createdAt?: string | null,
    landlord?:  {
      __typename: "LandlordBasicInfo",
      businessName?: string | null,
      firstName?: string | null,
      lastName?: string | null,
      profileImage?: string | null,
    } | null,
    landlordNotes?: string | null,
    property?:  {
      __typename: "Property",
      address:  {
        __typename: "Address",
        coordinates?:  {
          __typename: "Coordinates",
          latitude: number,
          longitude: number,
        } | null,
        district: string,
        postalCode?: string | null,
        region: string,
        street?: string | null,
        ward?: string | null,
      },
      agent?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      agentId?: string | null,
      amenities?: Array< string | null > | null,
      availability?:  {
        __typename: "PropertyAvailability",
        available: boolean,
        availableFrom?: string | null,
        maximumLeaseTerm?: number | null,
        minimumLeaseTerm?: number | null,
      } | null,
      createdAt?: string | null,
      description?: string | null,
      googleMapsUrl?: string | null,
      landlord?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      media?:  {
        __typename: "PropertyMedia",
        floorPlan?: string | null,
        images?: Array< string > | null,
        videos?: Array< string > | null,
        virtualTour?: string | null,
      } | null,
      pricing?:  {
        __typename: "PropertyPricing",
        currency: string,
        deposit?: number | null,
        monthlyRent: number,
        serviceCharge?: number | null,
        utilitiesIncluded?: boolean | null,
      } | null,
      propertyId: string,
      propertyType: PropertyType,
      specifications?:  {
        __typename: "PropertySpecifications",
        bathrooms?: number | null,
        bedrooms?: number | null,
        floors?: number | null,
        furnished?: boolean | null,
        parkingSpaces?: number | null,
        squareMeters?: number | null,
      } | null,
      status: PropertyStatus,
      title: string,
      updatedAt?: string | null,
      verified: boolean,
      version?: number | null,
    } | null,
    propertyId: string,
    rejectionReason?: string | null,
    status: ApplicationStatus,
    submittedAt?: string | null,
    updatedAt?: string | null,
  },
};

export type AdminUpdatePropertyStatusMutationVariables = {
  notes?: string | null,
  propertyId: string,
  status: PropertyStatus,
};

export type AdminUpdatePropertyStatusMutation = {
  adminUpdatePropertyStatus:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type ApproveBookingMutationVariables = {
  bookingId: string,
  hostNotes?: string | null,
  token?: string | null,
};

export type ApproveBookingMutation = {
  approveBooking:  {
    __typename: "Booking",
    bookingId: string,
    bookingType: BookingType,
    cancellationReason?: string | null,
    cancelledAt?: string | null,
    checkInDate: string,
    checkOutDate: string,
    completedAt?: string | null,
    confirmedAt?: string | null,
    createdAt: string,
    guest?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    guestEmail?: string | null,
    guestId: string,
    guestName?: string | null,
    guestPhone?: string | null,
    hostNotes?: string | null,
    numberOfAdults: number,
    numberOfChildren: number,
    numberOfGuests: number,
    numberOfInfants: number,
    numberOfNights: number,
    paymentIntentId?: string | null,
    paymentStatus: PaymentStatus,
    pricing:  {
      __typename: "BookingPricing",
      cleaningFee: number,
      currency: string,
      nightlyRate: number,
      numberOfNights: number,
      refundAmount?: number | null,
      refundPercentage?: number | null,
      serviceFee: number,
      subtotal: number,
      taxes: number,
      total: number,
    },
    property?:  {
      __typename: "ShortTermProperty",
      address?:  {
        __typename: "ShortTermAddress",
        city: string,
        country: string,
        district?: string | null,
        postalCode?: string | null,
        region: string,
        street: string,
      } | null,
      advanceBookingDays?: number | null,
      allowsChildren?: boolean | null,
      allowsInfants?: boolean | null,
      allowsPets?: boolean | null,
      allowsSmoking?: boolean | null,
      amenities?: Array< string > | null,
      averageRating?: number | null,
      bathrooms?: number | null,
      bedrooms?: number | null,
      cancellationPolicy?: CancellationPolicy | null,
      checkInInstructions?:  {
        __typename: "CheckInInstructions",
        accessCode?: string | null,
        additionalNotes?: string | null,
        contactName?: string | null,
        contactPhone?: string | null,
        directions?: string | null,
        houseRules?: Array< string > | null,
        parkingInfo?: string | null,
        wifiName?: string | null,
        wifiPassword?: string | null,
      } | null,
      checkInTime?: string | null,
      checkOutTime?: string | null,
      cleaningFee?: number | null,
      coordinates?:  {
        __typename: "Coordinates",
        latitude: number,
        longitude: number,
      } | null,
      createdAt: string,
      currency: string,
      description?: string | null,
      district: string,
      googleMapsUrl?: string | null,
      host?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      hostId: string,
      houseRules?: Array< string > | null,
      images?: Array< string > | null,
      instantBookEnabled?: boolean | null,
      maxAdults?: number | null,
      maxChildren?: number | null,
      maxGuests?: number | null,
      maxInfants?: number | null,
      maximumStay?: number | null,
      minimumStay?: number | null,
      nightlyRate: number,
      propertyId: string,
      propertyType: ShortTermPropertyType,
      publishedAt?: string | null,
      ratingSummary?:  {
        __typename: "PropertyRatingSummary",
        accuracy?: number | null,
        averageRating: number,
        cleanliness?: number | null,
        communication?: number | null,
        fiveStars?: number | null,
        fourStars?: number | null,
        location?: number | null,
        oneStar?: number | null,
        threeStars?: number | null,
        totalReviews: number,
        twoStars?: number | null,
        value?: number | null,
      } | null,
      region: string,
      serviceFeePercentage?: number | null,
      status: PropertyStatus,
      stayCategories?: Array< StayCategory > | null,
      taxPercentage?: number | null,
      thumbnail?: string | null,
      title: string,
      updatedAt: string,
      videos?: Array< string > | null,
    } | null,
    propertyId: string,
    propertySnapshot?:  {
      __typename: "PropertySnapshot",
      address?:  {
        __typename: "PropertySnapshotAddress",
        city?: string | null,
        district?: string | null,
        region?: string | null,
        street?: string | null,
      } | null,
      currency: string,
      images?: Array< string > | null,
      nightlyRate: number,
      propertyType: string,
      thumbnail?: string | null,
      title: string,
    } | null,
    specialRequests?: string | null,
    status: BookingStatus,
    updatedAt: string,
  },
};

export type ApprovePropertyMutationVariables = {
  notes?: string | null,
  propertyId: string,
};

export type ApprovePropertyMutation = {
  approveProperty:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type AssignPropertyAgentMutationVariables = {
  agentId: string,
  propertyId: string,
};

export type AssignPropertyAgentMutation = {
  assignPropertyAgent:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type AssociateMediaWithPropertyMutationVariables = {
  media: PropertyMediaInput,
  propertyId: string,
};

export type AssociateMediaWithPropertyMutation = {
  associateMediaWithProperty:  {
    __typename: "Property",
    address:  {
      __typename: "Address",
      coordinates?:  {
        __typename: "Coordinates",
        latitude: number,
        longitude: number,
      } | null,
      district: string,
      postalCode?: string | null,
      region: string,
      street?: string | null,
      ward?: string | null,
    },
    agent?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    agentId?: string | null,
    amenities?: Array< string | null > | null,
    availability?:  {
      __typename: "PropertyAvailability",
      available: boolean,
      availableFrom?: string | null,
      maximumLeaseTerm?: number | null,
      minimumLeaseTerm?: number | null,
    } | null,
    createdAt?: string | null,
    description?: string | null,
    googleMapsUrl?: string | null,
    landlord?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    media?:  {
      __typename: "PropertyMedia",
      floorPlan?: string | null,
      images?: Array< string > | null,
      videos?: Array< string > | null,
      virtualTour?: string | null,
    } | null,
    pricing?:  {
      __typename: "PropertyPricing",
      currency: string,
      deposit?: number | null,
      monthlyRent: number,
      serviceCharge?: number | null,
      utilitiesIncluded?: boolean | null,
    } | null,
    propertyId: string,
    propertyType: PropertyType,
    specifications?:  {
      __typename: "PropertySpecifications",
      bathrooms?: number | null,
      bedrooms?: number | null,
      floors?: number | null,
      furnished?: boolean | null,
      parkingSpaces?: number | null,
      squareMeters?: number | null,
    } | null,
    status: PropertyStatus,
    title: string,
    updatedAt?: string | null,
    verified: boolean,
    version?: number | null,
  },
};

export type BlockDatesMutationVariables = {
  input: BlockDatesInput,
};

export type BlockDatesMutation = {
  blockDates:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type CancelBookingMutationVariables = {
  bookingId: string,
  reason?: string | null,
};

export type CancelBookingMutation = {
  cancelBooking:  {
    __typename: "CancelBookingResponse",
    booking:  {
      __typename: "Booking",
      bookingId: string,
      bookingType: BookingType,
      cancellationReason?: string | null,
      cancelledAt?: string | null,
      checkInDate: string,
      checkOutDate: string,
      completedAt?: string | null,
      confirmedAt?: string | null,
      createdAt: string,
      guest?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      guestEmail?: string | null,
      guestId: string,
      guestName?: string | null,
      guestPhone?: string | null,
      hostNotes?: string | null,
      numberOfAdults: number,
      numberOfChildren: number,
      numberOfGuests: number,
      numberOfInfants: number,
      numberOfNights: number,
      paymentIntentId?: string | null,
      paymentStatus: PaymentStatus,
      pricing:  {
        __typename: "BookingPricing",
        cleaningFee: number,
        currency: string,
        nightlyRate: number,
        numberOfNights: number,
        refundAmount?: number | null,
        refundPercentage?: number | null,
        serviceFee: number,
        subtotal: number,
        taxes: number,
        total: number,
      },
      property?:  {
        __typename: "ShortTermProperty",
        address?:  {
          __typename: "ShortTermAddress",
          city: string,
          country: string,
          district?: string | null,
          postalCode?: string | null,
          region: string,
          street: string,
        } | null,
        advanceBookingDays?: number | null,
        allowsChildren?: boolean | null,
        allowsInfants?: boolean | null,
        allowsPets?: boolean | null,
        allowsSmoking?: boolean | null,
        amenities?: Array< string > | null,
        averageRating?: number | null,
        bathrooms?: number | null,
        bedrooms?: number | null,
        cancellationPolicy?: CancellationPolicy | null,
        checkInInstructions?:  {
          __typename: "CheckInInstructions",
          accessCode?: string | null,
          additionalNotes?: string | null,
          contactName?: string | null,
          contactPhone?: string | null,
          directions?: string | null,
          houseRules?: Array< string > | null,
          parkingInfo?: string | null,
          wifiName?: string | null,
          wifiPassword?: string | null,
        } | null,
        checkInTime?: string | null,
        checkOutTime?: string | null,
        cleaningFee?: number | null,
        coordinates?:  {
          __typename: "Coordinates",
          latitude: number,
          longitude: number,
        } | null,
        createdAt: string,
        currency: string,
        description?: string | null,
        district: string,
        googleMapsUrl?: string | null,
        host?:  {
          __typename: "PropertyUser",
          firstName: string,
          lastName: string,
          profileImage?: string | null,
          whatsappNumber?: string | null,
        } | null,
        hostId: string,
        houseRules?: Array< string > | null,
        images?: Array< string > | null,
        instantBookEnabled?: boolean | null,
        maxAdults?: number | null,
        maxChildren?: number | null,
        maxGuests?: number | null,
        maxInfants?: number | null,
        maximumStay?: number | null,
        minimumStay?: number | null,
        nightlyRate: number,
        propertyId: string,
        propertyType: ShortTermPropertyType,
        publishedAt?: string | null,
        ratingSummary?:  {
          __typename: "PropertyRatingSummary",
          accuracy?: number | null,
          averageRating: number,
          cleanliness?: number | null,
          communication?: number | null,
          fiveStars?: number | null,
          fourStars?: number | null,
          location?: number | null,
          oneStar?: number | null,
          threeStars?: number | null,
          totalReviews: number,
          twoStars?: number | null,
          value?: number | null,
        } | null,
        region: string,
        serviceFeePercentage?: number | null,
        status: PropertyStatus,
        stayCategories?: Array< StayCategory > | null,
        taxPercentage?: number | null,
        thumbnail?: string | null,
        title: string,
        updatedAt: string,
        videos?: Array< string > | null,
      } | null,
      propertyId: string,
      propertySnapshot?:  {
        __typename: "PropertySnapshot",
        address?:  {
          __typename: "PropertySnapshotAddress",
          city?: string | null,
          district?: string | null,
          region?: string | null,
          street?: string | null,
        } | null,
        currency: string,
        images?: Array< string > | null,
        nightlyRate: number,
        propertyType: string,
        thumbnail?: string | null,
        title: string,
      } | null,
      specialRequests?: string | null,
      status: BookingStatus,
      updatedAt: string,
    },
    message: string,
    refundAmount: number,
    refundPercentage: number,
  },
};

export type ConfirmWhatsAppAssociationMutationVariables = {
  code: string,
  whatsappNumber: string,
};

export type ConfirmWhatsAppAssociationMutation = {
  confirmWhatsAppAssociation:  {
    __typename: "AssociateWhatsAppResponse",
    message: string,
    success: boolean,
  },
};

export type CreateBookingMutationVariables = {
  input: CreateBookingInput,
};

export type CreateBookingMutation = {
  createBooking:  {
    __typename: "CreateBookingResponse",
    booking:  {
      __typename: "Booking",
      bookingId: string,
      bookingType: BookingType,
      cancellationReason?: string | null,
      cancelledAt?: string | null,
      checkInDate: string,
      checkOutDate: string,
      completedAt?: string | null,
      confirmedAt?: string | null,
      createdAt: string,
      guest?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      guestEmail?: string | null,
      guestId: string,
      guestName?: string | null,
      guestPhone?: string | null,
      hostNotes?: string | null,
      numberOfAdults: number,
      numberOfChildren: number,
      numberOfGuests: number,
      numberOfInfants: number,
      numberOfNights: number,
      paymentIntentId?: string | null,
      paymentStatus: PaymentStatus,
      pricing:  {
        __typename: "BookingPricing",
        cleaningFee: number,
        currency: string,
        nightlyRate: number,
        numberOfNights: number,
        refundAmount?: number | null,
        refundPercentage?: number | null,
        serviceFee: number,
        subtotal: number,
        taxes: number,
        total: number,
      },
      property?:  {
        __typename: "ShortTermProperty",
        address?:  {
          __typename: "ShortTermAddress",
          city: string,
          country: string,
          district?: string | null,
          postalCode?: string | null,
          region: string,
          street: string,
        } | null,
        advanceBookingDays?: number | null,
        allowsChildren?: boolean | null,
        allowsInfants?: boolean | null,
        allowsPets?: boolean | null,
        allowsSmoking?: boolean | null,
        amenities?: Array< string > | null,
        averageRating?: number | null,
        bathrooms?: number | null,
        bedrooms?: number | null,
        cancellationPolicy?: CancellationPolicy | null,
        checkInInstructions?:  {
          __typename: "CheckInInstructions",
          accessCode?: string | null,
          additionalNotes?: string | null,
          contactName?: string | null,
          contactPhone?: string | null,
          directions?: string | null,
          houseRules?: Array< string > | null,
          parkingInfo?: string | null,
          wifiName?: string | null,
          wifiPassword?: string | null,
        } | null,
        checkInTime?: string | null,
        checkOutTime?: string | null,
        cleaningFee?: number | null,
        coordinates?:  {
          __typename: "Coordinates",
          latitude: number,
          longitude: number,
        } | null,
        createdAt: string,
        currency: string,
        description?: string | null,
        district: string,
        googleMapsUrl?: string | null,
        host?:  {
          __typename: "PropertyUser",
          firstName: string,
          lastName: string,
          profileImage?: string | null,
          whatsappNumber?: string | null,
        } | null,
        hostId: string,
        houseRules?: Array< string > | null,
        images?: Array< string > | null,
        instantBookEnabled?: boolean | null,
        maxAdults?: number | null,
        maxChildren?: number | null,
        maxGuests?: number | null,
        maxInfants?: number | null,
        maximumStay?: number | null,
        minimumStay?: number | null,
        nightlyRate: number,
        propertyId: string,
        propertyType: ShortTermPropertyType,
        publishedAt?: string | null,
        ratingSummary?:  {
          __typename: "PropertyRatingSummary",
          accuracy?: number | null,
          averageRating: number,
          cleanliness?: number | null,
          communication?: number | null,
          fiveStars?: number | null,
          fourStars?: number | null,
          location?: number | null,
          oneStar?: number | null,
          threeStars?: number | null,
          totalReviews: number,
          twoStars?: number | null,
          value?: number | null,
        } | null,
        region: string,
        serviceFeePercentage?: number | null,
        status: PropertyStatus,
        stayCategories?: Array< StayCategory > | null,
        taxPercentage?: number | null,
        thumbnail?: string | null,
        title: string,
        updatedAt: string,
        videos?: Array< string > | null,
      } | null,
      propertyId: string,
      propertySnapshot?:  {
        __typename: "PropertySnapshot",
        address?:  {
          __typename: "PropertySnapshotAddress",
          city?: string | null,
          district?: string | null,
          region?: string | null,
          street?: string | null,
        } | null,
        currency: string,
        images?: Array< string > | null,
        nightlyRate: number,
        propertyType: string,
        thumbnail?: string | null,
        title: string,
      } | null,
      specialRequests?: string | null,
      status: BookingStatus,
      updatedAt: string,
    },
    message: string,
    paymentStatus: PaymentStatus,
  },
};

export type CreateHousingRequestMutationVariables = {
  bedrooms?: number | null,
  contactName?: string | null,
  currency?: string | null,
  description: string,
  district?: string | null,
  maxBudget?: number | null,
  minBudget?: number | null,
  moveInDate?: string | null,
  phone: string,
  propertyType?: string | null,
  region?: string | null,
  source: HousingRequestSource,
  street?: string | null,
  ward?: string | null,
};

export type CreateHousingRequestMutation = {
  createHousingRequest:  {
    __typename: "HousingRequest",
    adminNotes?: string | null,
    assignedAdmin?: string | null,
    bedrooms?: number | null,
    contactName?: string | null,
    createdAt: string,
    currency: string,
    description: string,
    district?: string | null,
    fulfilledPropertyId?: string | null,
    matchedLandlords?: Array< string > | null,
    maxBudget?: number | null,
    minBudget?: number | null,
    moveInDate?: string | null,
    phone: string,
    propertyType?: string | null,
    region?: string | null,
    requestId: string,
    source: HousingRequestSource,
    status: HousingRequestStatus,
    street?: string | null,
    updatedAt: string,
    userId?: string | null,
    ward?: string | null,
  },
};

export type CreateLocationMutationVariables = {
  input: CreateLocationInput,
};

export type CreateLocationMutation = {
  createLocation:  {
    __typename: "LocationCreateResponse",
    location: ( {
        __typename: "District",
        id: string,
        name: string,
        regionId: string,
      } | {
        __typename: "Region",
        id: string,
        name: string,
      } | {
        __typename: "Street",
        id: string,
        name: string,
        wardId: string,
      } | {
        __typename: "Ward",
        districtId: string,
        id: string,
        name: string,
      }
    ),
    message: string,
    success: boolean,
  },
};

export type CreatePropertyMutationVariables = {
  input: CreatePropertyInput,
};

export type CreatePropertyMutation = {
  createProperty:  {
    __typename: "CreatePropertyResponse",
    isGuestUser: boolean,
    message: string,
    propertyId: string,
    status: PropertyStatus,
    success: boolean,
  },
};

export type CreatePropertyDraftMutationVariables = {
  input: CreatePropertyDraftInput,
};

export type CreatePropertyDraftMutation = {
  createPropertyDraft:  {
    __typename: "CreatePropertyResponse",
    isGuestUser: boolean,
    message: string,
    propertyId: string,
    status: PropertyStatus,
    success: boolean,
  },
};

export type CreateReviewMutationVariables = {
  input: CreateReviewInput,
};

export type CreateReviewMutation = {
  createReview:  {
    __typename: "Review",
    accuracy: number,
    bookingId: string,
    cleanliness: number,
    comment: string,
    communication: number,
    createdAt: string,
    guest?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    guestId: string,
    hostResponse?: string | null,
    hostResponseDate?: string | null,
    location: number,
    overallRating: number,
    photos?: Array< string > | null,
    propertyId: string,
    reviewId: string,
    updatedAt: string,
    value: number,
    verifiedStay: boolean,
  },
};

export type CreateShortTermPropertyMutationVariables = {
  input: CreateShortTermPropertyInput,
};

export type CreateShortTermPropertyMutation = {
  createShortTermProperty:  {
    __typename: "ShortTermProperty",
    address?:  {
      __typename: "ShortTermAddress",
      city: string,
      country: string,
      district?: string | null,
      postalCode?: string | null,
      region: string,
      street: string,
    } | null,
    advanceBookingDays?: number | null,
    allowsChildren?: boolean | null,
    allowsInfants?: boolean | null,
    allowsPets?: boolean | null,
    allowsSmoking?: boolean | null,
    amenities?: Array< string > | null,
    averageRating?: number | null,
    bathrooms?: number | null,
    bedrooms?: number | null,
    cancellationPolicy?: CancellationPolicy | null,
    checkInInstructions?:  {
      __typename: "CheckInInstructions",
      accessCode?: string | null,
      additionalNotes?: string | null,
      contactName?: string | null,
      contactPhone?: string | null,
      directions?: string | null,
      houseRules?: Array< string > | null,
      parkingInfo?: string | null,
      wifiName?: string | null,
      wifiPassword?: string | null,
    } | null,
    checkInTime?: string | null,
    checkOutTime?: string | null,
    cleaningFee?: number | null,
    coordinates?:  {
      __typename: "Coordinates",
      latitude: number,
      longitude: number,
    } | null,
    createdAt: string,
    currency: string,
    description?: string | null,
    district: string,
    googleMapsUrl?: string | null,
    host?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    hostId: string,
    houseRules?: Array< string > | null,
    images?: Array< string > | null,
    instantBookEnabled?: boolean | null,
    maxAdults?: number | null,
    maxChildren?: number | null,
    maxGuests?: number | null,
    maxInfants?: number | null,
    maximumStay?: number | null,
    minimumStay?: number | null,
    nightlyRate: number,
    propertyId: string,
    propertyType: ShortTermPropertyType,
    publishedAt?: string | null,
    ratingSummary?:  {
      __typename: "PropertyRatingSummary",
      accuracy?: number | null,
      averageRating: number,
      cleanliness?: number | null,
      communication?: number | null,
      fiveStars?: number | null,
      fourStars?: number | null,
      location?: number | null,
      oneStar?: number | null,
      threeStars?: number | null,
      totalReviews: number,
      twoStars?: number | null,
      value?: number | null,
    } | null,
    region: string,
    serviceFeePercentage?: number | null,
    status: PropertyStatus,
    stayCategories?: Array< StayCategory > | null,
    taxPercentage?: number | null,
    thumbnail?: string | null,
    title: string,
    updatedAt: string,
    videos?: Array< string > | null,
  },
};

export type CreateShortTermPropertyDraftMutationVariables = {
  input: CreateShortTermPropertyDraftInput,
};

export type CreateShortTermPropertyDraftMutation = {
  createShortTermPropertyDraft:  {
    __typename: "CreateShortTermPropertyResponse",
    isGuestUser: boolean,
    message: string,
    propertyId?: string | null,
    status: PropertyStatus,
    success: boolean,
  },
};

export type CreateStripePaymentIntentMutationVariables = {
  bookingId: string,
  currency?: string | null,
};

export type CreateStripePaymentIntentMutation = {
  createStripePaymentIntent:  {
    __typename: "StripePaymentIntentResponse",
    amount: number,
    clientSecret: string,
    currency: string,
    paymentIntentId: string,
  },
};

export type DeactivateShortTermPropertyMutationVariables = {
  propertyId: string,
};

export type DeactivateShortTermPropertyMutation = {
  deactivateShortTermProperty:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type DeclineBookingMutationVariables = {
  bookingId: string,
  reason: string,
  token?: string | null,
};

export type DeclineBookingMutation = {
  declineBooking:  {
    __typename: "Booking",
    bookingId: string,
    bookingType: BookingType,
    cancellationReason?: string | null,
    cancelledAt?: string | null,
    checkInDate: string,
    checkOutDate: string,
    completedAt?: string | null,
    confirmedAt?: string | null,
    createdAt: string,
    guest?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    guestEmail?: string | null,
    guestId: string,
    guestName?: string | null,
    guestPhone?: string | null,
    hostNotes?: string | null,
    numberOfAdults: number,
    numberOfChildren: number,
    numberOfGuests: number,
    numberOfInfants: number,
    numberOfNights: number,
    paymentIntentId?: string | null,
    paymentStatus: PaymentStatus,
    pricing:  {
      __typename: "BookingPricing",
      cleaningFee: number,
      currency: string,
      nightlyRate: number,
      numberOfNights: number,
      refundAmount?: number | null,
      refundPercentage?: number | null,
      serviceFee: number,
      subtotal: number,
      taxes: number,
      total: number,
    },
    property?:  {
      __typename: "ShortTermProperty",
      address?:  {
        __typename: "ShortTermAddress",
        city: string,
        country: string,
        district?: string | null,
        postalCode?: string | null,
        region: string,
        street: string,
      } | null,
      advanceBookingDays?: number | null,
      allowsChildren?: boolean | null,
      allowsInfants?: boolean | null,
      allowsPets?: boolean | null,
      allowsSmoking?: boolean | null,
      amenities?: Array< string > | null,
      averageRating?: number | null,
      bathrooms?: number | null,
      bedrooms?: number | null,
      cancellationPolicy?: CancellationPolicy | null,
      checkInInstructions?:  {
        __typename: "CheckInInstructions",
        accessCode?: string | null,
        additionalNotes?: string | null,
        contactName?: string | null,
        contactPhone?: string | null,
        directions?: string | null,
        houseRules?: Array< string > | null,
        parkingInfo?: string | null,
        wifiName?: string | null,
        wifiPassword?: string | null,
      } | null,
      checkInTime?: string | null,
      checkOutTime?: string | null,
      cleaningFee?: number | null,
      coordinates?:  {
        __typename: "Coordinates",
        latitude: number,
        longitude: number,
      } | null,
      createdAt: string,
      currency: string,
      description?: string | null,
      district: string,
      googleMapsUrl?: string | null,
      host?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      hostId: string,
      houseRules?: Array< string > | null,
      images?: Array< string > | null,
      instantBookEnabled?: boolean | null,
      maxAdults?: number | null,
      maxChildren?: number | null,
      maxGuests?: number | null,
      maxInfants?: number | null,
      maximumStay?: number | null,
      minimumStay?: number | null,
      nightlyRate: number,
      propertyId: string,
      propertyType: ShortTermPropertyType,
      publishedAt?: string | null,
      ratingSummary?:  {
        __typename: "PropertyRatingSummary",
        accuracy?: number | null,
        averageRating: number,
        cleanliness?: number | null,
        communication?: number | null,
        fiveStars?: number | null,
        fourStars?: number | null,
        location?: number | null,
        oneStar?: number | null,
        threeStars?: number | null,
        totalReviews: number,
        twoStars?: number | null,
        value?: number | null,
      } | null,
      region: string,
      serviceFeePercentage?: number | null,
      status: PropertyStatus,
      stayCategories?: Array< StayCategory > | null,
      taxPercentage?: number | null,
      thumbnail?: string | null,
      title: string,
      updatedAt: string,
      videos?: Array< string > | null,
    } | null,
    propertyId: string,
    propertySnapshot?:  {
      __typename: "PropertySnapshot",
      address?:  {
        __typename: "PropertySnapshotAddress",
        city?: string | null,
        district?: string | null,
        region?: string | null,
        street?: string | null,
      } | null,
      currency: string,
      images?: Array< string > | null,
      nightlyRate: number,
      propertyType: string,
      thumbnail?: string | null,
      title: string,
    } | null,
    specialRequests?: string | null,
    status: BookingStatus,
    updatedAt: string,
  },
};

export type DeleteConversationMutationVariables = {
  conversationId: string,
};

export type DeleteConversationMutation = {
  deleteConversation:  {
    __typename: "DeleteResponse",
    message: string,
    success: boolean,
  },
};

export type DeleteMediaItemMutationVariables = {
  fileUrl: string,
};

export type DeleteMediaItemMutation = {
  deleteMediaItem?:  {
    __typename: "MediaItem",
    actionTime: number,
    additionalFiles?:  Array< {
      __typename: "MediaFile",
      contentType: string,
      fileName?: string | null,
      fileUrl: string,
    } | null > | null,
    media?:  {
      __typename: "PropertyMedia",
      floorPlan?: string | null,
      images?: Array< string > | null,
      videos?: Array< string > | null,
      virtualTour?: string | null,
    } | null,
    userId: string,
  } | null,
};

export type DeleteMessageMutationVariables = {
  messageId: string,
};

export type DeleteMessageMutation = {
  deleteMessage:  {
    __typename: "DeleteResponse",
    message: string,
    success: boolean,
  },
};

export type DeletePropertyMutationVariables = {
  propertyId: string,
};

export type DeletePropertyMutation = {
  deleteProperty:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type DeleteTeamMeetingMutationVariables = {
  meetingId: string,
};

export type DeleteTeamMeetingMutation = {
  deleteTeamMeeting:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type DeleteUserMutationVariables = {
  userId: string,
};

export type DeleteUserMutation = {
  deleteUser:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type DummyMutationMutationVariables = {
};

export type DummyMutationMutation = {
  dummyMutation?: string | null,
};

export type ForgotPasswordMutationVariables = {
  email: string,
};

export type ForgotPasswordMutation = {
  forgotPassword:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type GenerateDataUploadUrlMutationVariables = {
  dataType: DataType,
  filename?: string | null,
};

export type GenerateDataUploadUrlMutation = {
  generateDataUploadUrl:  {
    __typename: "UploadUrlResponse",
    fileKey: string,
    uploadUrl: string,
  },
};

export type GetMediaUploadUrlMutationVariables = {
  contentType: string,
  fileName: string,
};

export type GetMediaUploadUrlMutation = {
  getMediaUploadUrl:  {
    __typename: "MediaUploadResponse",
    fileUrl: string,
    key: string,
    uploadUrl: string,
  },
};

export type ImportLocationsFromCSVMutationVariables = {
  csvData: string,
};

export type ImportLocationsFromCSVMutation = {
  importLocationsFromCSV:  {
    __typename: "LocationImportResponse",
    errors?: Array< string > | null,
    imported: number,
    message: string,
    skipped: number,
    success: boolean,
  },
};

export type ImportPropertiesFromCSVMutationVariables = {
  csvData: string,
};

export type ImportPropertiesFromCSVMutation = {
  importPropertiesFromCSV:  {
    __typename: "PropertyImportResult",
    errors: Array< string >,
    imported: number,
    message: string,
    skipped: number,
    success: boolean,
    updated: number,
  },
};

export type InitializeDirectChatMutationVariables = {
  targetUserId: string,
};

export type InitializeDirectChatMutation = {
  initializeDirectChat:  {
    __typename: "DirectChatInitializationResponse",
    conversationId: string,
    targetUserInfo:  {
      __typename: "ChatUser",
      businessName?: string | null,
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      userId: string,
      userType: UserType,
    },
  },
};

export type InitializePropertyChatMutationVariables = {
  propertyId: string,
};

export type InitializePropertyChatMutation = {
  initializePropertyChat:  {
    __typename: "ChatInitializationResponse",
    conversationId: string,
    landlordInfo:  {
      __typename: "ChatLandlordInfo",
      businessName?: string | null,
      firstName: string,
      lastName: string,
      profileImage?: string | null,
    },
    propertyId: string,
    propertyTitle: string,
  },
};

export type InitiatePaymentMutationVariables = {
  input: InitiatePaymentInput,
};

export type InitiatePaymentMutation = {
  initiatePayment:  {
    __typename: "InitiatePaymentResponse",
    amount: number,
    currency: string,
    message: string,
    reference: string,
    status: string,
  },
};

export type InitiateWhatsAppAssociationMutationVariables = {
  whatsappNumber: string,
};

export type InitiateWhatsAppAssociationMutation = {
  initiateWhatsAppAssociation:  {
    __typename: "AssociateWhatsAppResponse",
    message: string,
    success: boolean,
  },
};

export type MarkAsReadMutationVariables = {
  conversationId: string,
};

export type MarkAsReadMutation = {
  markAsRead:  {
    __typename: "Conversation",
    conversationType?: string | null,
    createdAt: string,
    id: string,
    lastMessage: string,
    lastMessageTime: string,
    otherPartyImage?: string | null,
    otherPartyName: string,
    propertyTitle: string,
    unreadCount: number,
    updatedAt: string,
  },
};

export type MarkLandlordContactedMutationVariables = {
  createdAt: string,
  landlordId: string,
  requestId: string,
};

export type MarkLandlordContactedMutation = {
  markLandlordContacted:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type MarkPropertyAsAvailableMutationVariables = {
  propertyId: string,
};

export type MarkPropertyAsAvailableMutation = {
  markPropertyAsAvailable:  {
    __typename: "Property",
    address:  {
      __typename: "Address",
      coordinates?:  {
        __typename: "Coordinates",
        latitude: number,
        longitude: number,
      } | null,
      district: string,
      postalCode?: string | null,
      region: string,
      street?: string | null,
      ward?: string | null,
    },
    agent?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    agentId?: string | null,
    amenities?: Array< string | null > | null,
    availability?:  {
      __typename: "PropertyAvailability",
      available: boolean,
      availableFrom?: string | null,
      maximumLeaseTerm?: number | null,
      minimumLeaseTerm?: number | null,
    } | null,
    createdAt?: string | null,
    description?: string | null,
    googleMapsUrl?: string | null,
    landlord?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    media?:  {
      __typename: "PropertyMedia",
      floorPlan?: string | null,
      images?: Array< string > | null,
      videos?: Array< string > | null,
      virtualTour?: string | null,
    } | null,
    pricing?:  {
      __typename: "PropertyPricing",
      currency: string,
      deposit?: number | null,
      monthlyRent: number,
      serviceCharge?: number | null,
      utilitiesIncluded?: boolean | null,
    } | null,
    propertyId: string,
    propertyType: PropertyType,
    specifications?:  {
      __typename: "PropertySpecifications",
      bathrooms?: number | null,
      bedrooms?: number | null,
      floors?: number | null,
      furnished?: boolean | null,
      parkingSpaces?: number | null,
      squareMeters?: number | null,
    } | null,
    status: PropertyStatus,
    title: string,
    updatedAt?: string | null,
    verified: boolean,
    version?: number | null,
  },
};

export type MarkPropertyAsRentedMutationVariables = {
  propertyId: string,
  tenantId: string,
};

export type MarkPropertyAsRentedMutation = {
  markPropertyAsRented:  {
    __typename: "Property",
    address:  {
      __typename: "Address",
      coordinates?:  {
        __typename: "Coordinates",
        latitude: number,
        longitude: number,
      } | null,
      district: string,
      postalCode?: string | null,
      region: string,
      street?: string | null,
      ward?: string | null,
    },
    agent?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    agentId?: string | null,
    amenities?: Array< string | null > | null,
    availability?:  {
      __typename: "PropertyAvailability",
      available: boolean,
      availableFrom?: string | null,
      maximumLeaseTerm?: number | null,
      minimumLeaseTerm?: number | null,
    } | null,
    createdAt?: string | null,
    description?: string | null,
    googleMapsUrl?: string | null,
    landlord?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    media?:  {
      __typename: "PropertyMedia",
      floorPlan?: string | null,
      images?: Array< string > | null,
      videos?: Array< string > | null,
      virtualTour?: string | null,
    } | null,
    pricing?:  {
      __typename: "PropertyPricing",
      currency: string,
      deposit?: number | null,
      monthlyRent: number,
      serviceCharge?: number | null,
      utilitiesIncluded?: boolean | null,
    } | null,
    propertyId: string,
    propertyType: PropertyType,
    specifications?:  {
      __typename: "PropertySpecifications",
      bathrooms?: number | null,
      bedrooms?: number | null,
      floors?: number | null,
      furnished?: boolean | null,
      parkingSpaces?: number | null,
      squareMeters?: number | null,
    } | null,
    status: PropertyStatus,
    title: string,
    updatedAt?: string | null,
    verified: boolean,
    version?: number | null,
  },
};

export type PublishNewPropertyEventMutationVariables = {
  propertyId: string,
  region: string,
};

export type PublishNewPropertyEventMutation = {
  publishNewPropertyEvent?:  {
    __typename: "SubscriptionPublishResponse",
    message?: string | null,
    propertyId?: string | null,
    success: boolean,
  } | null,
};

export type PublishPropertyMutationVariables = {
  propertyId: string,
};

export type PublishPropertyMutation = {
  publishProperty:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type PublishPropertyUpdateEventMutationVariables = {
  input: PropertyUpdateEventInput,
};

export type PublishPropertyUpdateEventMutation = {
  publishPropertyUpdateEvent?:  {
    __typename: "PropertyUpdateEvent",
    changes:  Array< {
      __typename: "PropertyChange",
      field: string,
      newValue: string,
      oldValue?: string | null,
    } >,
    eventType: PropertyEventType,
    property:  {
      __typename: "Property",
      address:  {
        __typename: "Address",
        coordinates?:  {
          __typename: "Coordinates",
          latitude: number,
          longitude: number,
        } | null,
        district: string,
        postalCode?: string | null,
        region: string,
        street?: string | null,
        ward?: string | null,
      },
      agent?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      agentId?: string | null,
      amenities?: Array< string | null > | null,
      availability?:  {
        __typename: "PropertyAvailability",
        available: boolean,
        availableFrom?: string | null,
        maximumLeaseTerm?: number | null,
        minimumLeaseTerm?: number | null,
      } | null,
      createdAt?: string | null,
      description?: string | null,
      googleMapsUrl?: string | null,
      landlord?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      media?:  {
        __typename: "PropertyMedia",
        floorPlan?: string | null,
        images?: Array< string > | null,
        videos?: Array< string > | null,
        virtualTour?: string | null,
      } | null,
      pricing?:  {
        __typename: "PropertyPricing",
        currency: string,
        deposit?: number | null,
        monthlyRent: number,
        serviceCharge?: number | null,
        utilitiesIncluded?: boolean | null,
      } | null,
      propertyId: string,
      propertyType: PropertyType,
      specifications?:  {
        __typename: "PropertySpecifications",
        bathrooms?: number | null,
        bedrooms?: number | null,
        floors?: number | null,
        furnished?: boolean | null,
        parkingSpaces?: number | null,
        squareMeters?: number | null,
      } | null,
      status: PropertyStatus,
      title: string,
      updatedAt?: string | null,
      verified: boolean,
      version?: number | null,
    },
    propertyId: string,
    timestamp: string,
  } | null,
};

export type PublishShortTermPropertyMutationVariables = {
  propertyId: string,
};

export type PublishShortTermPropertyMutation = {
  publishShortTermProperty:  {
    __typename: "ShortTermProperty",
    address?:  {
      __typename: "ShortTermAddress",
      city: string,
      country: string,
      district?: string | null,
      postalCode?: string | null,
      region: string,
      street: string,
    } | null,
    advanceBookingDays?: number | null,
    allowsChildren?: boolean | null,
    allowsInfants?: boolean | null,
    allowsPets?: boolean | null,
    allowsSmoking?: boolean | null,
    amenities?: Array< string > | null,
    averageRating?: number | null,
    bathrooms?: number | null,
    bedrooms?: number | null,
    cancellationPolicy?: CancellationPolicy | null,
    checkInInstructions?:  {
      __typename: "CheckInInstructions",
      accessCode?: string | null,
      additionalNotes?: string | null,
      contactName?: string | null,
      contactPhone?: string | null,
      directions?: string | null,
      houseRules?: Array< string > | null,
      parkingInfo?: string | null,
      wifiName?: string | null,
      wifiPassword?: string | null,
    } | null,
    checkInTime?: string | null,
    checkOutTime?: string | null,
    cleaningFee?: number | null,
    coordinates?:  {
      __typename: "Coordinates",
      latitude: number,
      longitude: number,
    } | null,
    createdAt: string,
    currency: string,
    description?: string | null,
    district: string,
    googleMapsUrl?: string | null,
    host?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    hostId: string,
    houseRules?: Array< string > | null,
    images?: Array< string > | null,
    instantBookEnabled?: boolean | null,
    maxAdults?: number | null,
    maxChildren?: number | null,
    maxGuests?: number | null,
    maxInfants?: number | null,
    maximumStay?: number | null,
    minimumStay?: number | null,
    nightlyRate: number,
    propertyId: string,
    propertyType: ShortTermPropertyType,
    publishedAt?: string | null,
    ratingSummary?:  {
      __typename: "PropertyRatingSummary",
      accuracy?: number | null,
      averageRating: number,
      cleanliness?: number | null,
      communication?: number | null,
      fiveStars?: number | null,
      fourStars?: number | null,
      location?: number | null,
      oneStar?: number | null,
      threeStars?: number | null,
      totalReviews: number,
      twoStars?: number | null,
      value?: number | null,
    } | null,
    region: string,
    serviceFeePercentage?: number | null,
    status: PropertyStatus,
    stayCategories?: Array< StayCategory > | null,
    taxPercentage?: number | null,
    thumbnail?: string | null,
    title: string,
    updatedAt: string,
    videos?: Array< string > | null,
  },
};

export type RefundBookingMutationVariables = {
  amountCents?: number | null,
  bookingId: string,
  reason?: string | null,
};

export type RefundBookingMutation = {
  refundBooking:  {
    __typename: "RefundResponse",
    amount: number,
    currency: string,
    refundId: string,
    success: boolean,
  },
};

export type RegenerateLocationJsonMutationVariables = {
};

export type RegenerateLocationJsonMutation = {
  regenerateLocationJson:  {
    __typename: "LocationJsonResponse",
    cloudfrontUrl: string,
    message: string,
    success: boolean,
  },
};

export type RegisterPushTokenMutationVariables = {
  token: string,
};

export type RegisterPushTokenMutation = {
  registerPushToken:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type RejectPropertyMutationVariables = {
  propertyId: string,
  reason: string,
};

export type RejectPropertyMutation = {
  rejectProperty:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type RemoveBusyBlockMutationVariables = {
  blockId: string,
  blockStartUtc: string,
};

export type RemoveBusyBlockMutation = {
  removeBusyBlock:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type RemovePropertyAgentMutationVariables = {
  propertyId: string,
};

export type RemovePropertyAgentMutation = {
  removePropertyAgent:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type ResendVerificationCodeMutationVariables = {
  email: string,
};

export type ResendVerificationCodeMutation = {
  resendVerificationCode:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type ResetPasswordMutationVariables = {
  confirmationCode: string,
  email: string,
  newPassword: string,
};

export type ResetPasswordMutation = {
  resetPassword:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type RespondToReviewMutationVariables = {
  input: RespondToReviewInput,
};

export type RespondToReviewMutation = {
  respondToReview:  {
    __typename: "Review",
    accuracy: number,
    bookingId: string,
    cleanliness: number,
    comment: string,
    communication: number,
    createdAt: string,
    guest?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    guestId: string,
    hostResponse?: string | null,
    hostResponseDate?: string | null,
    location: number,
    overallRating: number,
    photos?: Array< string > | null,
    propertyId: string,
    reviewId: string,
    updatedAt: string,
    value: number,
    verifiedStay: boolean,
  },
};

export type ReviewLandlordApplicationMutationVariables = {
  applicationId: string,
  notes?: string | null,
  status: LandlordApplicationStatus,
};

export type ReviewLandlordApplicationMutation = {
  reviewLandlordApplication:  {
    __typename: "LandlordApplication",
    address?: string | null,
    adminNotes?: string | null,
    alternatePhone?: string | null,
    applicant?:  {
      __typename: "TenantBasicInfo",
      firstName?: string | null,
      lastName?: string | null,
      profileImage?: string | null,
    } | null,
    applicationId: string,
    birthDate?: string | null,
    createdAt?: string | null,
    nationalId?: string | null,
    phoneNumber?: string | null,
    rejectionReason?: string | null,
    reviewedAt?: string | null,
    status?: LandlordApplicationStatus | null,
    submittedAt?: string | null,
    updatedAt?: string | null,
    userId: string,
  },
};

export type ScheduleMeetingMutationVariables = {
  attendeeIds: Array< string >,
  description?: string | null,
  endUtc: string,
  link?: string | null,
  startUtc: string,
  title: string,
};

export type ScheduleMeetingMutation = {
  scheduleMeeting:  {
    __typename: "TeamMeeting",
    attendeeIds: Array< string >,
    createdAt: string,
    createdBy: string,
    createdByName: string,
    description?: string | null,
    endUtc: string,
    id: string,
    link?: string | null,
    startUtc: string,
    title: string,
  },
};

export type SendCheckInInstructionsMutationVariables = {
  input: SendCheckInInstructionsInput,
};

export type SendCheckInInstructionsMutation = {
  sendCheckInInstructions:  {
    __typename: "SendCheckInInstructionsResponse",
    message: string,
    sentVia: Array< string >,
    success: boolean,
  },
};

export type SendMessageMutationVariables = {
  input: SendMessageInput,
};

export type SendMessageMutation = {
  sendMessage:  {
    __typename: "ChatMessage",
    content: string,
    conversationId: string,
    id: string,
    isMine: boolean,
    isRead: boolean,
    senderId?: string | null,
    senderName: string,
    timestamp: string,
  },
};

export type SendWhatsAppMessageMutationVariables = {
  message: string,
  phone: string,
};

export type SendWhatsAppMessageMutation = {
  sendWhatsAppMessage:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type SignInMutationVariables = {
  email: string,
  password: string,
};

export type SignInMutation = {
  signIn:  {
    __typename: "AuthResponse",
    accessToken: string,
    refreshToken: string,
  },
};

export type SignUpMutationVariables = {
  input: SignUpInput,
};

export type SignUpMutation = {
  signUp:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type SubmitApplicationMutationVariables = {
  input: SubmitApplicationInput,
};

export type SubmitApplicationMutation = {
  submitApplication:  {
    __typename: "Application",
    applicant?:  {
      __typename: "TenantBasicInfo",
      firstName?: string | null,
      lastName?: string | null,
      profileImage?: string | null,
    } | null,
    applicantDetails:  {
      __typename: "ApplicantDetails",
      emergencyContact:  {
        __typename: "EmergencyContact",
        email?: string | null,
        name: string,
        phoneNumber: string,
        relationship: string,
      },
      hasPets: boolean,
      leaseDuration: number,
      monthlyIncome: number,
      moveInDate: string,
      numberOfOccupants: number,
      occupation: string,
      petDetails?: string | null,
      smokingStatus: SmokingStatus,
    },
    applicationId: string,
    createdAt?: string | null,
    landlord?:  {
      __typename: "LandlordBasicInfo",
      businessName?: string | null,
      firstName?: string | null,
      lastName?: string | null,
      profileImage?: string | null,
    } | null,
    landlordNotes?: string | null,
    property?:  {
      __typename: "Property",
      address:  {
        __typename: "Address",
        coordinates?:  {
          __typename: "Coordinates",
          latitude: number,
          longitude: number,
        } | null,
        district: string,
        postalCode?: string | null,
        region: string,
        street?: string | null,
        ward?: string | null,
      },
      agent?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      agentId?: string | null,
      amenities?: Array< string | null > | null,
      availability?:  {
        __typename: "PropertyAvailability",
        available: boolean,
        availableFrom?: string | null,
        maximumLeaseTerm?: number | null,
        minimumLeaseTerm?: number | null,
      } | null,
      createdAt?: string | null,
      description?: string | null,
      googleMapsUrl?: string | null,
      landlord?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      media?:  {
        __typename: "PropertyMedia",
        floorPlan?: string | null,
        images?: Array< string > | null,
        videos?: Array< string > | null,
        virtualTour?: string | null,
      } | null,
      pricing?:  {
        __typename: "PropertyPricing",
        currency: string,
        deposit?: number | null,
        monthlyRent: number,
        serviceCharge?: number | null,
        utilitiesIncluded?: boolean | null,
      } | null,
      propertyId: string,
      propertyType: PropertyType,
      specifications?:  {
        __typename: "PropertySpecifications",
        bathrooms?: number | null,
        bedrooms?: number | null,
        floors?: number | null,
        furnished?: boolean | null,
        parkingSpaces?: number | null,
        squareMeters?: number | null,
      } | null,
      status: PropertyStatus,
      title: string,
      updatedAt?: string | null,
      verified: boolean,
      version?: number | null,
    } | null,
    propertyId: string,
    rejectionReason?: string | null,
    status: ApplicationStatus,
    submittedAt?: string | null,
    updatedAt?: string | null,
  },
};

export type SubmitContactInquiryMutationVariables = {
  input: SubmitContactInquiryInput,
};

export type SubmitContactInquiryMutation = {
  submitContactInquiry:  {
    __typename: "ContactInquiryResponse",
    createdAt: string,
    inquiryId: string,
    message: string,
  },
};

export type SubmitLandlordApplicationMutationVariables = {
  input: LandlordApplicationInput,
};

export type SubmitLandlordApplicationMutation = {
  submitLandlordApplication:  {
    __typename: "ApplicationResponse",
    applicationId?: string | null,
    message: string,
    status?: string | null,
    submittedAt?: string | null,
    success: boolean,
  },
};

export type SubmitLandlordRegistrationMutationVariables = {
  area?: string | null,
  name: string,
  notes?: string | null,
  phone: string,
};

export type SubmitLandlordRegistrationMutation = {
  submitLandlordRegistration:  {
    __typename: "LandlordRegistration",
    adminNotes?: Array< string > | null,
    area?: string | null,
    assignedTo?: string | null,
    createdAt: string,
    name: string,
    notes?: string | null,
    phone: string,
    registrationId: string,
    status: string,
    updatedAt?: string | null,
  },
};

export type SubmitReferralMutationVariables = {
  landlordArea: string,
  landlordName: string,
  landlordNotes?: string | null,
  landlordPhone: string,
  referrerName: string,
  referrerNida?: string | null,
  referrerPhone: string,
};

export type SubmitReferralMutation = {
  submitReferral:  {
    __typename: "ReferralSubmission",
    adminNotes?: Array< string > | null,
    assignedTo?: string | null,
    createdAt: string,
    landlordArea: string,
    landlordName: string,
    landlordNotes?: string | null,
    landlordPhone: string,
    listingRewardStatus: string,
    profitShareRewardStatus: string,
    referralId: string,
    referrerName: string,
    referrerNida?: string | null,
    referrerPhone: string,
    status: string,
    updatedAt?: string | null,
  },
};

export type ToggleFavoriteMutationVariables = {
  propertyId: string,
};

export type ToggleFavoriteMutation = {
  toggleFavorite:  {
    __typename: "FavoriteResponse",
    isFavorited: boolean,
    message?: string | null,
    success: boolean,
  },
};

export type UnblockDatesMutationVariables = {
  input: UnblockDatesInput,
};

export type UnblockDatesMutation = {
  unblockDates:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type UpdateApplicationMutationVariables = {
  applicationId: string,
  input: UpdateApplicationInput,
};

export type UpdateApplicationMutation = {
  updateApplication:  {
    __typename: "Application",
    applicant?:  {
      __typename: "TenantBasicInfo",
      firstName?: string | null,
      lastName?: string | null,
      profileImage?: string | null,
    } | null,
    applicantDetails:  {
      __typename: "ApplicantDetails",
      emergencyContact:  {
        __typename: "EmergencyContact",
        email?: string | null,
        name: string,
        phoneNumber: string,
        relationship: string,
      },
      hasPets: boolean,
      leaseDuration: number,
      monthlyIncome: number,
      moveInDate: string,
      numberOfOccupants: number,
      occupation: string,
      petDetails?: string | null,
      smokingStatus: SmokingStatus,
    },
    applicationId: string,
    createdAt?: string | null,
    landlord?:  {
      __typename: "LandlordBasicInfo",
      businessName?: string | null,
      firstName?: string | null,
      lastName?: string | null,
      profileImage?: string | null,
    } | null,
    landlordNotes?: string | null,
    property?:  {
      __typename: "Property",
      address:  {
        __typename: "Address",
        coordinates?:  {
          __typename: "Coordinates",
          latitude: number,
          longitude: number,
        } | null,
        district: string,
        postalCode?: string | null,
        region: string,
        street?: string | null,
        ward?: string | null,
      },
      agent?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      agentId?: string | null,
      amenities?: Array< string | null > | null,
      availability?:  {
        __typename: "PropertyAvailability",
        available: boolean,
        availableFrom?: string | null,
        maximumLeaseTerm?: number | null,
        minimumLeaseTerm?: number | null,
      } | null,
      createdAt?: string | null,
      description?: string | null,
      googleMapsUrl?: string | null,
      landlord?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      media?:  {
        __typename: "PropertyMedia",
        floorPlan?: string | null,
        images?: Array< string > | null,
        videos?: Array< string > | null,
        virtualTour?: string | null,
      } | null,
      pricing?:  {
        __typename: "PropertyPricing",
        currency: string,
        deposit?: number | null,
        monthlyRent: number,
        serviceCharge?: number | null,
        utilitiesIncluded?: boolean | null,
      } | null,
      propertyId: string,
      propertyType: PropertyType,
      specifications?:  {
        __typename: "PropertySpecifications",
        bathrooms?: number | null,
        bedrooms?: number | null,
        floors?: number | null,
        furnished?: boolean | null,
        parkingSpaces?: number | null,
        squareMeters?: number | null,
      } | null,
      status: PropertyStatus,
      title: string,
      updatedAt?: string | null,
      verified: boolean,
      version?: number | null,
    } | null,
    propertyId: string,
    rejectionReason?: string | null,
    status: ApplicationStatus,
    submittedAt?: string | null,
    updatedAt?: string | null,
  },
};

export type UpdateApplicationStatusMutationVariables = {
  applicationId: string,
  input: UpdateApplicationStatusInput,
};

export type UpdateApplicationStatusMutation = {
  updateApplicationStatus:  {
    __typename: "Application",
    applicant?:  {
      __typename: "TenantBasicInfo",
      firstName?: string | null,
      lastName?: string | null,
      profileImage?: string | null,
    } | null,
    applicantDetails:  {
      __typename: "ApplicantDetails",
      emergencyContact:  {
        __typename: "EmergencyContact",
        email?: string | null,
        name: string,
        phoneNumber: string,
        relationship: string,
      },
      hasPets: boolean,
      leaseDuration: number,
      monthlyIncome: number,
      moveInDate: string,
      numberOfOccupants: number,
      occupation: string,
      petDetails?: string | null,
      smokingStatus: SmokingStatus,
    },
    applicationId: string,
    createdAt?: string | null,
    landlord?:  {
      __typename: "LandlordBasicInfo",
      businessName?: string | null,
      firstName?: string | null,
      lastName?: string | null,
      profileImage?: string | null,
    } | null,
    landlordNotes?: string | null,
    property?:  {
      __typename: "Property",
      address:  {
        __typename: "Address",
        coordinates?:  {
          __typename: "Coordinates",
          latitude: number,
          longitude: number,
        } | null,
        district: string,
        postalCode?: string | null,
        region: string,
        street?: string | null,
        ward?: string | null,
      },
      agent?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      agentId?: string | null,
      amenities?: Array< string | null > | null,
      availability?:  {
        __typename: "PropertyAvailability",
        available: boolean,
        availableFrom?: string | null,
        maximumLeaseTerm?: number | null,
        minimumLeaseTerm?: number | null,
      } | null,
      createdAt?: string | null,
      description?: string | null,
      googleMapsUrl?: string | null,
      landlord?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      media?:  {
        __typename: "PropertyMedia",
        floorPlan?: string | null,
        images?: Array< string > | null,
        videos?: Array< string > | null,
        virtualTour?: string | null,
      } | null,
      pricing?:  {
        __typename: "PropertyPricing",
        currency: string,
        deposit?: number | null,
        monthlyRent: number,
        serviceCharge?: number | null,
        utilitiesIncluded?: boolean | null,
      } | null,
      propertyId: string,
      propertyType: PropertyType,
      specifications?:  {
        __typename: "PropertySpecifications",
        bathrooms?: number | null,
        bedrooms?: number | null,
        floors?: number | null,
        furnished?: boolean | null,
        parkingSpaces?: number | null,
        squareMeters?: number | null,
      } | null,
      status: PropertyStatus,
      title: string,
      updatedAt?: string | null,
      verified: boolean,
      version?: number | null,
    } | null,
    propertyId: string,
    rejectionReason?: string | null,
    status: ApplicationStatus,
    submittedAt?: string | null,
    updatedAt?: string | null,
  },
};

export type UpdateContactInquiryStatusMutationVariables = {
  adminNotes?: string | null,
  inquiryId: string,
  status: InquiryStatus,
};

export type UpdateContactInquiryStatusMutation = {
  updateContactInquiryStatus:  {
    __typename: "ContactInquiry",
    adminNotes?: string | null,
    createdAt: string,
    email: string,
    handledBy?: string | null,
    inquiryId: string,
    inquiryType: InquiryType,
    message: string,
    name: string,
    phone?: string | null,
    status: InquiryStatus,
    subject: string,
    updatedAt: string,
  },
};

export type UpdateHousingRequestStatusMutationVariables = {
  adminNotes?: string | null,
  createdAt: string,
  requestId: string,
  status: HousingRequestStatus,
};

export type UpdateHousingRequestStatusMutation = {
  updateHousingRequestStatus:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type UpdateLandlordRegistrationStatusMutationVariables = {
  adminNotes?: string | null,
  createdAt: string,
  registrationId: string,
  status: string,
};

export type UpdateLandlordRegistrationStatusMutation = {
  updateLandlordRegistrationStatus:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type UpdateLocationMutationVariables = {
  locationId: string,
  name: string,
};

export type UpdateLocationMutation = {
  updateLocation:  {
    __typename: "LocationUpdateResponse",
    location?:  {
      __typename: "Region",
      id: string,
      name: string,
    } | null,
    message?: string | null,
    success: boolean,
  },
};

export type UpdatePropertyMutationVariables = {
  input: UpdatePropertyInput,
  propertyId: string,
};

export type UpdatePropertyMutation = {
  updateProperty:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type UpdatePropertyStatusMutationVariables = {
  propertyId: string,
  status: PropertyStatus,
};

export type UpdatePropertyStatusMutation = {
  updatePropertyStatus:  {
    __typename: "Property",
    address:  {
      __typename: "Address",
      coordinates?:  {
        __typename: "Coordinates",
        latitude: number,
        longitude: number,
      } | null,
      district: string,
      postalCode?: string | null,
      region: string,
      street?: string | null,
      ward?: string | null,
    },
    agent?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    agentId?: string | null,
    amenities?: Array< string | null > | null,
    availability?:  {
      __typename: "PropertyAvailability",
      available: boolean,
      availableFrom?: string | null,
      maximumLeaseTerm?: number | null,
      minimumLeaseTerm?: number | null,
    } | null,
    createdAt?: string | null,
    description?: string | null,
    googleMapsUrl?: string | null,
    landlord?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    media?:  {
      __typename: "PropertyMedia",
      floorPlan?: string | null,
      images?: Array< string > | null,
      videos?: Array< string > | null,
      virtualTour?: string | null,
    } | null,
    pricing?:  {
      __typename: "PropertyPricing",
      currency: string,
      deposit?: number | null,
      monthlyRent: number,
      serviceCharge?: number | null,
      utilitiesIncluded?: boolean | null,
    } | null,
    propertyId: string,
    propertyType: PropertyType,
    specifications?:  {
      __typename: "PropertySpecifications",
      bathrooms?: number | null,
      bedrooms?: number | null,
      floors?: number | null,
      furnished?: boolean | null,
      parkingSpaces?: number | null,
      squareMeters?: number | null,
    } | null,
    status: PropertyStatus,
    title: string,
    updatedAt?: string | null,
    verified: boolean,
    version?: number | null,
  },
};

export type UpdateReferralStatusMutationVariables = {
  adminNotes?: string | null,
  createdAt: string,
  referralId: string,
  status: string,
};

export type UpdateReferralStatusMutation = {
  updateReferralStatus:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type UpdateShortTermPropertyMutationVariables = {
  input: UpdateShortTermPropertyInput,
  propertyId: string,
};

export type UpdateShortTermPropertyMutation = {
  updateShortTermProperty:  {
    __typename: "ShortTermProperty",
    address?:  {
      __typename: "ShortTermAddress",
      city: string,
      country: string,
      district?: string | null,
      postalCode?: string | null,
      region: string,
      street: string,
    } | null,
    advanceBookingDays?: number | null,
    allowsChildren?: boolean | null,
    allowsInfants?: boolean | null,
    allowsPets?: boolean | null,
    allowsSmoking?: boolean | null,
    amenities?: Array< string > | null,
    averageRating?: number | null,
    bathrooms?: number | null,
    bedrooms?: number | null,
    cancellationPolicy?: CancellationPolicy | null,
    checkInInstructions?:  {
      __typename: "CheckInInstructions",
      accessCode?: string | null,
      additionalNotes?: string | null,
      contactName?: string | null,
      contactPhone?: string | null,
      directions?: string | null,
      houseRules?: Array< string > | null,
      parkingInfo?: string | null,
      wifiName?: string | null,
      wifiPassword?: string | null,
    } | null,
    checkInTime?: string | null,
    checkOutTime?: string | null,
    cleaningFee?: number | null,
    coordinates?:  {
      __typename: "Coordinates",
      latitude: number,
      longitude: number,
    } | null,
    createdAt: string,
    currency: string,
    description?: string | null,
    district: string,
    googleMapsUrl?: string | null,
    host?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    hostId: string,
    houseRules?: Array< string > | null,
    images?: Array< string > | null,
    instantBookEnabled?: boolean | null,
    maxAdults?: number | null,
    maxChildren?: number | null,
    maxGuests?: number | null,
    maxInfants?: number | null,
    maximumStay?: number | null,
    minimumStay?: number | null,
    nightlyRate: number,
    propertyId: string,
    propertyType: ShortTermPropertyType,
    publishedAt?: string | null,
    ratingSummary?:  {
      __typename: "PropertyRatingSummary",
      accuracy?: number | null,
      averageRating: number,
      cleanliness?: number | null,
      communication?: number | null,
      fiveStars?: number | null,
      fourStars?: number | null,
      location?: number | null,
      oneStar?: number | null,
      threeStars?: number | null,
      totalReviews: number,
      twoStars?: number | null,
      value?: number | null,
    } | null,
    region: string,
    serviceFeePercentage?: number | null,
    status: PropertyStatus,
    stayCategories?: Array< StayCategory > | null,
    taxPercentage?: number | null,
    thumbnail?: string | null,
    title: string,
    updatedAt: string,
    videos?: Array< string > | null,
  },
};

export type UpdateUserMutationVariables = {
  input: UpdateUserInput,
};

export type UpdateUserMutation = {
  updateUser:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type UpdateUserRoleMutationVariables = {
  userId: string,
  userType: UserType,
};

export type UpdateUserRoleMutation = {
  updateUserRole:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type UpdateUserStatusMutationVariables = {
  reason?: string | null,
  status: AccountStatus,
  userId: string,
};

export type UpdateUserStatusMutation = {
  updateUserStatus:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type VerifyEmailMutationVariables = {
  code: string,
  email: string,
};

export type VerifyEmailMutation = {
  verifyEmail:  {
    __typename: "SuccessResponse",
    message: string,
    success: boolean,
  },
};

export type _emptyQueryVariables = {
};

export type _emptyQuery = {
  _empty?: string | null,
};

export type CalculateBookingPriceQueryVariables = {
  checkInDate: string,
  checkOutDate: string,
  numberOfGuests: number,
  propertyId: string,
};

export type CalculateBookingPriceQuery = {
  calculateBookingPrice:  {
    __typename: "BookingPricing",
    cleaningFee: number,
    currency: string,
    nightlyRate: number,
    numberOfNights: number,
    refundAmount?: number | null,
    refundPercentage?: number | null,
    serviceFee: number,
    subtotal: number,
    taxes: number,
    total: number,
  },
};

export type CheckAvailabilityQueryVariables = {
  checkInDate: string,
  checkOutDate: string,
  propertyId: string,
};

export type CheckAvailabilityQuery = {
  checkAvailability:  {
    __typename: "PropertyAvailabilityRange",
    available: boolean,
    endDate: string,
    propertyId: string,
    startDate: string,
    unavailableDates: Array< string >,
  },
};

export type CheckListingEntitlementQueryVariables = {
};

export type CheckListingEntitlementQuery = {
  checkListingEntitlement:  {
    __typename: "ListingEntitlement",
    activePlan?: string | null,
    canList: boolean,
    freeListingsRemaining: number,
    message: string,
  },
};

export type CheckPhoneEntitlementQueryVariables = {
  phoneNumber: string,
};

export type CheckPhoneEntitlementQuery = {
  checkPhoneEntitlement:  {
    __typename: "ListingEntitlement",
    activePlan?: string | null,
    canList: boolean,
    freeListingsRemaining: number,
    message: string,
  },
};

export type DummyQueryQueryVariables = {
};

export type DummyQueryQuery = {
  dummyQuery?: string | null,
};

export type GetAdminApplicationStatsQueryVariables = {
};

export type GetAdminApplicationStatsQuery = {
  getAdminApplicationStats:  {
    __typename: "ApplicationStats",
    approved: number,
    rejected: number,
    submitted: number,
    total: number,
    underReview: number,
    withdrawn: number,
  },
};

export type GetAdminPropertyStatsQueryVariables = {
};

export type GetAdminPropertyStatsQuery = {
  getAdminPropertyStats:  {
    __typename: "PropertyStats",
    availableProperties: number,
    deletedProperties: number,
    draftProperties: number,
    maintenanceProperties: number,
    newPropertiesThisMonth: number,
    newPropertiesThisWeek: number,
    rentedProperties: number,
    totalProperties: number,
  },
};

export type GetApplicationQueryVariables = {
  applicationId: string,
};

export type GetApplicationQuery = {
  getApplication?:  {
    __typename: "Application",
    applicant?:  {
      __typename: "TenantBasicInfo",
      firstName?: string | null,
      lastName?: string | null,
      profileImage?: string | null,
    } | null,
    applicantDetails:  {
      __typename: "ApplicantDetails",
      emergencyContact:  {
        __typename: "EmergencyContact",
        email?: string | null,
        name: string,
        phoneNumber: string,
        relationship: string,
      },
      hasPets: boolean,
      leaseDuration: number,
      monthlyIncome: number,
      moveInDate: string,
      numberOfOccupants: number,
      occupation: string,
      petDetails?: string | null,
      smokingStatus: SmokingStatus,
    },
    applicationId: string,
    createdAt?: string | null,
    landlord?:  {
      __typename: "LandlordBasicInfo",
      businessName?: string | null,
      firstName?: string | null,
      lastName?: string | null,
      profileImage?: string | null,
    } | null,
    landlordNotes?: string | null,
    property?:  {
      __typename: "Property",
      address:  {
        __typename: "Address",
        coordinates?:  {
          __typename: "Coordinates",
          latitude: number,
          longitude: number,
        } | null,
        district: string,
        postalCode?: string | null,
        region: string,
        street?: string | null,
        ward?: string | null,
      },
      agent?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      agentId?: string | null,
      amenities?: Array< string | null > | null,
      availability?:  {
        __typename: "PropertyAvailability",
        available: boolean,
        availableFrom?: string | null,
        maximumLeaseTerm?: number | null,
        minimumLeaseTerm?: number | null,
      } | null,
      createdAt?: string | null,
      description?: string | null,
      googleMapsUrl?: string | null,
      landlord?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      media?:  {
        __typename: "PropertyMedia",
        floorPlan?: string | null,
        images?: Array< string > | null,
        videos?: Array< string > | null,
        virtualTour?: string | null,
      } | null,
      pricing?:  {
        __typename: "PropertyPricing",
        currency: string,
        deposit?: number | null,
        monthlyRent: number,
        serviceCharge?: number | null,
        utilitiesIncluded?: boolean | null,
      } | null,
      propertyId: string,
      propertyType: PropertyType,
      specifications?:  {
        __typename: "PropertySpecifications",
        bathrooms?: number | null,
        bedrooms?: number | null,
        floors?: number | null,
        furnished?: boolean | null,
        parkingSpaces?: number | null,
        squareMeters?: number | null,
      } | null,
      status: PropertyStatus,
      title: string,
      updatedAt?: string | null,
      verified: boolean,
      version?: number | null,
    } | null,
    propertyId: string,
    rejectionReason?: string | null,
    status: ApplicationStatus,
    submittedAt?: string | null,
    updatedAt?: string | null,
  } | null,
};

export type GetApplicationDocumentUploadUrlQueryVariables = {
  applicationId: string,
  fileName: string,
  fileType: string,
};

export type GetApplicationDocumentUploadUrlQuery = {
  getApplicationDocumentUploadUrl:  {
    __typename: "MediaUploadResponse",
    fileUrl: string,
    key: string,
    uploadUrl: string,
  },
};

export type GetApplicationStatsQueryVariables = {
  landlordId: string,
};

export type GetApplicationStatsQuery = {
  getApplicationStats:  {
    __typename: "ApplicationStats",
    approved: number,
    rejected: number,
    submitted: number,
    total: number,
    underReview: number,
    withdrawn: number,
  },
};

export type GetBlockedDatesQueryVariables = {
  endDate?: string | null,
  propertyId: string,
  startDate?: string | null,
};

export type GetBlockedDatesQuery = {
  getBlockedDates:  {
    __typename: "BlockedDatesResponse",
    blockedRanges:  Array< {
      __typename: "BlockedDateRange",
      endDate: string,
      reason?: string | null,
      startDate: string,
    } >,
    propertyId: string,
  },
};

export type GetBookingQueryVariables = {
  bookingId: string,
};

export type GetBookingQuery = {
  getBooking?:  {
    __typename: "Booking",
    bookingId: string,
    bookingType: BookingType,
    cancellationReason?: string | null,
    cancelledAt?: string | null,
    checkInDate: string,
    checkOutDate: string,
    completedAt?: string | null,
    confirmedAt?: string | null,
    createdAt: string,
    guest?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    guestEmail?: string | null,
    guestId: string,
    guestName?: string | null,
    guestPhone?: string | null,
    hostNotes?: string | null,
    numberOfAdults: number,
    numberOfChildren: number,
    numberOfGuests: number,
    numberOfInfants: number,
    numberOfNights: number,
    paymentIntentId?: string | null,
    paymentStatus: PaymentStatus,
    pricing:  {
      __typename: "BookingPricing",
      cleaningFee: number,
      currency: string,
      nightlyRate: number,
      numberOfNights: number,
      refundAmount?: number | null,
      refundPercentage?: number | null,
      serviceFee: number,
      subtotal: number,
      taxes: number,
      total: number,
    },
    property?:  {
      __typename: "ShortTermProperty",
      address?:  {
        __typename: "ShortTermAddress",
        city: string,
        country: string,
        district?: string | null,
        postalCode?: string | null,
        region: string,
        street: string,
      } | null,
      advanceBookingDays?: number | null,
      allowsChildren?: boolean | null,
      allowsInfants?: boolean | null,
      allowsPets?: boolean | null,
      allowsSmoking?: boolean | null,
      amenities?: Array< string > | null,
      averageRating?: number | null,
      bathrooms?: number | null,
      bedrooms?: number | null,
      cancellationPolicy?: CancellationPolicy | null,
      checkInInstructions?:  {
        __typename: "CheckInInstructions",
        accessCode?: string | null,
        additionalNotes?: string | null,
        contactName?: string | null,
        contactPhone?: string | null,
        directions?: string | null,
        houseRules?: Array< string > | null,
        parkingInfo?: string | null,
        wifiName?: string | null,
        wifiPassword?: string | null,
      } | null,
      checkInTime?: string | null,
      checkOutTime?: string | null,
      cleaningFee?: number | null,
      coordinates?:  {
        __typename: "Coordinates",
        latitude: number,
        longitude: number,
      } | null,
      createdAt: string,
      currency: string,
      description?: string | null,
      district: string,
      googleMapsUrl?: string | null,
      host?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      hostId: string,
      houseRules?: Array< string > | null,
      images?: Array< string > | null,
      instantBookEnabled?: boolean | null,
      maxAdults?: number | null,
      maxChildren?: number | null,
      maxGuests?: number | null,
      maxInfants?: number | null,
      maximumStay?: number | null,
      minimumStay?: number | null,
      nightlyRate: number,
      propertyId: string,
      propertyType: ShortTermPropertyType,
      publishedAt?: string | null,
      ratingSummary?:  {
        __typename: "PropertyRatingSummary",
        accuracy?: number | null,
        averageRating: number,
        cleanliness?: number | null,
        communication?: number | null,
        fiveStars?: number | null,
        fourStars?: number | null,
        location?: number | null,
        oneStar?: number | null,
        threeStars?: number | null,
        totalReviews: number,
        twoStars?: number | null,
        value?: number | null,
      } | null,
      region: string,
      serviceFeePercentage?: number | null,
      status: PropertyStatus,
      stayCategories?: Array< StayCategory > | null,
      taxPercentage?: number | null,
      thumbnail?: string | null,
      title: string,
      updatedAt: string,
      videos?: Array< string > | null,
    } | null,
    propertyId: string,
    propertySnapshot?:  {
      __typename: "PropertySnapshot",
      address?:  {
        __typename: "PropertySnapshotAddress",
        city?: string | null,
        district?: string | null,
        region?: string | null,
        street?: string | null,
      } | null,
      currency: string,
      images?: Array< string > | null,
      nightlyRate: number,
      propertyType: string,
      thumbnail?: string | null,
      title: string,
    } | null,
    specialRequests?: string | null,
    status: BookingStatus,
    updatedAt: string,
  } | null,
};

export type GetBookingPaymentsQueryVariables = {
  bookingId: string,
};

export type GetBookingPaymentsQuery = {
  getBookingPayments:  Array< {
    __typename: "Payment",
    amount: number,
    bookingId: string,
    completedAt?: string | null,
    conversationID?: string | null,
    createdAt: string,
    currency: string,
    customerEmail?: string | null,
    customerPhone?: string | null,
    errorMessage?: string | null,
    paymentId: string,
    provider: PaymentProvider,
    refundAmount?: number | null,
    refundReason?: string | null,
    refundedAt?: string | null,
    status: PaymentStatus,
    thirdPartyConversationID: string,
    transactionID?: string | null,
    updatedAt: string,
  } >,
};

export type GetCategorizedPropertiesQueryVariables = {
  limitPerCategory?: number | null,
};

export type GetCategorizedPropertiesQuery = {
  getCategorizedProperties:  {
    __typename: "CategorizedPropertiesResponse",
    favorites?:  {
      __typename: "CategoryPropertyResponse",
      category: PropertyCategory,
      count: number,
      nextToken?: string | null,
      properties:  Array< {
        __typename: "PropertyCard",
        bedrooms?: number | null,
        currency: string,
        district: string,
        monthlyRent: number,
        propertyId: string,
        propertyType: PropertyType,
        region: string,
        thumbnail?: string | null,
        title: string,
        verified: boolean,
      } >,
    } | null,
    lowestPrice:  {
      __typename: "CategoryPropertyResponse",
      category: PropertyCategory,
      count: number,
      nextToken?: string | null,
      properties:  Array< {
        __typename: "PropertyCard",
        bedrooms?: number | null,
        currency: string,
        district: string,
        monthlyRent: number,
        propertyId: string,
        propertyType: PropertyType,
        region: string,
        thumbnail?: string | null,
        title: string,
        verified: boolean,
      } >,
    },
    more?:  {
      __typename: "CategoryPropertyResponse",
      category: PropertyCategory,
      count: number,
      nextToken?: string | null,
      properties:  Array< {
        __typename: "PropertyCard",
        bedrooms?: number | null,
        currency: string,
        district: string,
        monthlyRent: number,
        propertyId: string,
        propertyType: PropertyType,
        region: string,
        thumbnail?: string | null,
        title: string,
        verified: boolean,
      } >,
    } | null,
    mostViewed?:  {
      __typename: "CategoryPropertyResponse",
      category: PropertyCategory,
      count: number,
      nextToken?: string | null,
      properties:  Array< {
        __typename: "PropertyCard",
        bedrooms?: number | null,
        currency: string,
        district: string,
        monthlyRent: number,
        propertyId: string,
        propertyType: PropertyType,
        region: string,
        thumbnail?: string | null,
        title: string,
        verified: boolean,
      } >,
    } | null,
    nearby:  {
      __typename: "CategoryPropertyResponse",
      category: PropertyCategory,
      count: number,
      nextToken?: string | null,
      properties:  Array< {
        __typename: "PropertyCard",
        bedrooms?: number | null,
        currency: string,
        district: string,
        monthlyRent: number,
        propertyId: string,
        propertyType: PropertyType,
        region: string,
        thumbnail?: string | null,
        title: string,
        verified: boolean,
      } >,
    },
    recentlyViewed?:  {
      __typename: "CategoryPropertyResponse",
      category: PropertyCategory,
      count: number,
      nextToken?: string | null,
      properties:  Array< {
        __typename: "PropertyCard",
        bedrooms?: number | null,
        currency: string,
        district: string,
        monthlyRent: number,
        propertyId: string,
        propertyType: PropertyType,
        region: string,
        thumbnail?: string | null,
        title: string,
        verified: boolean,
      } >,
    } | null,
  },
};

export type GetContactInquiryQueryVariables = {
  inquiryId: string,
};

export type GetContactInquiryQuery = {
  getContactInquiry?:  {
    __typename: "ContactInquiry",
    adminNotes?: string | null,
    createdAt: string,
    email: string,
    handledBy?: string | null,
    inquiryId: string,
    inquiryType: InquiryType,
    message: string,
    name: string,
    phone?: string | null,
    status: InquiryStatus,
    subject: string,
    updatedAt: string,
  } | null,
};

export type GetContactInquiryStatsQueryVariables = {
};

export type GetContactInquiryStatsQuery = {
  getContactInquiryStats:  {
    __typename: "ContactInquiryStats",
    byType:  Array< {
      __typename: "InquiryTypeCount",
      count: number,
      type: InquiryType,
    } >,
    inProgress: number,
    pending: number,
    resolved: number,
    total: number,
  },
};

export type GetConversationMessagesQueryVariables = {
  conversationId: string,
};

export type GetConversationMessagesQuery = {
  getConversationMessages:  Array< {
    __typename: "ChatMessage",
    content: string,
    conversationId: string,
    id: string,
    isMine: boolean,
    isRead: boolean,
    senderId?: string | null,
    senderName: string,
    timestamp: string,
  } >,
};

export type GetDistrictsQueryVariables = {
  regionId: string,
};

export type GetDistrictsQuery = {
  getDistricts:  Array< {
    __typename: "District",
    id: string,
    name: string,
    regionId: string,
  } >,
};

export type GetHousingRequestQueryVariables = {
  createdAt: string,
  requestId: string,
};

export type GetHousingRequestQuery = {
  getHousingRequest?:  {
    __typename: "HousingRequest",
    adminNotes?: string | null,
    assignedAdmin?: string | null,
    bedrooms?: number | null,
    contactName?: string | null,
    createdAt: string,
    currency: string,
    description: string,
    district?: string | null,
    fulfilledPropertyId?: string | null,
    matchedLandlords?: Array< string > | null,
    maxBudget?: number | null,
    minBudget?: number | null,
    moveInDate?: string | null,
    phone: string,
    propertyType?: string | null,
    region?: string | null,
    requestId: string,
    source: HousingRequestSource,
    status: HousingRequestStatus,
    street?: string | null,
    updatedAt: string,
    userId?: string | null,
    ward?: string | null,
  } | null,
};

export type GetInitialAppStateQueryVariables = {
  limitPerCategory?: number | null,
};

export type GetInitialAppStateQuery = {
  getInitialAppState:  {
    __typename: "InitialAppState",
    categorizedProperties:  {
      __typename: "CategorizedPropertiesResponse",
      favorites?:  {
        __typename: "CategoryPropertyResponse",
        category: PropertyCategory,
        count: number,
        nextToken?: string | null,
        properties:  Array< {
          __typename: "PropertyCard",
          bedrooms?: number | null,
          currency: string,
          district: string,
          monthlyRent: number,
          propertyId: string,
          propertyType: PropertyType,
          region: string,
          thumbnail?: string | null,
          title: string,
          verified: boolean,
        } >,
      } | null,
      lowestPrice:  {
        __typename: "CategoryPropertyResponse",
        category: PropertyCategory,
        count: number,
        nextToken?: string | null,
        properties:  Array< {
          __typename: "PropertyCard",
          bedrooms?: number | null,
          currency: string,
          district: string,
          monthlyRent: number,
          propertyId: string,
          propertyType: PropertyType,
          region: string,
          thumbnail?: string | null,
          title: string,
          verified: boolean,
        } >,
      },
      more?:  {
        __typename: "CategoryPropertyResponse",
        category: PropertyCategory,
        count: number,
        nextToken?: string | null,
        properties:  Array< {
          __typename: "PropertyCard",
          bedrooms?: number | null,
          currency: string,
          district: string,
          monthlyRent: number,
          propertyId: string,
          propertyType: PropertyType,
          region: string,
          thumbnail?: string | null,
          title: string,
          verified: boolean,
        } >,
      } | null,
      mostViewed?:  {
        __typename: "CategoryPropertyResponse",
        category: PropertyCategory,
        count: number,
        nextToken?: string | null,
        properties:  Array< {
          __typename: "PropertyCard",
          bedrooms?: number | null,
          currency: string,
          district: string,
          monthlyRent: number,
          propertyId: string,
          propertyType: PropertyType,
          region: string,
          thumbnail?: string | null,
          title: string,
          verified: boolean,
        } >,
      } | null,
      nearby:  {
        __typename: "CategoryPropertyResponse",
        category: PropertyCategory,
        count: number,
        nextToken?: string | null,
        properties:  Array< {
          __typename: "PropertyCard",
          bedrooms?: number | null,
          currency: string,
          district: string,
          monthlyRent: number,
          propertyId: string,
          propertyType: PropertyType,
          region: string,
          thumbnail?: string | null,
          title: string,
          verified: boolean,
        } >,
      },
      recentlyViewed?:  {
        __typename: "CategoryPropertyResponse",
        category: PropertyCategory,
        count: number,
        nextToken?: string | null,
        properties:  Array< {
          __typename: "PropertyCard",
          bedrooms?: number | null,
          currency: string,
          district: string,
          monthlyRent: number,
          propertyId: string,
          propertyType: PropertyType,
          region: string,
          thumbnail?: string | null,
          title: string,
          verified: boolean,
        } >,
      } | null,
    },
  },
};

export type GetInitialAppStateFastQueryVariables = {
  limitPerCategory?: number | null,
};

export type GetInitialAppStateFastQuery = {
  getInitialAppStateFast:  {
    __typename: "InitialAppState",
    categorizedProperties:  {
      __typename: "CategorizedPropertiesResponse",
      favorites?:  {
        __typename: "CategoryPropertyResponse",
        category: PropertyCategory,
        count: number,
        nextToken?: string | null,
        properties:  Array< {
          __typename: "PropertyCard",
          bedrooms?: number | null,
          currency: string,
          district: string,
          monthlyRent: number,
          propertyId: string,
          propertyType: PropertyType,
          region: string,
          thumbnail?: string | null,
          title: string,
          verified: boolean,
        } >,
      } | null,
      lowestPrice:  {
        __typename: "CategoryPropertyResponse",
        category: PropertyCategory,
        count: number,
        nextToken?: string | null,
        properties:  Array< {
          __typename: "PropertyCard",
          bedrooms?: number | null,
          currency: string,
          district: string,
          monthlyRent: number,
          propertyId: string,
          propertyType: PropertyType,
          region: string,
          thumbnail?: string | null,
          title: string,
          verified: boolean,
        } >,
      },
      more?:  {
        __typename: "CategoryPropertyResponse",
        category: PropertyCategory,
        count: number,
        nextToken?: string | null,
        properties:  Array< {
          __typename: "PropertyCard",
          bedrooms?: number | null,
          currency: string,
          district: string,
          monthlyRent: number,
          propertyId: string,
          propertyType: PropertyType,
          region: string,
          thumbnail?: string | null,
          title: string,
          verified: boolean,
        } >,
      } | null,
      mostViewed?:  {
        __typename: "CategoryPropertyResponse",
        category: PropertyCategory,
        count: number,
        nextToken?: string | null,
        properties:  Array< {
          __typename: "PropertyCard",
          bedrooms?: number | null,
          currency: string,
          district: string,
          monthlyRent: number,
          propertyId: string,
          propertyType: PropertyType,
          region: string,
          thumbnail?: string | null,
          title: string,
          verified: boolean,
        } >,
      } | null,
      nearby:  {
        __typename: "CategoryPropertyResponse",
        category: PropertyCategory,
        count: number,
        nextToken?: string | null,
        properties:  Array< {
          __typename: "PropertyCard",
          bedrooms?: number | null,
          currency: string,
          district: string,
          monthlyRent: number,
          propertyId: string,
          propertyType: PropertyType,
          region: string,
          thumbnail?: string | null,
          title: string,
          verified: boolean,
        } >,
      },
      recentlyViewed?:  {
        __typename: "CategoryPropertyResponse",
        category: PropertyCategory,
        count: number,
        nextToken?: string | null,
        properties:  Array< {
          __typename: "PropertyCard",
          bedrooms?: number | null,
          currency: string,
          district: string,
          monthlyRent: number,
          propertyId: string,
          propertyType: PropertyType,
          region: string,
          thumbnail?: string | null,
          title: string,
          verified: boolean,
        } >,
      } | null,
    },
  },
};

export type GetLandlordApplicationQueryVariables = {
  applicationId: string,
};

export type GetLandlordApplicationQuery = {
  getLandlordApplication?:  {
    __typename: "LandlordApplication",
    address?: string | null,
    adminNotes?: string | null,
    alternatePhone?: string | null,
    applicant?:  {
      __typename: "TenantBasicInfo",
      firstName?: string | null,
      lastName?: string | null,
      profileImage?: string | null,
    } | null,
    applicationId: string,
    birthDate?: string | null,
    createdAt?: string | null,
    nationalId?: string | null,
    phoneNumber?: string | null,
    rejectionReason?: string | null,
    reviewedAt?: string | null,
    status?: LandlordApplicationStatus | null,
    submittedAt?: string | null,
    updatedAt?: string | null,
    userId: string,
  } | null,
};

export type GetLandlordApplicationStatsQueryVariables = {
};

export type GetLandlordApplicationStatsQuery = {
  getLandlordApplicationStats:  {
    __typename: "LandlordApplicationStats",
    approved: number,
    pending: number,
    rejected: number,
    total: number,
    underReview: number,
  },
};

export type GetLandlordPropertiesInfoQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
  phone: string,
};

export type GetLandlordPropertiesInfoQuery = {
  getLandlordPropertiesInfo:  {
    __typename: "LandlordPropertiesInfo",
    count: number,
    landlord:  {
      __typename: "LandlordPublicInfo",
      businessName?: string | null,
      createdAt?: string | null,
      district?: string | null,
      email?: string | null,
      firstName?: string | null,
      lastName?: string | null,
      phoneNumber?: string | null,
      profileImage?: string | null,
      region?: string | null,
      whatsappNumber?: string | null,
    },
    nextToken?: string | null,
    properties:  Array< {
      __typename: "Property",
      address:  {
        __typename: "Address",
        coordinates?:  {
          __typename: "Coordinates",
          latitude: number,
          longitude: number,
        } | null,
        district: string,
        postalCode?: string | null,
        region: string,
        street?: string | null,
        ward?: string | null,
      },
      agent?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      agentId?: string | null,
      amenities?: Array< string | null > | null,
      availability?:  {
        __typename: "PropertyAvailability",
        available: boolean,
        availableFrom?: string | null,
        maximumLeaseTerm?: number | null,
        minimumLeaseTerm?: number | null,
      } | null,
      createdAt?: string | null,
      description?: string | null,
      googleMapsUrl?: string | null,
      landlord?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      media?:  {
        __typename: "PropertyMedia",
        floorPlan?: string | null,
        images?: Array< string > | null,
        videos?: Array< string > | null,
        virtualTour?: string | null,
      } | null,
      pricing?:  {
        __typename: "PropertyPricing",
        currency: string,
        deposit?: number | null,
        monthlyRent: number,
        serviceCharge?: number | null,
        utilitiesIncluded?: boolean | null,
      } | null,
      propertyId: string,
      propertyType: PropertyType,
      specifications?:  {
        __typename: "PropertySpecifications",
        bathrooms?: number | null,
        bedrooms?: number | null,
        floors?: number | null,
        furnished?: boolean | null,
        parkingSpaces?: number | null,
        squareMeters?: number | null,
      } | null,
      status: PropertyStatus,
      title: string,
      updatedAt?: string | null,
      verified: boolean,
      version?: number | null,
    } >,
  },
};

export type GetLandlordRegistrationQueryVariables = {
  createdAt: string,
  registrationId: string,
};

export type GetLandlordRegistrationQuery = {
  getLandlordRegistration?:  {
    __typename: "LandlordRegistration",
    adminNotes?: Array< string > | null,
    area?: string | null,
    assignedTo?: string | null,
    createdAt: string,
    name: string,
    notes?: string | null,
    phone: string,
    registrationId: string,
    status: string,
    updatedAt?: string | null,
  } | null,
};

export type GetMeQueryVariables = {
};

export type GetMeQuery = {
  getMe: ( {
      __typename: "Admin",
      accountStatus?: AccountStatus | null,
      address?: string | null,
      city?: string | null,
      createdAt?: string | null,
      currency?: string | null,
      dateOfBirth?: string | null,
      district?: string | null,
      email?: string | null,
      emailNotifications?: boolean | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      firstName?: string | null,
      gender?: string | null,
      hasProperties?: boolean | null,
      isEmailVerified?: boolean | null,
      language?: string | null,
      lastName?: string | null,
      nationalIdLast4?: string | null,
      occupation?: string | null,
      payoutBankAccountName?: string | null,
      payoutBankAccountNumber?: string | null,
      payoutBankBranch?: string | null,
      payoutBankName?: string | null,
      payoutMethod?: PayoutMethod | null,
      payoutMpesaName?: string | null,
      payoutMpesaPhone?: string | null,
      permissions?: Array< string > | null,
      phoneNumber?: string | null,
      profileImage?: string | null,
      pushNotifications?: boolean | null,
      region?: string | null,
      smsNotifications?: boolean | null,
      street?: string | null,
      updatedAt?: string | null,
      userType: UserType,
      ward?: string | null,
      whatsappNumber?: string | null,
    } | {
      __typename: "Agent",
      accountStatus?: AccountStatus | null,
      address?: string | null,
      agencyName?: string | null,
      city?: string | null,
      createdAt?: string | null,
      currency?: string | null,
      dateOfBirth?: string | null,
      district?: string | null,
      email?: string | null,
      emailNotifications?: boolean | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      firstName?: string | null,
      gender?: string | null,
      hasProperties?: boolean | null,
      isEmailVerified?: boolean | null,
      language?: string | null,
      lastName?: string | null,
      licenseNumber?: string | null,
      nationalIdLast4?: string | null,
      occupation?: string | null,
      phoneNumber?: string | null,
      profileImage?: string | null,
      pushNotifications?: boolean | null,
      region?: string | null,
      smsNotifications?: boolean | null,
      specializations?: Array< string > | null,
      street?: string | null,
      updatedAt?: string | null,
      userType: UserType,
      ward?: string | null,
      whatsappNumber?: string | null,
    } | {
      __typename: "Landlord",
      accountStatus?: AccountStatus | null,
      address?: string | null,
      businessLicense?: string | null,
      businessName?: string | null,
      city?: string | null,
      createdAt?: string | null,
      currency?: string | null,
      dateOfBirth?: string | null,
      district?: string | null,
      email?: string | null,
      emailNotifications?: boolean | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      firstName?: string | null,
      gender?: string | null,
      hasProperties?: boolean | null,
      isEmailVerified?: boolean | null,
      language?: string | null,
      lastName?: string | null,
      nationalIdLast4?: string | null,
      occupation?: string | null,
      payoutBankAccountName?: string | null,
      payoutBankAccountNumber?: string | null,
      payoutBankBranch?: string | null,
      payoutBankName?: string | null,
      payoutMethod?: PayoutMethod | null,
      payoutMpesaName?: string | null,
      payoutMpesaPhone?: string | null,
      phoneNumber?: string | null,
      profileImage?: string | null,
      pushNotifications?: boolean | null,
      region?: string | null,
      smsNotifications?: boolean | null,
      street?: string | null,
      taxId?: string | null,
      updatedAt?: string | null,
      userType: UserType,
      verificationDocuments?: Array< string > | null,
      ward?: string | null,
      whatsappNumber?: string | null,
    } | {
      __typename: "Tenant",
      accountStatus?: AccountStatus | null,
      address?: string | null,
      city?: string | null,
      createdAt?: string | null,
      currency?: string | null,
      dateOfBirth?: string | null,
      district?: string | null,
      email?: string | null,
      emailNotifications?: boolean | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      firstName?: string | null,
      gender?: string | null,
      hasProperties?: boolean | null,
      isEmailVerified?: boolean | null,
      language?: string | null,
      lastName?: string | null,
      nationalIdLast4?: string | null,
      occupation?: string | null,
      payoutBankAccountName?: string | null,
      payoutBankAccountNumber?: string | null,
      payoutBankBranch?: string | null,
      payoutBankName?: string | null,
      payoutMethod?: PayoutMethod | null,
      payoutMpesaName?: string | null,
      payoutMpesaPhone?: string | null,
      phoneNumber?: string | null,
      profileImage?: string | null,
      pushNotifications?: boolean | null,
      region?: string | null,
      smsNotifications?: boolean | null,
      street?: string | null,
      updatedAt?: string | null,
      userType: UserType,
      ward?: string | null,
      whatsappNumber?: string | null,
    }
  ) | null,
};

export type GetMediaLibraryQueryVariables = {
};

export type GetMediaLibraryQuery = {
  getMediaLibrary?:  {
    __typename: "MediaItem",
    actionTime: number,
    additionalFiles?:  Array< {
      __typename: "MediaFile",
      contentType: string,
      fileName?: string | null,
      fileUrl: string,
    } | null > | null,
    media?:  {
      __typename: "PropertyMedia",
      floorPlan?: string | null,
      images?: Array< string > | null,
      videos?: Array< string > | null,
      virtualTour?: string | null,
    } | null,
    userId: string,
  } | null,
};

export type GetMyBusyBlocksQueryVariables = {
};

export type GetMyBusyBlocksQuery = {
  getMyBusyBlocks:  Array< {
    __typename: "BusyBlock",
    createdAt: string,
    endUtc: string,
    id: string,
    recurrence?:  {
      __typename: "BusyBlockRecurrence",
      days?: Array< number > | null,
      endDate: string,
      type: string,
    } | null,
    startUtc: string,
    title?: string | null,
    userId: string,
  } >,
};

export type GetMyLandlordApplicationQueryVariables = {
};

export type GetMyLandlordApplicationQuery = {
  getMyLandlordApplication?:  {
    __typename: "LandlordApplication",
    address?: string | null,
    adminNotes?: string | null,
    alternatePhone?: string | null,
    applicant?:  {
      __typename: "TenantBasicInfo",
      firstName?: string | null,
      lastName?: string | null,
      profileImage?: string | null,
    } | null,
    applicationId: string,
    birthDate?: string | null,
    createdAt?: string | null,
    nationalId?: string | null,
    phoneNumber?: string | null,
    rejectionReason?: string | null,
    reviewedAt?: string | null,
    status?: LandlordApplicationStatus | null,
    submittedAt?: string | null,
    updatedAt?: string | null,
    userId: string,
  } | null,
};

export type GetPaymentQueryVariables = {
  paymentId: string,
};

export type GetPaymentQuery = {
  getPayment?:  {
    __typename: "Payment",
    amount: number,
    bookingId: string,
    completedAt?: string | null,
    conversationID?: string | null,
    createdAt: string,
    currency: string,
    customerEmail?: string | null,
    customerPhone?: string | null,
    errorMessage?: string | null,
    paymentId: string,
    provider: PaymentProvider,
    refundAmount?: number | null,
    refundReason?: string | null,
    refundedAt?: string | null,
    status: PaymentStatus,
    thirdPartyConversationID: string,
    transactionID?: string | null,
    updatedAt: string,
  } | null,
};

export type GetPropertiesByCategoryQueryVariables = {
  category: PropertyCategory,
  limit?: number | null,
  nextToken?: string | null,
};

export type GetPropertiesByCategoryQuery = {
  getPropertiesByCategory:  {
    __typename: "CategoryPropertyResponse",
    category: PropertyCategory,
    count: number,
    nextToken?: string | null,
    properties:  Array< {
      __typename: "PropertyCard",
      bedrooms?: number | null,
      currency: string,
      district: string,
      monthlyRent: number,
      propertyId: string,
      propertyType: PropertyType,
      region: string,
      thumbnail?: string | null,
      title: string,
      verified: boolean,
    } >,
  },
};

export type GetPropertiesByLocationQueryVariables = {
  bathrooms?: number | null,
  bedrooms?: number | null,
  district?: string | null,
  limit?: number | null,
  maxPrice?: number | null,
  minPrice?: number | null,
  moveInDate?: string | null,
  nextToken?: string | null,
  propertyType?: PropertyType | null,
  region: string,
  sortBy?: PropertySortOption | null,
};

export type GetPropertiesByLocationQuery = {
  getPropertiesByLocation:  {
    __typename: "PropertyCardsResponse",
    count: number,
    nextToken?: string | null,
    properties:  Array< {
      __typename: "PropertyCard",
      bedrooms?: number | null,
      currency: string,
      district: string,
      monthlyRent: number,
      propertyId: string,
      propertyType: PropertyType,
      region: string,
      thumbnail?: string | null,
      title: string,
      verified: boolean,
    } >,
  },
};

export type GetPropertyQueryVariables = {
  propertyId: string,
};

export type GetPropertyQuery = {
  getProperty?:  {
    __typename: "Property",
    address:  {
      __typename: "Address",
      coordinates?:  {
        __typename: "Coordinates",
        latitude: number,
        longitude: number,
      } | null,
      district: string,
      postalCode?: string | null,
      region: string,
      street?: string | null,
      ward?: string | null,
    },
    agent?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    agentId?: string | null,
    amenities?: Array< string | null > | null,
    availability?:  {
      __typename: "PropertyAvailability",
      available: boolean,
      availableFrom?: string | null,
      maximumLeaseTerm?: number | null,
      minimumLeaseTerm?: number | null,
    } | null,
    createdAt?: string | null,
    description?: string | null,
    googleMapsUrl?: string | null,
    landlord?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    media?:  {
      __typename: "PropertyMedia",
      floorPlan?: string | null,
      images?: Array< string > | null,
      videos?: Array< string > | null,
      virtualTour?: string | null,
    } | null,
    pricing?:  {
      __typename: "PropertyPricing",
      currency: string,
      deposit?: number | null,
      monthlyRent: number,
      serviceCharge?: number | null,
      utilitiesIncluded?: boolean | null,
    } | null,
    propertyId: string,
    propertyType: PropertyType,
    specifications?:  {
      __typename: "PropertySpecifications",
      bathrooms?: number | null,
      bedrooms?: number | null,
      floors?: number | null,
      furnished?: boolean | null,
      parkingSpaces?: number | null,
      squareMeters?: number | null,
    } | null,
    status: PropertyStatus,
    title: string,
    updatedAt?: string | null,
    verified: boolean,
    version?: number | null,
  } | null,
};

export type GetPropertyRatingSummaryQueryVariables = {
  propertyId: string,
};

export type GetPropertyRatingSummaryQuery = {
  getPropertyRatingSummary:  {
    __typename: "PropertyRatingSummary",
    accuracy?: number | null,
    averageRating: number,
    cleanliness?: number | null,
    communication?: number | null,
    fiveStars?: number | null,
    fourStars?: number | null,
    location?: number | null,
    oneStar?: number | null,
    threeStars?: number | null,
    totalReviews: number,
    twoStars?: number | null,
    value?: number | null,
  },
};

export type GetPropertyReviewsQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
  propertyId: string,
};

export type GetPropertyReviewsQuery = {
  getPropertyReviews:  {
    __typename: "ReviewListResponse",
    count: number,
    nextToken?: string | null,
    reviews:  Array< {
      __typename: "Review",
      accuracy: number,
      bookingId: string,
      cleanliness: number,
      comment: string,
      communication: number,
      createdAt: string,
      guest?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      guestId: string,
      hostResponse?: string | null,
      hostResponseDate?: string | null,
      location: number,
      overallRating: number,
      photos?: Array< string > | null,
      propertyId: string,
      reviewId: string,
      updatedAt: string,
      value: number,
      verifiedStay: boolean,
    } >,
  },
};

export type GetReferralSubmissionQueryVariables = {
  createdAt: string,
  referralId: string,
};

export type GetReferralSubmissionQuery = {
  getReferralSubmission?:  {
    __typename: "ReferralSubmission",
    adminNotes?: Array< string > | null,
    assignedTo?: string | null,
    createdAt: string,
    landlordArea: string,
    landlordName: string,
    landlordNotes?: string | null,
    landlordPhone: string,
    listingRewardStatus: string,
    profitShareRewardStatus: string,
    referralId: string,
    referrerName: string,
    referrerNida?: string | null,
    referrerPhone: string,
    status: string,
    updatedAt?: string | null,
  } | null,
};

export type GetRegionsQueryVariables = {
};

export type GetRegionsQuery = {
  getRegions:  Array< {
    __typename: "Region",
    id: string,
    name: string,
  } >,
};

export type GetRelatedPropertiesQueryVariables = {
  landlordLimit?: number | null,
  locationLimit?: number | null,
  priceLimit?: number | null,
  propertyId: string,
};

export type GetRelatedPropertiesQuery = {
  getRelatedProperties:  {
    __typename: "RelatedPropertiesResponse",
    landlordProperties:  Array< {
      __typename: "PropertyCard",
      bedrooms?: number | null,
      currency: string,
      district: string,
      monthlyRent: number,
      propertyId: string,
      propertyType: PropertyType,
      region: string,
      thumbnail?: string | null,
      title: string,
      verified: boolean,
    } >,
    similarLocationProperties:  Array< {
      __typename: "PropertyCard",
      bedrooms?: number | null,
      currency: string,
      district: string,
      monthlyRent: number,
      propertyId: string,
      propertyType: PropertyType,
      region: string,
      thumbnail?: string | null,
      title: string,
      verified: boolean,
    } >,
    similarPriceProperties:  Array< {
      __typename: "PropertyCard",
      bedrooms?: number | null,
      currency: string,
      district: string,
      monthlyRent: number,
      propertyId: string,
      propertyType: PropertyType,
      region: string,
      thumbnail?: string | null,
      title: string,
      verified: boolean,
    } >,
  },
};

export type GetShortTermPropertyQueryVariables = {
  propertyId: string,
};

export type GetShortTermPropertyQuery = {
  getShortTermProperty?:  {
    __typename: "ShortTermProperty",
    address?:  {
      __typename: "ShortTermAddress",
      city: string,
      country: string,
      district?: string | null,
      postalCode?: string | null,
      region: string,
      street: string,
    } | null,
    advanceBookingDays?: number | null,
    allowsChildren?: boolean | null,
    allowsInfants?: boolean | null,
    allowsPets?: boolean | null,
    allowsSmoking?: boolean | null,
    amenities?: Array< string > | null,
    averageRating?: number | null,
    bathrooms?: number | null,
    bedrooms?: number | null,
    cancellationPolicy?: CancellationPolicy | null,
    checkInInstructions?:  {
      __typename: "CheckInInstructions",
      accessCode?: string | null,
      additionalNotes?: string | null,
      contactName?: string | null,
      contactPhone?: string | null,
      directions?: string | null,
      houseRules?: Array< string > | null,
      parkingInfo?: string | null,
      wifiName?: string | null,
      wifiPassword?: string | null,
    } | null,
    checkInTime?: string | null,
    checkOutTime?: string | null,
    cleaningFee?: number | null,
    coordinates?:  {
      __typename: "Coordinates",
      latitude: number,
      longitude: number,
    } | null,
    createdAt: string,
    currency: string,
    description?: string | null,
    district: string,
    googleMapsUrl?: string | null,
    host?:  {
      __typename: "PropertyUser",
      firstName: string,
      lastName: string,
      profileImage?: string | null,
      whatsappNumber?: string | null,
    } | null,
    hostId: string,
    houseRules?: Array< string > | null,
    images?: Array< string > | null,
    instantBookEnabled?: boolean | null,
    maxAdults?: number | null,
    maxChildren?: number | null,
    maxGuests?: number | null,
    maxInfants?: number | null,
    maximumStay?: number | null,
    minimumStay?: number | null,
    nightlyRate: number,
    propertyId: string,
    propertyType: ShortTermPropertyType,
    publishedAt?: string | null,
    ratingSummary?:  {
      __typename: "PropertyRatingSummary",
      accuracy?: number | null,
      averageRating: number,
      cleanliness?: number | null,
      communication?: number | null,
      fiveStars?: number | null,
      fourStars?: number | null,
      location?: number | null,
      oneStar?: number | null,
      threeStars?: number | null,
      totalReviews: number,
      twoStars?: number | null,
      value?: number | null,
    } | null,
    region: string,
    serviceFeePercentage?: number | null,
    status: PropertyStatus,
    stayCategories?: Array< StayCategory > | null,
    taxPercentage?: number | null,
    thumbnail?: string | null,
    title: string,
    updatedAt: string,
    videos?: Array< string > | null,
  } | null,
};

export type GetStreetsQueryVariables = {
  wardId: string,
};

export type GetStreetsQuery = {
  getStreets:  Array< {
    __typename: "Street",
    id: string,
    name: string,
    wardId: string,
  } >,
};

export type GetSuggestedLandlordsQueryVariables = {
  createdAt: string,
  requestId: string,
};

export type GetSuggestedLandlordsQuery = {
  getSuggestedLandlords:  Array< {
    __typename: "SuggestedLandlord",
    landlord:  {
      __typename: "LandlordProfile",
      businessName?: string | null,
      createdAt?: string | null,
      currency?: string | null,
      district?: string | null,
      firstName?: string | null,
      lastName?: string | null,
      maxPrice?: number | null,
      minPrice?: number | null,
      operatingDistricts: Array< string >,
      operatingRegions: Array< string >,
      phoneNumber?: string | null,
      profileImage?: string | null,
      propertyCount: number,
      propertyTypes: Array< string >,
      region?: string | null,
      userId: string,
      ward?: string | null,
      whatsappNumber?: string | null,
    },
    matchReasons: Array< string >,
  } >,
};

export type GetTeamAvailabilityQueryVariables = {
  endDate: string,
  startDate: string,
};

export type GetTeamAvailabilityQuery = {
  getTeamAvailability:  {
    __typename: "TeamAvailabilityResponse",
    busyBlocks:  Array< {
      __typename: "BusyBlock",
      createdAt: string,
      endUtc: string,
      id: string,
      recurrence?:  {
        __typename: "BusyBlockRecurrence",
        days?: Array< number > | null,
        endDate: string,
        type: string,
      } | null,
      startUtc: string,
      title?: string | null,
      userId: string,
    } >,
    meetings:  Array< {
      __typename: "TeamMeeting",
      attendeeIds: Array< string >,
      createdAt: string,
      createdBy: string,
      createdByName: string,
      description?: string | null,
      endUtc: string,
      id: string,
      link?: string | null,
      startUtc: string,
      title: string,
    } >,
  },
};

export type GetUnreadCountQueryVariables = {
};

export type GetUnreadCountQuery = {
  getUnreadCount: number,
};

export type GetUserByEmailQueryVariables = {
  email: string,
};

export type GetUserByEmailQuery = {
  getUserByEmail: ( {
      __typename: "Admin",
      accountStatus?: AccountStatus | null,
      address?: string | null,
      city?: string | null,
      createdAt?: string | null,
      currency?: string | null,
      dateOfBirth?: string | null,
      district?: string | null,
      email?: string | null,
      emailNotifications?: boolean | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      firstName?: string | null,
      gender?: string | null,
      hasProperties?: boolean | null,
      isEmailVerified?: boolean | null,
      language?: string | null,
      lastName?: string | null,
      nationalIdLast4?: string | null,
      occupation?: string | null,
      payoutBankAccountName?: string | null,
      payoutBankAccountNumber?: string | null,
      payoutBankBranch?: string | null,
      payoutBankName?: string | null,
      payoutMethod?: PayoutMethod | null,
      payoutMpesaName?: string | null,
      payoutMpesaPhone?: string | null,
      permissions?: Array< string > | null,
      phoneNumber?: string | null,
      profileImage?: string | null,
      pushNotifications?: boolean | null,
      region?: string | null,
      smsNotifications?: boolean | null,
      street?: string | null,
      updatedAt?: string | null,
      userType: UserType,
      ward?: string | null,
      whatsappNumber?: string | null,
    } | {
      __typename: "Agent",
      accountStatus?: AccountStatus | null,
      address?: string | null,
      agencyName?: string | null,
      city?: string | null,
      createdAt?: string | null,
      currency?: string | null,
      dateOfBirth?: string | null,
      district?: string | null,
      email?: string | null,
      emailNotifications?: boolean | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      firstName?: string | null,
      gender?: string | null,
      hasProperties?: boolean | null,
      isEmailVerified?: boolean | null,
      language?: string | null,
      lastName?: string | null,
      licenseNumber?: string | null,
      nationalIdLast4?: string | null,
      occupation?: string | null,
      phoneNumber?: string | null,
      profileImage?: string | null,
      pushNotifications?: boolean | null,
      region?: string | null,
      smsNotifications?: boolean | null,
      specializations?: Array< string > | null,
      street?: string | null,
      updatedAt?: string | null,
      userType: UserType,
      ward?: string | null,
      whatsappNumber?: string | null,
    } | {
      __typename: "Landlord",
      accountStatus?: AccountStatus | null,
      address?: string | null,
      businessLicense?: string | null,
      businessName?: string | null,
      city?: string | null,
      createdAt?: string | null,
      currency?: string | null,
      dateOfBirth?: string | null,
      district?: string | null,
      email?: string | null,
      emailNotifications?: boolean | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      firstName?: string | null,
      gender?: string | null,
      hasProperties?: boolean | null,
      isEmailVerified?: boolean | null,
      language?: string | null,
      lastName?: string | null,
      nationalIdLast4?: string | null,
      occupation?: string | null,
      payoutBankAccountName?: string | null,
      payoutBankAccountNumber?: string | null,
      payoutBankBranch?: string | null,
      payoutBankName?: string | null,
      payoutMethod?: PayoutMethod | null,
      payoutMpesaName?: string | null,
      payoutMpesaPhone?: string | null,
      phoneNumber?: string | null,
      profileImage?: string | null,
      pushNotifications?: boolean | null,
      region?: string | null,
      smsNotifications?: boolean | null,
      street?: string | null,
      taxId?: string | null,
      updatedAt?: string | null,
      userType: UserType,
      verificationDocuments?: Array< string > | null,
      ward?: string | null,
      whatsappNumber?: string | null,
    } | {
      __typename: "Tenant",
      accountStatus?: AccountStatus | null,
      address?: string | null,
      city?: string | null,
      createdAt?: string | null,
      currency?: string | null,
      dateOfBirth?: string | null,
      district?: string | null,
      email?: string | null,
      emailNotifications?: boolean | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      firstName?: string | null,
      gender?: string | null,
      hasProperties?: boolean | null,
      isEmailVerified?: boolean | null,
      language?: string | null,
      lastName?: string | null,
      nationalIdLast4?: string | null,
      occupation?: string | null,
      payoutBankAccountName?: string | null,
      payoutBankAccountNumber?: string | null,
      payoutBankBranch?: string | null,
      payoutBankName?: string | null,
      payoutMethod?: PayoutMethod | null,
      payoutMpesaName?: string | null,
      payoutMpesaPhone?: string | null,
      phoneNumber?: string | null,
      profileImage?: string | null,
      pushNotifications?: boolean | null,
      region?: string | null,
      smsNotifications?: boolean | null,
      street?: string | null,
      updatedAt?: string | null,
      userType: UserType,
      ward?: string | null,
      whatsappNumber?: string | null,
    }
  ) | null,
};

export type GetUserByIdQueryVariables = {
  userId: string,
};

export type GetUserByIdQuery = {
  getUserById: ( {
      __typename: "Admin",
      accountStatus?: AccountStatus | null,
      address?: string | null,
      city?: string | null,
      createdAt?: string | null,
      currency?: string | null,
      dateOfBirth?: string | null,
      district?: string | null,
      email?: string | null,
      emailNotifications?: boolean | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      firstName?: string | null,
      gender?: string | null,
      hasProperties?: boolean | null,
      isEmailVerified?: boolean | null,
      language?: string | null,
      lastName?: string | null,
      nationalIdLast4?: string | null,
      occupation?: string | null,
      payoutBankAccountName?: string | null,
      payoutBankAccountNumber?: string | null,
      payoutBankBranch?: string | null,
      payoutBankName?: string | null,
      payoutMethod?: PayoutMethod | null,
      payoutMpesaName?: string | null,
      payoutMpesaPhone?: string | null,
      permissions?: Array< string > | null,
      phoneNumber?: string | null,
      profileImage?: string | null,
      pushNotifications?: boolean | null,
      region?: string | null,
      smsNotifications?: boolean | null,
      street?: string | null,
      updatedAt?: string | null,
      userType: UserType,
      ward?: string | null,
      whatsappNumber?: string | null,
    } | {
      __typename: "Agent",
      accountStatus?: AccountStatus | null,
      address?: string | null,
      agencyName?: string | null,
      city?: string | null,
      createdAt?: string | null,
      currency?: string | null,
      dateOfBirth?: string | null,
      district?: string | null,
      email?: string | null,
      emailNotifications?: boolean | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      firstName?: string | null,
      gender?: string | null,
      hasProperties?: boolean | null,
      isEmailVerified?: boolean | null,
      language?: string | null,
      lastName?: string | null,
      licenseNumber?: string | null,
      nationalIdLast4?: string | null,
      occupation?: string | null,
      phoneNumber?: string | null,
      profileImage?: string | null,
      pushNotifications?: boolean | null,
      region?: string | null,
      smsNotifications?: boolean | null,
      specializations?: Array< string > | null,
      street?: string | null,
      updatedAt?: string | null,
      userType: UserType,
      ward?: string | null,
      whatsappNumber?: string | null,
    } | {
      __typename: "Landlord",
      accountStatus?: AccountStatus | null,
      address?: string | null,
      businessLicense?: string | null,
      businessName?: string | null,
      city?: string | null,
      createdAt?: string | null,
      currency?: string | null,
      dateOfBirth?: string | null,
      district?: string | null,
      email?: string | null,
      emailNotifications?: boolean | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      firstName?: string | null,
      gender?: string | null,
      hasProperties?: boolean | null,
      isEmailVerified?: boolean | null,
      language?: string | null,
      lastName?: string | null,
      nationalIdLast4?: string | null,
      occupation?: string | null,
      payoutBankAccountName?: string | null,
      payoutBankAccountNumber?: string | null,
      payoutBankBranch?: string | null,
      payoutBankName?: string | null,
      payoutMethod?: PayoutMethod | null,
      payoutMpesaName?: string | null,
      payoutMpesaPhone?: string | null,
      phoneNumber?: string | null,
      profileImage?: string | null,
      pushNotifications?: boolean | null,
      region?: string | null,
      smsNotifications?: boolean | null,
      street?: string | null,
      taxId?: string | null,
      updatedAt?: string | null,
      userType: UserType,
      verificationDocuments?: Array< string > | null,
      ward?: string | null,
      whatsappNumber?: string | null,
    } | {
      __typename: "Tenant",
      accountStatus?: AccountStatus | null,
      address?: string | null,
      city?: string | null,
      createdAt?: string | null,
      currency?: string | null,
      dateOfBirth?: string | null,
      district?: string | null,
      email?: string | null,
      emailNotifications?: boolean | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      firstName?: string | null,
      gender?: string | null,
      hasProperties?: boolean | null,
      isEmailVerified?: boolean | null,
      language?: string | null,
      lastName?: string | null,
      nationalIdLast4?: string | null,
      occupation?: string | null,
      payoutBankAccountName?: string | null,
      payoutBankAccountNumber?: string | null,
      payoutBankBranch?: string | null,
      payoutBankName?: string | null,
      payoutMethod?: PayoutMethod | null,
      payoutMpesaName?: string | null,
      payoutMpesaPhone?: string | null,
      phoneNumber?: string | null,
      profileImage?: string | null,
      pushNotifications?: boolean | null,
      region?: string | null,
      smsNotifications?: boolean | null,
      street?: string | null,
      updatedAt?: string | null,
      userType: UserType,
      ward?: string | null,
      whatsappNumber?: string | null,
    }
  ) | null,
};

export type GetUserConversationsQueryVariables = {
};

export type GetUserConversationsQuery = {
  getUserConversations:  Array< {
    __typename: "Conversation",
    conversationType?: string | null,
    createdAt: string,
    id: string,
    lastMessage: string,
    lastMessageTime: string,
    otherPartyImage?: string | null,
    otherPartyName: string,
    propertyTitle: string,
    unreadCount: number,
    updatedAt: string,
  } >,
};

export type GetUserStatsQueryVariables = {
};

export type GetUserStatsQuery = {
  getUserStats:  {
    __typename: "UserStats",
    activeUsers: number,
    newUsersThisMonth: number,
    newUsersThisWeek: number,
    totalAdmins: number,
    totalAgents: number,
    totalLandlords: number,
    totalTenants: number,
    totalUsers: number,
  },
};

export type GetWardsQueryVariables = {
  districtId: string,
};

export type GetWardsQuery = {
  getWards:  Array< {
    __typename: "Ward",
    districtId: string,
    id: string,
    name: string,
  } >,
};

export type GetWhatsAppChatHistoryQueryVariables = {
  before?: string | null,
  limit?: number | null,
  phone: string,
};

export type GetWhatsAppChatHistoryQuery = {
  getWhatsAppChatHistory:  {
    __typename: "WhatsAppConversationSummary",
    contactName?: string | null,
    entries:  Array< {
      __typename: "WhatsAppChatEntry",
      direction: string,
      lang?: string | null,
      phone: string,
      replyId?: string | null,
      source?: string | null,
      step?: string | null,
      text?: string | null,
      ts: string,
      type: string,
    } >,
    hasMore?: boolean | null,
    lastMessageAt?: string | null,
    linkedUser?:  {
      __typename: "WhatsAppLinkedUser",
      email?: string | null,
      firstName: string,
      lastName: string,
      phoneNumber?: string | null,
      userId: string,
      userType: string,
      whatsappNumber?: string | null,
    } | null,
    messageCount: number,
    oldestTs?: string | null,
    phone: string,
  },
};

export type ListAgentPropertiesQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
};

export type ListAgentPropertiesQuery = {
  listAgentProperties:  {
    __typename: "PropertyListResponse",
    count: number,
    nextToken?: string | null,
    properties:  Array< {
      __typename: "Property",
      address:  {
        __typename: "Address",
        coordinates?:  {
          __typename: "Coordinates",
          latitude: number,
          longitude: number,
        } | null,
        district: string,
        postalCode?: string | null,
        region: string,
        street?: string | null,
        ward?: string | null,
      },
      agent?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      agentId?: string | null,
      amenities?: Array< string | null > | null,
      availability?:  {
        __typename: "PropertyAvailability",
        available: boolean,
        availableFrom?: string | null,
        maximumLeaseTerm?: number | null,
        minimumLeaseTerm?: number | null,
      } | null,
      createdAt?: string | null,
      description?: string | null,
      googleMapsUrl?: string | null,
      landlord?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      media?:  {
        __typename: "PropertyMedia",
        floorPlan?: string | null,
        images?: Array< string > | null,
        videos?: Array< string > | null,
        virtualTour?: string | null,
      } | null,
      pricing?:  {
        __typename: "PropertyPricing",
        currency: string,
        deposit?: number | null,
        monthlyRent: number,
        serviceCharge?: number | null,
        utilitiesIncluded?: boolean | null,
      } | null,
      propertyId: string,
      propertyType: PropertyType,
      specifications?:  {
        __typename: "PropertySpecifications",
        bathrooms?: number | null,
        bedrooms?: number | null,
        floors?: number | null,
        furnished?: boolean | null,
        parkingSpaces?: number | null,
        squareMeters?: number | null,
      } | null,
      status: PropertyStatus,
      title: string,
      updatedAt?: string | null,
      verified: boolean,
      version?: number | null,
    } >,
  },
};

export type ListAllApplicationsQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
  status?: ApplicationStatus | null,
};

export type ListAllApplicationsQuery = {
  listAllApplications:  {
    __typename: "ApplicationListResponse",
    applications:  Array< {
      __typename: "Application",
      applicant?:  {
        __typename: "TenantBasicInfo",
        firstName?: string | null,
        lastName?: string | null,
        profileImage?: string | null,
      } | null,
      applicantDetails:  {
        __typename: "ApplicantDetails",
        emergencyContact:  {
          __typename: "EmergencyContact",
          email?: string | null,
          name: string,
          phoneNumber: string,
          relationship: string,
        },
        hasPets: boolean,
        leaseDuration: number,
        monthlyIncome: number,
        moveInDate: string,
        numberOfOccupants: number,
        occupation: string,
        petDetails?: string | null,
        smokingStatus: SmokingStatus,
      },
      applicationId: string,
      createdAt?: string | null,
      landlord?:  {
        __typename: "LandlordBasicInfo",
        businessName?: string | null,
        firstName?: string | null,
        lastName?: string | null,
        profileImage?: string | null,
      } | null,
      landlordNotes?: string | null,
      property?:  {
        __typename: "Property",
        address:  {
          __typename: "Address",
          district: string,
          postalCode?: string | null,
          region: string,
          street?: string | null,
          ward?: string | null,
        },
        agent?:  {
          __typename: "PropertyUser",
          firstName: string,
          lastName: string,
          profileImage?: string | null,
          whatsappNumber?: string | null,
        } | null,
        agentId?: string | null,
        amenities?: Array< string | null > | null,
        availability?:  {
          __typename: "PropertyAvailability",
          available: boolean,
          availableFrom?: string | null,
          maximumLeaseTerm?: number | null,
          minimumLeaseTerm?: number | null,
        } | null,
        createdAt?: string | null,
        description?: string | null,
        googleMapsUrl?: string | null,
        landlord?:  {
          __typename: "PropertyUser",
          firstName: string,
          lastName: string,
          profileImage?: string | null,
          whatsappNumber?: string | null,
        } | null,
        media?:  {
          __typename: "PropertyMedia",
          floorPlan?: string | null,
          images?: Array< string > | null,
          videos?: Array< string > | null,
          virtualTour?: string | null,
        } | null,
        pricing?:  {
          __typename: "PropertyPricing",
          currency: string,
          deposit?: number | null,
          monthlyRent: number,
          serviceCharge?: number | null,
          utilitiesIncluded?: boolean | null,
        } | null,
        propertyId: string,
        propertyType: PropertyType,
        specifications?:  {
          __typename: "PropertySpecifications",
          bathrooms?: number | null,
          bedrooms?: number | null,
          floors?: number | null,
          furnished?: boolean | null,
          parkingSpaces?: number | null,
          squareMeters?: number | null,
        } | null,
        status: PropertyStatus,
        title: string,
        updatedAt?: string | null,
        verified: boolean,
        version?: number | null,
      } | null,
      propertyId: string,
      rejectionReason?: string | null,
      status: ApplicationStatus,
      submittedAt?: string | null,
      updatedAt?: string | null,
    } >,
    count: number,
    nextToken?: string | null,
  },
};

export type ListAllLandlordApplicationsQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
  status?: LandlordApplicationStatus | null,
};

export type ListAllLandlordApplicationsQuery = {
  listAllLandlordApplications:  {
    __typename: "LandlordApplicationListResponse",
    applications:  Array< {
      __typename: "LandlordApplication",
      address?: string | null,
      adminNotes?: string | null,
      alternatePhone?: string | null,
      applicant?:  {
        __typename: "TenantBasicInfo",
        firstName?: string | null,
        lastName?: string | null,
        profileImage?: string | null,
      } | null,
      applicationId: string,
      birthDate?: string | null,
      createdAt?: string | null,
      nationalId?: string | null,
      phoneNumber?: string | null,
      rejectionReason?: string | null,
      reviewedAt?: string | null,
      status?: LandlordApplicationStatus | null,
      submittedAt?: string | null,
      updatedAt?: string | null,
      userId: string,
    } >,
    count: number,
    nextToken?: string | null,
  },
};

export type ListAllPropertiesQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
  propertyType?: string | null,
  search?: string | null,
  status?: PropertyStatus | null,
};

export type ListAllPropertiesQuery = {
  listAllProperties:  {
    __typename: "CombinedPropertyListResponse",
    longTermProperties:  Array< {
      __typename: "Property",
      address:  {
        __typename: "Address",
        coordinates?:  {
          __typename: "Coordinates",
          latitude: number,
          longitude: number,
        } | null,
        district: string,
        postalCode?: string | null,
        region: string,
        street?: string | null,
        ward?: string | null,
      },
      agent?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      agentId?: string | null,
      amenities?: Array< string | null > | null,
      availability?:  {
        __typename: "PropertyAvailability",
        available: boolean,
        availableFrom?: string | null,
        maximumLeaseTerm?: number | null,
        minimumLeaseTerm?: number | null,
      } | null,
      createdAt?: string | null,
      description?: string | null,
      googleMapsUrl?: string | null,
      landlord?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      media?:  {
        __typename: "PropertyMedia",
        floorPlan?: string | null,
        images?: Array< string > | null,
        videos?: Array< string > | null,
        virtualTour?: string | null,
      } | null,
      pricing?:  {
        __typename: "PropertyPricing",
        currency: string,
        deposit?: number | null,
        monthlyRent: number,
        serviceCharge?: number | null,
        utilitiesIncluded?: boolean | null,
      } | null,
      propertyId: string,
      propertyType: PropertyType,
      specifications?:  {
        __typename: "PropertySpecifications",
        bathrooms?: number | null,
        bedrooms?: number | null,
        floors?: number | null,
        furnished?: boolean | null,
        parkingSpaces?: number | null,
        squareMeters?: number | null,
      } | null,
      status: PropertyStatus,
      title: string,
      updatedAt?: string | null,
      verified: boolean,
      version?: number | null,
    } >,
    nextToken?: string | null,
    shortTermProperties:  Array< {
      __typename: "ShortTermProperty",
      address?:  {
        __typename: "ShortTermAddress",
        city: string,
        country: string,
        district?: string | null,
        postalCode?: string | null,
        region: string,
        street: string,
      } | null,
      advanceBookingDays?: number | null,
      allowsChildren?: boolean | null,
      allowsInfants?: boolean | null,
      allowsPets?: boolean | null,
      allowsSmoking?: boolean | null,
      amenities?: Array< string > | null,
      averageRating?: number | null,
      bathrooms?: number | null,
      bedrooms?: number | null,
      cancellationPolicy?: CancellationPolicy | null,
      checkInInstructions?:  {
        __typename: "CheckInInstructions",
        accessCode?: string | null,
        additionalNotes?: string | null,
        contactName?: string | null,
        contactPhone?: string | null,
        directions?: string | null,
        houseRules?: Array< string > | null,
        parkingInfo?: string | null,
        wifiName?: string | null,
        wifiPassword?: string | null,
      } | null,
      checkInTime?: string | null,
      checkOutTime?: string | null,
      cleaningFee?: number | null,
      coordinates?:  {
        __typename: "Coordinates",
        latitude: number,
        longitude: number,
      } | null,
      createdAt: string,
      currency: string,
      description?: string | null,
      district: string,
      googleMapsUrl?: string | null,
      host?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      hostId: string,
      houseRules?: Array< string > | null,
      images?: Array< string > | null,
      instantBookEnabled?: boolean | null,
      maxAdults?: number | null,
      maxChildren?: number | null,
      maxGuests?: number | null,
      maxInfants?: number | null,
      maximumStay?: number | null,
      minimumStay?: number | null,
      nightlyRate: number,
      propertyId: string,
      propertyType: ShortTermPropertyType,
      publishedAt?: string | null,
      ratingSummary?:  {
        __typename: "PropertyRatingSummary",
        accuracy?: number | null,
        averageRating: number,
        cleanliness?: number | null,
        communication?: number | null,
        fiveStars?: number | null,
        fourStars?: number | null,
        location?: number | null,
        oneStar?: number | null,
        threeStars?: number | null,
        totalReviews: number,
        twoStars?: number | null,
        value?: number | null,
      } | null,
      region: string,
      serviceFeePercentage?: number | null,
      status: PropertyStatus,
      stayCategories?: Array< StayCategory > | null,
      taxPercentage?: number | null,
      thumbnail?: string | null,
      title: string,
      updatedAt: string,
      videos?: Array< string > | null,
    } >,
    totalCount: number,
  },
};

export type ListAllUsersQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
  userType?: UserType | null,
};

export type ListAllUsersQuery = {
  listAllUsers:  {
    __typename: "UserListResponse",
    count: number,
    nextToken?: string | null,
    users:  Array< {
      __typename: "UserWithId",
      profile: ( {
          __typename: "Admin",
          accountStatus?: AccountStatus | null,
          address?: string | null,
          city?: string | null,
          createdAt?: string | null,
          currency?: string | null,
          dateOfBirth?: string | null,
          district?: string | null,
          email?: string | null,
          emailNotifications?: boolean | null,
          emergencyContactName?: string | null,
          emergencyContactPhone?: string | null,
          firstName?: string | null,
          gender?: string | null,
          hasProperties?: boolean | null,
          isEmailVerified?: boolean | null,
          language?: string | null,
          lastName?: string | null,
          nationalIdLast4?: string | null,
          occupation?: string | null,
          payoutBankAccountName?: string | null,
          payoutBankAccountNumber?: string | null,
          payoutBankBranch?: string | null,
          payoutBankName?: string | null,
          payoutMethod?: PayoutMethod | null,
          payoutMpesaName?: string | null,
          payoutMpesaPhone?: string | null,
          permissions?: Array< string > | null,
          phoneNumber?: string | null,
          profileImage?: string | null,
          pushNotifications?: boolean | null,
          region?: string | null,
          smsNotifications?: boolean | null,
          street?: string | null,
          updatedAt?: string | null,
          userType: UserType,
          ward?: string | null,
          whatsappNumber?: string | null,
        } | {
          __typename: "Agent",
          accountStatus?: AccountStatus | null,
          address?: string | null,
          agencyName?: string | null,
          city?: string | null,
          createdAt?: string | null,
          currency?: string | null,
          dateOfBirth?: string | null,
          district?: string | null,
          email?: string | null,
          emailNotifications?: boolean | null,
          emergencyContactName?: string | null,
          emergencyContactPhone?: string | null,
          firstName?: string | null,
          gender?: string | null,
          hasProperties?: boolean | null,
          isEmailVerified?: boolean | null,
          language?: string | null,
          lastName?: string | null,
          licenseNumber?: string | null,
          nationalIdLast4?: string | null,
          occupation?: string | null,
          phoneNumber?: string | null,
          profileImage?: string | null,
          pushNotifications?: boolean | null,
          region?: string | null,
          smsNotifications?: boolean | null,
          specializations?: Array< string > | null,
          street?: string | null,
          updatedAt?: string | null,
          userType: UserType,
          ward?: string | null,
          whatsappNumber?: string | null,
        } | {
          __typename: "Landlord",
          accountStatus?: AccountStatus | null,
          address?: string | null,
          businessLicense?: string | null,
          businessName?: string | null,
          city?: string | null,
          createdAt?: string | null,
          currency?: string | null,
          dateOfBirth?: string | null,
          district?: string | null,
          email?: string | null,
          emailNotifications?: boolean | null,
          emergencyContactName?: string | null,
          emergencyContactPhone?: string | null,
          firstName?: string | null,
          gender?: string | null,
          hasProperties?: boolean | null,
          isEmailVerified?: boolean | null,
          language?: string | null,
          lastName?: string | null,
          nationalIdLast4?: string | null,
          occupation?: string | null,
          payoutBankAccountName?: string | null,
          payoutBankAccountNumber?: string | null,
          payoutBankBranch?: string | null,
          payoutBankName?: string | null,
          payoutMethod?: PayoutMethod | null,
          payoutMpesaName?: string | null,
          payoutMpesaPhone?: string | null,
          phoneNumber?: string | null,
          profileImage?: string | null,
          pushNotifications?: boolean | null,
          region?: string | null,
          smsNotifications?: boolean | null,
          street?: string | null,
          taxId?: string | null,
          updatedAt?: string | null,
          userType: UserType,
          verificationDocuments?: Array< string > | null,
          ward?: string | null,
          whatsappNumber?: string | null,
        } | {
          __typename: "Tenant",
          accountStatus?: AccountStatus | null,
          address?: string | null,
          city?: string | null,
          createdAt?: string | null,
          currency?: string | null,
          dateOfBirth?: string | null,
          district?: string | null,
          email?: string | null,
          emailNotifications?: boolean | null,
          emergencyContactName?: string | null,
          emergencyContactPhone?: string | null,
          firstName?: string | null,
          gender?: string | null,
          hasProperties?: boolean | null,
          isEmailVerified?: boolean | null,
          language?: string | null,
          lastName?: string | null,
          nationalIdLast4?: string | null,
          occupation?: string | null,
          payoutBankAccountName?: string | null,
          payoutBankAccountNumber?: string | null,
          payoutBankBranch?: string | null,
          payoutBankName?: string | null,
          payoutMethod?: PayoutMethod | null,
          payoutMpesaName?: string | null,
          payoutMpesaPhone?: string | null,
          phoneNumber?: string | null,
          profileImage?: string | null,
          pushNotifications?: boolean | null,
          region?: string | null,
          smsNotifications?: boolean | null,
          street?: string | null,
          updatedAt?: string | null,
          userType: UserType,
          ward?: string | null,
          whatsappNumber?: string | null,
        }
      ),
      userId: string,
    } >,
  },
};

export type ListContactInquiriesQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
  status?: InquiryStatus | null,
};

export type ListContactInquiriesQuery = {
  listContactInquiries:  {
    __typename: "ContactInquiryListResponse",
    count: number,
    items:  Array< {
      __typename: "ContactInquiry",
      adminNotes?: string | null,
      createdAt: string,
      email: string,
      handledBy?: string | null,
      inquiryId: string,
      inquiryType: InquiryType,
      message: string,
      name: string,
      phone?: string | null,
      status: InquiryStatus,
      subject: string,
      updatedAt: string,
    } >,
    nextToken?: string | null,
  },
};

export type ListHousingRequestsQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
  status?: HousingRequestStatus | null,
};

export type ListHousingRequestsQuery = {
  listHousingRequests:  {
    __typename: "HousingRequestListResponse",
    count: number,
    nextToken?: string | null,
    requests:  Array< {
      __typename: "HousingRequest",
      adminNotes?: string | null,
      assignedAdmin?: string | null,
      bedrooms?: number | null,
      contactName?: string | null,
      createdAt: string,
      currency: string,
      description: string,
      district?: string | null,
      fulfilledPropertyId?: string | null,
      matchedLandlords?: Array< string > | null,
      maxBudget?: number | null,
      minBudget?: number | null,
      moveInDate?: string | null,
      phone: string,
      propertyType?: string | null,
      region?: string | null,
      requestId: string,
      source: HousingRequestSource,
      status: HousingRequestStatus,
      street?: string | null,
      updatedAt: string,
      userId?: string | null,
      ward?: string | null,
    } >,
  },
};

export type ListLandlordPropertiesQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
};

export type ListLandlordPropertiesQuery = {
  listLandlordProperties:  {
    __typename: "PropertyListResponse",
    count: number,
    nextToken?: string | null,
    properties:  Array< {
      __typename: "Property",
      address:  {
        __typename: "Address",
        coordinates?:  {
          __typename: "Coordinates",
          latitude: number,
          longitude: number,
        } | null,
        district: string,
        postalCode?: string | null,
        region: string,
        street?: string | null,
        ward?: string | null,
      },
      agent?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      agentId?: string | null,
      amenities?: Array< string | null > | null,
      availability?:  {
        __typename: "PropertyAvailability",
        available: boolean,
        availableFrom?: string | null,
        maximumLeaseTerm?: number | null,
        minimumLeaseTerm?: number | null,
      } | null,
      createdAt?: string | null,
      description?: string | null,
      googleMapsUrl?: string | null,
      landlord?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      media?:  {
        __typename: "PropertyMedia",
        floorPlan?: string | null,
        images?: Array< string > | null,
        videos?: Array< string > | null,
        virtualTour?: string | null,
      } | null,
      pricing?:  {
        __typename: "PropertyPricing",
        currency: string,
        deposit?: number | null,
        monthlyRent: number,
        serviceCharge?: number | null,
        utilitiesIncluded?: boolean | null,
      } | null,
      propertyId: string,
      propertyType: PropertyType,
      specifications?:  {
        __typename: "PropertySpecifications",
        bathrooms?: number | null,
        bedrooms?: number | null,
        floors?: number | null,
        furnished?: boolean | null,
        parkingSpaces?: number | null,
        squareMeters?: number | null,
      } | null,
      status: PropertyStatus,
      title: string,
      updatedAt?: string | null,
      verified: boolean,
      version?: number | null,
    } >,
  },
};

export type ListLandlordRegistrationsQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
  status?: string | null,
};

export type ListLandlordRegistrationsQuery = {
  listLandlordRegistrations:  {
    __typename: "LandlordRegistrationListResponse",
    count: number,
    nextToken?: string | null,
    registrations:  Array< {
      __typename: "LandlordRegistration",
      adminNotes?: Array< string > | null,
      area?: string | null,
      assignedTo?: string | null,
      createdAt: string,
      name: string,
      notes?: string | null,
      phone: string,
      registrationId: string,
      status: string,
      updatedAt?: string | null,
    } >,
  },
};

export type ListMyApplicationsQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
  status?: ApplicationStatus | null,
};

export type ListMyApplicationsQuery = {
  listMyApplications:  {
    __typename: "ApplicationListResponse",
    applications:  Array< {
      __typename: "Application",
      applicant?:  {
        __typename: "TenantBasicInfo",
        firstName?: string | null,
        lastName?: string | null,
        profileImage?: string | null,
      } | null,
      applicantDetails:  {
        __typename: "ApplicantDetails",
        emergencyContact:  {
          __typename: "EmergencyContact",
          email?: string | null,
          name: string,
          phoneNumber: string,
          relationship: string,
        },
        hasPets: boolean,
        leaseDuration: number,
        monthlyIncome: number,
        moveInDate: string,
        numberOfOccupants: number,
        occupation: string,
        petDetails?: string | null,
        smokingStatus: SmokingStatus,
      },
      applicationId: string,
      createdAt?: string | null,
      landlord?:  {
        __typename: "LandlordBasicInfo",
        businessName?: string | null,
        firstName?: string | null,
        lastName?: string | null,
        profileImage?: string | null,
      } | null,
      landlordNotes?: string | null,
      property?:  {
        __typename: "Property",
        address:  {
          __typename: "Address",
          district: string,
          postalCode?: string | null,
          region: string,
          street?: string | null,
          ward?: string | null,
        },
        agent?:  {
          __typename: "PropertyUser",
          firstName: string,
          lastName: string,
          profileImage?: string | null,
          whatsappNumber?: string | null,
        } | null,
        agentId?: string | null,
        amenities?: Array< string | null > | null,
        availability?:  {
          __typename: "PropertyAvailability",
          available: boolean,
          availableFrom?: string | null,
          maximumLeaseTerm?: number | null,
          minimumLeaseTerm?: number | null,
        } | null,
        createdAt?: string | null,
        description?: string | null,
        googleMapsUrl?: string | null,
        landlord?:  {
          __typename: "PropertyUser",
          firstName: string,
          lastName: string,
          profileImage?: string | null,
          whatsappNumber?: string | null,
        } | null,
        media?:  {
          __typename: "PropertyMedia",
          floorPlan?: string | null,
          images?: Array< string > | null,
          videos?: Array< string > | null,
          virtualTour?: string | null,
        } | null,
        pricing?:  {
          __typename: "PropertyPricing",
          currency: string,
          deposit?: number | null,
          monthlyRent: number,
          serviceCharge?: number | null,
          utilitiesIncluded?: boolean | null,
        } | null,
        propertyId: string,
        propertyType: PropertyType,
        specifications?:  {
          __typename: "PropertySpecifications",
          bathrooms?: number | null,
          bedrooms?: number | null,
          floors?: number | null,
          furnished?: boolean | null,
          parkingSpaces?: number | null,
          squareMeters?: number | null,
        } | null,
        status: PropertyStatus,
        title: string,
        updatedAt?: string | null,
        verified: boolean,
        version?: number | null,
      } | null,
      propertyId: string,
      rejectionReason?: string | null,
      status: ApplicationStatus,
      submittedAt?: string | null,
      updatedAt?: string | null,
    } >,
    count: number,
    nextToken?: string | null,
  },
};

export type ListMyBookingsQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
  status?: BookingStatus | null,
};

export type ListMyBookingsQuery = {
  listMyBookings:  {
    __typename: "BookingListResponse",
    bookings:  Array< {
      __typename: "Booking",
      bookingId: string,
      bookingType: BookingType,
      cancellationReason?: string | null,
      cancelledAt?: string | null,
      checkInDate: string,
      checkOutDate: string,
      completedAt?: string | null,
      confirmedAt?: string | null,
      createdAt: string,
      guest?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      guestEmail?: string | null,
      guestId: string,
      guestName?: string | null,
      guestPhone?: string | null,
      hostNotes?: string | null,
      numberOfAdults: number,
      numberOfChildren: number,
      numberOfGuests: number,
      numberOfInfants: number,
      numberOfNights: number,
      paymentIntentId?: string | null,
      paymentStatus: PaymentStatus,
      pricing:  {
        __typename: "BookingPricing",
        cleaningFee: number,
        currency: string,
        nightlyRate: number,
        numberOfNights: number,
        refundAmount?: number | null,
        refundPercentage?: number | null,
        serviceFee: number,
        subtotal: number,
        taxes: number,
        total: number,
      },
      property?:  {
        __typename: "ShortTermProperty",
        address?:  {
          __typename: "ShortTermAddress",
          city: string,
          country: string,
          district?: string | null,
          postalCode?: string | null,
          region: string,
          street: string,
        } | null,
        advanceBookingDays?: number | null,
        allowsChildren?: boolean | null,
        allowsInfants?: boolean | null,
        allowsPets?: boolean | null,
        allowsSmoking?: boolean | null,
        amenities?: Array< string > | null,
        averageRating?: number | null,
        bathrooms?: number | null,
        bedrooms?: number | null,
        cancellationPolicy?: CancellationPolicy | null,
        checkInInstructions?:  {
          __typename: "CheckInInstructions",
          accessCode?: string | null,
          additionalNotes?: string | null,
          contactName?: string | null,
          contactPhone?: string | null,
          directions?: string | null,
          houseRules?: Array< string > | null,
          parkingInfo?: string | null,
          wifiName?: string | null,
          wifiPassword?: string | null,
        } | null,
        checkInTime?: string | null,
        checkOutTime?: string | null,
        cleaningFee?: number | null,
        coordinates?:  {
          __typename: "Coordinates",
          latitude: number,
          longitude: number,
        } | null,
        createdAt: string,
        currency: string,
        description?: string | null,
        district: string,
        googleMapsUrl?: string | null,
        host?:  {
          __typename: "PropertyUser",
          firstName: string,
          lastName: string,
          profileImage?: string | null,
          whatsappNumber?: string | null,
        } | null,
        hostId: string,
        houseRules?: Array< string > | null,
        images?: Array< string > | null,
        instantBookEnabled?: boolean | null,
        maxAdults?: number | null,
        maxChildren?: number | null,
        maxGuests?: number | null,
        maxInfants?: number | null,
        maximumStay?: number | null,
        minimumStay?: number | null,
        nightlyRate: number,
        propertyId: string,
        propertyType: ShortTermPropertyType,
        publishedAt?: string | null,
        ratingSummary?:  {
          __typename: "PropertyRatingSummary",
          accuracy?: number | null,
          averageRating: number,
          cleanliness?: number | null,
          communication?: number | null,
          fiveStars?: number | null,
          fourStars?: number | null,
          location?: number | null,
          oneStar?: number | null,
          threeStars?: number | null,
          totalReviews: number,
          twoStars?: number | null,
          value?: number | null,
        } | null,
        region: string,
        serviceFeePercentage?: number | null,
        status: PropertyStatus,
        stayCategories?: Array< StayCategory > | null,
        taxPercentage?: number | null,
        thumbnail?: string | null,
        title: string,
        updatedAt: string,
        videos?: Array< string > | null,
      } | null,
      propertyId: string,
      propertySnapshot?:  {
        __typename: "PropertySnapshot",
        address?:  {
          __typename: "PropertySnapshotAddress",
          city?: string | null,
          district?: string | null,
          region?: string | null,
          street?: string | null,
        } | null,
        currency: string,
        images?: Array< string > | null,
        nightlyRate: number,
        propertyType: string,
        thumbnail?: string | null,
        title: string,
      } | null,
      specialRequests?: string | null,
      status: BookingStatus,
      updatedAt: string,
    } >,
    count: number,
    nextToken?: string | null,
  },
};

export type ListMyShortTermPropertiesQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
};

export type ListMyShortTermPropertiesQuery = {
  listMyShortTermProperties:  {
    __typename: "ShortTermPropertyListResponse",
    nextToken?: string | null,
    properties:  Array< {
      __typename: "ShortTermProperty",
      address?:  {
        __typename: "ShortTermAddress",
        city: string,
        country: string,
        district?: string | null,
        postalCode?: string | null,
        region: string,
        street: string,
      } | null,
      advanceBookingDays?: number | null,
      allowsChildren?: boolean | null,
      allowsInfants?: boolean | null,
      allowsPets?: boolean | null,
      allowsSmoking?: boolean | null,
      amenities?: Array< string > | null,
      averageRating?: number | null,
      bathrooms?: number | null,
      bedrooms?: number | null,
      cancellationPolicy?: CancellationPolicy | null,
      checkInInstructions?:  {
        __typename: "CheckInInstructions",
        accessCode?: string | null,
        additionalNotes?: string | null,
        contactName?: string | null,
        contactPhone?: string | null,
        directions?: string | null,
        houseRules?: Array< string > | null,
        parkingInfo?: string | null,
        wifiName?: string | null,
        wifiPassword?: string | null,
      } | null,
      checkInTime?: string | null,
      checkOutTime?: string | null,
      cleaningFee?: number | null,
      coordinates?:  {
        __typename: "Coordinates",
        latitude: number,
        longitude: number,
      } | null,
      createdAt: string,
      currency: string,
      description?: string | null,
      district: string,
      googleMapsUrl?: string | null,
      host?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      hostId: string,
      houseRules?: Array< string > | null,
      images?: Array< string > | null,
      instantBookEnabled?: boolean | null,
      maxAdults?: number | null,
      maxChildren?: number | null,
      maxGuests?: number | null,
      maxInfants?: number | null,
      maximumStay?: number | null,
      minimumStay?: number | null,
      nightlyRate: number,
      propertyId: string,
      propertyType: ShortTermPropertyType,
      publishedAt?: string | null,
      ratingSummary?:  {
        __typename: "PropertyRatingSummary",
        accuracy?: number | null,
        averageRating: number,
        cleanliness?: number | null,
        communication?: number | null,
        fiveStars?: number | null,
        fourStars?: number | null,
        location?: number | null,
        oneStar?: number | null,
        threeStars?: number | null,
        totalReviews: number,
        twoStars?: number | null,
        value?: number | null,
      } | null,
      region: string,
      serviceFeePercentage?: number | null,
      status: PropertyStatus,
      stayCategories?: Array< StayCategory > | null,
      taxPercentage?: number | null,
      thumbnail?: string | null,
      title: string,
      updatedAt: string,
      videos?: Array< string > | null,
    } >,
  },
};

export type ListPropertyApplicationsQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
  propertyId: string,
  status?: ApplicationStatus | null,
};

export type ListPropertyApplicationsQuery = {
  listPropertyApplications:  {
    __typename: "ApplicationListResponse",
    applications:  Array< {
      __typename: "Application",
      applicant?:  {
        __typename: "TenantBasicInfo",
        firstName?: string | null,
        lastName?: string | null,
        profileImage?: string | null,
      } | null,
      applicantDetails:  {
        __typename: "ApplicantDetails",
        emergencyContact:  {
          __typename: "EmergencyContact",
          email?: string | null,
          name: string,
          phoneNumber: string,
          relationship: string,
        },
        hasPets: boolean,
        leaseDuration: number,
        monthlyIncome: number,
        moveInDate: string,
        numberOfOccupants: number,
        occupation: string,
        petDetails?: string | null,
        smokingStatus: SmokingStatus,
      },
      applicationId: string,
      createdAt?: string | null,
      landlord?:  {
        __typename: "LandlordBasicInfo",
        businessName?: string | null,
        firstName?: string | null,
        lastName?: string | null,
        profileImage?: string | null,
      } | null,
      landlordNotes?: string | null,
      property?:  {
        __typename: "Property",
        address:  {
          __typename: "Address",
          district: string,
          postalCode?: string | null,
          region: string,
          street?: string | null,
          ward?: string | null,
        },
        agent?:  {
          __typename: "PropertyUser",
          firstName: string,
          lastName: string,
          profileImage?: string | null,
          whatsappNumber?: string | null,
        } | null,
        agentId?: string | null,
        amenities?: Array< string | null > | null,
        availability?:  {
          __typename: "PropertyAvailability",
          available: boolean,
          availableFrom?: string | null,
          maximumLeaseTerm?: number | null,
          minimumLeaseTerm?: number | null,
        } | null,
        createdAt?: string | null,
        description?: string | null,
        googleMapsUrl?: string | null,
        landlord?:  {
          __typename: "PropertyUser",
          firstName: string,
          lastName: string,
          profileImage?: string | null,
          whatsappNumber?: string | null,
        } | null,
        media?:  {
          __typename: "PropertyMedia",
          floorPlan?: string | null,
          images?: Array< string > | null,
          videos?: Array< string > | null,
          virtualTour?: string | null,
        } | null,
        pricing?:  {
          __typename: "PropertyPricing",
          currency: string,
          deposit?: number | null,
          monthlyRent: number,
          serviceCharge?: number | null,
          utilitiesIncluded?: boolean | null,
        } | null,
        propertyId: string,
        propertyType: PropertyType,
        specifications?:  {
          __typename: "PropertySpecifications",
          bathrooms?: number | null,
          bedrooms?: number | null,
          floors?: number | null,
          furnished?: boolean | null,
          parkingSpaces?: number | null,
          squareMeters?: number | null,
        } | null,
        status: PropertyStatus,
        title: string,
        updatedAt?: string | null,
        verified: boolean,
        version?: number | null,
      } | null,
      propertyId: string,
      rejectionReason?: string | null,
      status: ApplicationStatus,
      submittedAt?: string | null,
      updatedAt?: string | null,
    } >,
    count: number,
    nextToken?: string | null,
  },
};

export type ListPropertyBookingsQueryVariables = {
  endDate?: string | null,
  limit?: number | null,
  nextToken?: string | null,
  propertyId: string,
  startDate?: string | null,
  status?: BookingStatus | null,
};

export type ListPropertyBookingsQuery = {
  listPropertyBookings:  {
    __typename: "BookingListResponse",
    bookings:  Array< {
      __typename: "Booking",
      bookingId: string,
      bookingType: BookingType,
      cancellationReason?: string | null,
      cancelledAt?: string | null,
      checkInDate: string,
      checkOutDate: string,
      completedAt?: string | null,
      confirmedAt?: string | null,
      createdAt: string,
      guest?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      guestEmail?: string | null,
      guestId: string,
      guestName?: string | null,
      guestPhone?: string | null,
      hostNotes?: string | null,
      numberOfAdults: number,
      numberOfChildren: number,
      numberOfGuests: number,
      numberOfInfants: number,
      numberOfNights: number,
      paymentIntentId?: string | null,
      paymentStatus: PaymentStatus,
      pricing:  {
        __typename: "BookingPricing",
        cleaningFee: number,
        currency: string,
        nightlyRate: number,
        numberOfNights: number,
        refundAmount?: number | null,
        refundPercentage?: number | null,
        serviceFee: number,
        subtotal: number,
        taxes: number,
        total: number,
      },
      property?:  {
        __typename: "ShortTermProperty",
        address?:  {
          __typename: "ShortTermAddress",
          city: string,
          country: string,
          district?: string | null,
          postalCode?: string | null,
          region: string,
          street: string,
        } | null,
        advanceBookingDays?: number | null,
        allowsChildren?: boolean | null,
        allowsInfants?: boolean | null,
        allowsPets?: boolean | null,
        allowsSmoking?: boolean | null,
        amenities?: Array< string > | null,
        averageRating?: number | null,
        bathrooms?: number | null,
        bedrooms?: number | null,
        cancellationPolicy?: CancellationPolicy | null,
        checkInInstructions?:  {
          __typename: "CheckInInstructions",
          accessCode?: string | null,
          additionalNotes?: string | null,
          contactName?: string | null,
          contactPhone?: string | null,
          directions?: string | null,
          houseRules?: Array< string > | null,
          parkingInfo?: string | null,
          wifiName?: string | null,
          wifiPassword?: string | null,
        } | null,
        checkInTime?: string | null,
        checkOutTime?: string | null,
        cleaningFee?: number | null,
        coordinates?:  {
          __typename: "Coordinates",
          latitude: number,
          longitude: number,
        } | null,
        createdAt: string,
        currency: string,
        description?: string | null,
        district: string,
        googleMapsUrl?: string | null,
        host?:  {
          __typename: "PropertyUser",
          firstName: string,
          lastName: string,
          profileImage?: string | null,
          whatsappNumber?: string | null,
        } | null,
        hostId: string,
        houseRules?: Array< string > | null,
        images?: Array< string > | null,
        instantBookEnabled?: boolean | null,
        maxAdults?: number | null,
        maxChildren?: number | null,
        maxGuests?: number | null,
        maxInfants?: number | null,
        maximumStay?: number | null,
        minimumStay?: number | null,
        nightlyRate: number,
        propertyId: string,
        propertyType: ShortTermPropertyType,
        publishedAt?: string | null,
        ratingSummary?:  {
          __typename: "PropertyRatingSummary",
          accuracy?: number | null,
          averageRating: number,
          cleanliness?: number | null,
          communication?: number | null,
          fiveStars?: number | null,
          fourStars?: number | null,
          location?: number | null,
          oneStar?: number | null,
          threeStars?: number | null,
          totalReviews: number,
          twoStars?: number | null,
          value?: number | null,
        } | null,
        region: string,
        serviceFeePercentage?: number | null,
        status: PropertyStatus,
        stayCategories?: Array< StayCategory > | null,
        taxPercentage?: number | null,
        thumbnail?: string | null,
        title: string,
        updatedAt: string,
        videos?: Array< string > | null,
      } | null,
      propertyId: string,
      propertySnapshot?:  {
        __typename: "PropertySnapshot",
        address?:  {
          __typename: "PropertySnapshotAddress",
          city?: string | null,
          district?: string | null,
          region?: string | null,
          street?: string | null,
        } | null,
        currency: string,
        images?: Array< string > | null,
        nightlyRate: number,
        propertyType: string,
        thumbnail?: string | null,
        title: string,
      } | null,
      specialRequests?: string | null,
      status: BookingStatus,
      updatedAt: string,
    } >,
    count: number,
    nextToken?: string | null,
  },
};

export type ListPropertyOwnersQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
};

export type ListPropertyOwnersQuery = {
  listPropertyOwners:  {
    __typename: "LandlordProfileListResponse",
    count: number,
    landlords:  Array< {
      __typename: "LandlordProfile",
      businessName?: string | null,
      createdAt?: string | null,
      currency?: string | null,
      district?: string | null,
      firstName?: string | null,
      lastName?: string | null,
      maxPrice?: number | null,
      minPrice?: number | null,
      operatingDistricts: Array< string >,
      operatingRegions: Array< string >,
      phoneNumber?: string | null,
      profileImage?: string | null,
      propertyCount: number,
      propertyTypes: Array< string >,
      region?: string | null,
      userId: string,
      ward?: string | null,
      whatsappNumber?: string | null,
    } >,
    nextToken?: string | null,
  },
};

export type ListReferralSubmissionsQueryVariables = {
  limit?: number | null,
  nextToken?: string | null,
  status?: string | null,
};

export type ListReferralSubmissionsQuery = {
  listReferralSubmissions:  {
    __typename: "ReferralSubmissionListResponse",
    count: number,
    nextToken?: string | null,
    submissions:  Array< {
      __typename: "ReferralSubmission",
      adminNotes?: Array< string > | null,
      assignedTo?: string | null,
      createdAt: string,
      landlordArea: string,
      landlordName: string,
      landlordNotes?: string | null,
      landlordPhone: string,
      listingRewardStatus: string,
      profitShareRewardStatus: string,
      referralId: string,
      referrerName: string,
      referrerNida?: string | null,
      referrerPhone: string,
      status: string,
      updatedAt?: string | null,
    } >,
  },
};

export type ListWhatsAppConversationsQueryVariables = {
  limit?: number | null,
};

export type ListWhatsAppConversationsQuery = {
  listWhatsAppConversations:  Array< {
    __typename: "WhatsAppConversationRow",
    contactName?: string | null,
    createdAt: string,
    lang?: string | null,
    lastMessageAt: string,
    phoneNumber: string,
    step: string,
  } >,
};

export type QueryPaymentStatusQueryVariables = {
  paymentId: string,
};

export type QueryPaymentStatusQuery = {
  queryPaymentStatus:  {
    __typename: "Payment",
    amount: number,
    bookingId: string,
    completedAt?: string | null,
    conversationID?: string | null,
    createdAt: string,
    currency: string,
    customerEmail?: string | null,
    customerPhone?: string | null,
    errorMessage?: string | null,
    paymentId: string,
    provider: PaymentProvider,
    refundAmount?: number | null,
    refundReason?: string | null,
    refundedAt?: string | null,
    status: PaymentStatus,
    thirdPartyConversationID: string,
    transactionID?: string | null,
    updatedAt: string,
  },
};

export type SearchChatUsersQueryVariables = {
  district?: string | null,
  limit?: number | null,
  query: string,
  region?: string | null,
  source?: string | null,
};

export type SearchChatUsersQuery = {
  searchChatUsers:  Array< {
    __typename: "ChatUser",
    businessName?: string | null,
    firstName: string,
    lastName: string,
    profileImage?: string | null,
    userId: string,
    userType: UserType,
  } >,
};

export type SearchLandlordProfilesQueryVariables = {
  district?: string | null,
  limit?: number | null,
  nextToken?: string | null,
  propertyType?: string | null,
  region?: string | null,
};

export type SearchLandlordProfilesQuery = {
  searchLandlordProfiles:  {
    __typename: "LandlordProfileListResponse",
    count: number,
    landlords:  Array< {
      __typename: "LandlordProfile",
      businessName?: string | null,
      createdAt?: string | null,
      currency?: string | null,
      district?: string | null,
      firstName?: string | null,
      lastName?: string | null,
      maxPrice?: number | null,
      minPrice?: number | null,
      operatingDistricts: Array< string >,
      operatingRegions: Array< string >,
      phoneNumber?: string | null,
      profileImage?: string | null,
      propertyCount: number,
      propertyTypes: Array< string >,
      region?: string | null,
      userId: string,
      ward?: string | null,
      whatsappNumber?: string | null,
    } >,
    nextToken?: string | null,
  },
};

export type SearchShortTermPropertiesQueryVariables = {
  input: ShortTermSearchInput,
};

export type SearchShortTermPropertiesQuery = {
  searchShortTermProperties:  {
    __typename: "ShortTermPropertyListResponse",
    nextToken?: string | null,
    properties:  Array< {
      __typename: "ShortTermProperty",
      address?:  {
        __typename: "ShortTermAddress",
        city: string,
        country: string,
        district?: string | null,
        postalCode?: string | null,
        region: string,
        street: string,
      } | null,
      advanceBookingDays?: number | null,
      allowsChildren?: boolean | null,
      allowsInfants?: boolean | null,
      allowsPets?: boolean | null,
      allowsSmoking?: boolean | null,
      amenities?: Array< string > | null,
      averageRating?: number | null,
      bathrooms?: number | null,
      bedrooms?: number | null,
      cancellationPolicy?: CancellationPolicy | null,
      checkInInstructions?:  {
        __typename: "CheckInInstructions",
        accessCode?: string | null,
        additionalNotes?: string | null,
        contactName?: string | null,
        contactPhone?: string | null,
        directions?: string | null,
        houseRules?: Array< string > | null,
        parkingInfo?: string | null,
        wifiName?: string | null,
        wifiPassword?: string | null,
      } | null,
      checkInTime?: string | null,
      checkOutTime?: string | null,
      cleaningFee?: number | null,
      coordinates?:  {
        __typename: "Coordinates",
        latitude: number,
        longitude: number,
      } | null,
      createdAt: string,
      currency: string,
      description?: string | null,
      district: string,
      googleMapsUrl?: string | null,
      host?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      hostId: string,
      houseRules?: Array< string > | null,
      images?: Array< string > | null,
      instantBookEnabled?: boolean | null,
      maxAdults?: number | null,
      maxChildren?: number | null,
      maxGuests?: number | null,
      maxInfants?: number | null,
      maximumStay?: number | null,
      minimumStay?: number | null,
      nightlyRate: number,
      propertyId: string,
      propertyType: ShortTermPropertyType,
      publishedAt?: string | null,
      ratingSummary?:  {
        __typename: "PropertyRatingSummary",
        accuracy?: number | null,
        averageRating: number,
        cleanliness?: number | null,
        communication?: number | null,
        fiveStars?: number | null,
        fourStars?: number | null,
        location?: number | null,
        oneStar?: number | null,
        threeStars?: number | null,
        totalReviews: number,
        twoStars?: number | null,
        value?: number | null,
      } | null,
      region: string,
      serviceFeePercentage?: number | null,
      status: PropertyStatus,
      stayCategories?: Array< StayCategory > | null,
      taxPercentage?: number | null,
      thumbnail?: string | null,
      title: string,
      updatedAt: string,
      videos?: Array< string > | null,
    } >,
  },
};

export type DummySubscriptionSubscriptionVariables = {
};

export type DummySubscriptionSubscription = {
  dummySubscription?: string | null,
};

export type OnNewMessageSubscriptionVariables = {
  conversationId: string,
};

export type OnNewMessageSubscription = {
  onNewMessage?:  {
    __typename: "ChatMessage",
    content: string,
    conversationId: string,
    id: string,
    isMine: boolean,
    isRead: boolean,
    senderId?: string | null,
    senderName: string,
    timestamp: string,
  } | null,
};

export type OnNewPropertyInRegionSubscriptionVariables = {
  region: string,
};

export type OnNewPropertyInRegionSubscription = {
  onNewPropertyInRegion?:  {
    __typename: "SubscriptionPublishResponse",
    message?: string | null,
    propertyId?: string | null,
    success: boolean,
  } | null,
};

export type OnPropertyUpdatedSubscriptionVariables = {
  propertyId: string,
};

export type OnPropertyUpdatedSubscription = {
  onPropertyUpdated?:  {
    __typename: "PropertyUpdateEvent",
    changes:  Array< {
      __typename: "PropertyChange",
      field: string,
      newValue: string,
      oldValue?: string | null,
    } >,
    eventType: PropertyEventType,
    property:  {
      __typename: "Property",
      address:  {
        __typename: "Address",
        coordinates?:  {
          __typename: "Coordinates",
          latitude: number,
          longitude: number,
        } | null,
        district: string,
        postalCode?: string | null,
        region: string,
        street?: string | null,
        ward?: string | null,
      },
      agent?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      agentId?: string | null,
      amenities?: Array< string | null > | null,
      availability?:  {
        __typename: "PropertyAvailability",
        available: boolean,
        availableFrom?: string | null,
        maximumLeaseTerm?: number | null,
        minimumLeaseTerm?: number | null,
      } | null,
      createdAt?: string | null,
      description?: string | null,
      googleMapsUrl?: string | null,
      landlord?:  {
        __typename: "PropertyUser",
        firstName: string,
        lastName: string,
        profileImage?: string | null,
        whatsappNumber?: string | null,
      } | null,
      media?:  {
        __typename: "PropertyMedia",
        floorPlan?: string | null,
        images?: Array< string > | null,
        videos?: Array< string > | null,
        virtualTour?: string | null,
      } | null,
      pricing?:  {
        __typename: "PropertyPricing",
        currency: string,
        deposit?: number | null,
        monthlyRent: number,
        serviceCharge?: number | null,
        utilitiesIncluded?: boolean | null,
      } | null,
      propertyId: string,
      propertyType: PropertyType,
      specifications?:  {
        __typename: "PropertySpecifications",
        bathrooms?: number | null,
        bedrooms?: number | null,
        floors?: number | null,
        furnished?: boolean | null,
        parkingSpaces?: number | null,
        squareMeters?: number | null,
      } | null,
      status: PropertyStatus,
      title: string,
      updatedAt?: string | null,
      verified: boolean,
      version?: number | null,
    },
    propertyId: string,
    timestamp: string,
  } | null,
};
