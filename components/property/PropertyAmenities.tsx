import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PropertyAmenitiesProps {
  amenities: (string | null)[];
  textColor: string;
  tintColor: string;
  backgroundColor: string;
  borderColor: string;
  maxVisible?: number;
}

// Map common amenity names to icons
const AMENITY_ICONS: Record<string, string> = {
  wifi: 'wifi-outline',
  'wi-fi': 'wifi-outline',
  pool: 'water-outline',
  'swimming pool': 'water-outline',
  parking: 'car-outline',
  'free parking': 'car-outline',
  kitchen: 'restaurant-outline',
  'air conditioning': 'snow-outline',
  ac: 'snow-outline',
  tv: 'tv-outline',
  television: 'tv-outline',
  washer: 'shirt-outline',
  dryer: 'shirt-outline',
  gym: 'barbell-outline',
  fitness: 'barbell-outline',
  hot_tub: 'flame-outline',
  garden: 'leaf-outline',
  balcony: 'resize-outline',
  security: 'shield-checkmark-outline',
  generator: 'flash-outline',
  bbq: 'flame-outline',
};

function getAmenityIcon(amenity: string): string {
  const lower = amenity.toLowerCase();
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return 'checkmark-circle-outline';
}

export default function PropertyAmenities({
  amenities,
  textColor,
  tintColor,
  backgroundColor,
  borderColor,
  maxVisible = 6,
}: PropertyAmenitiesProps) {
  const [showAll, setShowAll] = useState(false);

  if (!amenities || amenities.length === 0) return null;

  const visibleAmenities = showAll ? amenities : amenities.slice(0, maxVisible);
  const hiddenCount = amenities.length - maxVisible;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>What this place offers</Text>
      <View style={styles.list}>
        {visibleAmenities.map((amenity, index) => {
          if (!amenity) return null;
          return (
            <View key={index} style={[styles.row, index < visibleAmenities.length - 1 && styles.rowBorder, { borderBottomColor: `${borderColor}` }]}>
              <Ionicons name={getAmenityIcon(amenity) as any} size={22} color={textColor} />
              <Text style={[styles.amenityText, { color: textColor }]}>{amenity}</Text>
            </View>
          );
        })}
      </View>
      {hiddenCount > 0 && (
        <TouchableOpacity
          style={[styles.showAllBtn, { borderColor: textColor }]}
          onPress={() => setShowAll(!showAll)}
        >
          <Text style={[styles.showAllText, { color: textColor }]}>
            {showAll ? 'Show less' : `Show all ${amenities.length} amenities`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  list: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
  },
  amenityText: {
    fontSize: 15,
    fontWeight: '400',
    flex: 1,
  },
  showAllBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  showAllText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
