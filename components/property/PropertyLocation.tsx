import PropertyMapView from '@/components/map/PropertyMapView';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PropertyLocationProps {
  latitude: number;
  longitude: number;
  title: string;
  textColor: string;
  tintColor: string;
  secondaryText: string;
  backgroundColor: string;
  borderColor: string;
}

export default function PropertyLocation({
  latitude,
  longitude,
  title,
  textColor,
  tintColor,
  secondaryText,
  backgroundColor,
  borderColor,
}: PropertyLocationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="map" size={22} color={tintColor} />
        <Text style={[styles.title, { color: textColor }]}>Location</Text>
      </View>
      <View style={styles.mapWrapper}>
        <PropertyMapView
          latitude={latitude}
          longitude={longitude}
          title={title}
        />
      </View>
      <View style={[styles.infoCard, { backgroundColor, borderColor }]}>
        <Ionicons name="information-circle" size={20} color={tintColor} />
        <Text style={[styles.disclaimer, { color: secondaryText }]}>
          Approximate location shown for privacy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  mapWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  disclaimer: {
    fontSize: 13,
    flex: 1,
  },
});
