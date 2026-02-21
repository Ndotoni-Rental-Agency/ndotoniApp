import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PropertySpecificationsProps {
  bedrooms?: number | null;
  bathrooms?: number | null;
  squareMeters?: number | null;
  floors?: number | null;
  parkingSpaces?: number | null;
  furnished?: boolean | null;
  textColor: string;
  tintColor: string;
  backgroundColor: string;
}

export default function PropertySpecifications({
  bedrooms,
  bathrooms,
  squareMeters,
  floors,
  parkingSpaces,
  furnished,
  textColor,
  tintColor,
  backgroundColor,
}: PropertySpecificationsProps) {
  const specs = [
    { icon: 'bed', label: 'Bedrooms', value: bedrooms },
    { icon: 'water', label: 'Bathrooms', value: bathrooms },
    { icon: 'resize', label: 'Size', value: squareMeters ? `${squareMeters} m²` : null },
    { icon: 'layers', label: 'Floors', value: floors },
    { icon: 'car', label: 'Parking', value: parkingSpaces },
  ].filter(spec => spec.value);

  if (specs.length === 0 && furnished === null) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="information-circle" size={22} color={tintColor} />
        <Text style={[styles.title, { color: textColor }]}>Property Details</Text>
      </View>
      
      <View style={styles.grid}>
        {specs.map((spec, index) => (
          <View key={index} style={styles.specItem}>
            <View style={[styles.iconCircle, { backgroundColor: `${tintColor}15` }]}>
              <Ionicons name={spec.icon as any} size={24} color={tintColor} />
            </View>
            <Text style={[styles.value, { color: textColor }]}>{spec.value}</Text>
            <Text style={[styles.label, { color: textColor }]}>{spec.label}</Text>
          </View>
        ))}
        
        {furnished !== null && (
          <View style={styles.specItem}>
            <View style={[styles.iconCircle, { backgroundColor: `${tintColor}15` }]}>
              <Ionicons name={furnished ? 'home' : 'home-outline'} size={24} color={tintColor} />
            </View>
            <Text style={[styles.value, { color: textColor }]}>{furnished ? 'Yes' : 'No'}</Text>
            <Text style={[styles.label, { color: textColor }]}>Furnished</Text>
          </View>
        )}
      </View>
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
    gap: 20,
  },
  specItem: {
    alignItems: 'center',
    width: '30%',
    gap: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    opacity: 0.7,
  },
});
