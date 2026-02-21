import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PropertyAmenitiesProps {
  amenities: (string | null)[];
  textColor: string;
  tintColor: string;
  backgroundColor: string;
  borderColor: string;
  maxVisible?: number;
}

export default function PropertyAmenities({
  amenities,
  textColor,
  tintColor,
  backgroundColor,
  borderColor,
  maxVisible = 8,
}: PropertyAmenitiesProps) {
  if (!amenities || amenities.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={22} color={tintColor} />
        <Text style={[styles.title, { color: textColor }]}>Amenities</Text>
      </View>
      <View style={styles.grid}>
        {amenities.slice(0, maxVisible).map((amenity, index) => (
          <View key={index} style={[styles.chip, { backgroundColor, borderColor }]}>
            <Ionicons name="checkmark" size={16} color={tintColor} />
            <Text style={[styles.chipText, { color: textColor }]}>{amenity}</Text>
          </View>
        ))}
      </View>
      {amenities.length > maxVisible && (
        <TouchableOpacity style={[styles.showMoreButton, { borderColor: tintColor }]}>
          <Text style={[styles.showMoreText, { color: tintColor }]}>
            Show all {amenities.length} amenities
          </Text>
          <Ionicons name="chevron-forward" size={16} color={tintColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  showMoreButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  showMoreText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
