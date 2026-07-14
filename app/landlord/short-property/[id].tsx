import { EditDetailsTab, EditPhotosTab, EditCheckInTab, EditSettingsTab, EditFormData } from '@/components/host/edit';
import { useShortTermPropertyDetail } from '@/hooks/propertyDetails/useShortTermPropertyDetail';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUpdateProperty } from '@/hooks/useUpdateProperty';
import { UpdateShortTermPropertyInput } from '@/lib/API';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'details' | 'photos' | 'checkin' | 'settings';

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
  const [form, setForm] = useState<EditFormData>({
    title: '', description: '', propertyType: '', stayCategories: [],
    region: '', district: '', nightlyRate: '', cleaningFee: '', serviceFeePercentage: '', currency: 'TZS',
    maxGuests: '', maxAdults: '', maxChildren: '', maxInfants: '', bedrooms: '', bathrooms: '',
    minimumStay: '1', maximumStay: '', advanceBookingDays: '', instantBookEnabled: false,
    checkInTime: '', checkOutTime: '', ciWifi: '', ciWifiPassword: '', ciAccessCode: '',
    ciDirections: '', ciParking: '', ciContactPhone: '', ciContactName: '', ciNotes: '',
    cancellationPolicy: 'MODERATE', allowsPets: false, allowsSmoking: false, allowsChildren: true, allowsInfants: true,
    houseRules: '', amenities: [],
  });
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!property) return;
    const ci = property.checkInInstructions as any;
    setForm({
      title: property.title || '', description: property.description || '',
      propertyType: property.propertyType || '', stayCategories: (property as any).stayCategories || ['NIGHTLY_STAY'],
      region: property.region || '', district: property.district || '',
      nightlyRate: property.nightlyRate?.toString() || '', cleaningFee: property.cleaningFee?.toString() || '',
      serviceFeePercentage: property.serviceFeePercentage?.toString() || '', currency: property.currency || 'TZS',
      maxGuests: property.maxGuests?.toString() || '', maxAdults: property.maxAdults?.toString() || '',
      maxChildren: property.maxChildren?.toString() || '', maxInfants: property.maxInfants?.toString() || '',
      bedrooms: (property as any).bedrooms?.toString() || '', bathrooms: (property as any).bathrooms?.toString() || '',
      minimumStay: property.minimumStay?.toString() || '1', maximumStay: property.maximumStay?.toString() || '',
      advanceBookingDays: property.advanceBookingDays?.toString() || '',
      instantBookEnabled: property.instantBookEnabled ?? false,
      checkInTime: property.checkInTime || '', checkOutTime: property.checkOutTime || '',
      ciWifi: ci?.wifiName || '', ciWifiPassword: ci?.wifiPassword || '',
      ciAccessCode: ci?.accessCode || '', ciDirections: ci?.directions || '',
      ciParking: ci?.parkingInfo || '', ciContactPhone: ci?.contactPhone || '',
      ciContactName: ci?.contactName || '', ciNotes: ci?.additionalNotes || '',
      cancellationPolicy: property.cancellationPolicy || 'MODERATE',
      allowsPets: property.allowsPets ?? false, allowsSmoking: property.allowsSmoking ?? false,
      allowsChildren: property.allowsChildren ?? true, allowsInfants: property.allowsInfants ?? true,
      houseRules: property.houseRules?.join('\n') || '', amenities: property.amenities?.filter((a): a is string => a !== null) || [],
    });
    setImages(property.images || []);
  }, [property]);

  const upd = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleCat = (c: string) => setForm(f => ({ ...f, stayCategories: f.stayCategories.includes(c) ? f.stayCategories.filter(x => x !== c) : [...f.stayCategories, c] }));

  const saveSec = async (label: string, input: Partial<UpdateShortTermPropertyInput>) => {
    setSaving(true);
    try {
      const result = await updateShortProperty(propertyId, input as UpdateShortTermPropertyInput);
      if (result.success) Alert.alert('✅ Saved', `${label} updated`);
      else Alert.alert('Error', result.message);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return <SafeAreaView style={[s.fill, { backgroundColor: bg }]} edges={['top']}><View style={s.center}><ActivityIndicator size="large" color={tint} /></View></SafeAreaView>;
  if (error || !property) return (
    <SafeAreaView style={[s.fill, { backgroundColor: bg }]} edges={['top']}>
      <View style={s.center}><Text style={{ color: text }}>{error || 'Not found'}</Text><TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}><Text style={{ color: tint }}>Go back</Text></TouchableOpacity></View>
    </SafeAreaView>
  );

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'details', label: 'Details', icon: 'document-text-outline' },
    { key: 'photos', label: 'Photos', icon: 'images-outline' },
    { key: 'checkin', label: 'Check-In', icon: 'key-outline' },
    { key: 'settings', label: 'Settings', icon: 'settings-outline' },
  ];

  const colors = { text, tint, card, border, subtle, bg };

  return (
    <SafeAreaView style={[s.fill, { backgroundColor: bg }]} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={text} /></TouchableOpacity>
        <Text style={[s.headerTitle, { color: text }]} numberOfLines={1}>{form.title || 'Edit'}</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.tabBar, { borderBottomColor: border }]}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[s.tab, tab === t.key && { borderBottomColor: tint, borderBottomWidth: 2 }]} onPress={() => setTab(t.key)}>
            <Ionicons name={t.icon as any} size={16} color={tab === t.key ? tint : subtle} />
            <Text style={[s.tabLabel, { color: tab === t.key ? tint : subtle }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {tab === 'details' && <EditDetailsTab form={form} upd={upd} toggleCat={toggleCat} saving={saving} saveSec={saveSec} {...colors} />}
        {tab === 'photos' && <EditPhotosTab images={images} setImages={setImages} saving={saving} saveSec={saveSec} text={text} tint={tint} subtle={subtle} />}
        {tab === 'checkin' && <EditCheckInTab form={form} upd={upd} toggleCat={toggleCat} saving={saving} saveSec={saveSec} {...colors} />}
        {tab === 'settings' && <EditSettingsTab form={form} upd={upd} toggleCat={toggleCat} saving={saving} saveSec={saveSec} {...colors} />}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '600', textAlign: 'center', marginHorizontal: 8 },
  tabBar: { paddingHorizontal: 12, borderBottomWidth: 1, gap: 4 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 12, paddingHorizontal: 10 },
  tabLabel: { fontSize: 13, fontWeight: '600' },
  body: { padding: 20, paddingBottom: 40 },
});
