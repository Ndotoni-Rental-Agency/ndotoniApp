/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const adminDeleteApplication = /* GraphQL */ `mutation AdminDeleteApplication($applicationId: ID!) {
  adminDeleteApplication(applicationId: $applicationId) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.AdminDeleteApplicationMutationVariables,
  APITypes.AdminDeleteApplicationMutation
>;
export const adminDeleteLandlordApplication = /* GraphQL */ `mutation AdminDeleteLandlordApplication($applicationId: ID!) {
  adminDeleteLandlordApplication(applicationId: $applicationId) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.AdminDeleteLandlordApplicationMutationVariables,
  APITypes.AdminDeleteLandlordApplicationMutation
>;
export const adminDeleteProperty = /* GraphQL */ `mutation AdminDeleteProperty($propertyId: ID!) {
  adminDeleteProperty(propertyId: $propertyId) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.AdminDeletePropertyMutationVariables,
  APITypes.AdminDeletePropertyMutation
>;
export const adminUpdateApplicationStatus = /* GraphQL */ `mutation AdminUpdateApplicationStatus(
  $applicationId: ID!
  $notes: String
  $status: ApplicationStatus!
) {
  adminUpdateApplicationStatus(
    applicationId: $applicationId
    notes: $notes
    status: $status
  ) {
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
      landlord {
        firstName
        lastName
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
` as GeneratedMutation<
  APITypes.AdminUpdateApplicationStatusMutationVariables,
  APITypes.AdminUpdateApplicationStatusMutation
>;
export const adminUpdatePropertyStatus = /* GraphQL */ `mutation AdminUpdatePropertyStatus(
  $notes: String
  $propertyId: ID!
  $status: PropertyStatus!
) {
  adminUpdatePropertyStatus(
    notes: $notes
    propertyId: $propertyId
    status: $status
  ) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.AdminUpdatePropertyStatusMutationVariables,
  APITypes.AdminUpdatePropertyStatusMutation
>;
export const approveBooking = /* GraphQL */ `mutation ApproveBooking($bookingId: ID!, $hostNotes: String) {
  approveBooking(bookingId: $bookingId, hostNotes: $hostNotes) {
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
      whatsappNumber
      __typename
    }
    guestId
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
      cancellationPolicy
      checkInInstructions
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
      host {
        firstName
        lastName
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
      taxPercentage
      thumbnail
      title
      updatedAt
      __typename
    }
    propertyId
    specialRequests
    status
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.ApproveBookingMutationVariables,
  APITypes.ApproveBookingMutation
>;
export const approveProperty = /* GraphQL */ `mutation ApproveProperty($notes: String, $propertyId: ID!) {
  approveProperty(notes: $notes, propertyId: $propertyId) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.ApprovePropertyMutationVariables,
  APITypes.ApprovePropertyMutation
>;
export const assignPropertyAgent = /* GraphQL */ `mutation AssignPropertyAgent($agentId: ID!, $propertyId: ID!) {
  assignPropertyAgent(agentId: $agentId, propertyId: $propertyId) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.AssignPropertyAgentMutationVariables,
  APITypes.AssignPropertyAgentMutation
>;
export const associateMediaWithProperty = /* GraphQL */ `mutation AssociateMediaWithProperty(
  $media: PropertyMediaInput!
  $propertyId: ID!
) {
  associateMediaWithProperty(media: $media, propertyId: $propertyId) {
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
    landlord {
      firstName
      lastName
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
    version
    __typename
  }
}
` as GeneratedMutation<
  APITypes.AssociateMediaWithPropertyMutationVariables,
  APITypes.AssociateMediaWithPropertyMutation
>;
export const blockDates = /* GraphQL */ `mutation BlockDates($input: BlockDatesInput!) {
  blockDates(input: $input) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.BlockDatesMutationVariables,
  APITypes.BlockDatesMutation
>;
export const cancelBooking = /* GraphQL */ `mutation CancelBooking($bookingId: ID!, $reason: String) {
  cancelBooking(bookingId: $bookingId, reason: $reason) {
    booking {
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
        whatsappNumber
        __typename
      }
      guestId
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
        cancellationPolicy
        checkInInstructions
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
        host {
          firstName
          lastName
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
        taxPercentage
        thumbnail
        title
        updatedAt
        __typename
      }
      propertyId
      specialRequests
      status
      updatedAt
      __typename
    }
    message
    refundAmount
    refundPercentage
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CancelBookingMutationVariables,
  APITypes.CancelBookingMutation
>;
export const createBooking = /* GraphQL */ `mutation CreateBooking($input: CreateBookingInput!) {
  createBooking(input: $input) {
    booking {
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
        whatsappNumber
        __typename
      }
      guestId
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
        cancellationPolicy
        checkInInstructions
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
        host {
          firstName
          lastName
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
        taxPercentage
        thumbnail
        title
        updatedAt
        __typename
      }
      propertyId
      specialRequests
      status
      updatedAt
      __typename
    }
    message
    paymentStatus
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateBookingMutationVariables,
  APITypes.CreateBookingMutation
>;
export const createLocation = /* GraphQL */ `mutation CreateLocation($input: CreateLocationInput!) {
  createLocation(input: $input) {
    location {
      ... on District {
        id
        name
        regionId
      }
      ... on Region {
        id
        name
      }
      ... on Street {
        id
        name
        wardId
      }
      ... on Ward {
        districtId
        id
        name
      }
    }
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateLocationMutationVariables,
  APITypes.CreateLocationMutation
>;
export const createProperty = /* GraphQL */ `mutation CreateProperty($input: CreatePropertyInput!) {
  createProperty(input: $input) {
    isGuestUser
    message
    propertyId
    status
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreatePropertyMutationVariables,
  APITypes.CreatePropertyMutation
>;
export const createPropertyDraft = /* GraphQL */ `mutation CreatePropertyDraft($input: CreatePropertyDraftInput!) {
  createPropertyDraft(input: $input) {
    isGuestUser
    message
    propertyId
    status
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreatePropertyDraftMutationVariables,
  APITypes.CreatePropertyDraftMutation
>;
export const createReview = /* GraphQL */ `mutation CreateReview($input: CreateReviewInput!) {
  createReview(input: $input) {
    accuracy
    bookingId
    cleanliness
    comment
    communication
    createdAt
    guest {
      firstName
      lastName
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
}
` as GeneratedMutation<
  APITypes.CreateReviewMutationVariables,
  APITypes.CreateReviewMutation
>;
export const createShortTermProperty = /* GraphQL */ `mutation CreateShortTermProperty($input: CreateShortTermPropertyInput!) {
  createShortTermProperty(input: $input) {
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
    cancellationPolicy
    checkInInstructions
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
    host {
      firstName
      lastName
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
    taxPercentage
    thumbnail
    title
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateShortTermPropertyMutationVariables,
  APITypes.CreateShortTermPropertyMutation
>;
export const createShortTermPropertyDraft = /* GraphQL */ `mutation CreateShortTermPropertyDraft(
  $input: CreateShortTermPropertyDraftInput!
) {
  createShortTermPropertyDraft(input: $input) {
    isGuestUser
    message
    propertyId
    status
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateShortTermPropertyDraftMutationVariables,
  APITypes.CreateShortTermPropertyDraftMutation
>;
export const deactivateShortTermProperty = /* GraphQL */ `mutation DeactivateShortTermProperty($propertyId: ID!) {
  deactivateShortTermProperty(propertyId: $propertyId) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeactivateShortTermPropertyMutationVariables,
  APITypes.DeactivateShortTermPropertyMutation
>;
export const declineBooking = /* GraphQL */ `mutation DeclineBooking($bookingId: ID!, $reason: String!) {
  declineBooking(bookingId: $bookingId, reason: $reason) {
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
      whatsappNumber
      __typename
    }
    guestId
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
      cancellationPolicy
      checkInInstructions
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
      host {
        firstName
        lastName
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
      taxPercentage
      thumbnail
      title
      updatedAt
      __typename
    }
    propertyId
    specialRequests
    status
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeclineBookingMutationVariables,
  APITypes.DeclineBookingMutation
>;
export const deleteConversation = /* GraphQL */ `mutation DeleteConversation($conversationId: String!) {
  deleteConversation(conversationId: $conversationId) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteConversationMutationVariables,
  APITypes.DeleteConversationMutation
>;
export const deleteMediaItem = /* GraphQL */ `mutation DeleteMediaItem($fileUrl: String!) {
  deleteMediaItem(fileUrl: $fileUrl) {
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
` as GeneratedMutation<
  APITypes.DeleteMediaItemMutationVariables,
  APITypes.DeleteMediaItemMutation
>;
export const deleteMessage = /* GraphQL */ `mutation DeleteMessage($messageId: String!) {
  deleteMessage(messageId: $messageId) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteMessageMutationVariables,
  APITypes.DeleteMessageMutation
>;
export const deleteProperty = /* GraphQL */ `mutation DeleteProperty($propertyId: ID!) {
  deleteProperty(propertyId: $propertyId) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeletePropertyMutationVariables,
  APITypes.DeletePropertyMutation
>;
export const deleteUser = /* GraphQL */ `mutation DeleteUser($userId: ID!) {
  deleteUser(userId: $userId) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteUserMutationVariables,
  APITypes.DeleteUserMutation
>;
export const dummyMutation = /* GraphQL */ `mutation DummyMutation {
  dummyMutation
}
` as GeneratedMutation<
  APITypes.DummyMutationMutationVariables,
  APITypes.DummyMutationMutation
>;
export const forgotPassword = /* GraphQL */ `mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.ForgotPasswordMutationVariables,
  APITypes.ForgotPasswordMutation
>;
export const generateDataUploadUrl = /* GraphQL */ `mutation GenerateDataUploadUrl($dataType: DataType!, $filename: String) {
  generateDataUploadUrl(dataType: $dataType, filename: $filename) {
    fileKey
    uploadUrl
    __typename
  }
}
` as GeneratedMutation<
  APITypes.GenerateDataUploadUrlMutationVariables,
  APITypes.GenerateDataUploadUrlMutation
>;
export const getMediaUploadUrl = /* GraphQL */ `mutation GetMediaUploadUrl($contentType: String!, $fileName: String!) {
  getMediaUploadUrl(contentType: $contentType, fileName: $fileName) {
    fileUrl
    key
    uploadUrl
    __typename
  }
}
` as GeneratedMutation<
  APITypes.GetMediaUploadUrlMutationVariables,
  APITypes.GetMediaUploadUrlMutation
>;
export const importLocationsFromCSV = /* GraphQL */ `mutation ImportLocationsFromCSV($csvData: String!) {
  importLocationsFromCSV(csvData: $csvData) {
    errors
    imported
    message
    skipped
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.ImportLocationsFromCSVMutationVariables,
  APITypes.ImportLocationsFromCSVMutation
>;
export const importPropertiesFromCSV = /* GraphQL */ `mutation ImportPropertiesFromCSV($csvData: String!) {
  importPropertiesFromCSV(csvData: $csvData) {
    errors
    imported
    message
    skipped
    success
    updated
    __typename
  }
}
` as GeneratedMutation<
  APITypes.ImportPropertiesFromCSVMutationVariables,
  APITypes.ImportPropertiesFromCSVMutation
>;
export const initializePropertyChat = /* GraphQL */ `mutation InitializePropertyChat($propertyId: ID!) {
  initializePropertyChat(propertyId: $propertyId) {
    conversationId
    landlordInfo {
      businessName
      firstName
      lastName
      profileImage
      __typename
    }
    propertyId
    propertyTitle
    __typename
  }
}
` as GeneratedMutation<
  APITypes.InitializePropertyChatMutationVariables,
  APITypes.InitializePropertyChatMutation
>;
export const initiatePayment = /* GraphQL */ `mutation InitiatePayment($input: InitiatePaymentInput!) {
  initiatePayment(input: $input) {
    message
    payment {
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
    __typename
  }
}
` as GeneratedMutation<
  APITypes.InitiatePaymentMutationVariables,
  APITypes.InitiatePaymentMutation
>;
export const markAsRead = /* GraphQL */ `mutation MarkAsRead($conversationId: String!) {
  markAsRead(conversationId: $conversationId) {
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
` as GeneratedMutation<
  APITypes.MarkAsReadMutationVariables,
  APITypes.MarkAsReadMutation
>;
export const markPropertyAsAvailable = /* GraphQL */ `mutation MarkPropertyAsAvailable($propertyId: ID!) {
  markPropertyAsAvailable(propertyId: $propertyId) {
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
    landlord {
      firstName
      lastName
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
    version
    __typename
  }
}
` as GeneratedMutation<
  APITypes.MarkPropertyAsAvailableMutationVariables,
  APITypes.MarkPropertyAsAvailableMutation
>;
export const markPropertyAsRented = /* GraphQL */ `mutation MarkPropertyAsRented($propertyId: ID!, $tenantId: ID!) {
  markPropertyAsRented(propertyId: $propertyId, tenantId: $tenantId) {
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
    landlord {
      firstName
      lastName
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
    version
    __typename
  }
}
` as GeneratedMutation<
  APITypes.MarkPropertyAsRentedMutationVariables,
  APITypes.MarkPropertyAsRentedMutation
>;
export const publishNewPropertyEvent = /* GraphQL */ `mutation PublishNewPropertyEvent($propertyId: ID!, $region: String!) {
  publishNewPropertyEvent(propertyId: $propertyId, region: $region) {
    message
    propertyId
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.PublishNewPropertyEventMutationVariables,
  APITypes.PublishNewPropertyEventMutation
>;
export const publishProperty = /* GraphQL */ `mutation PublishProperty($propertyId: ID!) {
  publishProperty(propertyId: $propertyId) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.PublishPropertyMutationVariables,
  APITypes.PublishPropertyMutation
>;
export const publishPropertyUpdateEvent = /* GraphQL */ `mutation PublishPropertyUpdateEvent($input: PropertyUpdateEventInput!) {
  publishPropertyUpdateEvent(input: $input) {
    changes {
      field
      newValue
      oldValue
      __typename
    }
    eventType
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
      landlord {
        firstName
        lastName
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
      version
      __typename
    }
    propertyId
    timestamp
    __typename
  }
}
` as GeneratedMutation<
  APITypes.PublishPropertyUpdateEventMutationVariables,
  APITypes.PublishPropertyUpdateEventMutation
>;
export const publishShortTermProperty = /* GraphQL */ `mutation PublishShortTermProperty($propertyId: ID!) {
  publishShortTermProperty(propertyId: $propertyId) {
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
    cancellationPolicy
    checkInInstructions
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
    host {
      firstName
      lastName
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
    taxPercentage
    thumbnail
    title
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.PublishShortTermPropertyMutationVariables,
  APITypes.PublishShortTermPropertyMutation
>;
export const regenerateLocationJson = /* GraphQL */ `mutation RegenerateLocationJson {
  regenerateLocationJson {
    cloudfrontUrl
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.RegenerateLocationJsonMutationVariables,
  APITypes.RegenerateLocationJsonMutation
>;
export const rejectProperty = /* GraphQL */ `mutation RejectProperty($propertyId: ID!, $reason: String!) {
  rejectProperty(propertyId: $propertyId, reason: $reason) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.RejectPropertyMutationVariables,
  APITypes.RejectPropertyMutation
>;
export const removePropertyAgent = /* GraphQL */ `mutation RemovePropertyAgent($propertyId: ID!) {
  removePropertyAgent(propertyId: $propertyId) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.RemovePropertyAgentMutationVariables,
  APITypes.RemovePropertyAgentMutation
>;
export const resendVerificationCode = /* GraphQL */ `mutation ResendVerificationCode($email: String!) {
  resendVerificationCode(email: $email) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.ResendVerificationCodeMutationVariables,
  APITypes.ResendVerificationCodeMutation
>;
export const resetPassword = /* GraphQL */ `mutation ResetPassword(
  $confirmationCode: String!
  $email: String!
  $newPassword: String!
) {
  resetPassword(
    confirmationCode: $confirmationCode
    email: $email
    newPassword: $newPassword
  ) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.ResetPasswordMutationVariables,
  APITypes.ResetPasswordMutation
>;
export const respondToReview = /* GraphQL */ `mutation RespondToReview($input: RespondToReviewInput!) {
  respondToReview(input: $input) {
    accuracy
    bookingId
    cleanliness
    comment
    communication
    createdAt
    guest {
      firstName
      lastName
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
}
` as GeneratedMutation<
  APITypes.RespondToReviewMutationVariables,
  APITypes.RespondToReviewMutation
>;
export const reviewLandlordApplication = /* GraphQL */ `mutation ReviewLandlordApplication(
  $applicationId: ID!
  $notes: String
  $status: LandlordApplicationStatus!
) {
  reviewLandlordApplication(
    applicationId: $applicationId
    notes: $notes
    status: $status
  ) {
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
` as GeneratedMutation<
  APITypes.ReviewLandlordApplicationMutationVariables,
  APITypes.ReviewLandlordApplicationMutation
>;
export const sendMessage = /* GraphQL */ `mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
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
` as GeneratedMutation<
  APITypes.SendMessageMutationVariables,
  APITypes.SendMessageMutation
>;
export const signIn = /* GraphQL */ `mutation SignIn($email: String!, $password: String!) {
  signIn(email: $email, password: $password) {
    accessToken
    refreshToken
    __typename
  }
}
` as GeneratedMutation<
  APITypes.SignInMutationVariables,
  APITypes.SignInMutation
>;
export const signUp = /* GraphQL */ `mutation SignUp($input: SignUpInput!) {
  signUp(input: $input) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.SignUpMutationVariables,
  APITypes.SignUpMutation
>;
export const submitApplication = /* GraphQL */ `mutation SubmitApplication($input: SubmitApplicationInput!) {
  submitApplication(input: $input) {
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
      landlord {
        firstName
        lastName
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
` as GeneratedMutation<
  APITypes.SubmitApplicationMutationVariables,
  APITypes.SubmitApplicationMutation
>;
export const submitContactInquiry = /* GraphQL */ `mutation SubmitContactInquiry($input: SubmitContactInquiryInput!) {
  submitContactInquiry(input: $input) {
    createdAt
    inquiryId
    message
    __typename
  }
}
` as GeneratedMutation<
  APITypes.SubmitContactInquiryMutationVariables,
  APITypes.SubmitContactInquiryMutation
>;
export const submitLandlordApplication = /* GraphQL */ `mutation SubmitLandlordApplication($input: LandlordApplicationInput!) {
  submitLandlordApplication(input: $input) {
    applicationId
    message
    status
    submittedAt
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.SubmitLandlordApplicationMutationVariables,
  APITypes.SubmitLandlordApplicationMutation
>;
export const toggleFavorite = /* GraphQL */ `mutation ToggleFavorite($propertyId: ID!) {
  toggleFavorite(propertyId: $propertyId) {
    isFavorited
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.ToggleFavoriteMutationVariables,
  APITypes.ToggleFavoriteMutation
>;
export const unblockDates = /* GraphQL */ `mutation UnblockDates($input: UnblockDatesInput!) {
  unblockDates(input: $input) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UnblockDatesMutationVariables,
  APITypes.UnblockDatesMutation
>;
export const updateApplication = /* GraphQL */ `mutation UpdateApplication(
  $applicationId: ID!
  $input: UpdateApplicationInput!
) {
  updateApplication(applicationId: $applicationId, input: $input) {
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
      landlord {
        firstName
        lastName
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
` as GeneratedMutation<
  APITypes.UpdateApplicationMutationVariables,
  APITypes.UpdateApplicationMutation
>;
export const updateApplicationStatus = /* GraphQL */ `mutation UpdateApplicationStatus(
  $applicationId: ID!
  $input: UpdateApplicationStatusInput!
) {
  updateApplicationStatus(applicationId: $applicationId, input: $input) {
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
      landlord {
        firstName
        lastName
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
` as GeneratedMutation<
  APITypes.UpdateApplicationStatusMutationVariables,
  APITypes.UpdateApplicationStatusMutation
>;
export const updateContactInquiryStatus = /* GraphQL */ `mutation UpdateContactInquiryStatus(
  $adminNotes: String
  $inquiryId: ID!
  $status: InquiryStatus!
) {
  updateContactInquiryStatus(
    adminNotes: $adminNotes
    inquiryId: $inquiryId
    status: $status
  ) {
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
` as GeneratedMutation<
  APITypes.UpdateContactInquiryStatusMutationVariables,
  APITypes.UpdateContactInquiryStatusMutation
>;
export const updateLocation = /* GraphQL */ `mutation UpdateLocation($locationId: ID!, $name: String!) {
  updateLocation(locationId: $locationId, name: $name) {
    location {
      id
      name
      __typename
    }
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateLocationMutationVariables,
  APITypes.UpdateLocationMutation
>;
export const updateProperty = /* GraphQL */ `mutation UpdateProperty($input: UpdatePropertyInput!, $propertyId: ID!) {
  updateProperty(input: $input, propertyId: $propertyId) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdatePropertyMutationVariables,
  APITypes.UpdatePropertyMutation
>;
export const updatePropertyStatus = /* GraphQL */ `mutation UpdatePropertyStatus($propertyId: ID!, $status: PropertyStatus!) {
  updatePropertyStatus(propertyId: $propertyId, status: $status) {
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
    landlord {
      firstName
      lastName
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
    version
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdatePropertyStatusMutationVariables,
  APITypes.UpdatePropertyStatusMutation
>;
export const updateShortTermProperty = /* GraphQL */ `mutation UpdateShortTermProperty(
  $input: UpdateShortTermPropertyInput!
  $propertyId: ID!
) {
  updateShortTermProperty(input: $input, propertyId: $propertyId) {
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
    cancellationPolicy
    checkInInstructions
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
    host {
      firstName
      lastName
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
    taxPercentage
    thumbnail
    title
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateShortTermPropertyMutationVariables,
  APITypes.UpdateShortTermPropertyMutation
>;
export const updateUser = /* GraphQL */ `mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateUserMutationVariables,
  APITypes.UpdateUserMutation
>;
export const updateUserRole = /* GraphQL */ `mutation UpdateUserRole($userId: ID!, $userType: UserType!) {
  updateUserRole(userId: $userId, userType: $userType) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateUserRoleMutationVariables,
  APITypes.UpdateUserRoleMutation
>;
export const updateUserStatus = /* GraphQL */ `mutation UpdateUserStatus(
  $reason: String
  $status: AccountStatus!
  $userId: ID!
) {
  updateUserStatus(reason: $reason, status: $status, userId: $userId) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateUserStatusMutationVariables,
  APITypes.UpdateUserStatusMutation
>;
export const verifyEmail = /* GraphQL */ `mutation VerifyEmail($code: String!, $email: String!) {
  verifyEmail(code: $code, email: $email) {
    message
    success
    __typename
  }
}
` as GeneratedMutation<
  APITypes.VerifyEmailMutationVariables,
  APITypes.VerifyEmailMutation
>;
