// Geocoding utilities for mobile app
// Uses OpenStreetMap Nominatim API for geocoding

export interface CoordinatesInput {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  region: string;
  district: string;
  ward?: string;
  street?: string;
}

// Fallback coordinates for major Tanzanian districts and wards
// Format: Region -> District -> Coordinates
const DISTRICT_COORDINATES: Record<string, Record<string, CoordinatesInput>> = {
  'Dar es Salaam': {
    'Kinondoni': { latitude: -6.7924, longitude: 39.2083 },
    'Ilala': { latitude: -6.8160, longitude: 39.2803 },
    'Temeke': { latitude: -6.8500, longitude: 39.2667 },
    'Ubungo': { latitude: -6.7833, longitude: 39.2500 },
    'Kigamboni': { latitude: -6.8667, longitude: 39.3167 },
  },
  'Arusha': {
    'Arusha': { latitude: -3.3869, longitude: 36.6830 },
    'Meru': { latitude: -3.3333, longitude: 36.7500 },
    'Karatu': { latitude: -3.4833, longitude: 35.7500 },
  },
  'Mwanza': {
    'Ilemela': { latitude: -2.4667, longitude: 32.9167 },
    'Nyamagana': { latitude: -2.5167, longitude: 32.9000 },
    'Mwanza': { latitude: -2.5167, longitude: 32.9000 },
  },
  'Dodoma': {
    'Dodoma': { latitude: -6.1630, longitude: 35.7516 },
  },
  'Mbeya': {
    'Mbeya': { latitude: -8.9000, longitude: 33.4500 },
  },
  'Morogoro': {
    'Morogoro': { latitude: -6.8211, longitude: 37.6636 },
  },
  'Tanga': {
    'Tanga': { latitude: -5.0689, longitude: 39.0986 },
  },
  'Zanzibar': {
    'Zanzibar Urban': { latitude: -6.1659, longitude: 39.2026 },
    'Zanzibar West': { latitude: -6.2278, longitude: 39.2203 },
  },
  'Shinyanga': {
    'Shinyanga': { latitude: -3.6667, longitude: 33.4167 },
    'Kahama': { latitude: -3.8333, longitude: 32.6000 },
  },
  'Mara': {
    'Musoma': { latitude: -1.5000, longitude: 33.8000 },
    'Tarime': { latitude: -1.3500, longitude: 34.3667 },
  },
  'Kagera': {
    'Bukoba': { latitude: -1.3317, longitude: 31.8122 },
  },
  'Kilimanjaro': {
    'Moshi': { latitude: -3.3500, longitude: 37.3333 },
    'Hai': { latitude: -3.3667, longitude: 37.4500 },
  },
  'Pwani': {
    'Kibaha': { latitude: -6.7667, longitude: 38.9167 },
    'Bagamoyo': { latitude: -6.4333, longitude: 38.9000 },
  },
  'Iringa': {
    'Iringa': { latitude: -7.7667, longitude: 35.6833 },
  },
  'Ruvuma': {
    'Songea': { latitude: -10.6833, longitude: 35.6500 },
  },
  'Kigoma': {
    'Kigoma': { latitude: -4.8833, longitude: 29.6333 },
  },
  'Tabora': {
    'Tabora': { latitude: -5.0167, longitude: 32.8000 },
  },
  'Rukwa': {
    'Sumbawanga': { latitude: -7.9667, longitude: 31.6167 },
  },
  'Lindi': {
    'Lindi': { latitude: -9.9833, longitude: 39.7167 },
  },
  'Mtwara': {
    'Mtwara': { latitude: -10.2667, longitude: 40.1833 },
  },
};

