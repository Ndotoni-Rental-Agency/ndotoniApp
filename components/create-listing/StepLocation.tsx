import LocationSelector from '@/components/location/LocationSelector';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { StepProps } from './types';

export default function StepLocation({ form, updateField, colors }: StepProps) {
  const { text, subtle, card, border } = colors;

  return (
    <>
      <Text style={[styles.heading, { color: text }]}>
        Where's your{'\n'}place located?
      </Text>
      <Text style={[styles.subtitle, { color: subtle }]}>
        Your address is only shared with guests after they book.
      </Text>

      <View style={styles.selectorWrap}>
        <LocationSelector
          value={{ region: form.region, district: form.district, ward: form.ward }}
          onChange={(loc: any) => {
            updateField('region', loc.region);
            updateField('district', loc.district);
            updateField('ward', loc.ward || '');
          }}
        />
      </View>

      <View style={styles.mapsLinkSection}>
        <View style={styles.mapsLinkHeader}>
          <Ionicons name="location" size={18} color={colors.tint} />
          <Text style={[styles.mapsLinkLabel, { color: text }]}>Google Maps link</Text>
          <Text style={[styles.optionalBadge, { color: subtle }]}>optional</Text>
        </View>
        <Text style={[styles.mapsLinkHint, { color: subtle }]}>
          Paste a Google Maps link to pinpoint your property's exact location on the map.
        </Text>
        <TextInput
          style={[styles.mapsLinkInput, { color: text, borderColor: border, backgroundColor: card }]}
          value={form.googleMapsLink}
          onChangeText={(val) => updateField('googleMapsLink', val)}
          placeholder="e.g. https://maps.google.com/..."
          placeholderTextColor={subtle}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 28,
  },
  selectorWrap: {
    flex: 1,
  },
  mapsLinkSection: {
    marginTop: 24,
  },
  mapsLinkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  mapsLinkLabel: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  optionalBadge: {
    fontSize: 12,
    fontWeight: '500',
  },
  mapsLinkHint: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  mapsLinkInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
  },
});
