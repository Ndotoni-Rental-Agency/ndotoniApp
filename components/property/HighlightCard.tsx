import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HighlightCardProps {
  icon: string;
  title: string;
  subtitle: string;
  tint: string;
  text: string;
}

export default function HighlightCard({ icon, title, subtitle, tint, text: textColor }: HighlightCardProps) {
  return (
    <View style={s.card}>
      <View style={[s.icon, { backgroundColor: `${tint}10` }]}>
        <Ionicons name={icon as any} size={20} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.title, { color: textColor }]}>{title}</Text>
        <Text style={[s.sub, { color: `${textColor}88` }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  icon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '600' },
  sub: { fontSize: 12, marginTop: 1 },
});
