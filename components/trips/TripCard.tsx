import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Booking, formatDate, getNights, getStatusColor, getStatusLabel, TripColors } from './types';

interface TripCardProps {
  booking: Booking;
  colors: TripColors;
  showPayButton?: boolean;
  onPress: () => void;
  onPayPress?: () => void;
}

export default function TripCard({ booking: b, colors, showPayButton, onPress, onPayPress }: TripCardProps) {
  const { text, tint, card, border, subtle } = colors;
  const img = b.property?.thumbnail || b.property?.images?.[0];
  const nights = getNights(b.checkInDate, b.checkOutDate);
  const totalAmount = b.pricing?.total || b.totalPrice || 0;
  const cur = (b.pricing?.currency || b.property?.currency || 'TZS') === 'TZS' ? 'Tshs' : (b.pricing?.currency || b.property?.currency);
  const statusColor = getStatusColor(b, subtle);
  const statusLabel = getStatusLabel(b);

  return (
    <TouchableOpacity style={[s.card, { backgroundColor: card, borderColor: border }]} activeOpacity={0.9} onPress={onPress}>
      {img && <Image source={{ uri: img }} style={s.img} contentFit="cover" transition={200} />}
      <View style={s.body}>
        <View style={s.row}>
          <Text style={[s.title, { color: text }]} numberOfLines={1}>{b.property?.title || 'Property'}</Text>
          <View style={[s.pill, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[s.pillText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        {b.property?.district && (
          <Text style={[s.loc, { color: subtle }]}>{b.property.district}, {b.property.region}</Text>
        )}
        <View style={s.details}>
          <Text style={[s.date, { color: text }]}>
            {formatDate(b.checkInDate)} – {formatDate(b.checkOutDate)}
          </Text>
          <Text style={[s.meta, { color: subtle }]}>
            {nights} night{nights !== 1 ? 's' : ''} · {b.numberOfGuests || 1} guest{(b.numberOfGuests || 1) !== 1 ? 's' : ''}
          </Text>
        </View>
        <Text style={[s.price, { color: text }]}>{cur} {totalAmount.toLocaleString()}</Text>

        {showPayButton && (
          <TouchableOpacity
            style={[s.payBtn, { backgroundColor: tint }]}
            onPress={(e) => { e.stopPropagation?.(); onPayPress?.(); }}
            activeOpacity={0.8}
          >
            <Ionicons name="card-outline" size={16} color="#fff" />
            <Text style={s.payBtnText}>Pay now</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  img: { width: '100%', height: 160 },
  body: { padding: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pillText: { fontSize: 11, fontWeight: '700' },
  loc: { fontSize: 13, marginTop: 3 },
  details: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  date: { fontSize: 14, fontWeight: '500' },
  meta: { fontSize: 13 },
  price: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, paddingVertical: 12, borderRadius: 10 },
  payBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
