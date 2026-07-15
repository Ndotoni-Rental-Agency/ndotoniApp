import LocationSelector from '@/components/location/LocationSelector';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StepProps } from './types';

export default function StepLocation({ form, updateField, colors }: StepProps) {
  const { text, subtle } = colors;

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
});
