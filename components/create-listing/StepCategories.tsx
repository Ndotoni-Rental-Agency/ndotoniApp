import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { STAY_CATEGORIES, StepProps } from './types';

export default function StepCategories({ form, updateField, colors }: StepProps) {
  const { text, tint, border, subtle } = colors;

  const toggleCategory = (cat: string) => {
    const current = form.stayCategories;
    const updated = current.includes(cat)
      ? current.filter(c => c !== cat)
      : [...current, cat];
    updateField('stayCategories', updated);
  };

  return (
    <>
      <Text style={[styles.heading, { color: text }]}>
        What's your place{'\n'}best for?
      </Text>
      <Text style={[styles.subtitle, { color: subtle }]}>
        Select all that apply
      </Text>

      <View style={styles.grid}>
        {STAY_CATEGORIES.map(cat => {
          const selected = form.stayCategories.includes(cat.value);
          return (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.chip,
                {
                  borderColor: selected ? tint : border,
                  backgroundColor: selected ? `${tint}08` : 'transparent',
                  borderWidth: selected ? 2 : 1.5,
                },
              ]}
              onPress={() => toggleCategory(cat.value)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={cat.label}
            >
              <Text style={styles.emoji}>{cat.icon}</Text>
              <Text style={[styles.label, { color: selected ? tint : text }]}>
                {cat.label}
              </Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 28,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 24,
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
