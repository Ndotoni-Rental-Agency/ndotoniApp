/**
 * Tanzania Locations Database
 * Approximate coordinates for regions and major districts
 * Used as fallback when geocoding API is unavailable
 */

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface LocationData {
  [key: string]: LocationCoordinates;
}

// Major regions in Tanzania with approximate center coordinates
export const TANZANIA_REGIONS: LocationData = {
  'ARUSHA': { latitude: -3.3869, longitude: 36.6830 },
  'DAR-ES-SALAAM': { latitude: -6.7924, longitude: 39.2083 },
  'DODOMA': { latitude: -6.1630, longitude: 35.7516 },
  'GEITA': { latitude: -2.8667, longitude: 32.2333 },
  'IRINGA': { latitude: -7.7667, longitude: 35.6833 },
  'KAGERA': { latitude: -1.3000, longitude: 31.2667 },
  'KATAVI': { latitude: -6.3667, longitude: 31.2333 },
  'KIGOMA': { latitude: -4.8833, longitude: 29.6333 },
  'KILIMANJARO': { latitude: -3.3667, longitude: 37.3500 },
  'LINDI': { latitude: -10.0000, longitude: 39.7167 },
  'MANYARA': { latitude: -4.3167, longitude: 36.7333 },
  'MARA': { latitude: -1.7750, longitude: 34.8583 },
  'MBEYA': { latitude: -8.9000, longitude: 33.4500 },
  'MOROGORO': { latitude: -6.8211, longitude: 37.6614 },
  'MTWARA': { latitude: -10.2667, longitude: 40.1833 },
  'MWANZA': { latitude: -2.5167, longitude: 32.9000 },
  'NJOMBE': { latitude: -9.3333, longitude: 34.7667 },
  'PEMBA-NORTH': { latitude: -5.0333, longitude: 39.7667 },
  'PEMBA-SOUTH': { latitude: -5.3167, longitude: 39.7500 },
  'PWANI': { latitude: -6.7833, longitude: 38.7833 },
  'RUKWA': { latitude: -7.9667, longitude: 31.9333 },
  'RUVUMA': { latitude: -10.7000, longitude: 35.7500 },
  'SHINYANGA': { latitude: -3.6667, longitude: 33.4167 },
  'SIMIYU': { latitude: -3.0000, longitude: 34.0000 },
  'SINGIDA': { latitude: -4.8167, longitude: 34.7333 },
  'SONGWE': { latitude: -9.2167, longitude: 33.4500 },
  'TABORA': { latitude: -5.0167, longitude: 32.8000 },
  'TANGA': { latitude: -5.0689, longitude: 39.0986 },
  'ZANZIBAR-NORTH': { latitude: -5.9167, longitude: 39.2833 },
  'ZANZIBAR-SOUTH': { latitude: -6.2333, longitude: 39.5000 },
  'ZANZIBAR-URBAN': { latitude: -6.1639, longitude: 39.1983 },
};

