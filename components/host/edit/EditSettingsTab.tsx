import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { EditTabProps } from './types';

export default function EditSettingsTab({ form, upd, saving, saveSec, text, tint, border, subtle }: EditTabProps) {
  return (
    <>
      <ToggleRow label="⚡ Instant Book" desc="Guests book without waiting for approval" val={form.instantBookEnabled} set={v => upd('instantBookEnabled', v)} text={text} subtle={subtle} border={border} tint={tint} />
      <ToggleRow label="🐾 Pets allowed" val={form.allowsPets} set={v => upd('allowsPets', v)} text={text} subtle={subtle} border={border} tint={tint} />
      <ToggleRow label="🚬 Smoking allowed" val={form.allowsSmoking} set={v => upd('allowsSmoking', v)} text={text} subtle={subtle} border={border} tint={tint} />
      <ToggleRow label="👶 Children allowed" val={form.allowsChildren} set={v => upd('allowsChildren', v)} text={text} subtle={subtle} border={border} tint={tint} />
      <ToggleRow label="🍼 Infants allowed" val={form.allowsInfants} set={v => upd('allowsInfants', v)} text={text} subtle={subtle} border={border} tint={tint} />

      <Text style={[s.secTitle, { color: text }]}>Cancellation policy</Text>
      {[
        { v: 'FLEXIBLE', d: 'Free cancellation up to 24 hours before check-in' },
        { v: 'MODERATE', d: 'Free cancellation up to 5 days before check-in' },
        { v: 'STRICT', d: '50% refund up to 1 week before, no refund after' },
      ].map(p => (
        <TouchableOpacity key={p.v} style={[s.policyCard, { borderColor: form.cancellationPolicy === p.v ? tint : border, backgroundColor: form.cancellationPolicy === p.v ? `${tint}06` : 'transparent' }]} onPress={() => upd('cancellationPolicy', p.v)}>
          <Text style={[s.policyName, { color: form.cancellationPolicy === p.v ? tint : text }]}>{p.v.charAt(0) + p.v.slice(1).toLowerCase()}</Text>
          <Text style={[s.policyDesc, { color: subtle }]}>{p.d}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={[s.saveBtn, { backgroundColor: tint, opacity: saving ? 0.5 : 1 }]} onPress={() => saveSec('Settings', { instantBookEnabled: form.instantBookEnabled, allowsPets: form.allowsPets, allowsSmoking: form.allowsSmoking, allowsChildren: form.allowsChildren, allowsInfants: form.allowsInfants, cancellationPolicy: form.cancellationPolicy as any })} disabled={saving}>
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>Save settings</Text>}
      </TouchableOpacity>

      <Text style={[s.secTitle, { color: '#ef4444', marginTop: 32 }]}>Danger zone</Text>
      <TouchableOpacity style={s.dangerBtn} onPress={() => Alert.alert('Deactivate', 'This will hide your listing from guests.', [{ text: 'Cancel' }, { text: 'Deactivate', style: 'destructive' }])}>
        <Ionicons name="eye-off-outline" size={18} color="#ef4444" />
        <Text style={{ color: '#ef4444', fontSize: 15, fontWeight: '600' }}>Deactivate listing</Text>
      </TouchableOpacity>
    </>
  );
}

function ToggleRow({ label, desc, val, set, text, subtle, border, tint }: { label: string; desc?: string; val: boolean; set: (v: boolean) => void; text: string; subtle: string; border: string; tint: string }) {
  return (
    <View style={[s.toggleRow, { borderBottomColor: border }]}>
      <View style={{ flex: 1 }}><Text style={[s.toggleLabel, { color: text }]}>{label}</Text>{desc && <Text style={[s.toggleDesc, { color: subtle }]}>{desc}</Text>}</View>
      <Switch value={val} onValueChange={set} trackColor={{ true: tint }} />
    </View>
  );
}

const s = StyleSheet.create({
  secTitle: { fontSize: 17, fontWeight: '700', marginTop: 24, marginBottom: 8 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
  toggleLabel: { fontSize: 15, fontWeight: '600' },
  toggleDesc: { fontSize: 12, marginTop: 2 },
  policyCard: { padding: 14, borderRadius: 12, borderWidth: 1.5, marginBottom: 8 },
  policyName: { fontSize: 14, fontWeight: '600' },
  policyDesc: { fontSize: 12, marginTop: 3, lineHeight: 16 },
  saveBtn: { marginTop: 20, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14 },
});
