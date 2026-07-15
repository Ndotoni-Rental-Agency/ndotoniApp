import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AIService } from '@/lib/ai-service';
import { EditTabProps } from '../types';

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

export default function BasicInfoSection({ form, upd, toggleCat, saving, saveSec, text, tint, border, subtle }: EditTabProps) {
  const [generatingTitle, setGeneratingTitle] = React.useState(false);
  const [generatingDesc, setGeneratingDesc] = React.useState(false);

  const generateTitle = async () => {
    setGeneratingTitle(true);
    try {
      const title = await AIService.generateTitle({ propertyType: form.propertyType, district: form.district, region: form.region, maxGuests: form.maxGuests, bedrooms: form.bedrooms, bathrooms: form.bathrooms, stayCategories: form.stayCategories, currency: form.currency, nightlyRate: form.nightlyRate, userContext: form.title || undefined });
      if (title) upd('title', title);
    } catch {} finally { setGeneratingTitle(false); }
  };

  const generateDescription = async () => {
    setGeneratingDesc(true);
    try {
      const desc = await AIService.generateDescription({ title: form.title, propertyType: form.propertyType, district: form.district, region: form.region, maxGuests: parseInt(form.maxGuests) || 2, nightlyRate: parseInt(form.nightlyRate) || 0, currency: form.currency, amenities: form.amenities });
      if (desc) upd('description', desc);
    } catch {} finally { setGeneratingDesc(false); }
  };

  return (
    <View style={s.section}>
      <Text style={[s.label, { color: text }]}>Title</Text>
      <TextInput style={[s.input, { color: text, borderColor: border }]} value={form.title} onChangeText={v => upd('title', v)} placeholder="Property title" placeholderTextColor={subtle} />
      <TouchableOpacity style={s.aiBtn} onPress={generateTitle} disabled={generatingTitle || !form.district}>
        {generatingTitle ? <ActivityIndicator size="small" color={tint} /> : <Ionicons name="sparkles" size={14} color={tint} />}
        <Text style={[s.aiBtnText, { color: tint }]}>{generatingTitle ? 'Generating...' : '✨ AI Suggest Title'}</Text>
      </TouchableOpacity>

      <Text style={[s.label, { color: text }]}>Description</Text>
      <TextInput style={[s.input, s.textArea, { color: text, borderColor: border }]} value={form.description} onChangeText={v => upd('description', v)} placeholder="Describe your place..." placeholderTextColor={subtle} multiline numberOfLines={4} textAlignVertical="top" />
      <TouchableOpacity style={s.aiBtn} onPress={generateDescription} disabled={generatingDesc || !form.title}>
        {generatingDesc ? <ActivityIndicator size="small" color={tint} /> : <Ionicons name="sparkles" size={14} color={tint} />}
        <Text style={[s.aiBtnText, { color: tint }]}>{generatingDesc ? 'Writing...' : '✨ AI Generate Description'}</Text>
      </TouchableOpacity>
      <Text style={[s.label, { color: text }]}>Stay categories</Text>
      <View style={s.chipGrid}>
        {STAY_CATEGORIES.map(c => {
          const sel = form.stayCategories.includes(c.value);
          return <TouchableOpacity key={c.value} style={[s.chip, { borderColor: sel ? tint : border, backgroundColor: sel ? `${tint}08` : 'transparent' }]} onPress={() => toggleCat(c.value)}><Text style={{ fontSize: 16 }}>{c.icon}</Text><Text style={[s.chipLabel, { color: sel ? tint : text }]}>{c.label}</Text></TouchableOpacity>;
        })}
      </View>
      <TouchableOpacity style={[s.saveBtn, { backgroundColor: tint, opacity: saving ? 0.5 : 1 }]} onPress={() => saveSec('Basic info', { title: form.title, description: form.description || undefined })} disabled={saving}>
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>Save basic info</Text>}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginBottom: 8 },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 18 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  textArea: { minHeight: 100, paddingTop: 14 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22, borderWidth: 1.5 },
  chipLabel: { fontSize: 13, fontWeight: '600' },
  saveBtn: { marginTop: 24, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingVertical: 8 },
  aiBtnText: { fontSize: 13, fontWeight: '600' },
});
