import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DashboardColors, Subpage } from './types';

interface StatsRowProps {
  colors: DashboardColors;
  totalEarned: number;
  upcomingCount: number;
  onStatPress: (page: Subpage) => void;
}

export default function StatsRow({ colors, totalEarned, upcomingCount, onStatPress }: StatsRowProps) {
  const { text, tint, card, subtle } = colors;
  const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}K` : n.toString();

  if (upcomingCount === 0 && totalEarned === 0) return null;

  return (
    <View style={s.container}>
      {/* Earnings card */}
      <TouchableOpacity style={[s.card, { backgroundColor: card }]} onPress={() => onStatPress('stats')} activeOpacity={0.7}>
        <View style={s.cardHeader}>
          <View style={[s.iconWrap, { backgroundColor: `${tint}12` }]}>
            <Ionicons name="trending-up" size={18} color={tint} />
          </View>
          <Ionicons name="chevron-forward" size={14} color={tint} />
        </View>
        <Text style={[s.value, { color: text }]}>Tshs {fmt(totalEarned)}</Text>
        <Text style={[s.label, { color: subtle }]}>Total earnings</Text>
      </TouchableOpacity>

      {/* Guests card — confirmed bookings (paid) */}
      <TouchableOpacity style={[s.card, { backgroundColor: card }]} onPress={() => onStatPress('bookings')} activeOpacity={0.7}>
        <View style={s.cardHeader}>
          <View style={[s.iconWrap, { backgroundColor: `${tint}12` }]}>
            <Ionicons name="calendar" size={18} color={tint} />
          </View>
          <Ionicons name="chevron-forward" size={14} color={tint} />
        </View>
        <Text style={[s.guestValue, { color: text }]}>{upcomingCount}</Text>
        <Text style={[s.guestLabel, { color: subtle }]}>Confirmed bookings</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },

  card: { flex: 1, padding: 16, borderRadius: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  value: { fontSize: 20, fontWeight: '800' },
  label: { fontSize: 12, marginTop: 2, fontWeight: '500' },

  // Guests
  guestValue: { fontSize: 20, fontWeight: '800' },
  guestLabel: { fontSize: 12, marginTop: 2, fontWeight: '500' },
});
