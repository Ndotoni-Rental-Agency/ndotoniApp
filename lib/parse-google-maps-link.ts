/**
 * Parse coordinates from any Google Maps URL by fetching the page and
 * extracting embedded lat/lng from the response content.
 *
 * This approach is more reliable than regex against URL patterns because
 * Google frequently changes URL formats, and short links resolve to addresses.
 * The page content always contains coordinates in static map image URLs or JS data.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export class GoogleMapsParser {
  /**
   * Synchronous parse for raw coordinate text like "-6.7924, 39.2083".
   * Use parseAsync() for any Google Maps URL.
   */
  static parse(input: string): Coordinates | null {
    if (!input || typeof input !== 'string') return null;
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Only handle raw coordinate text synchronously
    return GoogleMapsParser.fromRawCoords(trimmed);
  }

  /**
   * Resolve any Google Maps URL (short links, full URLs, etc.) by fetching
   * the page and extracting coordinates from the response.
   * Also handles raw coordinate text without a network call.
   */
  static async parseAsync(input: string): Promise<Coordinates | null> {
    if (!input || typeof input !== 'string') return null;
    const trimmed = input.trim();
    if (!trimmed) return null;

    // If it's raw coordinates, return immediately (no fetch needed)
    const raw = GoogleMapsParser.fromRawCoords(trimmed);
    if (raw) return raw;

    // For any URL, fetch the page and extract coordinates from the content
    if (/^https?:\/\//i.test(trimmed)) {
      console.log('[GoogleMapsParser] Fetching URL:', trimmed.substring(0, 80));
      const result = await GoogleMapsParser.fetchAndExtract(trimmed);
      console.log('[GoogleMapsParser] Fetch result:', result);
      return result;
    }

    return null;
  }

  /**
   * Fetch the URL (following all redirects) and extract coordinates.
   * Priority: URL coordinate patterns → geocode place name from q= param → page body @lat,lng
   */
  private static async fetchAndExtract(url: string): Promise<Coordinates | null> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      clearTimeout(timeout);

      const finalUrl = response.url;
      console.log('[GoogleMapsParser] Final resolved URL:', finalUrl?.substring(0, 150));

      // 1. Try extracting coordinates directly from the URL
      if (finalUrl) {
        const fromUrl = GoogleMapsParser.extractFromUrl(finalUrl);
        if (fromUrl) {
          console.log('[GoogleMapsParser] Extracted from URL:', fromUrl);
          return fromUrl;
        }

        // 2. If the URL has a q= with a place name, geocode it via Nominatim
        const placeMatch = finalUrl.match(/[?&]q=([^&]+)/);
        if (placeMatch) {
          const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
          // Only geocode if it's NOT a coordinate string
          if (!/^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/.test(placeName)) {
            console.log('[GoogleMapsParser] Geocoding place name:', placeName);
            const geocoded = await GoogleMapsParser.geocodePlace(placeName);
            if (geocoded) {
              console.log('[GoogleMapsParser] Geocoded result:', geocoded);
              return geocoded;
            }
          }
        }
      }

      // 3. Last resort: look for @lat,lng in the page body (but NOT center= which is unreliable)
      const body = await response.text();
      const atMatch = body.match(/@(-?\d+\.\d{4,}),(-?\d+\.\d{4,})/);
      if (atMatch) {
        const coords = GoogleMapsParser.validate(parseFloat(atMatch[1]), parseFloat(atMatch[2]));
        if (coords) {
          console.log('[GoogleMapsParser] Extracted @ pattern from body:', coords);
          return coords;
        }
      }

      console.warn('[GoogleMapsParser] Could not extract coordinates');
      return null;
    } catch (error) {
      console.warn('[GoogleMapsParser] Failed to fetch URL:', error);
      return null;
    }
  }

  /**
   * Geocode a place name using Nominatim (free, no API key).
   */
  private static async geocodePlace(placeName: string): Promise<Coordinates | null> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&limit=1`
      );
      const data = await res.json();
      if (data?.[0]) {
        return GoogleMapsParser.validate(parseFloat(data[0].lat), parseFloat(data[0].lon));
      }
    } catch {
      // Geocoding failed — not critical
    }
    return null;
  }

  /**
   * Try to extract coordinates from a resolved Google Maps URL.
   * Handles patterns like /@lat,lng, ?q=lat,lng, &ll=lat,lng, /lat,lng
   */
  private static extractFromUrl(url: string): Coordinates | null {
    // @lat,lng pattern (most common in full URLs)
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      return GoogleMapsParser.validate(parseFloat(atMatch[1]), parseFloat(atMatch[2]));
    }

    // ?q=lat,lng or &q=lat,lng
    const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (qMatch) {
      return GoogleMapsParser.validate(parseFloat(qMatch[1]), parseFloat(qMatch[2]));
    }

    // &ll=lat,lng
    const llMatch = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (llMatch) {
      return GoogleMapsParser.validate(parseFloat(llMatch[1]), parseFloat(llMatch[2]));
    }

    // /lat,lng in path
    const pathMatch = url.match(/\/(-?\d+\.\d{4,}),(-?\d+\.\d{4,})/);
    if (pathMatch) {
      return GoogleMapsParser.validate(parseFloat(pathMatch[1]), parseFloat(pathMatch[2]));
    }

    return null;
  }

  /**
   * Parse raw coordinate text like "-6.7924, 39.2083"
   */
  static fromRawCoords(text: string): Coordinates | null {
    const match = text.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
    if (match) {
      return GoogleMapsParser.validate(parseFloat(match[1]), parseFloat(match[2]));
    }
    return null;
  }

  /**
   * Validate that coordinates are within valid geographic bounds.
   */
  static validate(lat: number, lng: number): Coordinates | null {
    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90) return null;
    if (lng < -180 || lng > 180) return null;
    return { latitude: lat, longitude: lng };
  }
}

/** Convenience alias — kept for backwards compatibility */
export const parseGoogleMapsLink = GoogleMapsParser.parse;
