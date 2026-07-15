import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PROPERTY_TYPES, StepProps } from './types';

export default function StepPropertyType({ form, updateField, colors }: StepProps) {
  const { text, tint, card, border } = colors;

  return (
    <>
      <Text style={[styles.heading, { color: text }]}>
        Which of these{'\n'}best describes{'\n'}your place?
      </Text>

      <View style={styles.grid}>
        {PROPERTY_TYPES.map(pt => {
          const selected = form.propertyType === pt.value;
          return (
            <TouchableOpacity
              key={pt.value}
              style={[
                styles.card,
                {
                  borderColor: selected ? tint : border,
                  backgroundColor: selected ? `${tint}08` : card,
                  borderWidth: selected ? 2 : 1,
                },
              ]}
              onPress={() => updateField('propertyType', pt.value)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={pt.label}
            >
              <Text style={styles.emoji}>{pt.icon}</Text>
              <Text style={[styles.label, { color: selected ? tint : text }]}>
                {pt.label}
              </Text>
              {selected && (
                <View style={[styles.check, { backgroundColor: tint }]}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
    marginBottom: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 22,
    borderRadius: 16,
    position: 'relative',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  check: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
