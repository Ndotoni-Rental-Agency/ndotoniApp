import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DashboardColors, HostProperty } from './types';

interface ListingCardProps {
  property: HostProperty;
  colors: DashboardColors;
  onPress: () => void;
  onEdit: () => void;
  onCalendar: () => void;
  onDelete: () => void;
  onDeactivate: () => void;
}

export default function ListingCard({ property: p, colors, onPress, onEdit, onCalendar, onDelete, onDeactivate }: ListingCardProps) {
  const { text, tint, card, subtle } = colors;
  const live = ['AVAILABLE', 'ACTIVE', 'PUBLISHED'].includes(String(p.status || ''));

  return (
    <TouchableOpacity style={[s.card, { backgroundColor: card }]} onPress={onPress} activeOpacity={0.8}>
      <View style={s.imgWrap}>
        {(p.thumbnail || p.images?.[0]) ? (
          <Image source={{ uri: (p.thumbnail || p.images?.[0]) as string }} style={s.img} contentFit="cover" />
        ) : (
          <View style={[s.imgEmpty, { backgroundColor: `${tint}06` }]}>
            <Ionicons name="image-outline" size={20} color={tint} />
          </View>
        )}
        <View style={[s.tag, { backgroundColor: live ? '#16a34a' : '#f59e0b' }]}>
          <Text style={s.tagText}>{live ? 'Live' : 'Draft'}</Text>
        </View>
      </View>
      <View style={s.body}>
        <Text style={[s.title, { color: text }]} numberOfLines={1}>{p.title}</Text>
        <Text style={[s.loc, { color: subtle }]}>{p.district}, {p.region}</Text>
        <Text style={[s.price, { color: text }]}>
          {p.currency === 'TZS' ? 'Tshs' : p.currency} {(p.nightlyRate || 0).toLocaleString()}
          <Text style={{ color: subtle, fontWeight: '400' }}> / night</Text>
        </Text>
      </View>
      <View style={s.actions}>
        <TouchableOpacity style={[s.actBtn, { backgroundColor: `${tint}08` }]} onPress={onEdit}>
          <Ionicons name="create-outline" size={14} color={tint} />
          <Text style={[s.actLabel, { color: tint }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actBtn, { backgroundColor: `${tint}08` }]} onPress={onCalendar}>
          <Ionicons name="calendar-outline" size={14} color={tint} />
          <Text style={[s.actLabel, { color: tint }]}>Calendar</Text>
        </TouchableOpacity>
        {live && (
          <TouchableOpacity style={[s.actBtn, { backgroundColor: '#fef9c3' }]} onPress={onDeactivate}>
            <Ionicons name="pause-outline" size={14} color="#ca8a04" />
            <Text style={[s.actLabel, { color: '#ca8a04' }]}>Pause</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[s.actBtn, { backgroundColor: '#fef2f2' }]} onPress={onDelete}>
          <Ionicons name="trash-outline" size={14} color="#ef4444" />
          <Text style={[s.actLabel, { color: '#ef4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 14, marginBottom: 14, overflow: 'hidden' },
  imgWrap: { width: '100%', height: 140, position: 'relative' },
  img: { width: '100%', height: '100%' },
  imgEmpty: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  tag: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  body: { padding: 14 },
  title: { fontSize: 16, fontWeight: '600' },
  loc: { fontSize: 13, marginTop: 3 },
  price: { fontSize: 15, fontWeight: '700', marginTop: 6 },
  actions: { flexDirection: 'row', paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  actBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  actLabel: { fontSize: 12, fontWeight: '600' },
});
