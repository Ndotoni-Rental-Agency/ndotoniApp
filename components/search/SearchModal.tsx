import { useThemeColor } from '@/hooks/use-theme-color';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { RentalType } from '@/hooks/useRentalType';
import type { FlattenedLocation } from '@/lib/location/types';
import { formatDateShort, toTitleCase } from '@/lib/utils/common';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarDatePicker from '../property/CalendarDatePicker';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  rentalType: RentalType;
  onSearch: (params: SearchParams) => void;
  onRentalTypeChange?: (type: RentalType) => void;
}

export interface SearchParams {
  location?: FlattenedLocation;
  checkInDate?: string;
  checkOutDate?: string;
  moveInDate?: string;
  guests?: number;
}

const DESTINATIONS = [
  { name: 'Dar es Salaam', emoji: '🌆', region: 'DAR ES SALAAM' },
  { name: 'Zanzibar', emoji: '🏝️', region: 'ZANZIBAR' },
  { name: 'Arusha', emoji: '🏔️', region: 'ARUSHA' },
  { name: 'Mwanza', emoji: '🌊', region: 'MWANZA' },
  { name: 'Dodoma', emoji: '🏛️', region: 'DODOMA' },
  { name: 'Mbeya', emoji: '⛰️', region: 'MBEYA' },
];

