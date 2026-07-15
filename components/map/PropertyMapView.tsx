import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface PropertyMapViewProps {
  latitude: number;
  longitude: number;
  title?: string;
  radius?: number;
}

const INLINE_DELTA = 0.04; // show more neighborhood
const FULLSCREEN_DELTA = 0.025;

export default function PropertyMapView({
  latitude,
  longitude,
  title = 'Property Location',
  radius = 600,
}: PropertyMapViewProps) {
  const [expanded, setExpanded] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const pinPosition = useMemo(() => {
    const seed = Math.abs(Math.sin(latitude * longitude * 1000));
    const offsetRadius = 0.002;
    const angle = seed * 2 * Math.PI;
    const distance = seed * offsetRadius;
    return {
      latitude: latitude + distance * Math.cos(angle),
      longitude: longitude + distance * Math.sin(angle),
    };
  }, [latitude, longitude]);

  const circleColor = isDark ? '#065f46' : '#1c1c1e';
  const provider = Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE;

  const renderMap = (delta: number, style: any) => (
    <MapView
      style={style}
      provider={provider}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      }}
      scrollEnabled={true}
      zoomEnabled={true}
      pitchEnabled={false}
      rotateEnabled={false}
    >
      <Circle
        center={{ latitude, longitude }}
        radius={radius}
        strokeColor={circleColor}
        strokeWidth={2}
        fillColor={`${circleColor}1A`}
      />
      <Marker
        coordinate={pinPosition}
        title={title}
        pinColor={circleColor}
      />
    </MapView>
  );

  return (
    <>
      {/* Inline map */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setExpanded(true)}
        style={styles.container}
      >
        {renderMap(INLINE_DELTA, styles.map)}
        {/* Expand hint */}
        <View style={styles.expandHint}>
          <Ionicons name="expand-outline" size={16} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Fullscreen modal */}
      <Modal
        visible={expanded}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setExpanded(false)}
      >
        <View style={styles.fullscreenContainer}>
          {renderMap(FULLSCREEN_DELTA, styles.fullscreenMap)}

          {/* Close button */}
          <TouchableOpacity
            style={[styles.closeButton, { top: insets.top + 12 }]}
            onPress={() => setExpanded(false)}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>

          {/* Bottom info bar */}
          <View style={[
            styles.bottomBar,
            { backgroundColor: isDark ? '#1c1c1e' : '#fff', paddingBottom: insets.bottom + 12 }
          ]}>
            <Ionicons name="location-sharp" size={18} color={circleColor} />
            <Text style={[styles.bottomBarText, { color: textColor }]} numberOfLines={1}>
              {title} — approximate location
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  expandHint: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenContainer: {
    flex: 1,
  },
  fullscreenMap: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomBarText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
