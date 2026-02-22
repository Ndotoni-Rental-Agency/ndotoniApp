import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useMemo } from 'react';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface PropertyMapViewProps {
  latitude: number;
  longitude: number;
  title?: string;
  radius?: number;
}

/**
 * Property Map View Component
 * Displays an approximate location with privacy offset (like Airbnb)
 * Fully interactive map with pan, zoom, and scroll
 */
export default function PropertyMapView({
  latitude,
  longitude,
  title = 'Property Location',
  radius = 600,
}: PropertyMapViewProps) {
  const backgroundColor = useThemeColor({ light: '#f3f4f6', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#374151' }, 'background');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Generate consistent offset for privacy (like Airbnb)
  const pinPosition = useMemo(() => {
    const seed = Math.abs(Math.sin(latitude * longitude * 1000));
    const offsetRadius = 0.002; // ~200m
    const angle = seed * 2 * Math.PI;
    const distance = seed * offsetRadius;

    return {
      latitude: latitude + distance * Math.cos(angle),
      longitude: longitude + distance * Math.sin(angle),
    };
  }, [latitude, longitude]);

  const circleColor = isDark ? '#065f46' : '#1f2937';

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {/* Privacy circle */}
        <Circle
          center={{ latitude, longitude }}
          radius={radius}
          strokeColor={circleColor}
          strokeWidth={2}
          fillColor={`${circleColor}1A`} // 10% opacity
        />

        {/* Approximate location marker */}
        <Marker
          coordinate={pinPosition}
          title={title}
          pinColor={circleColor}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});
