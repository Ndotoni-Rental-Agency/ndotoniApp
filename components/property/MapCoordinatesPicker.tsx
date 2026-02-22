import { MAPS_CONFIG } from '@/config/maps';
import { useThemeColor } from '@/hooks/use-theme-color';
import { geocodeLocation } from '@/lib/geocoding-service';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [markerCoords, setMarkerCoords] = useState<Coordinates | null>(value);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  // Geocode address to get approximate coordinates
  const geocodeAddress = async (): Promise<Coordinates | null> => {
    if (!region && !district) {
      return null;
    }

    setIsGeocoding(true);
    try {
      const result = await geocodeLocation(
        { region, district, ward },
        null // Don't use saved coordinates for initial geocoding
      );
      
      console.log(`[MapCoordinatesPicker] Geocoded from ${result.source}:`, result.coordinates);
      return result.coordinates;
    } catch (error) {
      console.error('[MapCoordinatesPicker] Geocoding error:', error);
      return MAPS_CONFIG.TANZANIA_CENTER;
    } finally {
      setIsGeocoding(false);
    }
  };

  // Initialize map on mount or when address is first available
  useEffect(() => {
    if (!hasInitialized && (region || district)) {
      const initializeMap = async () => {
        setIsGeocoding(true);
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
        
        setHasInitialized(true);
        setIsGeocoding(false);
      };

      initializeMap();
    }
  }, [region, district, hasInitialized]);

  // Re-geocode when address changes (after initialization)
  useEffect(() => {
    if (hasInitialized && (region || district)) {
      const updateMapLocation = async () => {
        console.log('[MapCoordinatesPicker] Address changed, re-geocoding...');
        setIsGeocoding(true);
        
        const geocoded = await geocodeAddress();
        
        if (geocoded) {
          // Always update map region to new location
          setMapRegion({
            latitude: geocoded.latitude,
            longitude: geocoded.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
          
          // Update marker position if user hasn't manually set coordinates
          if (!value) {
            setMarkerCoords(geocoded);
          }
        }
        
        setIsGeocoding(false);
      };

      updateMapLocation();
    }
  }, [region, district, ward]);

  const handleMarkerDragEnd = (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setMarkerCoords(coords);
  };

  const handleSave = () => {
    if (markerCoords) {
      onChange(markerCoords);
      Alert.alert('Success', 'Location saved successfully!');
    } else {
      Alert.alert('No Location', 'Please drag the pin to set a location.');
    }
  };

  const handleClear = () => {
    setMarkerCoords(null);
    onChange(null);
    
    // Reset to geocoded location
    if (mapRegion) {
      setMarkerCoords({
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
      });
    }
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
    <View style={styles.container}>
      {/* Map Display */}
      {isGeocoding ? (
        <View style={[styles.loadingContainer, { backgroundColor: cardBg, borderColor }]}>
          <ActivityIndicator size="large" color={tintColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Finding location...
          </Text>
        </View>
      ) : mapRegion ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
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

          {/* Coordinate Display Overlay */}
          {markerCoords && (
            <View style={[styles.coordsOverlay, { backgroundColor: cardBg, borderColor }]}>
              <Ionicons name="location" size={14} color={tintColor} />
              <Text style={[styles.coordsText, { color: placeholderColor }]}>
                {markerCoords.latitude.toFixed(6)}, {markerCoords.longitude.toFixed(6)}
              </Text>
            </View>
          )}

          {/* Helper Text Overlay */}
          <View style={[styles.helperOverlay, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.helperText, { color: placeholderColor }]}>
              Drag the pin to set exact location
            </Text>
          </View>
        </View>
      ) : (
        <View style={[styles.placeholderContainer, { backgroundColor: cardBg, borderColor }]}>
          <Ionicons name="map-outline" size={48} color={placeholderColor} />
          <Text style={[styles.placeholderText, { color: placeholderColor }]}>
            Select region and district to see map
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { borderColor }]}
          onPress={handleUseCurrentLocation}
          disabled={isGeocoding}
        >
          <Ionicons name="navigate" size={18} color={tintColor} />
          <Text style={[styles.secondaryButtonText, { color: tintColor }]}>
            Current
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { borderColor }]}
          onPress={handleClear}
          disabled={isGeocoding || !markerCoords}
        >
          <Text style={[styles.secondaryButtonText, { color: textColor }]}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton, { backgroundColor: tintColor }]}
          onPress={handleSave}
          disabled={isGeocoding || !markerCoords}
        >
          <Text style={styles.saveButtonText}>Save Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  loadingContainer: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  loadingText: {
    fontSize: 15,
  },
  placeholderContainer: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  mapContainer: {
    height: 320,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  coordsOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coordsText: {
    fontSize: 11,
    fontWeight: '500',
  },
  helperOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helperText: {
    fontSize: 12,
    textAlign: 'center',
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