// Major districts with approximate coordinates
export const TANZANIA_DISTRICTS: LocationData = {
  // Dar es Salaam Districts
  'ILALA': { latitude: -6.8160, longitude: 39.2803 },
  'KINONDONI': { latitude: -6.7667, longitude: 39.2167 },
  'TEMEKE': { latitude: -6.8500, longitude: 39.2667 },
  'UBUNGO': { latitude: -6.7833, longitude: 39.2500 },
  'KIGAMBONI': { latitude: -6.8667, longitude: 39.2833 },
  
  // Dar es Salaam Wards - Ilala
  'KARIAKOO': { latitude: -6.8167, longitude: 39.2833 },
  'KISUTU': { latitude: -6.8167, longitude: 39.2833 },
  'UPANGA-WEST': { latitude: -6.8000, longitude: 39.2833 },
  'UPANGA-EAST': { latitude: -6.8000, longitude: 39.2900 },
  'MCHIKICHINI': { latitude: -6.8167, longitude: 39.2667 },
  'GEREZANI': { latitude: -6.8200, longitude: 39.2850 },
  'KIVUKONI': { latitude: -6.8150, longitude: 39.2900 },
  'JANGWANI': { latitude: -6.8100, longitude: 39.2700 },
  'BUGURUNI': { latitude: -6.8300, longitude: 39.2600 },
  'TABATA': { latitude: -6.8400, longitude: 39.2400 },
  'SEGEREA': { latitude: -6.8500, longitude: 39.2300 },
  'PUGU': { latitude: -6.9000, longitude: 39.1500 },
  
  // Dar es Salaam Wards - Kinondoni
  'MIKOCHENI': { latitude: -6.7833, longitude: 39.2500 },
  'MSASANI': { latitude: -6.7667, longitude: 39.2667 },
  'OYSTER-BAY': { latitude: -6.7833, longitude: 39.2833 },
  'MASAKI': { latitude: -6.7667, longitude: 39.2833 },
  'SINZA': { latitude: -6.7833, longitude: 39.2167 },
  'MWANANYAMALA': { latitude: -6.7667, longitude: 39.2333 },
  'KINONDONI': { latitude: -6.7924, longitude: 39.2083 },
  'MAGOMENI': { latitude: -6.8000, longitude: 39.2500 },
  'MANZESE': { latitude: -6.7833, longitude: 39.2333 },
  'TANDALE': { latitude: -6.7900, longitude: 39.2400 },
  'KIJITONYAMA': { latitude: -6.7700, longitude: 39.2300 },
  'KAWE': { latitude: -6.7500, longitude: 39.2200 },
  'MBEZI': { latitude: -6.7400, longitude: 39.2100 },
  'GOBA': { latitude: -6.7300, longitude: 39.2000 },
  
  // Dar es Salaam Wards - Temeke
  'TEMEKE': { latitude: -6.8500, longitude: 39.2667 },
  'MBAGALA': { latitude: -6.8667, longitude: 39.2500 },
  'CHANG\'OMBE': { latitude: -6.8400, longitude: 39.2700 },
  'KEKO': { latitude: -6.8350, longitude: 39.2750 },
  'KURASINI': { latitude: -6.8500, longitude: 39.2800 },
  'MTONI': { latitude: -6.8600, longitude: 39.2400 },
  'SANDALI': { latitude: -6.8700, longitude: 39.2300 },
  
  // Dar es Salaam Wards - Ubungo
  'UBUNGO': { latitude: -6.7833, longitude: 39.2500 },
  'MBURAHATI': { latitude: -6.7900, longitude: 39.2600 },
  'MAKUBURI': { latitude: -6.7950, longitude: 39.2550 },
  'MAKUMBUSHO': { latitude: -6.7800, longitude: 39.2450 },
  
  // Dar es Salaam Wards - Kigamboni
  'KIGAMBONI': { latitude: -6.8667, longitude: 39.3167 },
  'VIJIBWENI': { latitude: -6.8700, longitude: 39.3200 },
  'KIBADA': { latitude: -6.8800, longitude: 39.3100 },
  'SOMANGIRA': { latitude: -6.8900, longitude: 39.3000 },
  
  // Arusha
  'ARUSHA-CITY': { latitude: -3.3869, longitude: 36.6830 },
  'MERU': { latitude: -3.3333, longitude: 36.7833 },
  'KARATU': { latitude: -3.3333, longitude: 35.7500 },
  
  // Mwanza
  'ILEMELA': { latitude: -2.5833, longitude: 32.9167 },
  'NYAMAGANA': { latitude: -2.5167, longitude: 32.9167 },
  
  // Dodoma
  'DODOMA-URBAN': { latitude: -6.1630, longitude: 35.7516 },
  'KONDOA': { latitude: -4.9000, longitude: 35.7833 },
  
  // Mbeya
  'MBEYA-CITY': { latitude: -8.9000, longitude: 33.4500 },
  'MBEYA-RURAL': { latitude: -8.9167, longitude: 33.4167 },
  
  // Morogoro
  'MOROGORO-URBAN': { latitude: -6.8211, longitude: 37.6614 },
  'MOROGORO-RURAL': { latitude: -6.8333, longitude: 37.6667 },
  
  // Tanga
  'TANGA-CITY': { latitude: -5.0689, longitude: 39.0986 },
  'MUHEZA': { latitude: -5.1667, longitude: 38.7833 },
  
  // Kilimanjaro
  'MOSHI-URBAN': { latitude: -3.3500, longitude: 37.3333 },
  'MOSHI-RURAL': { latitude: -3.3333, longitude: 37.3500 },
  'HAI': { latitude: -3.2667, longitude: 37.4667 },
};

