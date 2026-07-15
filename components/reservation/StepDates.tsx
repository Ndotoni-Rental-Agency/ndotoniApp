import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PriceBreakdown, ReservationColors } from './types';

interface StepDatesProps {
  colors: ReservationColors;
  propertyTitle: string;
  propertyImage?: string;
  pricePerNight: number;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  maxGuests: number;
  price: PriceBreakdown;
  onOpenCalendar: () => void;
  onGuestsChange: (guests: number) => void;
}

export default function StepDates({
  colors,
  propertyTitle,
  propertyImage,
  pricePerNight,
  checkInDate,
  checkOutDate,
  guests,
  maxGuests,
  price,
  onOpenCalendar,
  onGuestsChange,
}: StepDatesProps) {
  const { text, card, border, subtle, tint } = colors;
  const { nights, subtotal, cleaningFee, serviceFee, total, currency } = price;
  const cur = currency === 'TZS' ? 'Tshs' : currency;
  const fmt = (n: number) => n.toLocaleString();

  return (
    <>
      {/* Property card */}
      <View style={[styles.heroCard, { backgroundColor: card }]}>
        {propertyImage && <Image source={{ uri: propertyImage }} style={styles.heroImg} />}
        <View style={styles.heroInfo}>
          <Text style={[styles.heroTitle, { color: text }]} numberOfLines={2}>{propertyTitle}</Text>
          <View style={styles.heroPriceRow}>
            <Text style={[styles.heroPrice, { color: text }]}>{cur} {fmt(pricePerNight)}</Text>
            <Text style={[styles.heroPriceUnit, { color: subtle }]}> / night</Text>
          </View>
        </View>
      </View>

      {/* Dates */}
      <TouchableOpacity style={[styles.dateCard, { borderColor: checkInDate ? border : tint, backgroundColor: card }]} onPress={onOpenCalendar} activeOpacity={0.7}>
        <View style={[styles.calIconWrap, { backgroundColor: `${tint}12` }]}>
          <Ionicons name="calendar" size={20} color={tint} />
        </View>
        <View style={{ flex: 1 }}>
          {checkInDate && checkOutDate ? (
            <>
              <Text style={[styles.dateSelected, { color: text }]}>
                {new Date(checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text style={[styles.nightsHint, { color: subtle }]}>{nights} night{nights !== 1 ? 's' : ''} · Tap to change</Text>
            </>
          ) : (
            <>
              <Text style={[styles.datePrompt, { color: text }]}>When are you going?</Text>
              <Text style={[styles.dateTapHint, { color: subtle }]}>Tap to select check-in & check-out</Text>
            </>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={subtle} />
      </TouchableOpacity>

      {/* Guests */}
      <Text style={[styles.sectionLabel, { color: text, marginTop: 24 }]}>Guests</Text>
      <View style={[styles.guestCard, { borderColor: border, backgroundColor: card }]}>
        <Text style={[styles.guestText, { color: text }]}>{guests} guest{guests !== 1 ? 's' : ''}</Text>
        <View style={styles.stepper}>
          <TouchableOpacity style={[styles.stepBtn, { borderColor: guests <= 1 ? border : subtle }]} onPress={() => onGuestsChange(Math.max(1, guests - 1))} disabled={guests <= 1}>
            <Ionicons name="remove" size={18} color={guests <= 1 ? border : text} />
          </TouchableOpacity>
          <Text style={[styles.stepNum, { color: text }]}>{guests}</Text>
          <TouchableOpacity style={[styles.stepBtn, { borderColor: guests >= maxGuests ? border : subtle }]} onPress={() => onGuestsChange(Math.min(maxGuests, guests + 1))} disabled={guests >= maxGuests}>
            <Ionicons name="add" size={18} color={guests >= maxGuests ? border : text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Price */}
      {nights > 0 && (
        <View style={[styles.priceCard, { backgroundColor: card }]}>
          <View style={styles.priceLine}><Text style={[styles.priceLabel, { color: subtle }]}>{cur} {fmt(pricePerNight)} × {nights}</Text><Text style={[styles.priceAmt, { color: text }]}>{cur} {fmt(subtotal)}</Text></View>
          {cleaningFee > 0 && <View style={styles.priceLine}><Text style={[styles.priceLabel, { color: subtle }]}>Cleaning</Text><Text style={[styles.priceAmt, { color: text }]}>{cur} {fmt(cleaningFee)}</Text></View>}
          {serviceFee > 0 && <View style={styles.priceLine}><Text style={[styles.priceLabel, { color: subtle }]}>Service fee</Text><Text style={[styles.priceAmt, { color: text }]}>{cur} {fmt(serviceFee)}</Text></View>}
          <View style={[styles.divider, { backgroundColor: border }]} />
          <View style={styles.priceLine}><Text style={[styles.totalLabel, { color: text }]}>Total</Text><Text style={[styles.totalAmt, { color: text }]}>{cur} {fmt(total)}</Text></View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  heroCard: { flexDirection: 'row', borderRadius: 14, padding: 12, marginBottom: 28, gap: 12 },
  heroImg: { width: 72, height: 72, borderRadius: 10 },
  heroInfo: { flex: 1, justifyContent: 'center' },
  heroTitle: { fontSize: 16, fontWeight: '700', lineHeight: 21 },
  heroPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  heroPrice: { fontSize: 16, fontWeight: '700' },
  heroPriceUnit: { fontSize: 13 },
  sectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  dateCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, padding: 16, gap: 14, marginBottom: 4 },
  calIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dateSelected: { fontSize: 16, fontWeight: '700' },
  datePrompt: { fontSize: 16, fontWeight: '600' },
  dateTapHint: { fontSize: 13, marginTop: 2 },
  nightsHint: { fontSize: 13, marginTop: 4 },
  guestCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1 },
  guestText: { flex: 1, fontSize: 15, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 16, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  priceCard: { marginTop: 20, padding: 16, borderRadius: 14 },
  priceLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  priceLabel: { fontSize: 14 },
  priceAmt: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalAmt: { fontSize: 16, fontWeight: '700' },
});