export default function SearchModal({ visible, onClose, onSearch }: SearchModalProps) {
  const router = useRouter();
  const { height: H } = useWindowDimensions();
  const [step, setStep] = useState<'where' | 'when' | 'who'>('where');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<FlattenedLocation | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [showCalendar, setShowCalendar] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#f5f5f5', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#e5e5e5', dark: '#333' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const slideAnim = useRef(new Animated.Value(H)).current;
  const { results: locations, isLoading: loadingLocs } = useLocationSearch(searchQuery);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 50, friction: 12 }).start();
      setTimeout(() => { if (step === 'where') inputRef.current?.focus(); }, 400);
    } else {
      slideAnim.setValue(H);
      setStep('where');
    }
  }, [visible]);

  const reset = () => { setSearchQuery(''); setSelectedLocation(null); setCheckIn(''); setCheckOut(''); setGuests(2); setStep('where'); };

  const goBack = () => {
    if (step === 'who') setStep('when');
    else if (step === 'when') setStep('where');
    else onClose();
  };

  const selectDestination = (d: typeof DESTINATIONS[0]) => {
    setSelectedLocation({ type: 'region', name: d.region, displayName: d.name } as FlattenedLocation);
    setSearchQuery(d.name);
    Keyboard.dismiss();
    setStep('when');
  };

  const selectLocation = (loc: FlattenedLocation) => {
    setSelectedLocation(loc);
    setSearchQuery(toTitleCase(loc.displayName));
    Keyboard.dismiss();
    setStep('when');
  };

  const handleSearch = () => {
    const params: SearchParams = { location: selectedLocation || undefined, guests };
    if (checkIn) params.checkInDate = checkIn;
    if (checkOut) params.checkOutDate = checkOut;
    onSearch(params);

    const navParams: any = { rentalType: 'short-term' };
    if (selectedLocation) {
      navParams.location = selectedLocation.displayName;
      if (selectedLocation.type === 'region') navParams.region = selectedLocation.name;
      else { navParams.region = selectedLocation.regionName; navParams.district = selectedLocation.name; }
    }
    if (checkIn) navParams.checkInDate = checkIn;
    if (checkOut) navParams.checkOutDate = checkOut;
    if (guests > 1) navParams.guests = guests.toString();

    reset();
    onClose();
    router.push({ pathname: '/search', params: navParams });
  };

  const stepIdx = step === 'where' ? 0 : step === 'when' ? 1 : 2;

  return (
    <Modal visible={visible} animationType="none" transparent statusBarTranslucent onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: slideAnim.interpolate({ inputRange: [0, H], outputRange: [1, 0] }) }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'bottom']}>

          {/* Top bar: back + progress + close */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={goBack} style={styles.topBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="arrow-back" size={22} color={text} />
            </TouchableOpacity>
            <View style={styles.progress}>
              {[0, 1, 2].map(i => (
                <View key={i} style={[styles.dot, i <= stepIdx ? { backgroundColor: tint } : { backgroundColor: border }]} />
              ))}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.topBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={text} />
            </TouchableOpacity>
          </View>

          {/* Scrollable content */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyInner} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* ====== WHERE ====== */}
            {step === 'where' && (
              <>
                <Text style={[styles.heading, { color: text }]}>Where to?</Text>
                <View style={[styles.field, { backgroundColor: card, borderColor: border }]}>
                  <Ionicons name="search" size={18} color={subtle} />
                  <TextInput
                    ref={inputRef}
                    style={[styles.fieldInput, { color: text }]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search regions, districts..."
                    placeholderTextColor={subtle}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => { setSearchQuery(''); setSelectedLocation(null); }}>
                      <Ionicons name="close-circle" size={18} color={subtle} />
                    </TouchableOpacity>
                  )}
                </View>

                {searchQuery.length > 0 ? (
                  <View style={styles.results}>
                    {loadingLocs ? (
                      <ActivityIndicator color={tint} style={{ marginTop: 20 }} />
                    ) : locations.length > 0 ? (
                      locations.slice(0, 8).map((loc, i) => (
                        <TouchableOpacity key={`${loc.name}-${i}`} style={styles.resultRow} onPress={() => selectLocation(loc)}>
                          <View style={[styles.resultIcon, { backgroundColor: `${tint}15` }]}>
                            <Ionicons name="location" size={16} color={tint} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.resultName, { color: text }]}>{toTitleCase(loc.displayName)}</Text>
                            <Text style={[styles.resultType, { color: subtle }]}>{loc.type === 'region' ? 'Region' : 'District'}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={border} />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={[styles.noResults, { color: subtle }]}>No locations found</Text>
                    )}
                  </View>
                ) : (
                  <>
                    <Text style={[styles.label, { color: subtle }]}>Popular destinations</Text>
                    <View style={styles.destGrid}>
                      {DESTINATIONS.map(d => (
                        <TouchableOpacity key={d.name} style={[styles.destCard, { backgroundColor: card, borderColor: border }]} onPress={() => selectDestination(d)}>
                          <Text style={styles.destEmoji}>{d.emoji}</Text>
                          <Text style={[styles.destName, { color: text }]}>{d.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity style={[styles.flexBtn, { borderColor: border }]} onPress={() => { setSelectedLocation(null); setSearchQuery(''); setStep('when'); }}>
                      <Ionicons name="globe-outline" size={18} color={tint} />
                      <Text style={[styles.flexText, { color: text }]}>I'm flexible</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}

            {/* ====== WHEN ====== */}
            {step === 'when' && (
              <>
                <Text style={[styles.heading, { color: text }]}>When's your trip?</Text>
                <Text style={[styles.context, { color: subtle }]}>
                  📍 {selectedLocation ? toTitleCase(selectedLocation.displayName) : 'Anywhere'}
                </Text>

                <View style={styles.dateRow}>
                  <TouchableOpacity style={[styles.dateBox, { borderColor: checkIn ? tint : border, backgroundColor: checkIn ? `${tint}06` : card }]} onPress={() => setShowCalendar(true)}>
                    <Text style={[styles.dateLabel, { color: subtle }]}>CHECK-IN</Text>
                    <Text style={[styles.dateVal, { color: checkIn ? text : subtle }]}>{checkIn ? formatDateShort(checkIn) : 'Add date'}</Text>
                  </TouchableOpacity>
                  <Ionicons name="arrow-forward" size={16} color={border} />
                  <TouchableOpacity style={[styles.dateBox, { borderColor: checkOut ? tint : border, backgroundColor: checkOut ? `${tint}06` : card }]} onPress={() => setShowCalendar(true)}>
                    <Text style={[styles.dateLabel, { color: subtle }]}>CHECK-OUT</Text>
                    <Text style={[styles.dateVal, { color: checkOut ? text : subtle }]}>{checkOut ? formatDateShort(checkOut) : 'Add date'}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: subtle }]}>Quick select</Text>
                <View style={styles.chipRow}>
                  {[
                    { label: 'Tonight', days: 1 },
                    { label: 'Weekend', days: 2 },
                    { label: 'Week', days: 7 },
                    { label: 'Month', days: 30 },
                  ].map(opt => {
                    const active = checkIn && checkOut && Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000) === opt.days;
                    return (
                      <TouchableOpacity key={opt.label} style={[styles.chip, { borderColor: active ? tint : border, backgroundColor: active ? `${tint}10` : 'transparent' }]} onPress={() => {
                        const d = new Date(); const e = new Date(d); e.setDate(e.getDate() + opt.days);
                        setCheckIn(d.toISOString().split('T')[0]); setCheckOut(e.toISOString().split('T')[0]);
                      }}>
                        <Text style={[styles.chipText, { color: active ? tint : text }]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Next button */}
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: text }]} onPress={() => setStep('who')}>
                  <Text style={[styles.actionBtnText, { color: bg }]}>Next: Guests</Text>
                  <Ionicons name="arrow-forward" size={16} color={bg} />
                </TouchableOpacity>
              </>
            )}

            {/* ====== WHO ====== */}
            {step === 'who' && (
              <>
                <Text style={[styles.heading, { color: text }]}>Who's coming?</Text>
                <Text style={[styles.context, { color: subtle }]}>
                  📍 {selectedLocation ? toTitleCase(selectedLocation.displayName) : 'Anywhere'}
                  {checkIn && checkOut ? `  ·  📅 ${formatDateShort(checkIn)} – ${formatDateShort(checkOut)}` : ''}
                </Text>

                <View style={[styles.guestCard, { backgroundColor: card, borderColor: border }]}>
                  <View>
                    <Text style={[styles.guestTitle, { color: text }]}>Guests</Text>
                    <Text style={[styles.guestSub, { color: subtle }]}>How many people?</Text>
                  </View>
                  <View style={styles.counter}>
                    <TouchableOpacity style={[styles.cBtn, { borderColor: guests <= 1 ? border : text }]} onPress={() => setGuests(Math.max(1, guests - 1))} disabled={guests <= 1}>
                      <Ionicons name="remove" size={20} color={guests <= 1 ? border : text} />
                    </TouchableOpacity>
                    <Text style={[styles.cNum, { color: text }]}>{guests}</Text>
                    <TouchableOpacity style={[styles.cBtn, { borderColor: text }]} onPress={() => setGuests(Math.min(50, guests + 1))}>
                      <Ionicons name="add" size={20} color={text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* SEARCH BUTTON — right here after guests */}
                <TouchableOpacity style={[styles.searchBtn, { backgroundColor: tint }]} onPress={handleSearch} activeOpacity={0.85}>
                  <Ionicons name="search" size={20} color="#fff" />
                  <Text style={styles.searchBtnText}>Search stays</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          {/* Calendar */}
          <CalendarDatePicker
            visible={showCalendar}
            onClose={() => setShowCalendar(false)}
            checkInDate={checkIn}
            checkOutDate={checkOut}
            onCheckInChange={setCheckIn}
            onCheckOutChange={setCheckOut}
            blockedDates={[]}
            textColor={text}
            tintColor={tint}
            backgroundColor={bg}
            borderColor={border}
            secondaryText={subtle}
            mode="range"
          />
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' } as any,
  sheet: { flex: 1 },
  safe: { flex: 1 },

  // Top bar
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  topBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  progress: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },

  // Body
  body: { flex: 1 },
  bodyInner: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 60 },

  // Type
  heading: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 16 },
  context: { fontSize: 14, marginBottom: 20, lineHeight: 20 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 24, marginBottom: 12 },

  // Field
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  fieldInput: { flex: 1, fontSize: 16, fontWeight: '500' },

  // Results
  results: { marginTop: 8 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  resultIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  resultName: { fontSize: 15, fontWeight: '600' },
  resultType: { fontSize: 12, marginTop: 1 },
  noResults: { textAlign: 'center', paddingVertical: 24, fontSize: 14 },

  // Destinations
  destGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  destCard: { width: '47%' as any, paddingVertical: 16, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, alignItems: 'center', gap: 4 },
  destEmoji: { fontSize: 26 },
  destName: { fontSize: 13, fontWeight: '600' },
  flexBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed' as any },
  flexText: { fontSize: 14, fontWeight: '600' },

  // Dates
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateBox: { flex: 1, paddingVertical: 14, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5 },
  dateLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  dateVal: { fontSize: 14, fontWeight: '600' },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5 },
  chipText: { fontSize: 13, fontWeight: '600' },

  // Action button (Next)
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28, paddingVertical: 15, borderRadius: 12 },
  actionBtnText: { fontSize: 15, fontWeight: '700' },

  // Guest
  guestCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 1 },
  guestTitle: { fontSize: 17, fontWeight: '600' },
  guestSub: { fontSize: 13, marginTop: 2 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  cNum: { fontSize: 20, fontWeight: '700', minWidth: 28, textAlign: 'center' },

  // Search button (inline, prominent)
  searchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 24, paddingVertical: 16, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 },
  searchBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
