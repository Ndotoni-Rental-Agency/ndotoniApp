/**
 * API Client for Mobile App
 * 
 * Provides high-level API methods using the GraphQLClient
 * All methods automatically handle authentication
 */

import GraphQLClient from './graphql-client';
import type {
  ShortTermSearchInput,
  ShortTermPropertyListResponse,
  PropertyCardsResponse,
  PropertySearchInput,
} from './API';

/**
 * Search for short-term rental properties
 * Uses public API (no authentication required)
 */
export async function searchShortTermProperties(
  input: ShortTermSearchInput
): Promise<ShortTermPropertyListResponse> {
  const query = `
    query SearchShortTermProperties($input: ShortTermSearchInput!) {
      searchShortTermProperties(input: $input) {
        properties {
          propertyId
          title
          propertyType
          nightlyRate
          currency
          region
          district
          thumbnail
          maxGuests
          averageRating
          instantBookEnabled
          status
          createdAt
          updatedAt
        }
        nextToken
      }
    }
  `;

  const result = await GraphQLClient.executePublic<{
    searchShortTermProperties: ShortTermPropertyListResponse;
  }>(query, { input });

  return result.searchShortTermProperties;
}

/**
 * Search for long-term rental properties
 * Uses public API (no authentication required)
 */
export async function searchLongTermProperties(
  input: PropertySearchInput
): Promise<PropertyCardsResponse> {
  const query = `
    query GetPropertiesByLocation(
      $region: String!
      $district: String
      $bedrooms: Int
      $minPrice: Float
      $maxPrice: Float
      $propertyType: PropertyType
      $moveInDate: AWSDate
      $limit: Int
      $nextToken: String
      $sortBy: PropertySortOption
    ) {
      getPropertiesByLocation(
        region: $region
        district: $district
        bedrooms: $bedrooms
        minPrice: $minPrice
        maxPrice: $maxPrice
        propertyType: $propertyType
        moveInDate: $moveInDate
        limit: $limit
        nextToken: $nextToken
        sortBy: $sortBy
      ) {
        properties {
          propertyId
          title
          propertyType
          monthlyRent
          currency
          region
          district
          thumbnail
          bedrooms
        }
        count
        nextToken
      }
    }
  `;

  const result = await GraphQLClient.executePublic<{
    getPropertiesByLocation: PropertyCardsResponse;
  }>(query, input);

  return result.getPropertiesByLocation;
}

/**
 * Get categorized properties for homepage
 * Uses public API (no authentication required)
 */
export async function getCategorizedProperties(limitPerCategory: number = 10) {
  const query = `
    query GetCategorizedProperties($limitPerCategory: Int) {
      getCategorizedProperties(limitPerCategory: $limitPerCategory) {
        nearby {
          category
          properties {
            propertyId
            title
            propertyType
            monthlyRent
            currency
            region
            district
            thumbnail
            bedrooms
          }
          count
          nextToken
        }
        lowestPrice {
          category
          properties {
            propertyId
            title
            propertyType
            monthlyRent
            currency
            region
            district
            thumbnail
            bedrooms
          }
          count
          nextToken
        }
        mostViewed {
          category
          properties {
            propertyId
            title
            propertyType
            monthlyRent
            currency
            region
            district
            thumbnail
            bedrooms
          }
          count
          nextToken
        }
        recentlyViewed {
          category
          properties {
            propertyId
            title
            propertyType
            monthlyRent
            currency
            region
            district
            thumbnail
            bedrooms
          }
          count
          nextToken
        }
        favorites {
          category
          properties {
            propertyId
            title
            propertyType
            monthlyRent
            currency
            region
            district
            thumbnail
            bedrooms
          }
          count
          nextToken
        }
        more {
          category
          properties {
            propertyId
            title
            propertyType
            monthlyRent
            currency
            region
            district
            thumbnail
            bedrooms
          }
          count
          nextToken
        }
      }
    }
  `;

  const result = await GraphQLClient.executePublic<{
    getCategorizedProperties: any;
  }>(query, { limitPerCategory });

  return result.getCategorizedProperties;
}

/**
 * Get property details by ID
 * Uses public API (no authentication required)
 */
