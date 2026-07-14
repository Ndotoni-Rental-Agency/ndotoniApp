import MediaSelector from '@/components/media/MediaSelector';
import AmenitiesSelector from '@/components/property/AmenitiesSelector';
import { useShortTermPropertyDetail } from '@/hooks/propertyDetails/useShortTermPropertyDetail';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUpdateProperty } from '@/hooks/useUpdateProperty';
import { UpdateShortTermPropertyInput } from '@/lib/API';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'details' | 'photos' | 'settings';

export default function EditShortTermPropertyScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const { property, loading, error } = useShortTermPropertyDetail(propertyId);
  const { updateShortProperty } = useUpdateProperty();

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#f9f9f9', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const [tab, setTab] = useState<Tab>('details');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', propertyType: '', nightlyRate: '', cleaningFee: '',
    currency: 'TZS', maxGuests: '', bedrooms: '', bathrooms: '',
    minimumStay: '', maximumStay: '', instantBookEnabled: false,
    checkInTime: '', checkOutTime: '', checkInInstructions: '',
    cancellationPolicy: 'MODERATE',
    allowsPets: false, allowsSmoking: false, allowsChildren: true, allowsInfants: true,
    amenities: [] as string[], houseRules: [] as string[],
  });
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!property) return;
    setForm({
      title: property.title || '', description: property.description || '',
      propertyType: property.propertyType || '', nightlyRate: property.nightlyRate?.toString() || '',
      cleaningFee: property.cleaningFee?.toString() || '', currency: property.currency || 'TZS',
      maxGuests: property.maxGuests?.toString() || '', bedrooms: (property as any).bedrooms?.toString() || '',
      bathrooms: (property as any).bathrooms?.toString() || '', minimumStay: property.minimumStay?.toString() || '1',
      maximumStay: property.maximumStay?.toString() || '', instantBookEnabled: property.instantBookEnabled ?? false,
      checkInTime: property.checkInTime || '', checkOutTime: property.checkOutTime || '',
      checkInInstructions: property.checkInInstructions || '', cancellationPolicy: property.cancellationPolicy || 'MODERATE',
      allowsPets: property.allowsPets ?? false, allowsSmoking: property.allowsSmoking ?? false,
      allowsChildren: property.allowsChildren ?? true, allowsInfants: property.allowsInfants ?? true,
      amenities: property.amenities?.filter((a): a is string => a !== null) || [],
      houseRules: property.houseRules?.filter((r): r is string => r !== null) || [],
    });
    setImages(property.images || []);
  }, [property]);

  const upd = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const input: UpdateShortTermPropertyInput = {
        title: form.title, description: form.description || undefined,
        nightlyRate: parseFloat(form.nightlyRate) || 0, currency: form.currency,
        cleaningFee: parseFloat(form.cleaningFee) || undefined,
        maxGuests: parseInt(form.maxGuests) || 1,
        minimumStay: parseInt(form.minimumStay) || 1,
        maximumStay: parseInt(form.maximumStay) || undefined,
        instantBookEnabled: form.instantBookEnabled,
        checkInTime: form.checkInTime || undefined, checkOutTime: form.checkOutTime || undefined,
        checkInInstructions: form.checkInInstructions || undefined,
        cancellationPolicy: form.cancellationPolicy as any,
        allowsPets: form.allowsPets, allowsSmoking: form.allowsSmoking,
        allowsChildren: form.allowsChildren, allowsInfants: form.allowsInfants,
        amenities: form.amenities, images,
      };
      const result = await updateShortProperty(propertyId, input);
      if (result.success) Alert.alert('✅ Saved', 'Property updated');
      else Alert.alert('Error', result.message);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return <SafeAreaView style={[styles.fill, { backgroundColor: bg }]} edges={['top']}><View style={styles.center}><ActivityIndicator size="large" color={tint} /></View></SafeAreaView>;
  if (error || !property) return (
    <SafeAreaView style={[styles.fill, { backgroundColor: bg }]} edges={['top']}>
      <View style={styles.center}>
        <Text style={[{ color: text, fontSize: 16 }]}>{error || 'Not found'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}><Text style={{ color: tint }}>Go back</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'details', label: 'Details', icon: 'document-text-outline' },
    { key: 'photos', label: 'Photos', icon: 'images-outline' },
    { key: 'settings', label: 'Settings', icon: 'settings-outline' },
  ];

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: bg }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={text} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]} numberOfLines={1}>{form.title || 'Edit'}</Text>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: tint, opacity: saving ? 0.5 : 1 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: border }]}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[styles.tab, tab === t.key && { borderBottomColor: tint, borderBottomWidth: 2 }]} onPress={() => setTab(t.key)}>
            <Ionicons name={t.icon as any} size={18} color={tab === t.key ? tint : subtle} />
            <Text style={[styles.tabLabel, { color: tab === t.key ? tint : subtle }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ═══ DETAILS ═══ */}
        {tab === 'details' && (
          <>
            <Text style={[styles.label, { color: text }]}>Title</Text>
            <TextInput style={[styles.input, { color: text, borderColor: border }]} value={form.title} onChangeText={v => upd('title', v)} placeholder="Property title" placeholderTextColor={subtle} />

            <Text style={[styles.label, { color: text }]}>Description</Text>
            <TextInput style={[styles.input, styles.textArea, { color: text, borderColor: border }]} value={form.description} onChangeText={v => upd('description', v)} placeholder="Describe your property..." placeholderTextColor={subtle} multiline numberOfLines={4} textAlignVertical="top" />

            <Text style={[styles.label, { color: text }]}>Nightly rate ({form.currency})</Text>
            <TextInput style={[styles.input, { color: text, borderColor: border }]} value={form.nightlyRate} onChangeText={v => upd('nightlyRate', v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="50000" placeholderTextColor={subtle} />

            <Text style={[styles.label, { color: text }]}>Cleaning fee</Text>
            <TextInput style={[styles.input, { color: text, borderColor: border }]} value={form.cleaningFee} onChangeText={v => upd('cleaningFee', v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="0" placeholderTextColor={subtle} />

            <View style={styles.row}>
              <View style={styles.col}><Text style={[styles.label, { color: text }]}>Guests</Text><TextInput style={[styles.input, { color: text, borderColor: border, textAlign: 'center' }]} value={form.maxGuests} onChangeText={v => upd('maxGuests', v)} keyboardType="number-pad" /></View>
              <View style={styles.col}><Text style={[styles.label, { color: text }]}>Beds</Text><TextInput style={[styles.input, { color: text, borderColor: border, textAlign: 'center' }]} value={form.bedrooms} onChangeText={v => upd('bedrooms', v)} keyboardType="number-pad" /></View>
              <View style={styles.col}><Text style={[styles.label, { color: text }]}>Baths</Text><TextInput style={[styles.input, { color: text, borderColor: border, textAlign: 'center' }]} value={form.bathrooms} onChangeText={v => upd('bathrooms', v)} keyboardType="number-pad" /></View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}><Text style={[styles.label, { color: text }]}>Min nights</Text><TextInput style={[styles.input, { color: text, borderColor: border, textAlign: 'center' }]} value={form.minimumStay} onChangeText={v => upd('minimumStay', v)} keyboardType="number-pad" /></View>
              <View style={styles.col}><Text style={[styles.label, { color: text }]}>Max nights</Text><TextInput style={[styles.input, { color: text, borderColor: border, textAlign: 'center' }]} value={form.maximumStay} onChangeText={v => upd('maximumStay', v)} keyboardType="number-pad" /></View>
            </View>

            <Text style={[styles.sectionHead, { color: text }]}>Amenities</Text>
            <AmenitiesSelector selectedAmenities={form.amenities} onAmenitiesChange={a => upd('amenities', a)} propertyType="short-term" />

            <Text style={[styles.sectionHead, { color: text }]}>Check-in / Check-out</Text>
            <View style={styles.row}>
              <View style={styles.col}><Text style={[styles.label, { color: text }]}>Check-in</Text><TextInput style={[styles.input, { color: text, borderColor: border }]} value={form.checkInTime} onChangeText={v => upd('checkInTime', v)} placeholder="14:00" placeholderTextColor={subtle} /></View>
              <View style={styles.col}><Text style={[styles.label, { color: text }]}>Check-out</Text><TextInput style={[styles.input, { color: text, borderColor: border }]} value={form.checkOutTime} onChangeText={v => upd('checkOutTime', v)} placeholder="11:00" placeholderTextColor={subtle} /></View>
            </View>

            <Text style={[styles.label, { color: text }]}>Check-in instructions</Text>
            <TextInput style={[styles.input, styles.textArea, { color: text, borderColor: border }]} value={form.checkInInstructions} onChangeText={v => upd('checkInInstructions', v)} placeholder="Directions, wifi password, access codes..." placeholderTextColor={subtle} multiline numberOfLines={3} textAlignVertical="top" />
          </>
        )}

        {/* ═══ PHOTOS ═══ */}
        {tab === 'photos' && (
          <>
            <Text style={[styles.sectionHead, { color: text }]}>Photos & Videos</Text>
            <Text style={[{ color: subtle, fontSize: 13, marginBottom: 12 }]}>Add up to 10 photos. First photo is the cover.</Text>
            <MediaSelector selectedMedia={images} onMediaChange={(_, imgs) => setImages(imgs)} />
          </>
        )}

        {/* ═══ SETTINGS ═══ */}
        {tab === 'settings' && (
          <>
            <View style={[styles.toggleItem, { borderBottomColor: border }]}>
              <View style={{ flex: 1 }}><Text style={[styles.toggleLabel, { color: text }]}>⚡ Instant Book</Text><Text style={[styles.toggleDesc, { color: subtle }]}>Guests book without approval</Text></View>
              <Switch value={form.instantBookEnabled} onValueChange={v => upd('instantBookEnabled', v)} trackColor={{ true: tint }} />
            </View>
            <View style={[styles.toggleItem, { borderBottomColor: border }]}>
              <View style={{ flex: 1 }}><Text style={[styles.toggleLabel, { color: text }]}>🐾 Pets allowed</Text></View>
              <Switch value={form.allowsPets} onValueChange={v => upd('allowsPets', v)} trackColor={{ true: tint }} />
            </View>
            <View style={[styles.toggleItem, { borderBottomColor: border }]}>
              <View style={{ flex: 1 }}><Text style={[styles.toggleLabel, { color: text }]}>🚬 Smoking allowed</Text></View>
              <Switch value={form.allowsSmoking} onValueChange={v => upd('allowsSmoking', v)} trackColor={{ true: tint }} />
            </View>
            <View style={[styles.toggleItem, { borderBottomColor: border }]}>
              <View style={{ flex: 1 }}><Text style={[styles.toggleLabel, { color: text }]}>👶 Children allowed</Text></View>
              <Switch value={form.allowsChildren} onValueChange={v => upd('allowsChildren', v)} trackColor={{ true: tint }} />
            </View>
            <View style={[styles.toggleItem, { borderBottomColor: border }]}>
              <View style={{ flex: 1 }}><Text style={[styles.toggleLabel, { color: text }]}>🍼 Infants allowed</Text></View>
              <Switch value={form.allowsInfants} onValueChange={v => upd('allowsInfants', v)} trackColor={{ true: tint }} />
            </View>

            <Text style={[styles.sectionHead, { color: text, marginTop: 24 }]}>Cancellation policy</Text>
            {['FLEXIBLE', 'MODERATE', 'STRICT'].map(p => (
              <TouchableOpacity key={p} style={[styles.policyItem, { borderColor: form.cancellationPolicy === p ? tint : border, backgroundColor: form.cancellationPolicy === p ? `${tint}08` : 'transparent' }]} onPress={() => upd('cancellationPolicy', p)}>
                <Text style={[styles.policyLabel, { color: form.cancellationPolicy === p ? tint : text }]}>{p.charAt(0) + p.slice(1).toLowerCase()}</Text>
                <Text style={[styles.policyDesc, { color: subtle }]}>
                  {p === 'FLEXIBLE' ? 'Free cancellation 24h before' : p === 'MODERATE' ? 'Free cancellation 5 days before' : 'No free cancellation'}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Danger zone */}
            <Text style={[styles.sectionHead, { color: '#ef4444', marginTop: 32 }]}>Danger zone</Text>
            <TouchableOpacity style={styles.dangerBtn} onPress={() => Alert.alert('Deactivate', 'This will hide your listing from guests.', [{ text: 'Cancel' }, { text: 'Deactivate', style: 'destructive' }])}>
              <Ionicons name="eye-off-outline" size={18} color="#ef4444" />
              <Text style={styles.dangerText}>Deactivate listing</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '600', marginHorizontal: 12 },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  tabLabel: { fontSize: 13, fontWeight: '600' },

  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 16 },
  sectionHead: { fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textArea: { minHeight: 80, paddingTop: 12 },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },

  toggleItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
  toggleLabel: { fontSize: 15, fontWeight: '600' },
  toggleDesc: { fontSize: 12, marginTop: 2 },

  policyItem: { padding: 14, borderRadius: 12, borderWidth: 1.5, marginBottom: 8 },
  policyLabel: { fontSize: 14, fontWeight: '600' },
  policyDesc: { fontSize: 12, marginTop: 2 },

  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14 },
  dangerText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
});