/**
 * Get coordinates for a location (region or district)
 * @param location - Location name (normalized to uppercase with hyphens)
 * @returns Coordinates or null if not found
 */
export function getLocationCoordinates(location: string): LocationCoordinates | null {
  const normalized = location.toUpperCase().replace(/\s+/g, '-');
  
  // Check districts first (more specific)
  if (TANZANIA_DISTRICTS[normalized]) {
    return TANZANIA_DISTRICTS[normalized];
  }
  
  // Then check regions
  if (TANZANIA_REGIONS[normalized]) {
    return TANZANIA_REGIONS[normalized];
  }
  
  return null;
}

/**
 * Get coordinates from address components
 * Tries to find the most specific location available
 * Priority: Ward > District > Region
 */
export function getCoordinatesFromAddress(
  region?: string,
  district?: string,
  ward?: string
): LocationCoordinates | null {
  // Normalize function to handle various formats
  const normalize = (text: string) => {
    return text.toUpperCase().replace(/\s+/g, '-');
  };

  // Strategy 1: Try ward-level coordinates (most specific)
  if (ward && district && region) {
    // Try: REGION::DISTRICT::WARD format
    const wardKey1 = `${normalize(region)}::${normalize(district)}::${normalize(ward)}`;
    if (TANZANIA_DISTRICTS[wardKey1]) {
      console.log('[TanzaniaLocations] Found ward-level coordinates:', wardKey1);
      return TANZANIA_DISTRICTS[wardKey1];
    }
    
    // Try: DISTRICT::WARD format
    const wardKey2 = `${normalize(district)}::${normalize(ward)}`;
    if (TANZANIA_DISTRICTS[wardKey2]) {
      console.log('[TanzaniaLocations] Found ward-level coordinates:', wardKey2);
      return TANZANIA_DISTRICTS[wardKey2];
    }
    
    // Try: Just WARD name
    const wardKey3 = normalize(ward);
    if (TANZANIA_DISTRICTS[wardKey3]) {
      console.log('[TanzaniaLocations] Found ward-level coordinates:', wardKey3);
      return TANZANIA_DISTRICTS[wardKey3];
    }
  }
  
  // Strategy 2: Try district-level coordinates
  if (district) {
    // Try: REGION::DISTRICT format
    if (region) {
      const districtKey1 = `${normalize(region)}::${normalize(district)}`;
      if (TANZANIA_DISTRICTS[districtKey1]) {
        console.log('[TanzaniaLocations] Found district-level coordinates:', districtKey1);
        return TANZANIA_DISTRICTS[districtKey1];
      }
    }
    
    // Try: Just DISTRICT name
    const districtKey2 = normalize(district);
    if (TANZANIA_DISTRICTS[districtKey2]) {
      console.log('[TanzaniaLocations] Found district-level coordinates:', districtKey2);
      return TANZANIA_DISTRICTS[districtKey2];
    }
  }
  
  // Strategy 3: Try region-level coordinates
  if (region) {
    const regionKey = normalize(region);
    if (TANZANIA_REGIONS[regionKey]) {
      console.log('[TanzaniaLocations] Found region-level coordinates:', regionKey);
      return TANZANIA_REGIONS[regionKey];
    }
  }
  
  // No match found
  console.log('[TanzaniaLocations] No coordinates found for:', { region, district, ward });
  return null;
}
