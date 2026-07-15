import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppSwitch from '@/components/ui/AppSwitch';
import { StepProps } from './types';

export default function StepBasics({ form, updateField, colors }: StepProps) {
  const { text, card, border, subtle } = colors;

  const Counter = ({ label, valueKey, min, max }: {
    label: string; valueKey: string; min: number; max: number;
  }) => {
    const val = parseInt(form[valueKey as keyof typeof form] as string) || min;
    return (
      <View style={[styles.counterRow, { borderBottomColor: border }]}>
        <Text style={[styles.counterLabel, { color: text }]}>{label}</Text>
        <View style={styles.counterControls}>
          <TouchableOpacity
            style={[styles.counterBtn, { borderColor: val <= min ? `${border}80` : border }]}
            onPress={() => updateField(valueKey, Math.max(min, val - 1).toString())}
            disabled={val <= min}
            accessibilityLabel={`Decrease ${label}`}
          >
            <Ionicons name="remove" size={20} color={val <= min ? `${subtle}40` : text} />
          </TouchableOpacity>
          <Text style={[styles.counterValue, { color: text }]}>{val}</Text>
          <TouchableOpacity
            style={[styles.counterBtn, { borderColor: border }]}
            onPress={() => updateField(valueKey, Math.min(max, val + 1).toString())}
            accessibilityLabel={`Increase ${label}`}
          >
            <Ionicons name="add" size={20} color={text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <Text style={[styles.heading, { color: text }]}>
        Share some basics{'\n'}about your place
      </Text>
      <Text style={[styles.subtitle, { color: subtle }]}>
        You can always change these later
      </Text>

      <View style={styles.counters}>
        <Counter label="Guests" valueKey="maxGuests" min={1} max={50} />
        <Counter label="Bedrooms" valueKey="bedrooms" min={1} max={20} />
        <Counter label="Bathrooms" valueKey="bathrooms" min={1} max={10} />
      </View>

      <View style={[styles.toggleCard, { backgroundColor: card, borderColor: border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.toggleTitle, { color: text }]}>⚡ Instant Book</Text>
          <Text style={[styles.toggleDesc, { color: subtle }]}>
            Guests can book without waiting for your approval
          </Text>
        </View>
        <AppSwitch
          value={form.instantBookEnabled}
          onValueChange={v => updateField('instantBookEnabled', v)}
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
    marginBottom: 32,
  },
  counters: {
    gap: 0,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  counterLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleDesc: {
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
});
