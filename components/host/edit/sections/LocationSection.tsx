import LocationSelector from '@/components/location/LocationSelector';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EditTabProps } from '../types';

export default function LocationSection({ form, upd, saving, saveSec, text, tint, border }: EditTabProps) {
  return (
    <View style={s.section}>
      <Text style={[s.title, { color: text }]}>Location</Text>
      <LocationSelector value={{ region: form.region, district: form.district }} onChange={(loc: any) => { upd('region', loc.region); upd('district', loc.district); }} />
      <TouchableOpacity style={[s.saveBtn, { backgroundColor: tint, opacity: saving ? 0.5 : 1 }]} onPress={() => saveSec('Location', { region: form.region, district: form.district })} disabled={saving}>
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>Save location</Text>}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginTop: 20, marginBottom: 8 },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  saveBtn: { marginTop: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
