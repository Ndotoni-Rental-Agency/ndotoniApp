/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const _empty = /* GraphQL */ `query _empty {
  _empty
}
` as GeneratedQuery<APITypes._emptyQueryVariables, APITypes._emptyQuery>;
export const calculateBookingPrice = /* GraphQL */ `query CalculateBookingPrice(
  $checkInDate: AWSDate!
  $checkOutDate: AWSDate!
  $numberOfGuests: Int!
  $propertyId: ID!
) {
  calculateBookingPrice(
    checkInDate: $checkInDate
    checkOutDate: $checkOutDate
    numberOfGuests: $numberOfGuests
    propertyId: $propertyId
  ) {
    cleaningFee
    currency
    nightlyRate
    numberOfNights
    refundAmount
    refundPercentage
    serviceFee
    subtotal
    taxes
    total
    __typename
  }
}
` as GeneratedQuery<
  APITypes.CalculateBookingPriceQueryVariables,
  APITypes.CalculateBookingPriceQuery
>;
export const checkAvailability = /* GraphQL */ `query CheckAvailability(
  $checkInDate: AWSDate!
  $checkOutDate: AWSDate!
  $propertyId: ID!
) {
  checkAvailability(
    checkInDate: $checkInDate
    checkOutDate: $checkOutDate
    propertyId: $propertyId
  ) {
    available
    endDate
    propertyId
    startDate
    unavailableDates
    __typename
  }
}
` as GeneratedQuery<
  APITypes.CheckAvailabilityQueryVariables,
  APITypes.CheckAvailabilityQuery
>;
export const checkListingEntitlement = /* GraphQL */ `query CheckListingEntitlement {
  checkListingEntitlement {
    activePlan
    canList
    freeListingsRemaining
    message
    __typename
  }
}
` as GeneratedQuery<
  APITypes.CheckListingEntitlementQueryVariables,
  APITypes.CheckListingEntitlementQuery
>;
export const checkPhoneEntitlement = /* GraphQL */ `query CheckPhoneEntitlement($phoneNumber: String!) {
  checkPhoneEntitlement(phoneNumber: $phoneNumber) {
    activePlan
    canList
    freeListingsRemaining
    message
    __typename
  }
}
` as GeneratedQuery<
  APITypes.CheckPhoneEntitlementQueryVariables,
  APITypes.CheckPhoneEntitlementQuery
>;
export const dummyQuery = /* GraphQL */ `query DummyQuery {
  dummyQuery
}
` as GeneratedQuery<
  APITypes.DummyQueryQueryVariables,
  APITypes.DummyQueryQuery
