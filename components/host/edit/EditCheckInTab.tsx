import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { EditTabProps } from './types';

export default function EditCheckInTab({ form, upd, saving, saveSec, text, tint, border, subtle }: EditTabProps) {
  return (
    <>
      <Text style={[s.secTitle, { color: text }]}>Check-in & Check-out</Text>
      <View style={s.row}>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Check-in time</Text><TextInput style={[s.input, { color: text, borderColor: border }]} value={form.checkInTime} onChangeText={v => upd('checkInTime', v)} placeholder="14:00" placeholderTextColor={subtle} /></View>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Check-out time</Text><TextInput style={[s.input, { color: text, borderColor: border }]} value={form.checkOutTime} onChangeText={v => upd('checkOutTime', v)} placeholder="11:00" placeholderTextColor={subtle} /></View>
      </View>

      <Text style={[s.secTitle, { color: text }]}>Wi-Fi</Text>
      <View style={s.row}>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Network name</Text><TextInput style={[s.input, { color: text, borderColor: border }]} value={form.ciWifi} onChangeText={v => upd('ciWifi', v)} placeholder="WiFi name" placeholderTextColor={subtle} /></View>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Password</Text><TextInput style={[s.input, { color: text, borderColor: border }]} value={form.ciWifiPassword} onChangeText={v => upd('ciWifiPassword', v)} placeholder="Password" placeholderTextColor={subtle} /></View>
      </View>

      <Text style={[s.secTitle, { color: text }]}>Access</Text>
      <Text style={[s.label, { color: text }]}>Access code / Lock code</Text>
      <TextInput style={[s.input, { color: text, borderColor: border }]} value={form.ciAccessCode} onChangeText={v => upd('ciAccessCode', v)} placeholder="e.g. 1234" placeholderTextColor={subtle} />
      <Text style={[s.label, { color: text }]}>Directions to property</Text>
      <TextInput style={[s.input, s.textArea, { color: text, borderColor: border }]} value={form.ciDirections} onChangeText={v => upd('ciDirections', v)} placeholder="How to find the property..." placeholderTextColor={subtle} multiline numberOfLines={3} textAlignVertical="top" />
      <Text style={[s.label, { color: text }]}>Parking info</Text>
      <TextInput style={[s.input, s.textArea, { color: text, borderColor: border }]} value={form.ciParking} onChangeText={v => upd('ciParking', v)} placeholder="Parking availability..." placeholderTextColor={subtle} multiline numberOfLines={2} textAlignVertical="top" />

      <Text style={[s.secTitle, { color: text }]}>Emergency contact</Text>
      <View style={s.row}>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Contact name</Text><TextInput style={[s.input, { color: text, borderColor: border }]} value={form.ciContactName} onChangeText={v => upd('ciContactName', v)} placeholder="Name" placeholderTextColor={subtle} /></View>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Phone</Text><TextInput style={[s.input, { color: text, borderColor: border }]} value={form.ciContactPhone} onChangeText={v => upd('ciContactPhone', v)} placeholder="+255..." placeholderTextColor={subtle} keyboardType="phone-pad" /></View>
      </View>
      <Text style={[s.label, { color: text }]}>Additional notes</Text>
      <TextInput style={[s.input, s.textArea, { color: text, borderColor: border }]} value={form.ciNotes} onChangeText={v => upd('ciNotes', v)} placeholder="Anything else guests should know..." placeholderTextColor={subtle} multiline numberOfLines={3} textAlignVertical="top" />

      <TouchableOpacity style={[s.saveBtn, { backgroundColor: tint, opacity: saving ? 0.5 : 1 }]} onPress={() => saveSec('Check-in', {
        checkInTime: form.checkInTime || undefined, checkOutTime: form.checkOutTime || undefined,
        ...(form.ciWifi || form.ciWifiPassword || form.ciAccessCode || form.ciDirections || form.ciParking || form.ciContactPhone || form.ciContactName || form.ciNotes ? {
          checkInInstructions: JSON.stringify({ wifiName: form.ciWifi || undefined, wifiPassword: form.ciWifiPassword || undefined, accessCode: form.ciAccessCode || undefined, directions: form.ciDirections || undefined, parkingInfo: form.ciParking || undefined, contactPhone: form.ciContactPhone || undefined, contactName: form.ciContactName || undefined, additionalNotes: form.ciNotes || undefined })
        } : {}),
      })} disabled={saving}>
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>Save check-in info</Text>}
      </TouchableOpacity>
    </>
  );
}

const s = StyleSheet.create({
  secTitle: { fontSize: 17, fontWeight: '700', marginTop: 28, marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 18 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  textArea: { minHeight: 80, paddingTop: 14 },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  saveBtn: { marginTop: 24, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
