/**
 * React Hook for Hierarchical Location Selection
 * 
 * Provides a clean interface for selecting locations hierarchically:
 * Region → District → Ward → Street
 * 
 * Only fetches data when needed, dramatically improving performance
 * compared to loading all 40,000+ locations upfront.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchRegions,
  fetchDistricts,
  fetchWards,
  fetchStreets,
  Region,
  District,
  Ward,
  Street,
} from '@/lib/location/hierarchical';

export interface SelectedLocation {
  region?: Region;
  district?: District;
  ward?: Ward;
  street?: Street;
}

export interface UseHierarchicalLocationReturn {
  // Available options at each level
  regions: Region[];
  districts: District[];
  wards: Ward[];
  streets: Street[];
  
  // Currently selected values
  selected: SelectedLocation;
  
  // Selection handlers
  selectRegion: (region: Region | null) => void;
  selectDistrict: (district: District | null) => void;
  selectWard: (ward: Ward | null) => void;
  selectStreet: (street: Street | null) => void;
  
  // Reset all selections
  reset: () => void;
  
  // Loading states
  loadingRegions: boolean;
  loadingDistricts: boolean;
  loadingWards: boolean;
  loadingStreets: boolean;
  
  // Error states
  error: string | null;
}

export function useHierarchicalLocation(): UseHierarchicalLocationReturn {
  // Available options
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [streets, setStreets] = useState<Street[]>([]);
  
  // Selected values
  const [selected, setSelected] = useState<SelectedLocation>({});
  
  // Loading states
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingStreets, setLoadingStreets] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Load regions on mount
  useEffect(() => {
    const loadRegions = async () => {
      setLoadingRegions(true);
      setError(null);
      
      try {
        const data = await fetchRegions();
        setRegions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load regions');
        console.error('Error loading regions:', err);
      } finally {
        setLoadingRegions(false);
      }
    };
    
    loadRegions();
  }, []);
  
  // Select region handler
  const selectRegion = useCallback(async (region: Region | null) => {
    if (!region) {
      // Clear selection
      setSelected({});
      setDistricts([]);
      setWards([]);
      setStreets([]);
      return;
    }
    
    // Update selection and clear downstream
    setSelected({ region });
    setDistricts([]);
    setWards([]);
    setStreets([]);
    
    // Fetch districts for this region
    setLoadingDistricts(true);
    setError(null);
    
    try {
      const data = await fetchDistricts(region.id);
      setDistricts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load districts');
      console.error('Error loading districts:', err);
    } finally {
      setLoadingDistricts(false);
    }
  }, []);
  
  // Select district handler
  const selectDistrict = useCallback(async (district: District | null) => {
    if (!district) {
      // Clear district and downstream
      setSelected(prev => ({ region: prev.region }));
      setWards([]);
      setStreets([]);
      return;
    }
    
    // Update selection and clear downstream
    setSelected(prev => ({ region: prev.region, district }));
    setWards([]);
    setStreets([]);
    
    // Fetch wards for this district
    setLoadingWards(true);
    setError(null);
    
    try {
      const data = await fetchWards(district.id);
      setWards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wards');
      console.error('Error loading wards:', err);
    } finally {
      setLoadingWards(false);
    }
  }, []);
  
  // Select ward handler
  const selectWard = useCallback(async (ward: Ward | null) => {
    if (!ward) {
      // Clear ward and downstream
      setSelected(prev => ({ region: prev.region, district: prev.district }));
      setStreets([]);
      return;
    }
    
    // Update selection and clear downstream
    setSelected(prev => ({ region: prev.region, district: prev.district, ward }));
    setStreets([]);
    
    // Fetch streets for this ward
    setLoadingStreets(true);
    setError(null);
    
    try {
      const data = await fetchStreets(ward.id);
      setStreets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load streets');
      console.error('Error loading streets:', err);
    } finally {
      setLoadingStreets(false);
    }
  }, []);
  
  // Select street handler
  const selectStreet = useCallback((street: Street | null) => {
    if (!street) {
      // Clear street only
      setSelected(prev => ({ 
        region: prev.region, 
        district: prev.district, 
        ward: prev.ward 
      }));
      return;
    }
    
    // Update selection
    setSelected(prev => ({ 
      region: prev.region, 
      district: prev.district, 
      ward: prev.ward, 
      street 
    }));
  }, []);
  
  // Reset all selections
  const reset = useCallback(() => {
    setSelected({});
    setDistricts([]);
    setWards([]);
    setStreets([]);
    setError(null);
  }, []);
  
  return {
    regions,
    districts,
    wards,
    streets,
    selected,
    selectRegion,
    selectDistrict,
    selectWard,
    selectStreet,
    reset,
    loadingRegions,
    loadingDistricts,
    loadingWards,
    loadingStreets,
    error,
  };
}
