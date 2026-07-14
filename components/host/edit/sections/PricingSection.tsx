import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { EditTabProps } from '../types';

export default function PricingSection({ form, upd, saving, saveSec, text, tint, border, subtle }: EditTabProps) {
  return (
    <View style={s.section}>
      <Text style={[s.title, { color: text }]}>Pricing</Text>
      <View style={s.row}>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Nightly ({form.currency})</Text><TextInput style={[s.input, { color: text, borderColor: border }]} value={form.nightlyRate} onChangeText={v => upd('nightlyRate', v.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="50000" placeholderTextColor={subtle} /></View>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Cleaning fee</Text><TextInput style={[s.input, { color: text, borderColor: border }]} value={form.cleaningFee} onChangeText={v => upd('cleaningFee', v.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="0" placeholderTextColor={subtle} /></View>
      </View>
      <View style={s.row}>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Service %</Text><TextInput style={[s.input, { color: text, borderColor: border }]} value={form.serviceFeePercentage} onChangeText={v => upd('serviceFeePercentage', v)} keyboardType="number-pad" placeholder="10" placeholderTextColor={subtle} /></View>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Currency</Text><TextInput style={[s.input, { color: text, borderColor: border }]} value={form.currency} onChangeText={v => upd('currency', v)} placeholder="TZS" placeholderTextColor={subtle} /></View>
      </View>
      <TouchableOpacity style={[s.saveBtn, { backgroundColor: tint, opacity: saving ? 0.5 : 1 }]} onPress={() => saveSec('Pricing', { nightlyRate: parseFloat(form.nightlyRate) || 0, cleaningFee: parseFloat(form.cleaningFee) || undefined, serviceFeePercentage: parseFloat(form.serviceFeePercentage) || undefined, currency: form.currency })} disabled={saving}>
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>Save pricing</Text>}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginTop: 20, marginBottom: 8 },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  saveBtn: { marginTop: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