>;
export const getAdminApplicationStats = /* GraphQL */ `query GetAdminApplicationStats {
  getAdminApplicationStats {
    approved
    rejected
    submitted
    total
    underReview
    withdrawn
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAdminApplicationStatsQueryVariables,
  APITypes.GetAdminApplicationStatsQuery
>;
export const getAdminPropertyStats = /* GraphQL */ `query GetAdminPropertyStats {
  getAdminPropertyStats {
    availableProperties
    deletedProperties
    draftProperties
    maintenanceProperties
    newPropertiesThisMonth
    newPropertiesThisWeek
    rentedProperties
    totalProperties
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAdminPropertyStatsQueryVariables,
  APITypes.GetAdminPropertyStatsQuery
>;
export const getApplication = /* GraphQL */ `query GetApplication($applicationId: ID!) {
  getApplication(applicationId: $applicationId) {
    applicant {
      firstName
      lastName
      profileImage
      __typename
    }
    applicantDetails {
      emergencyContact {
        email
        name
        phoneNumber
        relationship
        __typename
      }
      hasPets
      leaseDuration
      monthlyIncome
      moveInDate
      numberOfOccupants
      occupation
      petDetails
      smokingStatus
      __typename
    }
    applicationId
    createdAt
    landlord {
      businessName
      firstName
      lastName
      profileImage
      __typename
    }
    landlordNotes
    property {
      address {
        coordinates {
          latitude
          longitude
          __typename
        }
        district
        postalCode
        region
        street
        ward
        __typename
      }
      agent {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      agentId
      amenities
      availability {
        available
        availableFrom
        maximumLeaseTerm
        minimumLeaseTerm
        __typename
      }
      createdAt
      description
      googleMapsUrl
      landlord {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      media {
        floorPlan
        images
        videos
        virtualTour
        __typename
      }
      pricing {
        currency
        deposit
        monthlyRent
        serviceCharge
        utilitiesIncluded
        __typename
      }
      propertyId
      propertyType
      specifications {
        bathrooms
        bedrooms
        floors
        furnished
        parkingSpaces
        squareMeters
        __typename
      }
      status
      title
      updatedAt
      verified
      version
      __typename
    }
    propertyId
    rejectionReason
    status
    submittedAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetApplicationQueryVariables,
  APITypes.GetApplicationQuery
>;
export const getApplicationDocumentUploadUrl = /* GraphQL */ `query GetApplicationDocumentUploadUrl(
  $applicationId: ID!
  $fileName: String!
  $fileType: String!
) {
  getApplicationDocumentUploadUrl(
    applicationId: $applicationId
    fileName: $fileName
    fileType: $fileType
  ) {
    fileUrl
    key
    uploadUrl
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetApplicationDocumentUploadUrlQueryVariables,
  APITypes.GetApplicationDocumentUploadUrlQuery
>;
export const getApplicationStats = /* GraphQL */ `query GetApplicationStats($landlordId: ID!) {
  getApplicationStats(landlordId: $landlordId) {
    approved
    rejected
    submitted
    total
    underReview
    withdrawn
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetApplicationStatsQueryVariables,
  APITypes.GetApplicationStatsQuery
>;
export const getBlockedDates = /* GraphQL */ `query GetBlockedDates(
  $endDate: AWSDate
  $propertyId: ID!
  $startDate: AWSDate
) {
  getBlockedDates(
    endDate: $endDate
    propertyId: $propertyId
    startDate: $startDate
  ) {
    blockedRanges {
      endDate
      reason
      startDate
      __typename
    }
    propertyId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetBlockedDatesQueryVariables,
  APITypes.GetBlockedDatesQuery
>;
export const getBooking = /* GraphQL */ `query GetBooking($bookingId: ID!) {
  getBooking(bookingId: $bookingId) {
    bookingId
    bookingType
    cancellationReason
    cancelledAt
    checkInDate
    checkOutDate
    completedAt
    confirmedAt
    createdAt
    guest {
      firstName
      lastName
      profileImage
      whatsappNumber
      __typename
    }
    guestEmail
    guestId
    guestName
    guestPhone
    hostNotes
    numberOfAdults
    numberOfChildren
    numberOfGuests
    numberOfInfants
    numberOfNights
    paymentIntentId
    paymentStatus
    pricing {
      cleaningFee
      currency
      nightlyRate
      numberOfNights
      refundAmount
      refundPercentage
      serviceFee
      subtotal
      taxes
      total
      __typename
    }
    property {
      address {
        city
        country
        district
        postalCode
        region
        street
        __typename
      }
      advanceBookingDays
      allowsChildren
      allowsInfants
      allowsPets
      allowsSmoking
      amenities
      averageRating
      bathrooms
      bedrooms
      cancellationPolicy
      checkInInstructions {
        accessCode
        additionalNotes
        contactName
        contactPhone
        directions
        houseRules
        parkingInfo
        wifiName
        wifiPassword
        __typename
      }
      checkInTime
      checkOutTime
      cleaningFee
      coordinates {
        latitude
        longitude
        __typename
      }
      createdAt
      currency
      description
      district
      googleMapsUrl
      host {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      hostId
      houseRules
      images
      instantBookEnabled
      maxAdults
      maxChildren
      maxGuests
      maxInfants
      maximumStay
      minimumStay
      nightlyRate
      propertyId
      propertyType
      publishedAt
      ratingSummary {
        accuracy
        averageRating
        cleanliness
        communication
        fiveStars
        fourStars
        location
        oneStar
        threeStars
        totalReviews
        twoStars
        value
        __typename
      }
      region
      serviceFeePercentage
      status
      stayCategories
      taxPercentage
      thumbnail
      title
      updatedAt
      videos
      __typename
    }
    propertyId
    propertySnapshot {
      address {
        city
        district
        region
        street
        __typename
      }
      currency
      images
      nightlyRate
      propertyType
      thumbnail
      title
      __typename
    }
    specialRequests
    status
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetBookingQueryVariables,
  APITypes.GetBookingQuery
>;
export const getBookingPayments = /* GraphQL */ `query GetBookingPayments($bookingId: ID!) {
  getBookingPayments(bookingId: $bookingId) {
    amount
    bookingId
    completedAt
    conversationID
    createdAt
    currency
    customerEmail
    customerPhone
    errorMessage
    paymentId
    provider
    refundAmount
    refundReason
    refundedAt
    status
    thirdPartyConversationID
    transactionID
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetBookingPaymentsQueryVariables,
  APITypes.GetBookingPaymentsQuery
>;
export const getCategorizedProperties = /* GraphQL */ `query GetCategorizedProperties($limitPerCategory: Int) {
  getCategorizedProperties(limitPerCategory: $limitPerCategory) {
    favorites {
      category
      count
      nextToken
      properties {
        bedrooms
        currency
        district
        monthlyRent
        propertyId
        propertyType
        region
        thumbnail
        title
        verified
        __typename
      }
      __typename
    }
    lowestPrice {
      category
      count
      nextToken
      properties {
        bedrooms
        currency
        district
        monthlyRent
        propertyId
        propertyType
        region
        thumbnail
        title
        verified
        __typename
      }
      __typename
    }
    more {
      category
      count
      nextToken
      properties {
        bedrooms
        currency
        district
        monthlyRent
        propertyId
        propertyType
        region
        thumbnail
        title
        verified
        __typename
      }
      __typename
    }
    mostViewed {
      category
      count
      nextToken
      properties {
        bedrooms
        currency
        district
        monthlyRent
        propertyId
        propertyType
        region
        thumbnail
        title
        verified
        __typename
      }
      __typename
    }
    nearby {
      category
      count
      nextToken
      properties {
        bedrooms
        currency
        district
        monthlyRent
        propertyId
        propertyType
        region
        thumbnail
        title
        verified
        __typename
      }
      __typename
    }
    recentlyViewed {
      category
      count
      nextToken
      properties {
        bedrooms
        currency
        district
        monthlyRent
        propertyId
        propertyType
        region
        thumbnail
        title
        verified
        __typename
      }
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCategorizedPropertiesQueryVariables,
  APITypes.GetCategorizedPropertiesQuery
>;
export const getContactInquiry = /* GraphQL */ `query GetContactInquiry($inquiryId: ID!) {
  getContactInquiry(inquiryId: $inquiryId) {
    adminNotes
    createdAt
    email
    handledBy
    inquiryId
    inquiryType
    message
    name
    phone
    status
    subject
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetContactInquiryQueryVariables,
  APITypes.GetContactInquiryQuery
>;
export const getContactInquiryStats = /* GraphQL */ `query GetContactInquiryStats {
  getContactInquiryStats {
    byType {
      count
      type
      __typename
    }
    inProgress
    pending
    resolved
    total
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetContactInquiryStatsQueryVariables,
  APITypes.GetContactInquiryStatsQuery
>;
export const getConversationMessages = /* GraphQL */ `query GetConversationMessages($conversationId: String!) {
  getConversationMessages(conversationId: $conversationId) {
    content
    conversationId
    id
    isMine
    isRead
    senderId
    senderName
    timestamp
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetConversationMessagesQueryVariables,
  APITypes.GetConversationMessagesQuery
>;
export const getDistricts = /* GraphQL */ `query GetDistricts($regionId: ID!) {
  getDistricts(regionId: $regionId) {
    id
    name
    regionId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetDistrictsQueryVariables,
  APITypes.GetDistrictsQuery
>;
export const getHousingRequest = /* GraphQL */ `query GetHousingRequest($createdAt: String!, $requestId: ID!) {
  getHousingRequest(createdAt: $createdAt, requestId: $requestId) {
    adminNotes
    assignedAdmin
    bedrooms
    contactName
    createdAt
    currency
    description
    district
    fulfilledPropertyId
    matchedLandlords
    maxBudget
    minBudget
    moveInDate
    phone
    propertyType
    region
    requestId
    source
    status
    street
    updatedAt
    userId
    ward
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetHousingRequestQueryVariables,
  APITypes.GetHousingRequestQuery
>;
export const getInitialAppState = /* GraphQL */ `query GetInitialAppState($limitPerCategory: Int) {
  getInitialAppState(limitPerCategory: $limitPerCategory) {
    categorizedProperties {
      favorites {
        category
        count
        nextToken
        properties {
          bedrooms
          currency
          district
          monthlyRent
          propertyId
          propertyType
          region
          thumbnail
          title
          verified
          __typename
        }
        __typename
      }
      lowestPrice {
        category
        count
        nextToken
        properties {
          bedrooms
          currency
          district
          monthlyRent
          propertyId
          propertyType
          region
          thumbnail
          title
          verified
          __typename
        }
        __typename
      }
      more {
        category
        count
        nextToken
        properties {
          bedrooms
          currency
          district
          monthlyRent
          propertyId
          propertyType
          region
          thumbnail
          title
          verified
          __typename
        }
        __typename
      }
      mostViewed {
        category
        count
        nextToken
        properties {
          bedrooms
          currency
          district
          monthlyRent
          propertyId
          propertyType
          region
          thumbnail
          title
          verified
          __typename
        }
        __typename
      }
      nearby {
        category
        count
        nextToken
        properties {
          bedrooms
          currency
          district
          monthlyRent
          propertyId
          propertyType
          region
          thumbnail
          title
          verified
          __typename
        }
        __typename
      }
      recentlyViewed {
        category
        count
        nextToken
        properties {
          bedrooms
          currency
          district
          monthlyRent
          propertyId
          propertyType
          region
          thumbnail
          title
          verified
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetInitialAppStateQueryVariables,
  APITypes.GetInitialAppStateQuery
>;
export const getInitialAppStateFast = /* GraphQL */ `query GetInitialAppStateFast($limitPerCategory: Int) {
  getInitialAppStateFast(limitPerCategory: $limitPerCategory) {
    categorizedProperties {
      favorites {
        category
        count
        nextToken
        properties {
          bedrooms
          currency
          district
          monthlyRent
          propertyId
          propertyType
          region
          thumbnail
          title
          verified
          __typename
        }
        __typename
      }
      lowestPrice {
        category
        count
        nextToken
        properties {
          bedrooms
          currency
          district
          monthlyRent
          propertyId
          propertyType
          region
          thumbnail
          title
          verified
          __typename
        }
        __typename
      }
      more {
        category
        count
        nextToken
        properties {
          bedrooms
          currency
          district
          monthlyRent
          propertyId
          propertyType
          region
          thumbnail
          title
          verified
          __typename
        }
        __typename
      }
      mostViewed {
        category
        count
        nextToken
        properties {
          bedrooms
          currency
          district
          monthlyRent
          propertyId
          propertyType
          region
          thumbnail
          title
          verified
          __typename
        }
        __typename
      }
      nearby {
        category
        count
        nextToken
        properties {
          bedrooms
          currency
          district
          monthlyRent
          propertyId
          propertyType
          region
          thumbnail
          title
          verified
          __typename
        }
        __typename
      }
      recentlyViewed {
        category
        count
        nextToken
        properties {
          bedrooms
          currency
          district
          monthlyRent
          propertyId
          propertyType
          region
          thumbnail
          title
          verified
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetInitialAppStateFastQueryVariables,
  APITypes.GetInitialAppStateFastQuery
>;
export const getLandlordApplication = /* GraphQL */ `query GetLandlordApplication($applicationId: ID!) {
  getLandlordApplication(applicationId: $applicationId) {
    address
    adminNotes
    alternatePhone
    applicant {
      firstName
      lastName
      profileImage
      __typename
    }
    applicationId
    birthDate
    createdAt
    nationalId
    phoneNumber
    rejectionReason
    reviewedAt
    status
    submittedAt
    updatedAt
    userId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetLandlordApplicationQueryVariables,
  APITypes.GetLandlordApplicationQuery
>;
export const getLandlordApplicationStats = /* GraphQL */ `query GetLandlordApplicationStats {
  getLandlordApplicationStats {
    approved
    pending
    rejected
    total
    underReview
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetLandlordApplicationStatsQueryVariables,
  APITypes.GetLandlordApplicationStatsQuery
>;
export const getLandlordPropertiesInfo = /* GraphQL */ `query GetLandlordPropertiesInfo(
  $limit: Int
  $nextToken: String
  $phone: String!
) {
  getLandlordPropertiesInfo(
    limit: $limit
    nextToken: $nextToken
    phone: $phone
  ) {
    count
    landlord {
      businessName
      createdAt
      district
      email
      firstName
      lastName
      phoneNumber
      profileImage
      region
      whatsappNumber
      __typename
    }
    nextToken
    properties {
      address {
        coordinates {
          latitude
          longitude
          __typename
        }
        district
        postalCode
        region
        street
        ward
        __typename
      }
      agent {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      agentId
      amenities
      availability {
        available
        availableFrom
        maximumLeaseTerm
        minimumLeaseTerm
        __typename
      }
      createdAt
      description
      googleMapsUrl
      landlord {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      media {
        floorPlan
        images
        videos
        virtualTour
        __typename
      }
      pricing {
        currency
        deposit
        monthlyRent
        serviceCharge
        utilitiesIncluded
        __typename
      }
      propertyId
      propertyType
      specifications {
        bathrooms
        bedrooms
        floors
        furnished
        parkingSpaces
        squareMeters
        __typename
      }
      status
      title
      updatedAt
      verified
      version
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetLandlordPropertiesInfoQueryVariables,
  APITypes.GetLandlordPropertiesInfoQuery
>;
export const getLandlordRegistration = /* GraphQL */ `query GetLandlordRegistration($createdAt: String!, $registrationId: ID!) {
  getLandlordRegistration(
    createdAt: $createdAt
    registrationId: $registrationId
  ) {
    adminNotes
    area
    assignedTo
    createdAt
    name
    notes
    phone
    registrationId
    status
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetLandlordRegistrationQueryVariables,
  APITypes.GetLandlordRegistrationQuery
>;
export const getMe = /* GraphQL */ `query GetMe {
  getMe {
    ... on Admin {
      accountStatus
      address
      city
      createdAt
      currency
      dateOfBirth
      district
      email
      emailNotifications
      emergencyContactName
      emergencyContactPhone
      firstName
      gender
      hasProperties
      isEmailVerified
      language
      lastName
      nationalIdLast4
      occupation
      payoutBankAccountName
      payoutBankAccountNumber
      payoutBankBranch
      payoutBankName
      payoutMethod
      payoutMpesaName
      payoutMpesaPhone
      permissions
      phoneNumber
      profileImage
      pushNotifications
      region
      smsNotifications
      street
      updatedAt
      userType
      ward
      whatsappNumber
    }
    ... on Agent {
      accountStatus
      address
      agencyName
      city
      createdAt
      currency
      dateOfBirth
      district
      email
      emailNotifications
      emergencyContactName
      emergencyContactPhone
      firstName
      gender
      hasProperties
      isEmailVerified
      language
      lastName
      licenseNumber
      nationalIdLast4
      occupation
      phoneNumber
      profileImage
      pushNotifications
      region
      smsNotifications
      specializations
      street
      updatedAt
      userType
      ward
      whatsappNumber
    }
    ... on Landlord {
      accountStatus
      address
      businessLicense
      businessName
      city
      createdAt
      currency
      dateOfBirth
      district
      email
      emailNotifications
      emergencyContactName
      emergencyContactPhone
      firstName
      gender
      hasProperties
      isEmailVerified
      language
      lastName
      nationalIdLast4
      occupation
      payoutBankAccountName
      payoutBankAccountNumber
      payoutBankBranch
      payoutBankName
      payoutMethod
      payoutMpesaName
      payoutMpesaPhone
      phoneNumber
      profileImage
      pushNotifications
      region
      smsNotifications
      street
      taxId
      updatedAt
      userType
      verificationDocuments
      ward
      whatsappNumber
    }
    ... on Tenant {
      accountStatus
      address
      city
      createdAt
      currency
      dateOfBirth
      district
      email
      emailNotifications
      emergencyContactName
      emergencyContactPhone
      firstName
      gender
      hasProperties
      isEmailVerified
      language
      lastName
      nationalIdLast4
      occupation
      payoutBankAccountName
      payoutBankAccountNumber
      payoutBankBranch
      payoutBankName
      payoutMethod
      payoutMpesaName
      payoutMpesaPhone
      phoneNumber
      profileImage
      pushNotifications
      region
      smsNotifications
      street
      updatedAt
      userType
      ward
      whatsappNumber
    }
  }
}
` as GeneratedQuery<APITypes.GetMeQueryVariables, APITypes.GetMeQuery>;
export const getMediaLibrary = /* GraphQL */ `query GetMediaLibrary {
  getMediaLibrary {
    actionTime
    additionalFiles {
      contentType
      fileName
      fileUrl
      __typename
    }
    media {
      floorPlan
      images
      videos
      virtualTour
      __typename
    }
    userId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetMediaLibraryQueryVariables,
  APITypes.GetMediaLibraryQuery
>;
export const getMyBusyBlocks = /* GraphQL */ `query GetMyBusyBlocks {
  getMyBusyBlocks {
    createdAt
    endUtc
    id
    recurrence {
      days
      endDate
      type
      __typename
    }
    startUtc
    title
    userId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetMyBusyBlocksQueryVariables,
  APITypes.GetMyBusyBlocksQuery
>;
export const getMyLandlordApplication = /* GraphQL */ `query GetMyLandlordApplication {
  getMyLandlordApplication {
    address
    adminNotes
    alternatePhone
    applicant {
      firstName
      lastName
      profileImage
      __typename
    }
    applicationId
    birthDate
    createdAt
    nationalId
    phoneNumber
    rejectionReason
    reviewedAt
    status
    submittedAt
    updatedAt
    userId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetMyLandlordApplicationQueryVariables,
  APITypes.GetMyLandlordApplicationQuery
>;
export const getPayment = /* GraphQL */ `query GetPayment($paymentId: ID!) {
  getPayment(paymentId: $paymentId) {
    amount
    bookingId
    completedAt
    conversationID
    createdAt
    currency
    customerEmail
    customerPhone
    errorMessage
    paymentId
    provider
    refundAmount
    refundReason
    refundedAt
    status
    thirdPartyConversationID
    transactionID
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetPaymentQueryVariables,
  APITypes.GetPaymentQuery
>;
export const getPropertiesByCategory = /* GraphQL */ `query GetPropertiesByCategory(
  $category: PropertyCategory!
  $limit: Int
  $nextToken: String
) {
  getPropertiesByCategory(
    category: $category
    limit: $limit
    nextToken: $nextToken
  ) {
    category
    count
    nextToken
    properties {
      bedrooms
      currency
      district
      monthlyRent
      propertyId
      propertyType
      region
      thumbnail
      title
      verified
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetPropertiesByCategoryQueryVariables,
  APITypes.GetPropertiesByCategoryQuery
>;
export const getPropertiesByLocation = /* GraphQL */ `query GetPropertiesByLocation(
  $bathrooms: Int
  $bedrooms: Int
  $district: String
  $limit: Int
  $maxPrice: Float
  $minPrice: Float
  $moveInDate: AWSDate
  $nextToken: String
  $propertyType: PropertyType
  $region: String!
  $sortBy: PropertySortOption
) {
  getPropertiesByLocation(
    bathrooms: $bathrooms
    bedrooms: $bedrooms
    district: $district
    limit: $limit
    maxPrice: $maxPrice
    minPrice: $minPrice
    moveInDate: $moveInDate
    nextToken: $nextToken
    propertyType: $propertyType
    region: $region
    sortBy: $sortBy
  ) {
    count
    nextToken
    properties {
      bedrooms
      currency
      district
      monthlyRent
      propertyId
      propertyType
      region
      thumbnail
      title
      verified
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetPropertiesByLocationQueryVariables,
  APITypes.GetPropertiesByLocationQuery
>;
export const getProperty = /* GraphQL */ `query GetProperty($propertyId: ID!) {
  getProperty(propertyId: $propertyId) {
    address {
      coordinates {
        latitude
        longitude
        __typename
      }
      district
      postalCode
      region
      street
      ward
      __typename
    }
    agent {
      firstName
      lastName
      profileImage
      whatsappNumber
      __typename
    }
    agentId
    amenities
    availability {
      available
      availableFrom
      maximumLeaseTerm
      minimumLeaseTerm
      __typename
    }
    createdAt
    description
    googleMapsUrl
    landlord {
      firstName
      lastName
      profileImage
      whatsappNumber
      __typename
    }
    media {
      floorPlan
      images
      videos
      virtualTour
      __typename
    }
    pricing {
      currency
      deposit
      monthlyRent
      serviceCharge
      utilitiesIncluded
      __typename
    }
    propertyId
    propertyType
    specifications {
      bathrooms
      bedrooms
      floors
      furnished
      parkingSpaces
      squareMeters
      __typename
    }
    status
    title
    updatedAt
    verified
    version
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetPropertyQueryVariables,
  APITypes.GetPropertyQuery
>;
export const getPropertyRatingSummary = /* GraphQL */ `query GetPropertyRatingSummary($propertyId: ID!) {
  getPropertyRatingSummary(propertyId: $propertyId) {
    accuracy
    averageRating
    cleanliness
    communication
    fiveStars
    fourStars
    location
    oneStar
    threeStars
    totalReviews
    twoStars
    value
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetPropertyRatingSummaryQueryVariables,
  APITypes.GetPropertyRatingSummaryQuery
>;
export const getPropertyReviews = /* GraphQL */ `query GetPropertyReviews($limit: Int, $nextToken: String, $propertyId: ID!) {
  getPropertyReviews(
    limit: $limit
    nextToken: $nextToken
    propertyId: $propertyId
  ) {
    count
    nextToken
    reviews {
      accuracy
      bookingId
      cleanliness
      comment
      communication
      createdAt
      guest {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      guestId
      hostResponse
      hostResponseDate
      location
      overallRating
      photos
      propertyId
      reviewId
      updatedAt
      value
      verifiedStay
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetPropertyReviewsQueryVariables,
  APITypes.GetPropertyReviewsQuery
>;
export const getReferralSubmission = /* GraphQL */ `query GetReferralSubmission($createdAt: String!, $referralId: ID!) {
  getReferralSubmission(createdAt: $createdAt, referralId: $referralId) {
    adminNotes
    assignedTo
    createdAt
    landlordArea
    landlordName
    landlordNotes
    landlordPhone
    listingRewardStatus
    profitShareRewardStatus
    referralId
    referrerName
    referrerNida
    referrerPhone
    status
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetReferralSubmissionQueryVariables,
  APITypes.GetReferralSubmissionQuery
>;
export const getRegions = /* GraphQL */ `query GetRegions {
  getRegions {
    id
    name
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetRegionsQueryVariables,
  APITypes.GetRegionsQuery
>;
export const getRelatedProperties = /* GraphQL */ `query GetRelatedProperties(
  $landlordLimit: Int
  $locationLimit: Int
  $priceLimit: Int
  $propertyId: ID!
) {
  getRelatedProperties(
    landlordLimit: $landlordLimit
    locationLimit: $locationLimit
    priceLimit: $priceLimit
    propertyId: $propertyId
  ) {
    landlordProperties {
      bedrooms
      currency
      district
      monthlyRent
      propertyId
      propertyType
      region
      thumbnail
      title
      verified
      __typename
    }
    similarLocationProperties {
      bedrooms
      currency
      district
      monthlyRent
      propertyId
      propertyType
      region
      thumbnail
      title
      verified
      __typename
    }
    similarPriceProperties {
      bedrooms
      currency
      district
      monthlyRent
      propertyId
      propertyType
      region
      thumbnail
      title
      verified
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetRelatedPropertiesQueryVariables,
  APITypes.GetRelatedPropertiesQuery
>;
export const getShortTermProperty = /* GraphQL */ `query GetShortTermProperty($propertyId: ID!) {
  getShortTermProperty(propertyId: $propertyId) {
    address {
      city
      country
      district
      postalCode
      region
      street
      __typename
    }
    advanceBookingDays
    allowsChildren
    allowsInfants
    allowsPets
    allowsSmoking
    amenities
    averageRating
    bathrooms
    bedrooms
    cancellationPolicy
    checkInInstructions {
      accessCode
      additionalNotes
      contactName
      contactPhone
      directions
      houseRules
      parkingInfo
      wifiName
      wifiPassword
      __typename
    }
    checkInTime
    checkOutTime
    cleaningFee
    coordinates {
      latitude
      longitude
      __typename
    }
    createdAt
    currency
    description
    district
    googleMapsUrl
    host {
      firstName
      lastName
      profileImage
      whatsappNumber
      __typename
    }
    hostId
    houseRules
    images
    instantBookEnabled
    maxAdults
    maxChildren
    maxGuests
    maxInfants
    maximumStay
    minimumStay
    nightlyRate
    propertyId
    propertyType
    publishedAt
    ratingSummary {
      accuracy
      averageRating
      cleanliness
      communication
      fiveStars
      fourStars
      location
      oneStar
      threeStars
      totalReviews
      twoStars
      value
      __typename
    }
    region
    serviceFeePercentage
    status
    stayCategories
    taxPercentage
    thumbnail
    title
    updatedAt
    videos
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetShortTermPropertyQueryVariables,
  APITypes.GetShortTermPropertyQuery
>;
export const getStreets = /* GraphQL */ `query GetStreets($wardId: ID!) {
  getStreets(wardId: $wardId) {
    id
    name
    wardId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetStreetsQueryVariables,
  APITypes.GetStreetsQuery
>;
export const getSuggestedLandlords = /* GraphQL */ `query GetSuggestedLandlords($createdAt: String!, $requestId: ID!) {
  getSuggestedLandlords(createdAt: $createdAt, requestId: $requestId) {
    landlord {
      businessName
      createdAt
      currency
      district
      firstName
      lastName
      maxPrice
      minPrice
      operatingDistricts
      operatingRegions
      phoneNumber
      profileImage
      propertyCount
      propertyTypes
      region
      userId
      ward
      whatsappNumber
      __typename
    }
    matchReasons
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetSuggestedLandlordsQueryVariables,
  APITypes.GetSuggestedLandlordsQuery
>;
export const getTeamAvailability = /* GraphQL */ `query GetTeamAvailability($endDate: String!, $startDate: String!) {
  getTeamAvailability(endDate: $endDate, startDate: $startDate) {
    busyBlocks {
      createdAt
      endUtc
      id
      recurrence {
        days
        endDate
        type
        __typename
      }
      startUtc
      title
      userId
      __typename
    }
    meetings {
      attendeeIds
      createdAt
      createdBy
      createdByName
      description
      endUtc
      id
      link
      startUtc
      title
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetTeamAvailabilityQueryVariables,
  APITypes.GetTeamAvailabilityQuery
>;
export const getUnreadCount = /* GraphQL */ `query GetUnreadCount {
  getUnreadCount
}
` as GeneratedQuery<
  APITypes.GetUnreadCountQueryVariables,
  APITypes.GetUnreadCountQuery
>;
export const getUserByEmail = /* GraphQL */ `query GetUserByEmail($email: String!) {
  getUserByEmail(email: $email) {
    ... on Admin {
      accountStatus
      address
      city
      createdAt
      currency
      dateOfBirth
      district
      email
      emailNotifications
      emergencyContactName
      emergencyContactPhone
      firstName
      gender
      hasProperties
      isEmailVerified
      language
      lastName
      nationalIdLast4
      occupation
      payoutBankAccountName
      payoutBankAccountNumber
      payoutBankBranch
      payoutBankName
      payoutMethod
      payoutMpesaName
      payoutMpesaPhone
      permissions
      phoneNumber
      profileImage
      pushNotifications
      region
      smsNotifications
      street
      updatedAt
      userType
      ward
      whatsappNumber
    }
    ... on Agent {
      accountStatus
      address
      agencyName
      city
      createdAt
      currency
      dateOfBirth
      district
      email
      emailNotifications
      emergencyContactName
      emergencyContactPhone
      firstName
      gender
      hasProperties
      isEmailVerified
      language
      lastName
      licenseNumber
      nationalIdLast4
      occupation
      phoneNumber
      profileImage
      pushNotifications
      region
      smsNotifications
      specializations
      street
      updatedAt
      userType
      ward
      whatsappNumber
    }
    ... on Landlord {
      accountStatus
      address
      businessLicense
      businessName
      city
      createdAt
      currency
      dateOfBirth
      district
      email
      emailNotifications
      emergencyContactName
      emergencyContactPhone
      firstName
      gender
      hasProperties
      isEmailVerified
      language
      lastName
      nationalIdLast4
      occupation
      payoutBankAccountName
      payoutBankAccountNumber
      payoutBankBranch
      payoutBankName
      payoutMethod
      payoutMpesaName
      payoutMpesaPhone
      phoneNumber
      profileImage
      pushNotifications
      region
      smsNotifications
      street
      taxId
      updatedAt
      userType
      verificationDocuments
      ward
      whatsappNumber
    }
    ... on Tenant {
      accountStatus
      address
      city
      createdAt
      currency
      dateOfBirth
      district
      email
      emailNotifications
      emergencyContactName
      emergencyContactPhone
      firstName
      gender
      hasProperties
      isEmailVerified
      language
      lastName
      nationalIdLast4
      occupation
      payoutBankAccountName
      payoutBankAccountNumber
      payoutBankBranch
      payoutBankName
      payoutMethod
      payoutMpesaName
      payoutMpesaPhone
      phoneNumber
      profileImage
      pushNotifications
      region
      smsNotifications
      street
      updatedAt
      userType
      ward
      whatsappNumber
    }
  }
}
` as GeneratedQuery<
  APITypes.GetUserByEmailQueryVariables,
  APITypes.GetUserByEmailQuery
>;
export const getUserById = /* GraphQL */ `query GetUserById($userId: ID!) {
  getUserById(userId: $userId) {
    ... on Admin {
      accountStatus
      address
      city
      createdAt
      currency
      dateOfBirth
      district
      email
      emailNotifications
      emergencyContactName
      emergencyContactPhone
      firstName
      gender
      hasProperties
      isEmailVerified
      language
      lastName
      nationalIdLast4
      occupation
      payoutBankAccountName
      payoutBankAccountNumber
      payoutBankBranch
      payoutBankName
      payoutMethod
      payoutMpesaName
      payoutMpesaPhone
      permissions
      phoneNumber
      profileImage
      pushNotifications
      region
      smsNotifications
      street
      updatedAt
      userType
      ward
      whatsappNumber
    }
    ... on Agent {
      accountStatus
      address
      agencyName
      city
      createdAt
      currency
      dateOfBirth
      district
      email
      emailNotifications
      emergencyContactName
      emergencyContactPhone
      firstName
      gender
      hasProperties
      isEmailVerified
      language
      lastName
      licenseNumber
      nationalIdLast4
      occupation
      phoneNumber
      profileImage
      pushNotifications
      region
      smsNotifications
      specializations
      street
      updatedAt
      userType
      ward
      whatsappNumber
    }
    ... on Landlord {
      accountStatus
      address
      businessLicense
      businessName
      city
      createdAt
      currency
      dateOfBirth
      district
      email
      emailNotifications
      emergencyContactName
      emergencyContactPhone
      firstName
      gender
      hasProperties
      isEmailVerified
      language
      lastName
      nationalIdLast4
      occupation
      payoutBankAccountName
      payoutBankAccountNumber
      payoutBankBranch
      payoutBankName
      payoutMethod
      payoutMpesaName
      payoutMpesaPhone
      phoneNumber
      profileImage
      pushNotifications
      region
      smsNotifications
      street
      taxId
      updatedAt
      userType
      verificationDocuments
      ward
      whatsappNumber
    }
    ... on Tenant {
      accountStatus
      address
      city
      createdAt
      currency
      dateOfBirth
      district
      email
      emailNotifications
      emergencyContactName
      emergencyContactPhone
      firstName
      gender
      hasProperties
      isEmailVerified
      language
      lastName
      nationalIdLast4
      occupation
      payoutBankAccountName
      payoutBankAccountNumber
      payoutBankBranch
      payoutBankName
      payoutMethod
      payoutMpesaName
      payoutMpesaPhone
      phoneNumber
      profileImage
      pushNotifications
      region
      smsNotifications
      street
      updatedAt
      userType
      ward
      whatsappNumber
    }
  }
}
` as GeneratedQuery<
  APITypes.GetUserByIdQueryVariables,
  APITypes.GetUserByIdQuery
>;
export const getUserConversations = /* GraphQL */ `query GetUserConversations {
  getUserConversations {
    conversationType
    createdAt
    id
    lastMessage
    lastMessageTime
    otherPartyImage
    otherPartyName
    propertyTitle
    unreadCount
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserConversationsQueryVariables,
  APITypes.GetUserConversationsQuery
>;
export const getUserStats = /* GraphQL */ `query GetUserStats {
  getUserStats {
    activeUsers
    newUsersThisMonth
    newUsersThisWeek
    totalAdmins
    totalAgents
    totalLandlords
    totalTenants
    totalUsers
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserStatsQueryVariables,
  APITypes.GetUserStatsQuery
>;
export const getWards = /* GraphQL */ `query GetWards($districtId: ID!) {
  getWards(districtId: $districtId) {
    districtId
    id
    name
    __typename
  }
}
` as GeneratedQuery<APITypes.GetWardsQueryVariables, APITypes.GetWardsQuery>;
export const getWhatsAppChatHistory = /* GraphQL */ `query GetWhatsAppChatHistory($before: String, $limit: Int, $phone: String!) {
  getWhatsAppChatHistory(before: $before, limit: $limit, phone: $phone) {
    contactName
    entries {
      direction
      lang
      phone
      replyId
      source
      step
      text
      ts
      type
      __typename
    }
    hasMore
    lastMessageAt
    linkedUser {
      email
      firstName
      lastName
      phoneNumber
      userId
      userType
      whatsappNumber
      __typename
    }
    messageCount
    oldestTs
    phone
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetWhatsAppChatHistoryQueryVariables,
  APITypes.GetWhatsAppChatHistoryQuery
>;
export const listAgentProperties = /* GraphQL */ `query ListAgentProperties($limit: Int, $nextToken: String) {
  listAgentProperties(limit: $limit, nextToken: $nextToken) {
    count
    nextToken
    properties {
      address {
        coordinates {
          latitude
          longitude
          __typename
        }
        district
        postalCode
        region
        street
        ward
        __typename
      }
      agent {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      agentId
      amenities
      availability {
        available
        availableFrom
        maximumLeaseTerm
        minimumLeaseTerm
        __typename
      }
      createdAt
      description
      googleMapsUrl
      landlord {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      media {
        floorPlan
        images
        videos
        virtualTour
        __typename
      }
      pricing {
        currency
        deposit
        monthlyRent
        serviceCharge
        utilitiesIncluded
        __typename
      }
      propertyId
      propertyType
      specifications {
        bathrooms
        bedrooms
        floors
        furnished
        parkingSpaces
        squareMeters
        __typename
      }
      status
      title
      updatedAt
      verified
      version
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAgentPropertiesQueryVariables,
  APITypes.ListAgentPropertiesQuery
>;
export const listAllApplications = /* GraphQL */ `query ListAllApplications(
  $limit: Int
  $nextToken: String
  $status: ApplicationStatus
) {
  listAllApplications(limit: $limit, nextToken: $nextToken, status: $status) {
    applications {
      applicant {
        firstName
        lastName
        profileImage
        __typename
      }
      applicantDetails {
        emergencyContact {
          email
          name
          phoneNumber
          relationship
          __typename
        }
        hasPets
        leaseDuration
        monthlyIncome
        moveInDate
        numberOfOccupants
        occupation
        petDetails
        smokingStatus
        __typename
      }
      applicationId
      createdAt
      landlord {
        businessName
        firstName
        lastName
        profileImage
        __typename
      }
      landlordNotes
      property {
        address {
          district
          postalCode
          region
          street
          ward
          __typename
        }
        agent {
          firstName
          lastName
          profileImage
          whatsappNumber
          __typename
        }
        agentId
        amenities
        availability {
          available
          availableFrom
          maximumLeaseTerm
          minimumLeaseTerm
          __typename
        }
        createdAt
        description
        googleMapsUrl
        landlord {
          firstName
          lastName
          profileImage
          whatsappNumber
          __typename
        }
        media {
          floorPlan
          images
          videos
          virtualTour
          __typename
        }
        pricing {
          currency
          deposit
          monthlyRent
          serviceCharge
          utilitiesIncluded
          __typename
        }
        propertyId
        propertyType
        specifications {
          bathrooms
          bedrooms
          floors
          furnished
          parkingSpaces
          squareMeters
          __typename
        }
        status
        title
        updatedAt
        verified
        version
        __typename
      }
      propertyId
      rejectionReason
      status
      submittedAt
      updatedAt
      __typename
    }
    count
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAllApplicationsQueryVariables,
  APITypes.ListAllApplicationsQuery
>;
export const listAllLandlordApplications = /* GraphQL */ `query ListAllLandlordApplications(
  $limit: Int
  $nextToken: String
  $status: LandlordApplicationStatus
) {
  listAllLandlordApplications(
    limit: $limit
    nextToken: $nextToken
    status: $status
  ) {
    applications {
      address
      adminNotes
      alternatePhone
      applicant {
        firstName
        lastName
        profileImage
        __typename
      }
      applicationId
      birthDate
      createdAt
      nationalId
      phoneNumber
      rejectionReason
      reviewedAt
      status
      submittedAt
      updatedAt
      userId
      __typename
    }
    count
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAllLandlordApplicationsQueryVariables,
  APITypes.ListAllLandlordApplicationsQuery
>;
export const listAllProperties = /* GraphQL */ `query ListAllProperties(
  $limit: Int
  $nextToken: String
  $propertyType: String
  $search: String
  $status: PropertyStatus
) {
  listAllProperties(
    limit: $limit
    nextToken: $nextToken
    propertyType: $propertyType
    search: $search
    status: $status
  ) {
    longTermProperties {
      address {
        coordinates {
          latitude
          longitude
          __typename
        }
        district
        postalCode
        region
        street
        ward
        __typename
      }
      agent {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      agentId
      amenities
      availability {
        available
        availableFrom
        maximumLeaseTerm
        minimumLeaseTerm
        __typename
      }
      createdAt
      description
      googleMapsUrl
      landlord {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      media {
        floorPlan
        images
        videos
        virtualTour
        __typename
      }
      pricing {
        currency
        deposit
        monthlyRent
        serviceCharge
        utilitiesIncluded
        __typename
      }
      propertyId
      propertyType
      specifications {
        bathrooms
        bedrooms
        floors
        furnished
        parkingSpaces
        squareMeters
        __typename
      }
      status
      title
      updatedAt
      verified
      version
      __typename
    }
    nextToken
    shortTermProperties {
      address {
        city
        country
        district
        postalCode
        region
        street
        __typename
      }
      advanceBookingDays
      allowsChildren
      allowsInfants
      allowsPets
      allowsSmoking
      amenities
      averageRating
      bathrooms
      bedrooms
      cancellationPolicy
      checkInInstructions {
        accessCode
        additionalNotes
        contactName
        contactPhone
        directions
        houseRules
        parkingInfo
        wifiName
        wifiPassword
        __typename
      }
      checkInTime
      checkOutTime
      cleaningFee
      coordinates {
        latitude
        longitude
        __typename
      }
      createdAt
      currency
      description
      district
      googleMapsUrl
      host {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      hostId
      houseRules
      images
      instantBookEnabled
      maxAdults
      maxChildren
      maxGuests
      maxInfants
      maximumStay
      minimumStay
      nightlyRate
      propertyId
      propertyType
      publishedAt
      ratingSummary {
        accuracy
        averageRating
        cleanliness
        communication
        fiveStars
        fourStars
        location
        oneStar
        threeStars
        totalReviews
        twoStars
        value
        __typename
      }
      region
      serviceFeePercentage
      status
      stayCategories
      taxPercentage
      thumbnail
      title
      updatedAt
      videos
      __typename
    }
    totalCount
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAllPropertiesQueryVariables,
  APITypes.ListAllPropertiesQuery
>;
export const listAllUsers = /* GraphQL */ `query ListAllUsers($limit: Int, $nextToken: String, $userType: UserType) {
  listAllUsers(limit: $limit, nextToken: $nextToken, userType: $userType) {
    count
    nextToken
    users {
      profile {
        ... on Admin {
          accountStatus
          address
          city
          createdAt
          currency
          dateOfBirth
          district
          email
          emailNotifications
          emergencyContactName
          emergencyContactPhone
          firstName
          gender
          hasProperties
          isEmailVerified
          language
          lastName
          nationalIdLast4
          occupation
          payoutBankAccountName
          payoutBankAccountNumber
          payoutBankBranch
          payoutBankName
          payoutMethod
          payoutMpesaName
          payoutMpesaPhone
          permissions
          phoneNumber
          profileImage
          pushNotifications
          region
          smsNotifications
          street
          updatedAt
          userType
          ward
          whatsappNumber
        }
        ... on Agent {
          accountStatus
          address
          agencyName
          city
          createdAt
          currency
          dateOfBirth
          district
          email
          emailNotifications
          emergencyContactName
          emergencyContactPhone
          firstName
          gender
          hasProperties
          isEmailVerified
          language
          lastName
          licenseNumber
          nationalIdLast4
          occupation
          phoneNumber
          profileImage
          pushNotifications
          region
          smsNotifications
          specializations
          street
          updatedAt
          userType
          ward
          whatsappNumber
        }
        ... on Landlord {
          accountStatus
          address
          businessLicense
          businessName
          city
          createdAt
          currency
          dateOfBirth
          district
          email
          emailNotifications
          emergencyContactName
          emergencyContactPhone
          firstName
          gender
          hasProperties
          isEmailVerified
          language
          lastName
          nationalIdLast4
          occupation
          payoutBankAccountName
          payoutBankAccountNumber
          payoutBankBranch
          payoutBankName
          payoutMethod
          payoutMpesaName
          payoutMpesaPhone
          phoneNumber
          profileImage
          pushNotifications
          region
          smsNotifications
          street
          taxId
          updatedAt
          userType
          verificationDocuments
          ward
          whatsappNumber
        }
        ... on Tenant {
          accountStatus
          address
          city
          createdAt
          currency
          dateOfBirth
          district
          email
          emailNotifications
          emergencyContactName
          emergencyContactPhone
          firstName
          gender
          hasProperties
          isEmailVerified
          language
          lastName
          nationalIdLast4
          occupation
          payoutBankAccountName
          payoutBankAccountNumber
          payoutBankBranch
          payoutBankName
          payoutMethod
          payoutMpesaName
          payoutMpesaPhone
          phoneNumber
          profileImage
          pushNotifications
          region
          smsNotifications
          street
          updatedAt
          userType
          ward
          whatsappNumber
        }
      }
      userId
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAllUsersQueryVariables,
  APITypes.ListAllUsersQuery
>;
export const listContactInquiries = /* GraphQL */ `query ListContactInquiries(
  $limit: Int
  $nextToken: String
  $status: InquiryStatus
) {
  listContactInquiries(limit: $limit, nextToken: $nextToken, status: $status) {
    count
    items {
      adminNotes
      createdAt
      email
      handledBy
      inquiryId
      inquiryType
      message
      name
      phone
      status
      subject
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListContactInquiriesQueryVariables,
  APITypes.ListContactInquiriesQuery
>;
export const listHousingRequests = /* GraphQL */ `query ListHousingRequests(
  $limit: Int
  $nextToken: String
  $status: HousingRequestStatus
) {
  listHousingRequests(limit: $limit, nextToken: $nextToken, status: $status) {
    count
    nextToken
    requests {
      adminNotes
      assignedAdmin
      bedrooms
      contactName
      createdAt
      currency
      description
      district
      fulfilledPropertyId
      matchedLandlords
      maxBudget
      minBudget
      moveInDate
      phone
      propertyType
      region
      requestId
      source
      status
      street
      updatedAt
      userId
      ward
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListHousingRequestsQueryVariables,
  APITypes.ListHousingRequestsQuery
>;
export const listLandlordProperties = /* GraphQL */ `query ListLandlordProperties($limit: Int, $nextToken: String) {
  listLandlordProperties(limit: $limit, nextToken: $nextToken) {
    count
    nextToken
    properties {
      address {
        coordinates {
          latitude
          longitude
          __typename
        }
        district
        postalCode
        region
        street
        ward
        __typename
      }
      agent {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      agentId
      amenities
      availability {
        available
        availableFrom
        maximumLeaseTerm
        minimumLeaseTerm
        __typename
      }
      createdAt
      description
      googleMapsUrl
      landlord {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      media {
        floorPlan
        images
        videos
        virtualTour
        __typename
      }
      pricing {
        currency
        deposit
        monthlyRent
        serviceCharge
        utilitiesIncluded
        __typename
      }
      propertyId
      propertyType
      specifications {
        bathrooms
        bedrooms
        floors
        furnished
        parkingSpaces
        squareMeters
        __typename
      }
      status
      title
      updatedAt
      verified
      version
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListLandlordPropertiesQueryVariables,
  APITypes.ListLandlordPropertiesQuery
>;
export const listLandlordRegistrations = /* GraphQL */ `query ListLandlordRegistrations(
  $limit: Int
  $nextToken: String
  $status: String
) {
  listLandlordRegistrations(
    limit: $limit
    nextToken: $nextToken
    status: $status
  ) {
    count
    nextToken
    registrations {
      adminNotes
      area
      assignedTo
      createdAt
      name
      notes
      phone
      registrationId
      status
      updatedAt
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListLandlordRegistrationsQueryVariables,
  APITypes.ListLandlordRegistrationsQuery
>;
export const listMyApplications = /* GraphQL */ `query ListMyApplications(
  $limit: Int
  $nextToken: String
  $status: ApplicationStatus
) {
  listMyApplications(limit: $limit, nextToken: $nextToken, status: $status) {
    applications {
      applicant {
        firstName
        lastName
        profileImage
        __typename
      }
      applicantDetails {
        emergencyContact {
          email
          name
          phoneNumber
          relationship
          __typename
        }
        hasPets
        leaseDuration
        monthlyIncome
        moveInDate
        numberOfOccupants
        occupation
        petDetails
        smokingStatus
        __typename
      }
      applicationId
      createdAt
      landlord {
        businessName
        firstName
        lastName
        profileImage
        __typename
      }
      landlordNotes
      property {
        address {
          district
          postalCode
          region
          street
          ward
          __typename
        }
        agent {
          firstName
          lastName
          profileImage
          whatsappNumber
          __typename
        }
        agentId
        amenities
        availability {
          available
          availableFrom
          maximumLeaseTerm
          minimumLeaseTerm
          __typename
        }
        createdAt
        description
        googleMapsUrl
        landlord {
          firstName
          lastName
          profileImage
          whatsappNumber
          __typename
        }
        media {
          floorPlan
          images
          videos
          virtualTour
          __typename
        }
        pricing {
          currency
          deposit
          monthlyRent
          serviceCharge
          utilitiesIncluded
          __typename
        }
        propertyId
        propertyType
        specifications {
          bathrooms
          bedrooms
          floors
          furnished
          parkingSpaces
          squareMeters
          __typename
        }
        status
        title
        updatedAt
        verified
        version
        __typename
      }
      propertyId
      rejectionReason
      status
      submittedAt
      updatedAt
      __typename
    }
    count
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListMyApplicationsQueryVariables,
  APITypes.ListMyApplicationsQuery
>;
export const listMyBookings = /* GraphQL */ `query ListMyBookings($limit: Int, $nextToken: String, $status: BookingStatus) {
  listMyBookings(limit: $limit, nextToken: $nextToken, status: $status) {
    bookings {
      bookingId
      bookingType
      cancellationReason
      cancelledAt
      checkInDate
      checkOutDate
      completedAt
      confirmedAt
      createdAt
      guest {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      guestEmail
      guestId
      guestName
      guestPhone
      hostNotes
      numberOfAdults
      numberOfChildren
      numberOfGuests
      numberOfInfants
      numberOfNights
      paymentIntentId
      paymentStatus
      pricing {
        cleaningFee
        currency
        nightlyRate
        numberOfNights
        refundAmount
        refundPercentage
        serviceFee
        subtotal
        taxes
        total
        __typename
      }
      property {
        address {
          city
          country
          district
          postalCode
          region
          street
          __typename
        }
        advanceBookingDays
        allowsChildren
        allowsInfants
        allowsPets
        allowsSmoking
        amenities
        averageRating
        bathrooms
        bedrooms
        cancellationPolicy
        checkInInstructions {
          accessCode
          additionalNotes
          contactName
          contactPhone
          directions
          houseRules
          parkingInfo
          wifiName
          wifiPassword
          __typename
        }
        checkInTime
        checkOutTime
        cleaningFee
        coordinates {
          latitude
          longitude
          __typename
        }
        createdAt
        currency
        description
        district
        googleMapsUrl
        host {
          firstName
          lastName
          profileImage
          whatsappNumber
          __typename
        }
        hostId
        houseRules
        images
        instantBookEnabled
        maxAdults
        maxChildren
        maxGuests
        maxInfants
        maximumStay
        minimumStay
        nightlyRate
        propertyId
        propertyType
        publishedAt
        ratingSummary {
          accuracy
          averageRating
          cleanliness
          communication
          fiveStars
          fourStars
          location
          oneStar
          threeStars
          totalReviews
          twoStars
          value
          __typename
        }
        region
        serviceFeePercentage
        status
        stayCategories
        taxPercentage
        thumbnail
        title
        updatedAt
        videos
        __typename
      }
      propertyId
      propertySnapshot {
        address {
          city
          district
          region
          street
          __typename
        }
        currency
        images
        nightlyRate
        propertyType
        thumbnail
        title
        __typename
      }
      specialRequests
      status
      updatedAt
      __typename
    }
    count
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListMyBookingsQueryVariables,
  APITypes.ListMyBookingsQuery
>;
export const listMyShortTermProperties = /* GraphQL */ `query ListMyShortTermProperties($limit: Int, $nextToken: String) {
  listMyShortTermProperties(limit: $limit, nextToken: $nextToken) {
    nextToken
    properties {
      address {
        city
        country
        district
        postalCode
        region
        street
        __typename
      }
      advanceBookingDays
      allowsChildren
      allowsInfants
      allowsPets
      allowsSmoking
      amenities
      averageRating
      bathrooms
      bedrooms
      cancellationPolicy
      checkInInstructions {
        accessCode
        additionalNotes
        contactName
        contactPhone
        directions
        houseRules
        parkingInfo
        wifiName
        wifiPassword
        __typename
      }
      checkInTime
      checkOutTime
      cleaningFee
      coordinates {
        latitude
        longitude
        __typename
      }
      createdAt
      currency
      description
      district
      googleMapsUrl
      host {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      hostId
      houseRules
      images
      instantBookEnabled
      maxAdults
      maxChildren
      maxGuests
      maxInfants
      maximumStay
      minimumStay
      nightlyRate
      propertyId
      propertyType
      publishedAt
      ratingSummary {
        accuracy
        averageRating
        cleanliness
        communication
        fiveStars
        fourStars
        location
        oneStar
        threeStars
        totalReviews
        twoStars
        value
        __typename
      }
      region
      serviceFeePercentage
      status
      stayCategories
      taxPercentage
      thumbnail
      title
      updatedAt
      videos
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListMyShortTermPropertiesQueryVariables,
  APITypes.ListMyShortTermPropertiesQuery
>;
export const listPropertyApplications = /* GraphQL */ `query ListPropertyApplications(
  $limit: Int
  $nextToken: String
  $propertyId: ID!
  $status: ApplicationStatus
) {
  listPropertyApplications(
    limit: $limit
    nextToken: $nextToken
    propertyId: $propertyId
    status: $status
  ) {
    applications {
      applicant {
        firstName
        lastName
        profileImage
        __typename
      }
      applicantDetails {
        emergencyContact {
          email
          name
          phoneNumber
          relationship
          __typename
        }
        hasPets
        leaseDuration
        monthlyIncome
        moveInDate
        numberOfOccupants
        occupation
        petDetails
        smokingStatus
        __typename
      }
      applicationId
      createdAt
      landlord {
        businessName
        firstName
        lastName
        profileImage
        __typename
      }
      landlordNotes
      property {
        address {
          district
          postalCode
          region
          street
          ward
          __typename
        }
        agent {
          firstName
          lastName
          profileImage
          whatsappNumber
          __typename
        }
        agentId
        amenities
        availability {
          available
          availableFrom
          maximumLeaseTerm
          minimumLeaseTerm
          __typename
        }
        createdAt
        description
        googleMapsUrl
        landlord {
          firstName
          lastName
          profileImage
          whatsappNumber
          __typename
        }
        media {
          floorPlan
          images
          videos
          virtualTour
          __typename
        }
        pricing {
          currency
          deposit
          monthlyRent
          serviceCharge
          utilitiesIncluded
          __typename
        }
        propertyId
        propertyType
        specifications {
          bathrooms
          bedrooms
          floors
          furnished
          parkingSpaces
          squareMeters
          __typename
        }
        status
        title
        updatedAt
        verified
        version
        __typename
      }
      propertyId
      rejectionReason
      status
      submittedAt
      updatedAt
      __typename
    }
    count
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListPropertyApplicationsQueryVariables,
  APITypes.ListPropertyApplicationsQuery
>;
export const listPropertyBookings = /* GraphQL */ `query ListPropertyBookings(
  $endDate: AWSDate
  $limit: Int
  $nextToken: String
  $propertyId: ID!
  $startDate: AWSDate
  $status: BookingStatus
) {
  listPropertyBookings(
    endDate: $endDate
    limit: $limit
    nextToken: $nextToken
    propertyId: $propertyId
    startDate: $startDate
    status: $status
  ) {
    bookings {
      bookingId
      bookingType
      cancellationReason
      cancelledAt
      checkInDate
      checkOutDate
      completedAt
      confirmedAt
      createdAt
      guest {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      guestEmail
      guestId
      guestName
      guestPhone
      hostNotes
      numberOfAdults
      numberOfChildren
      numberOfGuests
      numberOfInfants
      numberOfNights
      paymentIntentId
      paymentStatus
      pricing {
        cleaningFee
        currency
        nightlyRate
        numberOfNights
        refundAmount
        refundPercentage
        serviceFee
        subtotal
        taxes
        total
        __typename
      }
      property {
        address {
          city
          country
          district
          postalCode
          region
          street
          __typename
        }
        advanceBookingDays
        allowsChildren
        allowsInfants
        allowsPets
        allowsSmoking
        amenities
        averageRating
        bathrooms
        bedrooms
        cancellationPolicy
        checkInInstructions {
          accessCode
          additionalNotes
          contactName
          contactPhone
          directions
          houseRules
          parkingInfo
          wifiName
          wifiPassword
          __typename
        }
        checkInTime
        checkOutTime
        cleaningFee
        coordinates {
          latitude
          longitude
          __typename
        }
        createdAt
        currency
        description
        district
        googleMapsUrl
        host {
          firstName
          lastName
          profileImage
          whatsappNumber
          __typename
        }
        hostId
        houseRules
        images
        instantBookEnabled
        maxAdults
        maxChildren
        maxGuests
        maxInfants
        maximumStay
        minimumStay
        nightlyRate
        propertyId
        propertyType
        publishedAt
        ratingSummary {
          accuracy
          averageRating
          cleanliness
          communication
          fiveStars
          fourStars
          location
          oneStar
          threeStars
          totalReviews
          twoStars
          value
          __typename
        }
        region
        serviceFeePercentage
        status
        stayCategories
        taxPercentage
        thumbnail
        title
        updatedAt
        videos
        __typename
      }
      propertyId
      propertySnapshot {
        address {
          city
          district
          region
          street
          __typename
        }
        currency
        images
        nightlyRate
        propertyType
        thumbnail
        title
        __typename
      }
      specialRequests
      status
      updatedAt
      __typename
    }
    count
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListPropertyBookingsQueryVariables,
  APITypes.ListPropertyBookingsQuery
>;
export const listPropertyOwners = /* GraphQL */ `query ListPropertyOwners($limit: Int, $nextToken: String) {
  listPropertyOwners(limit: $limit, nextToken: $nextToken) {
    count
    landlords {
      businessName
      createdAt
      currency
      district
      firstName
      lastName
      maxPrice
      minPrice
      operatingDistricts
      operatingRegions
      phoneNumber
      profileImage
      propertyCount
      propertyTypes
      region
      userId
      ward
      whatsappNumber
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListPropertyOwnersQueryVariables,
  APITypes.ListPropertyOwnersQuery
>;
export const listReferralSubmissions = /* GraphQL */ `query ListReferralSubmissions(
  $limit: Int
  $nextToken: String
  $status: String
) {
  listReferralSubmissions(
    limit: $limit
    nextToken: $nextToken
    status: $status
  ) {
    count
    nextToken
    submissions {
      adminNotes
      assignedTo
      createdAt
      landlordArea
      landlordName
      landlordNotes
      landlordPhone
      listingRewardStatus
      profitShareRewardStatus
      referralId
      referrerName
      referrerNida
      referrerPhone
      status
      updatedAt
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListReferralSubmissionsQueryVariables,
  APITypes.ListReferralSubmissionsQuery
>;
export const listWhatsAppConversations = /* GraphQL */ `query ListWhatsAppConversations($limit: Int) {
  listWhatsAppConversations(limit: $limit) {
    contactName
    createdAt
    lang
    lastMessageAt
    phoneNumber
    step
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListWhatsAppConversationsQueryVariables,
  APITypes.ListWhatsAppConversationsQuery
>;
export const queryPaymentStatus = /* GraphQL */ `query QueryPaymentStatus($paymentId: ID!) {
  queryPaymentStatus(paymentId: $paymentId) {
    amount
    bookingId
    completedAt
    conversationID
    createdAt
    currency
    customerEmail
    customerPhone
    errorMessage
    paymentId
    provider
    refundAmount
    refundReason
    refundedAt
    status
    thirdPartyConversationID
    transactionID
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.QueryPaymentStatusQueryVariables,
  APITypes.QueryPaymentStatusQuery
>;
export const searchChatUsers = /* GraphQL */ `query SearchChatUsers(
  $district: String
  $limit: Int
  $query: String!
  $region: String
  $source: String
) {
  searchChatUsers(
    district: $district
    limit: $limit
    query: $query
    region: $region
    source: $source
  ) {
    businessName
    firstName
    lastName
    profileImage
    userId
    userType
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SearchChatUsersQueryVariables,
  APITypes.SearchChatUsersQuery
>;
export const searchLandlordProfiles = /* GraphQL */ `query SearchLandlordProfiles(
  $district: String
  $limit: Int
  $nextToken: String
  $propertyType: String
  $region: String
) {
  searchLandlordProfiles(
    district: $district
    limit: $limit
    nextToken: $nextToken
    propertyType: $propertyType
    region: $region
  ) {
    count
    landlords {
      businessName
      createdAt
      currency
      district
      firstName
      lastName
      maxPrice
      minPrice
      operatingDistricts
      operatingRegions
      phoneNumber
      profileImage
      propertyCount
      propertyTypes
      region
      userId
      ward
      whatsappNumber
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SearchLandlordProfilesQueryVariables,
  APITypes.SearchLandlordProfilesQuery
>;
export const searchShortTermProperties = /* GraphQL */ `query SearchShortTermProperties($input: ShortTermSearchInput!) {
  searchShortTermProperties(input: $input) {
    nextToken
    properties {
      address {
        city
        country
        district
        postalCode
        region
        street
        __typename
      }
      advanceBookingDays
      allowsChildren
      allowsInfants
      allowsPets
      allowsSmoking
      amenities
      averageRating
      bathrooms
      bedrooms
      cancellationPolicy
      checkInInstructions {
        accessCode
        additionalNotes
        contactName
        contactPhone
        directions
        houseRules
        parkingInfo
        wifiName
        wifiPassword
        __typename
      }
      checkInTime
      checkOutTime
      cleaningFee
      coordinates {
        latitude
        longitude
        __typename
      }
      createdAt
      currency
      description
      district
      googleMapsUrl
      host {
        firstName
        lastName
        profileImage
        whatsappNumber
        __typename
      }
      hostId
      houseRules
      images
      instantBookEnabled
      maxAdults
      maxChildren
      maxGuests
      maxInfants
      maximumStay
      minimumStay
      nightlyRate
      propertyId
      propertyType
      publishedAt
      ratingSummary {
        accuracy
        averageRating
        cleanliness
        communication
        fiveStars
        fourStars
        location
        oneStar
        threeStars
        totalReviews
        twoStars
        value
        __typename
      }
      region
      serviceFeePercentage
      status
      stayCategories
      taxPercentage
      thumbnail
      title
      updatedAt
      videos
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SearchShortTermPropertiesQueryVariables,
  APITypes.SearchShortTermPropertiesQuery
>;
