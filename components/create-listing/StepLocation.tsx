import LocationSelector from '@/components/location/LocationSelector';
import { GoogleMapsParser } from '@/lib/parse-google-maps-link';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { StepProps } from './types';

/**
 * Reverse geocode coordinates using Nominatim to get region and district.
 */
async function reverseGeocode(lat: number, lng: number): Promise<{ region?: string; district?: string; ward?: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=16`
    );
    const data = await res.json();
    const address = data?.address;
    if (!address) return {};

    // Tanzania structure: state = region, state_district = district, village/suburb = ward
    const region = (address.state || '')
      .replace(/\s*region$/i, '')
      .toLowerCase()
      .trim() || undefined;
    const district = (address.state_district || address.county || address.city || '')
      .toLowerCase()
      .trim() || undefined;
    const ward = (address.village || address.suburb || address.neighbourhood || '')
      .toLowerCase()
      .trim() || undefined;

    return { region, district, ward };
  } catch {
    return {};
  }
}

export default function StepLocation({ form, updateField, colors }: StepProps) {
  const { text, subtle, card, border } = colors;
  const [resolving, setResolving] = useState(false);
  const lastResolved = useRef('');

  // When Google Maps link changes, resolve it and autofill location
  useEffect(() => {
    const link = form.googleMapsLink?.trim();
    if (!link || !link.startsWith('http') || link === lastResolved.current) return;

    lastResolved.current = link;
    setResolving(true);

    GoogleMapsParser.parseAsync(link).then(async (coords) => {
      if (coords) {
        // Reverse geocode to get region/district/ward
        const location = await reverseGeocode(coords.latitude, coords.longitude);
        if (location.region) updateField('region', location.region);
        if (location.district) updateField('district', location.district);
        if (location.ward) updateField('ward', location.ward);
      }
    }).finally(() => setResolving(false));
  }, [form.googleMapsLink]);

  return (
    <>
      <Text style={[styles.heading, { color: text }]}>
        Where's your{'\n'}place located?
      </Text>
      <Text style={[styles.subtitle, { color: subtle }]}>
        Your address is only shared with guests after they book.
      </Text>

      {/* Google Maps link — primary input */}
      <View style={styles.mapsLinkSection}>
        <View style={styles.mapsLinkHeader}>
          <Ionicons name="location" size={18} color={colors.tint} />
          <Text style={[styles.mapsLinkLabel, { color: text }]}>Google Maps link</Text>
        </View>
        <Text style={[styles.mapsLinkHint, { color: subtle }]}>
          {resolving ? 'Resolving location...' : 'Paste your Google Maps link to auto-fill location.'}
        </Text>
        <TextInput
          style={[styles.mapsLinkInput, { color: text, borderColor: border, backgroundColor: card }]}
          value={form.googleMapsLink}
          onChangeText={(val) => updateField('googleMapsLink', val)}
          placeholder="e.g. https://maps.app.goo.gl/..."
          placeholderTextColor={subtle}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      </View>

      {/* Divider */}
      <Text style={[styles.divider, { color: subtle }]}>or select manually</Text>

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
    marginBottom: 16,
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
  divider: {
    textAlign: 'center',
    fontSize: 12,
    marginVertical: 16,
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
