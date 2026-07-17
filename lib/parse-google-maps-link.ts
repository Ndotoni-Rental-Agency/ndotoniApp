/**
 * Parse coordinates from various Google Maps URL formats.
 *
 * Supported formats:
 * - https://maps.google.com/?q=-6.7924,39.2083
 * - https://www.google.com/maps?q=-6.7924,39.2083
 * - https://www.google.com/maps/@-6.7924,39.2083,15z
 * - https://www.google.com/maps/place/.../@-6.7924,39.2083,17z/...
 * - https://goo.gl/maps/... (short links — resolved at runtime)
 * - https://maps.app.goo.gl/... (newer short links)
 * - https://www.google.com/maps/dir/.../-6.7924,39.2083/...
 * - Plain coordinate text: -6.7924, 39.2083
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export class GoogleMapsParser {
  /**
   * Attempt to extract lat/lng from a Google Maps link or raw coordinate string.
   * For short links (goo.gl/maps, maps.app.goo.gl), use parseAsync() instead.
   * Returns null if parsing fails.
   */
  static parse(input: string): Coordinates | null {
    if (!input || typeof input !== 'string') return null;

    const trimmed = input.trim();
    if (!trimmed) return null;

    return (
      GoogleMapsParser.fromAtSign(trimmed) ||
      GoogleMapsParser.fromQueryParam(trimmed) ||
      GoogleMapsParser.fromPlaceCoords(trimmed) ||
      GoogleMapsParser.fromRawCoords(trimmed)
    );
  }

  /**
   * Async version that resolves short links (maps.app.goo.gl, goo.gl/maps)
   * by following the redirect to get the full URL, then parses coordinates.
   */
  static async parseAsync(input: string): Promise<Coordinates | null> {
    if (!input || typeof input !== 'string') return null;

    const trimmed = input.trim();
    if (!trimmed) return null;

    // Try direct parsing first (works for full URLs and raw coords)
    const direct = GoogleMapsParser.parse(trimmed);
    if (direct) return direct;

    // If it's a short link, resolve it
    if (GoogleMapsParser.isShortLink(trimmed)) {
      const resolved = await GoogleMapsParser.resolveShortLink(trimmed);
      if (resolved) {
        return GoogleMapsParser.parse(resolved);
      }
    }

    return null;
  }

  /**
   * Check if the URL is a Google Maps short link that needs resolving.
   */
  static isShortLink(url: string): boolean {
    return /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\//i.test(url);
  }

  /**
   * Resolve a short link by following the redirect (HEAD request).
   * Returns the final URL or null if resolution fails.
   */
  static async resolveShortLink(shortUrl: string): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(shortUrl, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return response.url || null;
    } catch (error) {
      console.warn('[GoogleMapsParser] Failed to resolve short link:', error);
      return null;
    }
  }

  /**
   * Parse from @lat,lng pattern (most common in full URLs)
   * e.g. /maps/@-6.7924,39.2083,15z
   */
  static fromAtSign(url: string): Coordinates | null {
    const match = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (match) {
      return GoogleMapsParser.validate(parseFloat(match[1]), parseFloat(match[2]));
    }
    return null;
  }

  /**
   * Parse from ?q=lat,lng, &ll=lat,lng, or &center=lat,lng query parameters
   * e.g. maps.google.com/?q=-6.7924,39.2083
   */
  static fromQueryParam(url: string): Coordinates | null {
    const match = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (match) {
      return GoogleMapsParser.validate(parseFloat(match[1]), parseFloat(match[2]));
    }

    const llMatch = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (llMatch) {
      return GoogleMapsParser.validate(parseFloat(llMatch[1]), parseFloat(llMatch[2]));
    }

    const centerMatch = url.match(/[?&]center=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (centerMatch) {
      return GoogleMapsParser.validate(parseFloat(centerMatch[1]), parseFloat(centerMatch[2]));
    }

    return null;
  }

  /**
   * Parse coordinates embedded in place or direction URLs
   * e.g. /place/Some+Place/-6.7924,39.2083 or /dir/.../lat,lng/
   */
  static fromPlaceCoords(url: string): Coordinates | null {
    const match = url.match(/\/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (match) {
      return GoogleMapsParser.validate(parseFloat(match[1]), parseFloat(match[2]));
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
