import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { createShortTermPropertyDraft } from '@/lib/graphql/mutations';
import MediaSelector from '@/components/media/MediaSelector';
import LocationSelector from '@/components/location/LocationSelector';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PROPERTY_TYPES = [
  { value: 'APARTMENT', icon: '🏢', label: 'Apartment' },
  { value: 'HOUSE', icon: '🏠', label: 'House' },
  { value: 'VILLA', icon: '🏡', label: 'Villa' },
  { value: 'STUDIO', icon: '🎨', label: 'Studio' },
  { value: 'ROOM', icon: '🛏️', label: 'Room' },
  { value: 'GUESTHOUSE', icon: '🏘️', label: 'Guesthouse' },
  { value: 'HOTEL', icon: '🏨', label: 'Hotel' },
  { value: 'COTTAGE', icon: '🛖', label: 'Cottage' },
];

const STAY_CATEGORIES = [
  { value: 'NIGHTLY_STAY', icon: '🏠', label: 'Nightly Stay' },
  { value: 'PARTY', icon: '🎉', label: 'Party & Events' },
  { value: 'PHOTOSHOOT', icon: '📸', label: 'Photoshoot' },
  { value: 'MEETING', icon: '💼', label: 'Meeting' },
  { value: 'GETAWAY', icon: '🌊', label: 'Getaway' },
  { value: 'SAFARI', icon: '🦁', label: 'Safari' },
  { value: 'BEACH', icon: '🏖️', label: 'Beach' },
  { value: 'WEDDING', icon: '💒', label: 'Wedding' },
];

type Step = 1 | 2 | 3 | 4;

