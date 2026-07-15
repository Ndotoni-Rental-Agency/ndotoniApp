import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DashboardColors, Subpage } from './types';

interface QuickActionsProps {
  colors: DashboardColors;
  onAction: (page: Subpage) => void;
}

const ACTIONS = [
  { key: 'bookings' as Subpage, icon: 'calendar', label: 'Bookings', color: '#3b82f6' },
  { key: 'stats' as Subpage, icon: 'trending-up', label: 'Earnings', color: '#16a34a' },
  { key: 'reviews' as Subpage, icon: 'star', label: 'Reviews', color: '#f59e0b' },
  { key: 'payouts' as Subpage, icon: 'card', label: 'Payouts', color: '#8b5cf6' },
  { key: 'whatsapp' as Subpage, icon: 'logo-whatsapp', label: 'WhatsApp', color: '#25d366' },
];

export default function QuickActions({ colors, onAction }: QuickActionsProps) {
  const { text, card } = colors;

  return (
    <View style={s.section}>
      <Text style={[s.title, { color: text }]}>Quick actions</Text>
      <View style={s.grid}>
        {ACTIONS.map(item => (
          <TouchableOpacity key={item.key} style={[s.item, { backgroundColor: card }]} onPress={() => onAction(item.key)} activeOpacity={0.7}>
            <View style={[s.icon, { backgroundColor: `${item.color}12` }]}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text style={[s.label, { color: text }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  section: { paddingHorizontal: 20, marginTop: 28 },
  title: { fontSize: 18, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  item: { width: '31%', alignItems: 'center', paddingVertical: 18, borderRadius: 14 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '600' },
});
