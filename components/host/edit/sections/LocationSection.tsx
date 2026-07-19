import LocationSelector from '@/components/location/LocationSelector';
import { GoogleMapsParser } from '@/lib/parse-google-maps-link';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { EditTabProps } from '../types';

async function reverseGeocode(lat: number, lng: number): Promise<{ region?: string; district?: string; ward?: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=16`
    );
    const data = await res.json();
    const address = data?.address;
    if (!address) return {};
    const rawRegion = address.state || '';
    const rawDistrict = address.state_district || address.city_district || address.county || address.city || '';
    const rawWard = address.village || address.suburb || address.ward || address.neighbourhood || '';
    const clean = (s: string) => s.replace(/\s*(region|city|municipal|district|urban|rural)$/i, '').toLowerCase().trim();
    return {
      region: clean(rawRegion) || undefined,
      district: clean(rawDistrict) || undefined,
      ward: rawWard.toLowerCase().trim() || undefined,
    };
  } catch {
    return {};
  }
}

export default function LocationSection({ form, upd, saving, saveSec, text, tint, border, subtle }: EditTabProps) {
  const [resolving, setResolving] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResolved = useRef(form.googleMapsUrl || '');

  useEffect(() => {
    const link = form.googleMapsUrl?.trim();
    if (!link || !link.startsWith('http') || link === lastResolved.current) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      lastResolved.current = link;
      setResolving(true);
      GoogleMapsParser.parseAsync(link).then(async (coords) => {
        if (coords) {
          const location = await reverseGeocode(coords.latitude, coords.longitude);
          if (location.region) upd('region', location.region);
          if (location.district) upd('district', location.district);
        }
      }).finally(() => setResolving(false));
    }, 600);

    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [form.googleMapsUrl]);

  return (
    <View style={s.section}>
      {/* Google Maps link — primary */}
      <View style={s.mapsSection}>
        <View style={s.mapsHeader}>
          <Ionicons name="location" size={16} color={tint} />
          <Text style={[s.label, { color: text }]}>Google Maps link</Text>
        </View>
        <TextInput
          style={[s.input, { color: text, borderColor: border }]}
          value={form.googleMapsUrl}
          onChangeText={(v) => upd('googleMapsUrl', v)}
          placeholder="e.g. https://maps.app.goo.gl/..."
          placeholderTextColor={subtle || '#999'}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {resolving && <Text style={[s.hint, { color: subtle || '#999' }]}>Resolving location...</Text>}
      </View>

      <Text style={[s.divider, { color: subtle || '#999' }]}>or select manually</Text>

      <LocationSelector
        value={{ region: form.region, district: form.district }}
        onChange={(loc: any) => { upd('region', loc.region); upd('district', loc.district); }}
      />

      <TouchableOpacity
        style={[s.saveBtn, { backgroundColor: tint, opacity: saving ? 0.5 : 1 }]}
        onPress={() => saveSec('Location', {
          region: form.region,
          district: form.district,
          ...(form.googleMapsUrl ? { googleMapsUrl: form.googleMapsUrl } : {}),
        })}
        disabled={saving}
      >
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>Save location</Text>}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginTop: 12, marginBottom: 8 },
  mapsSection: { marginBottom: 12 },
  mapsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  label: { fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14 },
  hint: { fontSize: 12, marginTop: 4 },
  divider: { textAlign: 'center', fontSize: 12, marginVertical: 14 },
  saveBtn: { marginTop: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
