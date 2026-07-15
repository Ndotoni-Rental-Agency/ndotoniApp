import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DashboardColors, Subpage } from './types';

interface QuickActionsProps {
  colors: DashboardColors;
  onAction: (page: Subpage) => void;
}

const ACTIONS = [
  { key: 'bookings' as Subpage, icon: 'calendar', label: 'Bookings', desc: 'Manage guest requests', color: '#3b82f6' },
  { key: 'stats' as Subpage, icon: 'trending-up', label: 'Earnings', desc: 'Revenue & analytics', color: '#16a34a' },
  { key: 'reviews' as Subpage, icon: 'star', label: 'Reviews', desc: 'What guests say', color: '#f59e0b' },
  { key: 'payouts' as Subpage, icon: 'card', label: 'Payouts', desc: 'M-Pesa & bank setup', color: '#8b5cf6' },
  { key: 'whatsapp' as Subpage, icon: 'logo-whatsapp', label: 'WhatsApp', desc: 'Notification number', color: '#25d366' },
];

export default function QuickActions({ colors, onAction }: QuickActionsProps) {
  const { text, card, subtle } = colors;

  return (
    <View style={s.section}>
      <Text style={[s.title, { color: text }]}>Manage</Text>
      <View style={s.list}>
        {ACTIONS.map(item => (
          <TouchableOpacity
            key={item.key}
            style={[s.item, { backgroundColor: card }]}
            onPress={() => onAction(item.key)}
            activeOpacity={0.6}
          >
            <View style={[s.icon, { backgroundColor: `${item.color}14` }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <View style={s.content}>
              <Text style={[s.label, { color: text }]}>{item.label}</Text>
              <Text style={[s.desc, { color: subtle }]}>{item.desc}</Text>
            </View>
            <View style={[s.arrow, { backgroundColor: `${item.color}10` }]}>
              <Ionicons name="arrow-forward" size={14} color={item.color} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  section: { paddingHorizontal: 20, marginTop: 28 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  list: { gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 14,
  },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  label: { fontSize: 15, fontWeight: '700' },
  desc: { fontSize: 13, marginTop: 2 },
  arrow: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
