import MediaSelector from '@/components/media/MediaSelector';
import AmenitiesSelector from '@/components/property/AmenitiesSelector';
import LocationSelector from '@/components/location/LocationSelector';
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

type Tab = 'details' | 'photos' | 'checkin' | 'settings';

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

  // Form state
  const [form, setForm] = useState({
    title: '', description: '', propertyType: '', stayCategories: [] as string[],
    region: '', district: '',
    nightlyRate: '', cleaningFee: '', serviceFeePercentage: '', currency: 'TZS',
    maxGuests: '', maxAdults: '', maxChildren: '', maxInfants: '',
    bedrooms: '', bathrooms: '',
    minimumStay: '', maximumStay: '', advanceBookingDays: '',
    instantBookEnabled: false,
    checkInTime: '', checkOutTime: '',
    // Check-in instructions (structured)
    ciWifi: '', ciWifiPassword: '', ciAccessCode: '', ciDirections: '',
    ciParking: '', ciContactPhone: '', ciContactName: '', ciNotes: '',
    // Policies
    cancellationPolicy: 'MODERATE',
    allowsPets: false, allowsSmoking: false, allowsChildren: true, allowsInfants: true,
    houseRules: '',
    amenities: [] as string[],
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
      houseRules: property.houseRules?.join('\n') || '',
      amenities: property.amenities?.filter((a): a is string => a !== null) || [],
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const input: UpdateShortTermPropertyInput = {
        title: form.title, description: form.description || undefined,
        nightlyRate: parseFloat(form.nightlyRate) || 0, currency: form.currency,
        cleaningFee: parseFloat(form.cleaningFee) || undefined,
        serviceFeePercentage: parseFloat(form.serviceFeePercentage) || undefined,
        maxGuests: parseInt(form.maxGuests) || 1,
        maxAdults: parseInt(form.maxAdults) || undefined,
        maxChildren: parseInt(form.maxChildren) || undefined,
        maxInfants: parseInt(form.maxInfants) || undefined,
        minimumStay: parseInt(form.minimumStay) || 1,
        maximumStay: parseInt(form.maximumStay) || undefined,
        advanceBookingDays: parseInt(form.advanceBookingDays) || undefined,
        instantBookEnabled: form.instantBookEnabled,
        checkInTime: form.checkInTime || undefined, checkOutTime: form.checkOutTime || undefined,
        checkInInstructions: (form.ciWifi || form.ciWifiPassword || form.ciAccessCode || form.ciDirections || form.ciParking || form.ciContactPhone || form.ciContactName || form.ciNotes)
          ? JSON.stringify({
              wifiName: form.ciWifi || undefined,
              wifiPassword: form.ciWifiPassword || undefined,
              accessCode: form.ciAccessCode || undefined,
              directions: form.ciDirections || undefined,
              parkingInfo: form.ciParking || undefined,
              contactPhone: form.ciContactPhone || undefined,
              contactName: form.ciContactName || undefined,
              additionalNotes: form.ciNotes || undefined,
            })
          : undefined,
        cancellationPolicy: form.cancellationPolicy as any,
        allowsPets: form.allowsPets, allowsSmoking: form.allowsSmoking,
        allowsChildren: form.allowsChildren, allowsInfants: form.allowsInfants,
        amenities: form.amenities, images,
        houseRules: form.houseRules.split('\n').filter(r => r.trim()),
        region: form.region, district: form.district,
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
      <View style={styles.center}><Text style={{ color: text }}>{error || 'Not found'}</Text><TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}><Text style={{ color: tint }}>Go back</Text></TouchableOpacity></View>
    </SafeAreaView>
  );

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'details', label: 'Details', icon: 'document-text-outline' },
    { key: 'photos', label: 'Photos', icon: 'images-outline' },
    { key: 'checkin', label: 'Check-In', icon: 'key-outline' },
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.tabBar, { borderBottomColor: border }]}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[styles.tab, tab === t.key && { borderBottomColor: tint, borderBottomWidth: 2 }]} onPress={() => setTab(t.key)}>
            <Ionicons name={t.icon as any} size={16} color={tab === t.key ? tint : subtle} />
            <Text style={[styles.tabLabel, { color: tab === t.key ? tint : subtle }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ═══ DETAILS ═══ */}
        {tab === 'details' && (
          <>
            {/* --- Title & Description --- */}
            <SectionTitle t={text}>Basic info</SectionTitle>
            <Label t={text}>Title</Label>
            <Input val={form.title} set={v => upd('title', v)} border={border} text={text} subtle={subtle} placeholder="Property title" />
            <Label t={text}>Description</Label>
            <Input val={form.description} set={v => upd('description', v)} border={border} text={text} subtle={subtle} placeholder="Describe your place..." multiline />
            <Label t={text}>Stay categories</Label>
            <View style={styles.chipGrid}>
              {STAY_CATEGORIES.map(c => {
                const sel = form.stayCategories.includes(c.value);
                return <TouchableOpacity key={c.value} style={[styles.chip, { borderColor: sel ? tint : border, backgroundColor: sel ? `${tint}08` : 'transparent' }]} onPress={() => toggleCat(c.value)}><Text style={{ fontSize: 16 }}>{c.icon}</Text><Text style={[styles.chipLabel, { color: sel ? tint : text }]}>{c.label}</Text></TouchableOpacity>;
              })}
            </View>
            <SaveSectionBtn label="Save basic info" saving={saving} tint={tint} onPress={() => saveSec('Basic info', { title: form.title, description: form.description || undefined })} />

            {/* --- Location --- */}
            <SectionTitle t={text}>Location</SectionTitle>
            <LocationSelector value={{ region: form.region, district: form.district }} onChange={(loc: any) => { upd('region', loc.region); upd('district', loc.district); }} />
            <SaveSectionBtn label="Save location" saving={saving} tint={tint} onPress={() => saveSec('Location', { region: form.region, district: form.district })} />

            {/* --- Pricing --- */}
            <SectionTitle t={text}>Pricing</SectionTitle>
            <View style={styles.row}>
              <View style={styles.col}><Label t={text}>Nightly ({form.currency})</Label><Input val={form.nightlyRate} set={v => upd('nightlyRate', v.replace(/\D/g, ''))} border={border} text={text} subtle={subtle} num /></View>
              <View style={styles.col}><Label t={text}>Cleaning fee</Label><Input val={form.cleaningFee} set={v => upd('cleaningFee', v.replace(/\D/g, ''))} border={border} text={text} subtle={subtle} num /></View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}><Label t={text}>Service %</Label><Input val={form.serviceFeePercentage} set={v => upd('serviceFeePercentage', v)} border={border} text={text} subtle={subtle} num /></View>
              <View style={styles.col}><Label t={text}>Currency</Label><Input val={form.currency} set={v => upd('currency', v)} border={border} text={text} subtle={subtle} /></View>
            </View>
            <SaveSectionBtn label="Save pricing" saving={saving} tint={tint} onPress={() => saveSec('Pricing', { nightlyRate: parseFloat(form.nightlyRate) || 0, cleaningFee: parseFloat(form.cleaningFee) || undefined, serviceFeePercentage: parseFloat(form.serviceFeePercentage) || undefined, currency: form.currency })} />

            {/* --- Capacity --- */}
            <SectionTitle t={text}>Capacity</SectionTitle>
            <View style={styles.row}>
              <View style={styles.col}><Label t={text}>Max guests</Label><Input val={form.maxGuests} set={v => upd('maxGuests', v)} border={border} text={text} subtle={subtle} num /></View>
              <View style={styles.col}><Label t={text}>Adults</Label><Input val={form.maxAdults} set={v => upd('maxAdults', v)} border={border} text={text} subtle={subtle} num /></View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}><Label t={text}>Children</Label><Input val={form.maxChildren} set={v => upd('maxChildren', v)} border={border} text={text} subtle={subtle} num /></View>
              <View style={styles.col}><Label t={text}>Infants</Label><Input val={form.maxInfants} set={v => upd('maxInfants', v)} border={border} text={text} subtle={subtle} num /></View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}><Label t={text}>Bedrooms</Label><Input val={form.bedrooms} set={v => upd('bedrooms', v)} border={border} text={text} subtle={subtle} num /></View>
              <View style={styles.col}><Label t={text}>Bathrooms</Label><Input val={form.bathrooms} set={v => upd('bathrooms', v)} border={border} text={text} subtle={subtle} num /></View>
            </View>
            <SaveSectionBtn label="Save capacity" saving={saving} tint={tint} onPress={() => saveSec('Capacity', { maxGuests: parseInt(form.maxGuests) || 1, maxAdults: parseInt(form.maxAdults) || undefined, maxChildren: parseInt(form.maxChildren) || undefined, maxInfants: parseInt(form.maxInfants) || undefined })} />

            {/* --- Stay duration --- */}
            <SectionTitle t={text}>Stay duration</SectionTitle>
            <View style={styles.row}>
              <View style={styles.col}><Label t={text}>Min nights</Label><Input val={form.minimumStay} set={v => upd('minimumStay', v)} border={border} text={text} subtle={subtle} num /></View>
              <View style={styles.col}><Label t={text}>Max nights</Label><Input val={form.maximumStay} set={v => upd('maximumStay', v)} border={border} text={text} subtle={subtle} num /></View>
            </View>
            <Label t={text}>Advance booking (days)</Label>
            <Input val={form.advanceBookingDays} set={v => upd('advanceBookingDays', v)} border={border} text={text} subtle={subtle} num placeholder="e.g. 90" />
            <SaveSectionBtn label="Save duration" saving={saving} tint={tint} onPress={() => saveSec('Duration', { minimumStay: parseInt(form.minimumStay) || 1, maximumStay: parseInt(form.maximumStay) || undefined, advanceBookingDays: parseInt(form.advanceBookingDays) || undefined })} />

            {/* --- Amenities --- */}
            <SectionTitle t={text}>Amenities</SectionTitle>
            <AmenitiesSelector selectedAmenities={form.amenities} onAmenitiesChange={a => upd('amenities', a)} propertyType="short-term" />
            <SaveSectionBtn label="Save amenities" saving={saving} tint={tint} onPress={() => saveSec('Amenities', { amenities: form.amenities })} />

            {/* --- House rules --- */}
            <SectionTitle t={text}>House rules</SectionTitle>
            <Input val={form.houseRules} set={v => upd('houseRules', v)} border={border} text={text} subtle={subtle} placeholder="One rule per line" multiline />
            <SaveSectionBtn label="Save rules" saving={saving} tint={tint} onPress={() => saveSec('Rules', { houseRules: form.houseRules.split('\n').filter(r => r.trim()) })} />
          </>
        )}

        {/* ═══ PHOTOS ═══ */}
        {tab === 'photos' && (
          <>
            <SectionTitle t={text}>Photos & Videos</SectionTitle>
            <Text style={{ color: subtle, fontSize: 13, marginBottom: 14 }}>First photo is the cover. Add up to 10.</Text>
            <MediaSelector selectedMedia={images} onMediaChange={(_, imgs) => setImages(imgs)} />
            <SaveSectionBtn label="Save photos" saving={saving} tint={tint} onPress={() => saveSec('Photos', { images })} />
          </>
        )}

        {/* ═══ CHECK-IN ═══ */}
        {tab === 'checkin' && (
          <>
            <SectionTitle t={text}>Check-in & Check-out</SectionTitle>
            <View style={styles.row}>
              <View style={styles.col}><Label t={text}>Check-in time</Label><Input val={form.checkInTime} set={v => upd('checkInTime', v)} border={border} text={text} subtle={subtle} placeholder="14:00" /></View>
              <View style={styles.col}><Label t={text}>Check-out time</Label><Input val={form.checkOutTime} set={v => upd('checkOutTime', v)} border={border} text={text} subtle={subtle} placeholder="11:00" /></View>
            </View>

            <SectionTitle t={text}>Wi-Fi</SectionTitle>
            <View style={styles.row}>
              <View style={styles.col}><Label t={text}>Network name</Label><Input val={form.ciWifi} set={v => upd('ciWifi', v)} border={border} text={text} subtle={subtle} placeholder="WiFi name" /></View>
              <View style={styles.col}><Label t={text}>Password</Label><Input val={form.ciWifiPassword} set={v => upd('ciWifiPassword', v)} border={border} text={text} subtle={subtle} placeholder="Password" /></View>
            </View>

            <SectionTitle t={text}>Access</SectionTitle>
            <Label t={text}>Access code / Lock code</Label>
            <Input val={form.ciAccessCode} set={v => upd('ciAccessCode', v)} border={border} text={text} subtle={subtle} placeholder="e.g. 1234 or key location" />

            <Label t={text}>Directions to property</Label>
            <Input val={form.ciDirections} set={v => upd('ciDirections', v)} border={border} text={text} subtle={subtle} placeholder="How to find the property..." multiline />

            <Label t={text}>Parking info</Label>
            <Input val={form.ciParking} set={v => upd('ciParking', v)} border={border} text={text} subtle={subtle} placeholder="Parking availability and instructions" multiline />

            <SectionTitle t={text}>Emergency contact</SectionTitle>
            <View style={styles.row}>
              <View style={styles.col}><Label t={text}>Contact name</Label><Input val={form.ciContactName} set={v => upd('ciContactName', v)} border={border} text={text} subtle={subtle} placeholder="Name" /></View>
              <View style={styles.col}><Label t={text}>Phone</Label><Input val={form.ciContactPhone} set={v => upd('ciContactPhone', v)} border={border} text={text} subtle={subtle} placeholder="+255..." /></View>
            </View>

            <Label t={text}>Additional notes</Label>
            <Input val={form.ciNotes} set={v => upd('ciNotes', v)} border={border} text={text} subtle={subtle} placeholder="Anything else guests should know..." multiline />
            <SaveSectionBtn label="Save check-in info" saving={saving} tint={tint} onPress={() => saveSec('Check-in', {
              checkInTime: form.checkInTime || undefined, checkOutTime: form.checkOutTime || undefined,
              ...(form.ciWifi || form.ciWifiPassword || form.ciAccessCode || form.ciDirections || form.ciParking || form.ciContactPhone || form.ciContactName || form.ciNotes ? {
                checkInInstructions: JSON.stringify({ wifiName: form.ciWifi || undefined, wifiPassword: form.ciWifiPassword || undefined, accessCode: form.ciAccessCode || undefined, directions: form.ciDirections || undefined, parkingInfo: form.ciParking || undefined, contactPhone: form.ciContactPhone || undefined, contactName: form.ciContactName || undefined, additionalNotes: form.ciNotes || undefined })
              } : {}),
            })} />
          </>
        )}

        {/* ═══ SETTINGS ═══ */}
        {tab === 'settings' && (
          <>
            <Toggle label="⚡ Instant Book" desc="Guests book without waiting for approval" val={form.instantBookEnabled} set={v => upd('instantBookEnabled', v)} text={text} subtle={subtle} border={border} tint={tint} />
            <Toggle label="🐾 Pets allowed" val={form.allowsPets} set={v => upd('allowsPets', v)} text={text} subtle={subtle} border={border} tint={tint} />
            <Toggle label="🚬 Smoking allowed" val={form.allowsSmoking} set={v => upd('allowsSmoking', v)} text={text} subtle={subtle} border={border} tint={tint} />
            <Toggle label="👶 Children allowed" val={form.allowsChildren} set={v => upd('allowsChildren', v)} text={text} subtle={subtle} border={border} tint={tint} />
            <Toggle label="🍼 Infants allowed" val={form.allowsInfants} set={v => upd('allowsInfants', v)} text={text} subtle={subtle} border={border} tint={tint} />

            <SectionTitle t={text}>Cancellation policy</SectionTitle>
            {[
              { v: 'FLEXIBLE', d: 'Free cancellation up to 24 hours before check-in' },
              { v: 'MODERATE', d: 'Free cancellation up to 5 days before check-in' },
              { v: 'STRICT', d: '50% refund up to 1 week before, no refund after' },
            ].map(p => (
              <TouchableOpacity key={p.v} style={[styles.policyCard, { borderColor: form.cancellationPolicy === p.v ? tint : border, backgroundColor: form.cancellationPolicy === p.v ? `${tint}06` : 'transparent' }]} onPress={() => upd('cancellationPolicy', p.v)}>
                <Text style={[styles.policyName, { color: form.cancellationPolicy === p.v ? tint : text }]}>{p.v.charAt(0) + p.v.slice(1).toLowerCase()}</Text>
                <Text style={[styles.policyDesc, { color: subtle }]}>{p.d}</Text>
              </TouchableOpacity>
            ))}

            <SectionTitle t={text}>Danger zone</SectionTitle>
            <TouchableOpacity style={styles.dangerBtn} onPress={() => Alert.alert('Deactivate', 'This will hide your listing.', [{ text: 'Cancel' }, { text: 'Deactivate', style: 'destructive' }])}>
              <Ionicons name="eye-off-outline" size={18} color="#ef4444" />
              <Text style={{ color: '#ef4444', fontSize: 15, fontWeight: '600' }}>Deactivate listing</Text>
            </TouchableOpacity>
            <SaveSectionBtn label="Save settings" saving={saving} tint={tint} onPress={() => saveSec('Settings', { instantBookEnabled: form.instantBookEnabled, allowsPets: form.allowsPets, allowsSmoking: form.allowsSmoking, allowsChildren: form.allowsChildren, allowsInfants: form.allowsInfants, cancellationPolicy: form.cancellationPolicy as any })} />
          </>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Helper components ───
function SaveSectionBtn({ label, saving, tint, onPress }: { label: string; saving: boolean; tint: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.secSaveBtn, { backgroundColor: tint, opacity: saving ? 0.5 : 1 }]} onPress={onPress} disabled={saving}>
      {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.secSaveBtnText}>{label}</Text>}
    </TouchableOpacity>
  );
}

