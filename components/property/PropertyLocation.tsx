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
      <Text style={[styles.title, { color: textColor }]}>Where you'll be</Text>
      <View style={styles.mapWrapper}>
        <PropertyMapView
          latitude={latitude}
          longitude={longitude}
          title={title}
        />
      </View>
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={16} color={secondaryText} />
        <Text style={[styles.disclaimerText, { color: secondaryText }]}>
          Exact location provided after booking
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  mapWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  disclaimerText: {
    fontSize: 13,
  },
});
