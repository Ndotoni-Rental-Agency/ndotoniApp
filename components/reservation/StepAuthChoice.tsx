import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ReservationColors } from './types';

interface StepAuthChoiceProps {
  colors: ReservationColors;
  onSignIn: () => void;
  onContinueAsGuest: () => void;
}

export default function StepAuthChoice({ colors, onSignIn, onContinueAsGuest }: StepAuthChoiceProps) {
  const { text, tint, card, border, subtle } = colors;

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: text }]}>How would you like{'\n'}to book?</Text>
      <Text style={[styles.sub, { color: subtle }]}>
        Sign in to track your bookings, or continue as a guest.
      </Text>

      <View style={styles.options}>
        {/* Sign in option */}
        <TouchableOpacity
          style={[styles.optionCard, { borderColor: tint, backgroundColor: `${tint}05` }]}
          onPress={onSignIn}
          activeOpacity={0.7}
        >
          <View style={[styles.optionIcon, { backgroundColor: `${tint}12` }]}>
            <Ionicons name="person" size={22} color={tint} />
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: text }]}>Sign in</Text>
            <Text style={[styles.optionDesc, { color: subtle }]}>
              Track bookings & get rewards
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={tint} />
        </TouchableOpacity>

        {/* Guest option */}
        <TouchableOpacity
          style={[styles.optionCard, { borderColor: border, backgroundColor: card }]}
          onPress={onContinueAsGuest}
          activeOpacity={0.7}
        >
          <View style={[styles.optionIcon, { backgroundColor: `${subtle}12` }]}>
            <Ionicons name="arrow-forward" size={22} color={subtle} />
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: text }]}>Continue as guest</Text>
            <Text style={[styles.optionDesc, { color: subtle }]}>
              Just enter your name & email
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={subtle} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 8 },
  heading: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3, lineHeight: 32 },
  sub: { fontSize: 15, marginTop: 8, lineHeight: 22, marginBottom: 28 },
  options: { gap: 12 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 14,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '700' },
  optionDesc: { fontSize: 13, marginTop: 2 },
});
