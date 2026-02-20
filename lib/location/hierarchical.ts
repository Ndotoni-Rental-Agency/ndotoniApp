/**
 * Hierarchical Location Data Fetching
 * 
 * Provides functions to fetch location data hierarchically from the GraphQL API:
 * Region → District → Ward → Street
 */

import { GraphQLClient } from '@/lib/graphql-client';
import { getRegions, getDistricts, getWards, getStreets } from '@/lib/graphql/queries';

export interface Region {
  id: string;
  name: string;
}

export interface District {
  id: string;
  name: string;
  regionId: string;
}

export interface Ward {
  id: string;
  name: string;
  districtId: string;
}

export interface Street {
  id: string;
  name: string;
  wardId: string;
}

/**
 * Fetch all regions
 */
export async function fetchRegions(): Promise<Region[]> {
  try {
    const response = await GraphQLClient.executePublic<{ getRegions: Region[] }>(
      getRegions
    );
    return response.getRegions || [];
  } catch (error) {
    console.error('[hierarchical] Error fetching regions:', error);
    throw new Error('Failed to load regions');
  }
}

/**
 * Fetch districts for a specific region
 */
export async function fetchDistricts(regionId: string): Promise<District[]> {
  try {
    const response = await GraphQLClient.executePublic<{ getDistricts: District[] }>(
      getDistricts,
      { regionId }
    );
    return response.getDistricts || [];
  } catch (error) {
    console.error('[hierarchical] Error fetching districts:', error);
    throw new Error('Failed to load districts');
  }
}

/**
 * Fetch wards for a specific district
 */
export async function fetchWards(districtId: string): Promise<Ward[]> {
  try {
    const response = await GraphQLClient.executePublic<{ getWards: Ward[] }>(
      getWards,
      { districtId }
    );
    return response.getWards || [];
  } catch (error) {
    console.error('[hierarchical] Error fetching wards:', error);
    throw new Error('Failed to load wards');
  }
}

/**
 * Fetch streets for a specific ward
 */
export async function fetchStreets(wardId: string): Promise<Street[]> {
  try {
    const response = await GraphQLClient.executePublic<{ getStreets: Street[] }>(
      getStreets,
      { wardId }
    );
    return response.getStreets || [];
  } catch (error) {
    console.error('[hierarchical] Error fetching streets:', error);
    throw new Error('Failed to load streets');
  }
}