// Ward-level coordinates for more precise locations
const WARD_COORDINATES: Record<string, Record<string, Record<string, CoordinatesInput>>> = {
  'Dar es Salaam': {
    'Kinondoni': {
      'Mikocheni': { latitude: -6.7833, longitude: 39.2500 },
      'Msasani': { latitude: -6.7667, longitude: 39.2667 },
      'Oyster Bay': { latitude: -6.7833, longitude: 39.2833 },
      'Masaki': { latitude: -6.7667, longitude: 39.2833 },
      'Sinza': { latitude: -6.7833, longitude: 39.2167 },
      'Mwananyamala': { latitude: -6.7667, longitude: 39.2333 },
      'Kinondoni': { latitude: -6.7924, longitude: 39.2083 },
    },
    'Ilala': {
      'Kariakoo': { latitude: -6.8167, longitude: 39.2833 },
      'Kisutu': { latitude: -6.8167, longitude: 39.2833 },
      'Upanga': { latitude: -6.8000, longitude: 39.2833 },
      'Mchikichini': { latitude: -6.8167, longitude: 39.2667 },
      'Ilala': { latitude: -6.8160, longitude: 39.2803 },
    },
    'Temeke': {
      'Temeke': { latitude: -6.8500, longitude: 39.2667 },
      'Mbagala': { latitude: -6.8667, longitude: 39.2500 },
      'Kigamboni': { latitude: -6.8667, longitude: 39.3167 },
    },
    'Ubungo': {
      'Ubungo': { latitude: -6.7833, longitude: 39.2500 },
      'Manzese': { latitude: -6.7833, longitude: 39.2333 },
    },
  },
};

/**
 * Get approximate coordinates for a location using OpenStreetMap Nominatim API
 * Falls back to hardcoded coordinates for known districts and wards
 */
export async function getApproximateCoordinates(
  location: LocationData
): Promise<CoordinatesInput | null> {
  if (!location.region || !location.district) {
    return null;
  }

  // Normalize location names to title case for better matching
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const normalizedRegion = normalizeText(location.region);
  const normalizedDistrict = normalizeText(location.district);
  const normalizedWard = location.ward ? normalizeText(location.ward) : undefined;

  // First, try ward-level fallback coordinates if ward is provided
  if (normalizedWard) {
    const wardCoords = WARD_COORDINATES[normalizedRegion]?.[normalizedDistrict]?.[normalizedWard];
    if (wardCoords) {
      console.log('[Geocoding] Using ward-level fallback coordinates for', normalizedWard, normalizedDistrict, normalizedRegion);
      return wardCoords;
    }
  }

  // Second, try district-level fallback coordinates
  const districtCoords = DISTRICT_COORDINATES[normalizedRegion]?.[normalizedDistrict];
  if (districtCoords) {
    console.log('[Geocoding] Using district-level fallback coordinates for', normalizedDistrict, normalizedRegion);
    return districtCoords;
  }

  try {
    // Try multiple search strategies
    const searchQueries = [
      // Strategy 1: District + Region + Country
      `${normalizedDistrict}, ${normalizedRegion}, Tanzania`,
      // Strategy 2: District with "District" suffix
      `${normalizedDistrict} District, ${normalizedRegion}, Tanzania`,
      // Strategy 3: Just district and country
      `${normalizedDistrict}, Tanzania`,
    ];

    for (const query of searchQueries) {
      console.log('[Geocoding] Trying search:', query);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(query)}&` +
        `countrycodes=tz&` + // Restrict to Tanzania
        `limit=1`
      );

      if (!response.ok) {
        console.warn('[Geocoding] API request failed:', response.status);
        continue;
      }

      const data = await response.json();

      if (data?.[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        console.log('[Geocoding] Found coordinates:', { lat, lng, display_name: data[0].display_name });

        if (!isNaN(lat) && !isNaN(lng)) {
          // Validate that coordinates are within Tanzania bounds
          // Tanzania: lat -1 to -12, lng 29 to 41
          if (lat >= -12 && lat <= -1 && lng >= 29 && lng <= 41) {
            return {
              latitude: lat,
              longitude: lng,
            };
          } else {
            console.warn('[Geocoding] Coordinates outside Tanzania bounds:', { lat, lng });
          }
        }
      }

      // Add a small delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.warn('[Geocoding] No coordinates found for location after all attempts');
    return null;
  } catch (error) {
    console.error('[Geocoding] Error:', error);
    return null;
  }
}
