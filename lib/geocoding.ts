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

/**
 * Get approximate coordinates for a location using OpenStreetMap Nominatim API
 */
export async function getApproximateCoordinates(
  location: LocationData
): Promise<CoordinatesInput | null> {
  if (!location.region || !location.district) {
    return null;
  }

  try {
    const query = [
      location.street,
      location.ward,
      location.district,
      location.region,
      'Tanzania',
    ]
      .filter(Boolean)
      .join(', ');

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}`
    );

    if (!response.ok) {
      console.warn('Geocoding API request failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (data?.[0]) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);

      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          latitude: lat,
          longitude: lng,
        };
      }
    }

    console.warn('No coordinates found for location:', query);
    return null;
  } catch (error) {
    console.error('Error geocoding location:', error);
    return null;
  }
}
