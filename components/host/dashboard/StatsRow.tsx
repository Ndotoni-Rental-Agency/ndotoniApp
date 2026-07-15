import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DashboardColors, Subpage } from './types';

interface StatsRowProps {
  colors: DashboardColors;
  totalEarned: number;
  upcomingCount: number;
  listingsCount: number;
  onStatPress: (page: Subpage) => void;
}

export default function StatsRow({ colors, totalEarned, upcomingCount, listingsCount, onStatPress }: StatsRowProps) {
  const { text, card, subtle } = colors;
  const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}K` : n.toString();

  if (upcomingCount === 0 && totalEarned === 0 && listingsCount === 0) return null;

  return (
    <View style={s.row}>
      <TouchableOpacity style={[s.card, { backgroundColor: card }]} onPress={() => onStatPress('stats')} activeOpacity={0.7}>
        <Text style={[s.value, { color: text }]}>Tshs {fmt(totalEarned)}</Text>
        <Text style={[s.label, { color: subtle }]}>Total earned</Text>
      </TouchableOpacity>
      <View style={[s.card, { backgroundColor: card }]}>
        <Text style={[s.value, { color: text }]}>{upcomingCount}</Text>
        <Text style={[s.label, { color: subtle }]}>Upcoming</Text>
      </View>
      <View style={[s.card, { backgroundColor: card }]}>
        <Text style={[s.value, { color: text }]}>{listingsCount}</Text>
        <Text style={[s.label, { color: subtle }]}>Listings</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  card: { flex: 1, padding: 16, borderRadius: 14, alignItems: 'center' },
  value: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 12, marginTop: 4, fontWeight: '500' },
});
