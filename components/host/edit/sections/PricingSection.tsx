import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AIService } from '@/lib/ai-service';
import { EditTabProps } from '../types';

export default function PricingSection({ form, upd, saving, saveSec, text, tint, border, subtle }: EditTabProps) {
  const [predicting, setPredicting] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<any>(null);

  const suggestPrice = async () => {
    setPredicting(true);
    try {
      const result = await AIService.predictPrice({ propertyType: form.propertyType, district: form.district, region: form.region, maxGuests: parseInt(form.maxGuests) || 2 });
      setSuggestion(result);
    } catch {} finally { setPredicting(false); }
  };

  return (
    <View style={s.section}>
      <View style={s.row}>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Nightly ({form.currency})</Text><TextInput style={[s.input, { color: text, borderColor: border }]} value={form.nightlyRate} onChangeText={v => upd('nightlyRate', v.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="50000" placeholderTextColor={subtle} /></View>
        <View style={s.col}><Text style={[s.label, { color: text }]}>Cleaning fee</Text><TextInput style={[s.input, { color: text, borderColor: border }]} value={form.cleaningFee} onChangeText={v => upd('cleaningFee', v.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="0" placeholderTextColor={subtle} /></View>
      </View>

      {/* AI Price */}
      <TouchableOpacity style={s.aiBtn} onPress={suggestPrice} disabled={predicting || !form.district}>
        {predicting ? <ActivityIndicator size="small" color={tint} /> : <Ionicons name="sparkles" size={14} color={tint} />}
        <Text style={[s.aiBtnText, { color: tint }]}>{predicting ? 'Analyzing...' : '✨ AI Price Suggestion'}</Text>
      </TouchableOpacity>
      {suggestion && (
        <View style={[s.suggBox, { backgroundColor: `${tint}08`, borderColor: `${tint}25` }]}>
          <Text style={[s.suggPrice, { color: text }]}>Suggested: TZS {suggestion.suggestedPrice?.toLocaleString()}/night</Text>
          {suggestion.range && <Text style={[s.suggRange, { color: subtle }]}>Range: TZS {suggestion.range.min?.toLocaleString()} – {suggestion.range.max?.toLocaleString()}</Text>}
          {suggestion.reasoning && <Text style={[s.suggReason, { color: subtle }]}>{suggestion.reasoning}</Text>}
          <TouchableOpacity style={[s.useBtn, { backgroundColor: tint }]} onPress={() => { upd('nightlyRate', suggestion.suggestedPrice.toString()); setSuggestion(null); }}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Use this price</Text>
          </TouchableOpacity>
        </View>
      )}

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
  section: { marginTop: 4, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  saveBtn: { marginTop: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingVertical: 6 },
  aiBtnText: { fontSize: 13, fontWeight: '600' },
  suggBox: { marginTop: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  suggPrice: { fontSize: 14, fontWeight: '700' },
  suggRange: { fontSize: 12, marginTop: 2 },
  suggReason: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  useBtn: { marginTop: 8, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start' },
});
