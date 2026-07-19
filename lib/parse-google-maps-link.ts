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
      return GoogleMapsParser.fetchAndExtract(trimmed);
    }

    return null;
  }

  /**
   * Fetch the URL (following all redirects) and extract coordinates
   * from both the final URL and the page content.
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

      // Try extracting from the final resolved URL first
      const finalUrl = response.url;
      if (finalUrl) {
        const fromUrl = GoogleMapsParser.extractFromUrl(finalUrl);
        if (fromUrl) return fromUrl;
      }

      // Fall back to extracting from the page body
      const body = await response.text();
      return GoogleMapsParser.extractFromBody(body);
    } catch (error) {
      console.warn('[GoogleMapsParser] Failed to fetch URL:', error);
      return null;
    }
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
   * Extract coordinates from Google Maps page HTML/JS content.
   * Google always embeds coordinates in static map image URLs or JS data blobs.
   */
  private static extractFromBody(html: string): Coordinates | null {
    // Pattern 1: center=lat%2Clng in static maps image URLs (most reliable)
    const centerMatch = html.match(/center=(-?\d+\.\d+)%2C(-?\d+\.\d+)/);
    if (centerMatch) {
      const coords = GoogleMapsParser.validate(parseFloat(centerMatch[1]), parseFloat(centerMatch[2]));
      if (coords) return coords;
    }

    // Pattern 2: @lat,lng embedded in any URL within the page
    const atMatch = html.match(/@(-?\d+\.\d{4,}),(-?\d+\.\d{4,})/);
    if (atMatch) {
      const coords = GoogleMapsParser.validate(parseFloat(atMatch[1]), parseFloat(atMatch[2]));
      if (coords) return coords;
    }

    // Pattern 3: [null,null,lat,lng] in embedded JS data
    const nullPattern = html.match(/\[null,null,(-?\d+\.\d+),(-?\d+\.\d+)\]/);
    if (nullPattern) {
      const coords = GoogleMapsParser.validate(parseFloat(nullPattern[1]), parseFloat(nullPattern[2]));
      if (coords) return coords;
    }

    // Pattern 4: lat,lng with high precision in any context (at least 5 decimal places)
    const preciseMatch = html.match(/(-?\d{1,3}\.\d{5,}),(-?\d{1,3}\.\d{5,})/);
    if (preciseMatch) {
      const coords = GoogleMapsParser.validate(parseFloat(preciseMatch[1]), parseFloat(preciseMatch[2]));
      if (coords) return coords;
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
