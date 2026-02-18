/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const dummySubscription = /* GraphQL */ `subscription DummySubscription {
  dummySubscription
}
` as GeneratedSubscription<
  APITypes.DummySubscriptionSubscriptionVariables,
  APITypes.DummySubscriptionSubscription
>;
export const onNewMessage = /* GraphQL */ `subscription OnNewMessage($conversationId: String!) {
  onNewMessage(conversationId: $conversationId) {
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
` as GeneratedSubscription<
  APITypes.OnNewMessageSubscriptionVariables,
  APITypes.OnNewMessageSubscription
>;
export const onNewPropertyInRegion = /* GraphQL */ `subscription OnNewPropertyInRegion($region: String!) {
  onNewPropertyInRegion(region: $region) {
    message
    propertyId
    success
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnNewPropertyInRegionSubscriptionVariables,
  APITypes.OnNewPropertyInRegionSubscription
>;
export const onPropertyUpdated = /* GraphQL */ `subscription OnPropertyUpdated($propertyId: ID!) {
  onPropertyUpdated(propertyId: $propertyId) {
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
` as GeneratedSubscription<
  APITypes.OnPropertyUpdatedSubscriptionVariables,
  APITypes.OnPropertyUpdatedSubscription
>;
