import AmenitiesSelector from '@/components/property/AmenitiesSelector';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { EditTabProps } from '../types';

export default function AmenitiesSection({ form, upd, saving, saveSec, text, tint, border, subtle }: EditTabProps) {
  return (
    <View style={s.section}>
      <AmenitiesSelector selectedAmenities={form.amenities} onAmenitiesChange={a => upd('amenities', a)} propertyType="short-term" />
      <TouchableOpacity style={[s.saveBtn, { backgroundColor: tint, opacity: saving ? 0.5 : 1 }]} onPress={() => saveSec('Amenities', { amenities: form.amenities })} disabled={saving}>
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>Save amenities</Text>}
      </TouchableOpacity>

      <Text style={[s.title, { color: text, marginTop: 20 }]}>House rules</Text>
      <TextInput style={[s.input, s.textArea, { color: text, borderColor: border }]} value={form.houseRules} onChangeText={v => upd('houseRules', v)} placeholder="One rule per line" placeholderTextColor={subtle} multiline numberOfLines={3} textAlignVertical="top" />
      <TouchableOpacity style={[s.saveBtn, { backgroundColor: tint, opacity: saving ? 0.5 : 1 }]} onPress={() => saveSec('Rules', { houseRules: form.houseRules.split('\n').filter(r => r.trim()) })} disabled={saving}>
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>Save rules</Text>}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginTop: 20, marginBottom: 8 },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textArea: { minHeight: 70, paddingTop: 12 },
  saveBtn: { marginTop: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
