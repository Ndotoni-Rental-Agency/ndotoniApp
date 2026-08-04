import { EditDetailsTab, EditPhotosTab, EditCheckInTab, EditSettingsTab, EditFormData } from '@/components/host/edit';
import { useShortTermPropertyDetail } from '@/hooks/propertyDetails/useShortTermPropertyDetail';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUpdateProperty } from '@/hooks/useUpdateProperty';
import { useAlert } from '@/contexts/AlertContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { deactivateShortTermProperty } from '@/lib/graphql/mutations';
import { UpdateShortTermPropertyInput } from '@/lib/API';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'details' | 'photos' | 'checkin' | 'settings';

export default function EditShortTermPropertyScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const propertyId = params.id as string;

  const { property, loading, error } = useShortTermPropertyDetail(propertyId);
  const { updateShortProperty } = useUpdateProperty();
  const { showAlert } = useAlert();
  const [deactivating, setDeactivating] = useState(false);

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
    region: '', district: '', ward: '', street: '', nightlyRate: '', cleaningFee: '', serviceFeePercentage: '', currency: 'TZS',
    maxGuests: '', maxAdults: '', maxChildren: '', maxInfants: '', bedrooms: '', bathrooms: '',
    minimumStay: '1', maximumStay: '', advanceBookingDays: '', instantBookEnabled: false,
    checkInTime: '', checkOutTime: '', ciWifi: '', ciWifiPassword: '', ciAccessCode: '',
    ciDirections: '', ciParking: '', ciContactPhone: '', ciContactName: '', ciNotes: '',
    googleMapsUrl: '',
    cancellationPolicy: 'MODERATE', allowsPets: false, allowsSmoking: false, allowsChildren: true, allowsInfants: true,
    houseRules: '', amenities: [],
  });
  const [images, setImages] = useState<string[]>([]);
  // Tracks which tabs have edits not yet confirmed saved — by tab, not by field, so
  // saving one tab doesn't silently clear edits sitting unsaved in another.
  const [dirtyTabs, setDirtyTabs] = useState<Set<Tab>>(new Set());

  useEffect(() => {
    if (!property) return;
    const ci = property.checkInInstructions as any;
    setForm({
      title: property.title || '', description: property.description || '',
      propertyType: property.propertyType || '', stayCategories: (property as any).stayCategories || ['NIGHTLY_STAY'],
      region: property.region || '', district: property.district || '',
      ward: (property as any).ward || (property as any).address?.ward || '',
      street: (property as any).street || (property as any).address?.street || '',
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
      googleMapsUrl: (property as any).googleMapsUrl || '',
      cancellationPolicy: property.cancellationPolicy || 'MODERATE',
      allowsPets: property.allowsPets ?? false, allowsSmoking: property.allowsSmoking ?? false,
      allowsChildren: property.allowsChildren ?? true, allowsInfants: property.allowsInfants ?? true,
      houseRules: property.houseRules?.join('\n') || '', amenities: property.amenities?.filter((a): a is string => a !== null) || [],
    });
    setImages(property.images || []);
    setDirtyTabs(new Set());
  }, [property]);

  const upd = (k: string, v: any) => {
    setForm(f => ({ ...f, [k]: v }));
    setDirtyTabs(prev => new Set(prev).add(tab));
  };
  const toggleCat = (c: string) => {
    setForm(f => ({ ...f, stayCategories: f.stayCategories.includes(c) ? f.stayCategories.filter(x => x !== c) : [...f.stayCategories, c] }));
    setDirtyTabs(prev => new Set(prev).add(tab));
  };
  const handleSetImages = (imgs: string[]) => {
    setImages(imgs);
    setDirtyTabs(prev => new Set(prev).add('photos'));
  };

  const saveSec = async (label: string, input: Partial<UpdateShortTermPropertyInput>) => {
    setSaving(true);
    try {
      const result = await updateShortProperty(propertyId, input as UpdateShortTermPropertyInput);
      if (result.success) {
        Alert.alert('✅ Saved', `${label} updated`);
        setDirtyTabs(prev => { const next = new Set(prev); next.delete(tab); return next; });
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const leaveWithUnsavedCheck = (proceed: () => void) => {
    if (dirtyTabs.size === 0) { proceed(); return; }
    const tabLabels: Record<Tab, string> = { details: 'Details', photos: 'Photos', checkin: 'Check-In', settings: 'Settings' };
    const names = Array.from(dirtyTabs).map(t => tabLabels[t]).join(', ');
    showAlert({
      title: 'Unsaved changes',
      message: `You have unsaved changes in ${names}. Leave without saving?`,
      icon: 'warning',
      buttons: [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard & leave', style: 'destructive', onPress: proceed },
      ],
    });
  };

  // Catch swipe-back / hardware back, not just the header arrow.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove' as any, (e: any) => {
      if (dirtyTabs.size === 0) return;
      e.preventDefault();
      leaveWithUnsavedCheck(() => navigation.dispatch(e.data.action));
    });
    return unsubscribe;
  }, [navigation, dirtyTabs]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeactivate = () => {
    showAlert({
      title: 'Deactivate Listing',
      message: `This will hide "${form.title || 'this listing'}" from guests. You can reactivate it anytime from your properties list.`,
      icon: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', style: 'destructive', onPress: async () => {
          setDeactivating(true);
          try {
            await GraphQLClient.executeAuthenticated(deactivateShortTermProperty, { propertyId });
            showAlert({
              title: 'Listing Deactivated', message: 'Guests can no longer book this listing.', icon: 'success',
              buttons: [{ text: 'OK', onPress: () => router.back() }],
            });
          } catch (err: any) {
            showAlert({ title: 'Error', message: err?.message || 'Failed to deactivate listing.', icon: 'error', buttons: [{ text: 'OK' }] });
          } finally {
            setDeactivating(false);
          }
        }},
      ],
    });
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
      <View style={s.header}>
        <TouchableOpacity onPress={() => leaveWithUnsavedCheck(() => router.back())} style={{ padding: 4 }} accessibilityRole="button" accessibilityLabel="Back"><Ionicons name="arrow-back" size={22} color={text} /></TouchableOpacity>
        <Text style={[s.headerTitle, { color: text }]} numberOfLines={1}>{form.title || 'Edit Property'}</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Tabs */}
      <View style={[s.tabBarWrap, { borderBottomColor: border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabBar}>
          {TABS.map(t => {
            const active = tab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[s.tab, active && { backgroundColor: `${tint}10`, borderRadius: 20 }]}
                onPress={() => setTab(t.key)}
                activeOpacity={0.7}
              >
                <Ionicons name={t.icon as any} size={16} color={active ? tint : subtle} />
                <Text style={[s.tabLabel, { color: active ? tint : subtle }]}>{t.label}</Text>
                {dirtyTabs.has(t.key) && <View style={[s.dirtyDot, { backgroundColor: tint }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <KeyboardAvoidingView style={s.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {tab === 'details' && <EditDetailsTab form={form} upd={upd} toggleCat={toggleCat} saving={saving} saveSec={saveSec} {...colors} />}
          {tab === 'photos' && <EditPhotosTab images={images} setImages={handleSetImages} saving={saving} saveSec={saveSec} text={text} tint={tint} subtle={subtle} />}
          {tab === 'checkin' && <EditCheckInTab form={form} upd={upd} toggleCat={toggleCat} saving={saving} saveSec={saveSec} {...colors} />}
          {tab === 'settings' && <EditSettingsTab form={form} upd={upd} toggleCat={toggleCat} saving={saving} saveSec={saveSec} onDeactivate={handleDeactivate} deactivating={deactivating} {...colors} />}
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center', marginHorizontal: 8 },
  tabBarWrap: { borderBottomWidth: 1, height: 52 },
  tabBar: { paddingHorizontal: 16, alignItems: 'center', height: 52 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 4,
  },
  tabLabel: { fontSize: 14, fontWeight: '600' },
  dirtyDot: { width: 6, height: 6, borderRadius: 3 },
  body: { padding: 20, paddingBottom: 60 },
});
