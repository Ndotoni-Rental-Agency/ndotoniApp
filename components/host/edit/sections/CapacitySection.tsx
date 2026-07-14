import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { EditTabProps } from '../types';

export default function CapacitySection({ form, upd, saving, saveSec, text, tint, border, subtle }: EditTabProps) {
  return (
    <View style={s.section}>
      <Text style={[s.title, { color: text }]}>Capacity & Duration</Text>
      <View style={s.row}>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Max guests</Text><TextInput style={[s.input, { color: text, borderColor: border, textAlign: 'center' }]} value={form.maxGuests} onChangeText={v => upd('maxGuests', v)} keyboardType="number-pad" /></View>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Bedrooms</Text><TextInput style={[s.input, { color: text, borderColor: border, textAlign: 'center' }]} value={form.bedrooms} onChangeText={v => upd('bedrooms', v)} keyboardType="number-pad" /></View>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Baths</Text><TextInput style={[s.input, { color: text, borderColor: border, textAlign: 'center' }]} value={form.bathrooms} onChangeText={v => upd('bathrooms', v)} keyboardType="number-pad" /></View>
      </View>
      <View style={s.row}>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Min nights</Text><TextInput style={[s.input, { color: text, borderColor: border, textAlign: 'center' }]} value={form.minimumStay} onChangeText={v => upd('minimumStay', v)} keyboardType="number-pad" /></View>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Max nights</Text><TextInput style={[s.input, { color: text, borderColor: border, textAlign: 'center' }]} value={form.maximumStay} onChangeText={v => upd('maximumStay', v)} keyboardType="number-pad" placeholder="365" placeholderTextColor={subtle} /></View>
      </View>
      <TouchableOpacity style={[s.saveBtn, { backgroundColor: tint, opacity: saving ? 0.5 : 1 }]} onPress={() => saveSec('Capacity', { maxGuests: parseInt(form.maxGuests) || 1, minimumStay: parseInt(form.minimumStay) || 1, maximumStay: parseInt(form.maximumStay) || undefined })} disabled={saving}>
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>Save capacity</Text>}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginTop: 20, marginBottom: 8 },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  row: { flexDirection: 'row', gap: 12, marginTop: 4 },
  col: { flex: 1 },
  saveBtn: { marginTop: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
