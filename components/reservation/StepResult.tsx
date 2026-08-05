import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ReservationColors } from './types';
import BrandLoader from '@/components/ui/BrandLoader';
import CelebrationCheck from '@/components/ui/CelebrationCheck';

interface StepResultProps {
  colors: ReservationColors;
  state: 'processing' | 'success' | 'failed';
  bookingStatus: string;
  error: string;
}

export default function StepResult({ colors, state, bookingStatus, error }: StepResultProps) {
  const { text, tint, subtle } = colors;

  if (state === 'processing') {
    return (
      <View style={styles.centerWrap}>
        <BrandLoader />
        <Text style={[styles.stepHeading, { color: text, marginTop: 24 }]}>Processing payment</Text>
        <Text style={[styles.stepSub, { color: subtle, textAlign: 'center' }]}>
          Check your phone and confirm{'\n'}the M-Pesa prompt
        </Text>
      </View>
    );
  }

  if (state === 'success') {
    const confirmed = bookingStatus === 'CONFIRMED';
    return (
      <View style={styles.centerWrap}>
        {confirmed ? (
          <CelebrationCheck size={72} />
        ) : (
          <View style={[styles.resultCircle, { backgroundColor: `${tint}12` }]}>
            <Ionicons name="checkmark-circle" size={60} color={tint} />
          </View>
        )}
        <Text style={[styles.stepHeading, { color: text, marginTop: confirmed ? 4 : 20 }]}>
          {confirmed ? 'Booking confirmed!' : 'Request sent!'}
        </Text>
        <Text style={[styles.stepSub, { color: subtle, textAlign: 'center', lineHeight: 22 }]}>
          {confirmed
            ? 'Your stay is booked. The host will share check-in details via WhatsApp.'
            : 'The host will review and confirm. You\'ll get a notification once accepted.'}
        </Text>
      </View>
    );
  }

  // failed
  return (
    <View style={styles.centerWrap}>
      <View style={[styles.resultCircle, { backgroundColor: '#fef2f2' }]}>
        <Ionicons name="alert-circle" size={60} color="#ef4444" />
      </View>
      <Text style={[styles.stepHeading, { color: text, marginTop: 20 }]}>
        {error.includes('no longer available') ? 'Dates unavailable' : 'Something went wrong'}
      </Text>
      <Text style={[styles.stepSub, { color: subtle, textAlign: 'center', lineHeight: 22 }]}>{error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerWrap: { alignItems: 'center', paddingTop: 48 },
  resultCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  stepHeading: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  stepSub: { fontSize: 14, marginTop: 6, lineHeight: 20 },
});