export default function CreatePropertyScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#f9f9f9', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#e5e5e5', dark: '#333' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState<any>(null);
  const [predictingPrice, setPredictingPrice] = useState(false);

  const [form, setForm] = useState({
    propertyType: '',
    stayCategories: ['NIGHTLY_STAY'] as string[],
    region: '',
    district: '',
    title: '',
    nightlyRate: '',
    currency: 'TZS',
    maxGuests: '2',
    bedrooms: '1',
    bathrooms: '1',
    instantBookEnabled: false,
    images: [] as string[],
  });

  const updateField = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));
  const toggleCategory = (cat: string) => {
    setForm(f => ({
      ...f,
      stayCategories: f.stayCategories.includes(cat)
        ? f.stayCategories.filter(c => c !== cat)
        : [...f.stayCategories, cat],
    }));
  };

  // AI: Generate title
  const generateTitle = async () => {
    setGeneratingTitle(true);
    try {
      const res = await fetch('https://www.ndotonistays.com/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyType: form.propertyType,
          district: form.district,
          region: form.region,
          maxGuests: form.maxGuests,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          stayCategories: form.stayCategories,
          currency: form.currency,
          nightlyRate: form.nightlyRate,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.title) updateField('title', data.title);
      }
    } catch (err) {
      console.error('AI title error:', err);
    } finally {
      setGeneratingTitle(false);
    }
  };

  // AI: Suggest price
  const suggestPrice = async () => {
    setPredictingPrice(true);
    try {
      const res = await fetch('https://www.ndotonistays.com/api/ai/predict-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyType: form.propertyType,
          district: form.district,
          region: form.region,
          maxGuests: parseInt(form.maxGuests) || 2,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPriceSuggestion(data);
      }
    } catch (err) {
      console.error('AI price error:', err);
    } finally {
      setPredictingPrice(false);
    }
  };

  const canNext = (): boolean => {
    if (step === 1) return !!form.propertyType && form.stayCategories.length > 0;
    if (step === 2) return !!form.region && !!form.district;
    if (step === 3) return !!form.nightlyRate && parseFloat(form.nightlyRate) > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (!form.title) { Alert.alert('Title required', 'Please add a title for your property'); return; }
    if (form.images.length === 0) { Alert.alert('Photos required', 'Add at least one photo'); return; }

    setLoading(true);
    try {
      const res = await GraphQLClient.executeAuthenticated<any>(createShortTermPropertyDraft, {
        input: {
          title: form.title,
          propertyType: form.propertyType,
          stayCategories: form.stayCategories,
          region: form.region,
          district: form.district || form.region,
          nightlyRate: parseFloat(form.nightlyRate),
          currency: form.currency,
          maxGuests: parseInt(form.maxGuests),
          bedrooms: parseInt(form.bedrooms) || 1,
          bathrooms: parseInt(form.bathrooms) || 1,
          instantBookEnabled: form.instantBookEnabled,
          images: form.images,
          guestPhoneNumber: user?.phoneNumber || undefined,
          guestWhatsappNumber: user?.whatsappNumber || user?.phoneNumber || undefined,
        },
      });

      if (res.createShortTermPropertyDraft?.success) {
        Alert.alert('🎉 Property Listed!', 'Your property has been created. You can add more details from your dashboard.', [
          { text: 'Go to Dashboard', onPress: () => router.replace('/(tabs)/explore' as any) },
        ]);
      } else {
        Alert.alert('Error', res.createShortTermPropertyDraft?.message || 'Failed to create property');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: bg }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => step > 1 ? setStep((step - 1) as Step) : router.back()}>
          <Ionicons name="arrow-back" size={22} color={text} />
        </TouchableOpacity>
        {/* Progress */}
        <View style={styles.progress}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={[styles.progressDot, { backgroundColor: i <= step ? tint : border }]} />
          ))}
        </View>
        <Text style={[styles.stepLabel, { color: subtle }]}>Step {step}/4</Text>
      </View>

      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.fill} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ═══ STEP 1: TYPE & CATEGORY ═══ */}
          {step === 1 && (
            <>
              <Text style={[styles.heading, { color: text }]}>What type of place?</Text>
              <Text style={[styles.sub, { color: subtle }]}>Select your property type</Text>
              <View style={styles.typeGrid}>
                {PROPERTY_TYPES.map(pt => (
                  <TouchableOpacity key={pt.value} style={[styles.typeCard, { borderColor: form.propertyType === pt.value ? tint : border, backgroundColor: form.propertyType === pt.value ? `${tint}08` : card }]} onPress={() => updateField('propertyType', pt.value)}>
                    <Text style={styles.typeEmoji}>{pt.icon}</Text>
                    <Text style={[styles.typeLabel, { color: text }]}>{pt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.heading, { color: text, marginTop: 32 }]}>Best for...</Text>
              <Text style={[styles.sub, { color: subtle }]}>What's your space perfect for?</Text>
              <View style={styles.catGrid}>
                {STAY_CATEGORIES.map(cat => {
                  const sel = form.stayCategories.includes(cat.value);
                  return (
                    <TouchableOpacity key={cat.value} style={[styles.catChip, { borderColor: sel ? tint : border, backgroundColor: sel ? `${tint}08` : 'transparent' }]} onPress={() => toggleCategory(cat.value)}>
                      <Text style={styles.catEmoji}>{cat.icon}</Text>
                      <Text style={[styles.catLabel, { color: sel ? tint : text }]}>{cat.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* ═══ STEP 2: LOCATION ═══ */}
          {step === 2 && (
            <>
              <Text style={[styles.heading, { color: text }]}>Where is it?</Text>
              <Text style={[styles.sub, { color: subtle }]}>Help guests find your place</Text>
              <LocationSelector
                value={{ region: form.region, district: form.district, ward: '' }}
                onChange={(loc: any) => { updateField('region', loc.region); updateField('district', loc.district); }}
              />
            </>
          )}

          {/* ═══ STEP 3: PRICING ═══ */}
          {step === 3 && (
            <>
              <Text style={[styles.heading, { color: text }]}>Set your price</Text>
              <Text style={[styles.sub, { color: subtle }]}>How much per night?</Text>

              <View style={styles.priceRow}>
                <View style={[styles.priceField, { borderColor: border, backgroundColor: card }]}>
                  <Text style={[styles.currLabel, { color: subtle }]}>{form.currency}</Text>
                  <TextInput style={[styles.priceInput, { color: text }]} value={form.nightlyRate} onChangeText={v => updateField('nightlyRate', v.replace(/[^0-9]/g, ''))} placeholder="50000" placeholderTextColor={subtle} keyboardType="number-pad" />
                </View>
                <TouchableOpacity style={[styles.currSwitch, { borderColor: border }]} onPress={() => updateField('currency', form.currency === 'TZS' ? 'USD' : 'TZS')}>
                  <Text style={[{ color: text, fontWeight: '600', fontSize: 13 }]}>{form.currency}</Text>
                </TouchableOpacity>
              </View>

              {/* AI price suggestion */}
              <TouchableOpacity style={styles.aiBtn} onPress={suggestPrice} disabled={predictingPrice || !form.district}>
                {predictingPrice ? <ActivityIndicator size="small" color={tint} /> : <Ionicons name="sparkles" size={16} color={tint} />}
                <Text style={[styles.aiBtnText, { color: tint }]}>{predictingPrice ? 'Analyzing...' : 'AI Price Suggestion'}</Text>
              </TouchableOpacity>

              {priceSuggestion && (
                <View style={[styles.suggestionBox, { backgroundColor: `${tint}08`, borderColor: `${tint}30` }]}>
                  <Text style={[styles.suggPrice, { color: text }]}>Suggested: TZS {priceSuggestion.suggestedPrice?.toLocaleString()}/night</Text>
                  <Text style={[styles.suggRange, { color: subtle }]}>Range: TZS {priceSuggestion.range?.min?.toLocaleString()} – {priceSuggestion.range?.max?.toLocaleString()}</Text>
                  {priceSuggestion.reasoning && <Text style={[styles.suggReason, { color: subtle }]}>{priceSuggestion.reasoning}</Text>}
                  <TouchableOpacity style={[styles.useBtn, { backgroundColor: tint }]} onPress={() => { updateField('nightlyRate', priceSuggestion.suggestedPrice.toString()); setPriceSuggestion(null); }}>
                    <Text style={styles.useBtnText}>Use this price</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Details */}
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: subtle }]}>Guests</Text>
                  <TextInput style={[styles.detailInput, { color: text, borderColor: border }]} value={form.maxGuests} onChangeText={v => updateField('maxGuests', v)} keyboardType="number-pad" />
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: subtle }]}>Beds</Text>
                  <TextInput style={[styles.detailInput, { color: text, borderColor: border }]} value={form.bedrooms} onChangeText={v => updateField('bedrooms', v)} keyboardType="number-pad" />
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: subtle }]}>Baths</Text>
                  <TextInput style={[styles.detailInput, { color: text, borderColor: border }]} value={form.bathrooms} onChangeText={v => updateField('bathrooms', v)} keyboardType="number-pad" />
                </View>
              </View>

              {/* Instant book */}
              <View style={[styles.toggleRow, { borderColor: border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontSize: 15, fontWeight: '600', color: text }]}>⚡ Instant Book</Text>
                  <Text style={[{ fontSize: 12, color: subtle, marginTop: 2 }]}>Guests can book without waiting for approval</Text>
                </View>
                <Switch value={form.instantBookEnabled} onValueChange={v => updateField('instantBookEnabled', v)} trackColor={{ true: tint, false: border }} />
              </View>
            </>
          )}

          {/* ═══ STEP 4: PHOTOS & TITLE ═══ */}
          {step === 4 && (
            <>
              <Text style={[styles.heading, { color: text }]}>Almost done!</Text>
              <Text style={[styles.sub, { color: subtle }]}>Add a title and photos</Text>

              {/* Title with AI */}
              <Text style={[styles.fieldLabel, { color: text }]}>Property title</Text>
              <TextInput style={[styles.titleInput, { color: text, borderColor: border, backgroundColor: card }]} value={form.title} onChangeText={v => updateField('title', v)} placeholder="e.g. Cozy Beach Villa in Zanzibar" placeholderTextColor={subtle} />
              <TouchableOpacity style={styles.aiBtn} onPress={generateTitle} disabled={generatingTitle || !form.district}>
                {generatingTitle ? <ActivityIndicator size="small" color={tint} /> : <Ionicons name="sparkles" size={16} color={tint} />}
                <Text style={[styles.aiBtnText, { color: tint }]}>{generatingTitle ? 'Writing...' : 'AI Suggest Title'}</Text>
              </TouchableOpacity>

              {/* Photos */}
              <Text style={[styles.fieldLabel, { color: text, marginTop: 24 }]}>Photos *</Text>
              <MediaSelector
                selectedMedia={form.images}
                onMediaChange={(urls: string[], imgs: string[]) => updateField('images', imgs)}
              />
              {form.images.length === 0 && <Text style={{ color: '#f59e0b', fontSize: 13, marginTop: 6 }}>At least 1 photo required</Text>}
            </>
          )}

        </ScrollView>

        {/* Bottom navigation */}
        <View style={[styles.bottomNav, { borderTopColor: border, backgroundColor: bg }]}>
          {step < 4 ? (
            <TouchableOpacity style={[styles.nextBtn, { backgroundColor: tint, opacity: canNext() ? 1 : 0.4 }]} onPress={() => canNext() && setStep((step + 1) as Step)} disabled={!canNext()}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.nextBtn, { backgroundColor: tint, opacity: loading ? 0.6 : 1 }]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.nextBtnText}>List Property</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  progress: { flexDirection: 'row', gap: 6 },
  progressDot: { width: 24, height: 4, borderRadius: 2 },
  stepLabel: { fontSize: 12, fontWeight: '600' },
  content: { padding: 24, paddingBottom: 100 },
  heading: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  sub: { fontSize: 14, marginTop: 4, marginBottom: 20 },

  // Type grid
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: { width: '30%', alignItems: 'center', paddingVertical: 16, borderRadius: 14, borderWidth: 1.5 },
  typeEmoji: { fontSize: 28, marginBottom: 4 },
  typeLabel: { fontSize: 12, fontWeight: '600' },

  // Category chips
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5 },
  catEmoji: { fontSize: 16 },
  catLabel: { fontSize: 13, fontWeight: '600' },

  // Pricing
  priceRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  priceField: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  currLabel: { fontSize: 14, fontWeight: '600', marginRight: 8 },
  priceInput: { flex: 1, fontSize: 22, fontWeight: '700' },
  currSwitch: { paddingHorizontal: 14, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },

  aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingVertical: 8 },
  aiBtnText: { fontSize: 13, fontWeight: '600' },

  suggestionBox: { marginTop: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  suggPrice: { fontSize: 15, fontWeight: '700' },
  suggRange: { fontSize: 12, marginTop: 2 },
  suggReason: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  useBtn: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start' },
  useBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  detailRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  detailInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, fontWeight: '600', textAlign: 'center' },

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, padding: 16, borderRadius: 12, borderWidth: 1 },

  // Step 4
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  titleInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, fontWeight: '500' },

  // Bottom
  bottomNav: { paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 12 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