function Label({ t, children }: { t: string; children: React.ReactNode }) {
  return <Text style={[styles.label, { color: t }]}>{children}</Text>;
}
function SectionTitle({ t, children }: { t: string; children: React.ReactNode }) {
  return <Text style={[styles.secTitle, { color: t }]}>{children}</Text>;
}
function Input({ val, set, border, text, subtle, placeholder, multiline, num }: { val: string; set: (v: string) => void; border: string; text: string; subtle: string; placeholder?: string; multiline?: boolean; num?: boolean }) {
  return <TextInput style={[styles.input, multiline && styles.textArea, { color: text, borderColor: border }]} value={val} onChangeText={set} placeholder={placeholder} placeholderTextColor={subtle} multiline={multiline} numberOfLines={multiline ? 3 : 1} textAlignVertical={multiline ? 'top' : 'center'} keyboardType={num ? 'number-pad' : 'default'} />;
}
function Toggle({ label, desc, val, set, text, subtle, border, tint }: { label: string; desc?: string; val: boolean; set: (v: boolean) => void; text: string; subtle: string; border: string; tint: string }) {
  return (
    <View style={[styles.toggleRow, { borderBottomColor: border }]}>
      <View style={{ flex: 1 }}><Text style={[styles.toggleLabel, { color: text }]}>{label}</Text>{desc && <Text style={[styles.toggleDesc, { color: subtle }]}>{desc}</Text>}</View>
      <Switch value={val} onValueChange={set} trackColor={{ true: tint }} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '600', marginHorizontal: 12 },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tabBar: { paddingHorizontal: 12, borderBottomWidth: 1, gap: 4 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 12, paddingHorizontal: 10 },
  tabLabel: { fontSize: 13, fontWeight: '600' },
  body: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  secTitle: { fontSize: 17, fontWeight: '700', marginTop: 28, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textArea: { minHeight: 80, paddingTop: 12 },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  chipLabel: { fontSize: 12, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
  toggleLabel: { fontSize: 15, fontWeight: '600' },
  toggleDesc: { fontSize: 12, marginTop: 2 },
  policyCard: { padding: 14, borderRadius: 12, borderWidth: 1.5, marginBottom: 8 },
  policyName: { fontSize: 14, fontWeight: '600' },
  policyDesc: { fontSize: 12, marginTop: 3, lineHeight: 16 },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14 },
  secSaveBtn: { marginTop: 16, marginBottom: 8, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  secSaveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