export async function getProperty(propertyId: string) {
  const query = `
    query GetProperty($propertyId: ID!) {
      getProperty(propertyId: $propertyId) {
        propertyId
        title
        description
        propertyType
        status
        address {
          region
          district
          ward
          street
          postalCode
          coordinates {
            latitude
            longitude
          }
        }
        pricing {
          monthlyRent
          currency
          deposit
          serviceCharge
          utilitiesIncluded
        }
        specifications {
          bedrooms
          bathrooms
          squareMeters
          furnished
          parkingSpaces
          floors
        }
        amenities
        media {
          images
          videos
          floorPlan
          virtualTour
        }
        availability {
          available
          availableFrom
          minimumLeaseTerm
          maximumLeaseTerm
        }
        landlord {
          firstName
          lastName
          whatsappNumber
        }
        createdAt
        updatedAt
      }
    }
  `;

  const result = await GraphQLClient.executePublic<{
    getProperty: any;
  }>(query, { propertyId });

  return result.getProperty;
}

/**
 * Get short-term property details by ID
 * Uses public API (no authentication required)
 */
export async function getShortTermProperty(propertyId: string) {
  const query = `
    query GetShortTermProperty($propertyId: ID!) {
      getShortTermProperty(propertyId: $propertyId) {
        propertyId
        title
        description
        propertyType
        status
        nightlyRate
        cleaningFee
        currency
        region
        district
        address {
          street
          city
          region
          district
          country
          postalCode
        }
        coordinates {
          latitude
          longitude
        }
        maxGuests
        maxAdults
        maxChildren
        maxInfants
        minimumStay
        maximumStay
        checkInTime
        checkOutTime
        instantBookEnabled
        cancellationPolicy
        amenities
        houseRules
        images
        thumbnail
        allowsPets
        allowsSmoking
        allowsChildren
        allowsInfants
        advanceBookingDays
        checkInInstructions
        serviceFeePercentage
        taxPercentage
        averageRating
        host {
          firstName
          lastName
          whatsappNumber
        }
        ratingSummary {
          averageRating
          totalReviews
          cleanliness
          accuracy
          communication
          location
          value
          fiveStars
          fourStars
          threeStars
          twoStars
          oneStar
        }
        createdAt
        updatedAt
        publishedAt
      }
    }
  `;

  const result = await GraphQLClient.executePublic<{
    getShortTermProperty: any;
  }>(query, { propertyId });

  return result.getShortTermProperty;
}

/**
 * Toggle property favorite status
 * Requires authentication
 */
export async function toggleFavorite(propertyId: string) {
  const mutation = `
    mutation ToggleFavorite($propertyId: ID!) {
      toggleFavorite(propertyId: $propertyId) {
        success
        isFavorited
        message
      }
    }
  `;

  const result = await GraphQLClient.executeAuthenticated<{
    toggleFavorite: any;
  }>(mutation, { propertyId });

  return result.toggleFavorite;
}

/**
 * Get user's favorite properties
 * Requires authentication
 */
export async function getMyFavorites(limit: number = 20, nextToken?: string) {
  const query = `
    query GetPropertiesByCategory($category: PropertyCategory!, $limit: Int, $nextToken: String) {
      getPropertiesByCategory(category: $category, limit: $limit, nextToken: $nextToken) {
        category
        properties {
          propertyId
          title
          propertyType
          monthlyRent
          currency
          region
          district
          thumbnail
          bedrooms
        }
        count
        nextToken
      }
    }
  `;

  const result = await GraphQLClient.executeAuthenticated<{
    getPropertiesByCategory: any;
  }>(query, { category: 'FAVORITES', limit, nextToken });

  return result.getPropertiesByCategory;
}

// Export all functions as a single API object for convenience
export const api = {
  searchShortTermProperties,
  searchLongTermProperties,
  getCategorizedProperties,
  getProperty,
  getShortTermProperty,
  toggleFavorite,
  getMyFavorites,
  fetchLongTermProperties,
  fetchShortTermProperties,
};

export default api;

/**
 * Fetch long-term properties for homepage
 * Returns categorized properties (lowest price, nearby, etc.)
 */
export async function fetchLongTermProperties() {
  const categorized = await getCategorizedProperties(10);
  
  return {
    lowestPrice: categorized.lowestPrice?.properties || [],
    nearby: categorized.nearby?.properties || [],
    mostViewed: categorized.mostViewed?.properties || [],
    recentlyViewed: categorized.recentlyViewed?.properties || [],
    favorites: categorized.favorites?.properties || [],
  };
}

/**
 * Fetch short-term properties for homepage
 * Returns categorized properties (lowest price, top rated, featured)
 */
export async function fetchShortTermProperties() {
  const categorized = await getCategorizedProperties(10);
  
  return {
    lowestPrice: categorized.lowestPrice?.properties || [],
    topRated: categorized.mostViewed?.properties || [],
    featured: categorized.nearby?.properties || [],
  };
}
