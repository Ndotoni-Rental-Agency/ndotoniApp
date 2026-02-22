import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PropertyHeaderProps {
  title: string;
  district: string;
  region: string;
  propertyType?: string;
  textColor: string;
  tintColor: string;
}

export default function PropertyHeader({
  title,
  district,
  region,
  propertyType,
  textColor,
  tintColor,
}: PropertyHeaderProps) {
  // Normalize location - capitalize first letter of each word
  const normalizeLocation = (text: string) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format property type for display
  const formatPropertyType = (type?: string) => {
    if (!type) return null;
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      {propertyType && (
        <View style={[styles.typeBadge, { backgroundColor: tintColor }]}>
          <Text style={styles.typeBadgeText}>{formatPropertyType(propertyType)}</Text>
        </View>
      )}
      <View style={styles.locationRow}>
        <Ionicons name="location" size={18} color={tintColor} />
        <Text style={[styles.locationText, { color: textColor }]}>
          {normalizeLocation(district)}, {normalizeLocation(region)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
    lineHeight: 34,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
  },
  priceCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  priceCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: '800',
  },
  priceLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
