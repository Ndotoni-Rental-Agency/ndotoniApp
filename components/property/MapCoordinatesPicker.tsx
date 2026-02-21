import { MAPS_CONFIG } from '@/config/maps';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface MapCoordinatesPickerProps {
  value: Coordinates | null;
  onChange: (coords: Coordinates | null) => void;
  region?: string;
  district?: string;
  ward?: string;
}

export default function MapCoordinatesPicker({ 
  value, 
  onChange, 
  region, 
  district, 
  ward 
}: MapCoordinatesPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const [markerCoords, setMarkerCoords] = useState<Coordinates | null>(value);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  // Geocode address to get approximate coordinates
  const geocodeAddress = async () => {
    if (!region && !district) {
      return null;
    }

    setIsGeocoding(true);
    try {
      // Build address string
      const addressParts = [ward, district, region, 'Tanzania'].filter(Boolean);
      const address = addressParts.join(', ');

      console.log('[MapCoordinatesPicker] Geocoding address:', address);

      // Use Google Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${MAPS_CONFIG.GOOGLE_API_KEY}`
      );
      
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const coords = {
          latitude: location.lat,
          longitude: location.lng,
        };
        console.log('[MapCoordinatesPicker] Geocoded coordinates:', coords);
        return coords;
      } else {
        console.warn('[MapCoordinatesPicker] Geocoding failed:', data.status);
        // Fallback to Tanzania center if geocoding fails
        return MAPS_CONFIG.TANZANIA_CENTER;
      }
    } catch (error) {
      console.error('[MapCoordinatesPicker] Geocoding error:', error);
      // Fallback to Tanzania center
      return MAPS_CONFIG.TANZANIA_CENTER;
    } finally {
      setIsGeocoding(false);
    }
  };

  // Initialize map when expanded
  useEffect(() => {
    if (expanded && !mapRegion) {
      const initializeMap = async () => {
        let initialCoords: Coordinates;

        if (value) {
          // Use existing coordinates
          initialCoords = value;
        } else {
          // Geocode address to get approximate location
          const geocoded = await geocodeAddress();
          initialCoords = geocoded || MAPS_CONFIG.TANZANIA_CENTER;
          setMarkerCoords(initialCoords);
        }

        setMapRegion({
          latitude: initialCoords.latitude,
          longitude: initialCoords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      };

      initializeMap();
    }
  }, [expanded, value, region, district, ward]);

  const handleMarkerDragEnd = (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setMarkerCoords(coords);
  };

  const handleSave = () => {
    if (markerCoords) {
      onChange(markerCoords);
      setExpanded(false);
    } else {
      Alert.alert('No Location', 'Please drag the pin to set a location.');
    }
  };

  const handleClear = () => {
    setMarkerCoords(null);
    onChange(null);
    setExpanded(false);
  };

  const handleUseCurrentLocation = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use your current location.'
        );
        return;
      }

      // Show loading
      setIsGeocoding(true);

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      console.log('[MapCoordinatesPicker] Current location:', coords);

      // Update marker and map region
      setMarkerCoords(coords);
      setMapRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      setIsGeocoding(false);
    } catch (error) {
      console.error('[MapCoordinatesPicker] Error getting current location:', error);
      setIsGeocoding(false);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again or drag the pin manually.'
      );
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.header, { backgroundColor: cardBg, borderColor }]}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.headerContent}>
          <Ionicons name="map" size={20} color={tintColor} />
          <Text style={[styles.headerText, { color: textColor }]}>
            {value 
              ? `${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}` 
              : 'Set location on map (optional)'}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={textColor}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.content, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.helperText, { color: placeholderColor }]}>
            Drag the pin to set the exact property location
          </Text>

          {isGeocoding ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={tintColor} />
              <Text style={[styles.loadingText, { color: textColor }]}>
                Finding location...
              </Text>
            </View>
          ) : mapRegion ? (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={mapRegion}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                {markerCoords && (
                  <Marker
                    coordinate={markerCoords}
                    draggable
                    onDragEnd={handleMarkerDragEnd}
                    title="Property Location"
                    description="Drag to adjust"
                  />
                )}
              </MapView>

              {markerCoords && (
                <View style={[styles.coordsDisplay, { backgroundColor: cardBg, borderColor }]}>
                  <Ionicons name="location" size={16} color={tintColor} />
                  <Text style={[styles.coordsText, { color: textColor }]}>
                    {markerCoords.latitude.toFixed(6)}, {markerCoords.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
            </View>
          ) : null}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { borderColor }]}
              onPress={handleUseCurrentLocation}
            >
              <Ionicons name="navigate" size={18} color={tintColor} />
              <Text style={[styles.secondaryButtonText, { color: tintColor }]}>
                Current
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { borderColor }]}
              onPress={handleClear}
            >
              <Text style={[styles.secondaryButtonText, { color: textColor }]}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: tintColor }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerText: {
    fontSize: 15,
  },
  content: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  helperText: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  loadingContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
  },
  mapContainer: {
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  coordsDisplay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coordsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
