import { useEffect, useState } from 'react';

export function usePropertyCoordinates(property: any) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!property) return;

    const saved = property.address?.coordinates;
    if (saved?.latitude && saved?.longitude) {
      setCoords({
        lat: saved.latitude,
        lng: saved.longitude,
      });
      return;
    }

    const query = [
      property.address?.ward,
      property.address?.district,
      property.address?.region,
      'Tanzania',
    ]
      .filter(Boolean)
      .join(', ');

    if (!query) return;

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}`
    )
      .then(r => r.json())
      .then(d => {
        if (d?.[0]) {
          setCoords({
            lat: parseFloat(d[0].lat),
            lng: parseFloat(d[0].lon),
          });
        }
      })
      .catch(() => {});
  }, [property]);

  return coords;
}
