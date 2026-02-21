import LocationSelector from '@/components/location/LocationSelector';
import MapCoordinatesPicker from '@/components/property/MapCoordinatesPicker';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface LocationSectionProps {
  formData: {
    region: string;
    district: string;
    ward: string;
    street: string;
    city?: string;
    country?: string;
    postalCode: string;
    coordinates: { latitude: number; longitude: number } | null;
  };
  onUpdate: (field: string, value: any) => void;
  onLocationChange: (location: any) => void;
  showCityCountry?: boolean;
}

export default function LocationSection({ formData, onUpdate, onLocationChange, showCityCountry = false }: LocationSectionProps) {
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  return (
    <>
      <LocationSelector
        value={{
          region: formData.region,
          district: formData.district,
          ward: formData.ward,
          street: formData.street,
        }}
        onChange={onLocationChange}
        required
      />

      {showCityCountry && (
        <View style={styles.row}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={[styles.label, { color: textColor }]}>City</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="e.g., Dar es Salaam"
              placeholderTextColor={placeholderColor}
              value={formData.city}
              onChangeText={(text) => onUpdate('city', text)}
            />
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={[styles.label, { color: textColor }]}>Country</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="e.g., Tanzania"
              placeholderTextColor={placeholderColor}
              value={formData.country}
              onChangeText={(text) => onUpdate('country', text)}
            />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>Postal Code</Text>
        <TextInput
          style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
          placeholder="e.g., 12345"
          placeholderTextColor={placeholderColor}
          value={formData.postalCode}
          onChangeText={(text) => onUpdate('postalCode', text)}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>GPS Coordinates</Text>
        <MapCoordinatesPicker
          value={formData.coordinates}
          onChange={(coords) => onUpdate('coordinates', coords)}
          region={formData.region}
          district={formData.district}
          ward={formData.ward}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
});
