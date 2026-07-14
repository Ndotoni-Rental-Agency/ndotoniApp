import AmenitiesSelector from '@/components/property/AmenitiesSelector';
import LocationSelector from '@/components/location/LocationSelector';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { EditTabProps } from './types';

const STAY_CATEGORIES = [
  { value: 'NIGHTLY_STAY', icon: '🏠', label: 'Nightly Stay' },
  { value: 'PARTY', icon: '🎉', label: 'Party' },
  { value: 'PHOTOSHOOT', icon: '📸', label: 'Photoshoot' },
  { value: 'MEETING', icon: '💼', label: 'Meeting' },
  { value: 'GETAWAY', icon: '🌊', label: 'Getaway' },
  { value: 'SAFARI', icon: '🦁', label: 'Safari' },
  { value: 'BEACH', icon: '🏖️', label: 'Beach' },
  { value: 'WEDDING', icon: '💒', label: 'Wedding' },
];

export default function EditDetailsTab({ form, upd, toggleCat, saving, saveSec, text, tint, border, subtle }: EditTabProps) {
  return (
    <>
      {/* Basic info */}
      <Text style={[s.secTitle, { color: text }]}>Basic info</Text>
      <Text style={[s.label, { color: text }]}>Title</Text>
      <TextInput style={[s.input, { color: text, borderColor: border }]} value={form.title} onChangeText={v => upd('title', v)} placeholder="Property title" placeholderTextColor={subtle} />
      <Text style={[s.label, { color: text }]}>Description</Text>
      <TextInput style={[s.input, s.textArea, { color: text, borderColor: border }]} value={form.description} onChangeText={v => upd('description', v)} placeholder="Describe your place..." placeholderTextColor={subtle} multiline numberOfLines={4} textAlignVertical="top" />
      <Text style={[s.label, { color: text }]}>Stay categories</Text>
      <View style={s.chipGrid}>
        {STAY_CATEGORIES.map(c => {
          const sel = form.stayCategories.includes(c.value);
          return <TouchableOpacity key={c.value} style={[s.chip, { borderColor: sel ? tint : border, backgroundColor: sel ? `${tint}08` : 'transparent' }]} onPress={() => toggleCat(c.value)}><Text style={{ fontSize: 16 }}>{c.icon}</Text><Text style={[s.chipLabel, { color: sel ? tint : text }]}>{c.label}</Text></TouchableOpacity>;
        })}
      </View>
      <SaveBtn label="Save basic info" saving={saving} tint={tint} onPress={() => saveSec('Basic info', { title: form.title, description: form.description || undefined })} />

      {/* Location */}
      <Text style={[s.secTitle, { color: text }]}>Location</Text>
      <LocationSelector value={{ region: form.region, district: form.district }} onChange={(loc: any) => { upd('region', loc.region); upd('district', loc.district); }} />
      <SaveBtn label="Save location" saving={saving} tint={tint} onPress={() => saveSec('Location', { region: form.region, district: form.district })} />

      {/* Pricing */}
      <Text style={[s.secTitle, { color: text }]}>Pricing</Text>
      <View style={s.row}>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Nightly ({form.currency})</Text><TextInput style={[s.input, { color: text, borderColor: border }]} value={form.nightlyRate} onChangeText={v => upd('nightlyRate', v.replace(/\D/g, ''))} keyboardType="number-pad" placeholderTextColor={subtle} /></View>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Cleaning fee</Text><TextInput style={[s.input, { color: text, borderColor: border }]} value={form.cleaningFee} onChangeText={v => upd('cleaningFee', v.replace(/\D/g, ''))} keyboardType="number-pad" placeholderTextColor={subtle} /></View>
      </View>
      <SaveBtn label="Save pricing" saving={saving} tint={tint} onPress={() => saveSec('Pricing', { nightlyRate: parseFloat(form.nightlyRate) || 0, cleaningFee: parseFloat(form.cleaningFee) || undefined, serviceFeePercentage: parseFloat(form.serviceFeePercentage) || undefined, currency: form.currency })} />

      {/* Capacity */}
      <Text style={[s.secTitle, { color: text }]}>Capacity</Text>
      <View style={s.row}>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Max guests</Text><TextInput style={[s.input, { color: text, borderColor: border, textAlign: 'center' }]} value={form.maxGuests} onChangeText={v => upd('maxGuests', v)} keyboardType="number-pad" /></View>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Bedrooms</Text><TextInput style={[s.input, { color: text, borderColor: border, textAlign: 'center' }]} value={form.bedrooms} onChangeText={v => upd('bedrooms', v)} keyboardType="number-pad" /></View>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Baths</Text><TextInput style={[s.input, { color: text, borderColor: border, textAlign: 'center' }]} value={form.bathrooms} onChangeText={v => upd('bathrooms', v)} keyboardType="number-pad" /></View>
      </View>
      <SaveBtn label="Save capacity" saving={saving} tint={tint} onPress={() => saveSec('Capacity', { maxGuests: parseInt(form.maxGuests) || 1 })} />

      {/* Duration */}
      <Text style={[s.secTitle, { color: text }]}>Stay duration</Text>
      <View style={s.row}>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Min nights</Text><TextInput style={[s.input, { color: text, borderColor: border, textAlign: 'center' }]} value={form.minimumStay} onChangeText={v => upd('minimumStay', v)} keyboardType="number-pad" /></View>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Max nights</Text><TextInput style={[s.input, { color: text, borderColor: border, textAlign: 'center' }]} value={form.maximumStay} onChangeText={v => upd('maximumStay', v)} keyboardType="number-pad" /></View>
      </View>
      <SaveBtn label="Save duration" saving={saving} tint={tint} onPress={() => saveSec('Duration', { minimumStay: parseInt(form.minimumStay) || 1, maximumStay: parseInt(form.maximumStay) || undefined })} />

      {/* Amenities */}
      <Text style={[s.secTitle, { color: text }]}>Amenities</Text>
      <AmenitiesSelector selectedAmenities={form.amenities} onAmenitiesChange={a => upd('amenities', a)} propertyType="short-term" />
      <SaveBtn label="Save amenities" saving={saving} tint={tint} onPress={() => saveSec('Amenities', { amenities: form.amenities })} />

      {/* House rules */}
      <Text style={[s.secTitle, { color: text }]}>House rules</Text>
      <TextInput style={[s.input, s.textArea, { color: text, borderColor: border }]} value={form.houseRules} onChangeText={v => upd('houseRules', v)} placeholder="One rule per line" placeholderTextColor={subtle} multiline numberOfLines={3} textAlignVertical="top" />
      <SaveBtn label="Save rules" saving={saving} tint={tint} onPress={() => saveSec('Rules', { houseRules: form.houseRules.split('\n').filter(r => r.trim()) })} />
    </>
  );
}

function SaveBtn({ label, saving, tint, onPress }: { label: string; saving: boolean; tint: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={[s.saveBtn, { backgroundColor: tint, opacity: saving ? 0.5 : 1 }]} onPress={onPress} disabled={saving}>
      {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>{label}</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  secTitle: { fontSize: 17, fontWeight: '700', marginTop: 28, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textArea: { minHeight: 80, paddingTop: 12 },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  chipLabel: { fontSize: 12, fontWeight: '600' },
  saveBtn: { marginTop: 16, marginBottom: 8, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
