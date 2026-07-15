import { useThemeColor } from '@/hooks/use-theme-color';
import { useLocationSearch } from '@/hooks/useLocationSearch';
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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CalendarDatePicker from '../property/CalendarDatePicker';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  rentalType?: string;
  onSearch: (params: SearchParams) => void;
  onRentalTypeChange?: (type: string) => void;
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
  const insets = useSafeAreaInsets();
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
  const card = useThemeColor({ light: '#f7f7f7', dark: '#1c1c1e' }, 'background');
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
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setSearchQuery('');
    setSelectedLocation(null);
    setCheckIn('');
    setCheckOut('');
    setGuests(2);
    setStep('where');
  };

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

  // Summary for collapsed cards
  const locationSummary = selectedLocation ? toTitleCase(selectedLocation.displayName) : 'Anywhere';
  const dateSummary = checkIn && checkOut ? `${formatDateShort(checkIn)} – ${formatDateShort(checkOut)}` : 'Any week';

  return (
    <Modal visible={visible} animationType="none" transparent statusBarTranslucent onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: slideAnim.interpolate({ inputRange: [0, H], outputRange: [1, 0] }) }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top }]}>

          {/* Top bar — fixed with proper safe area padding */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={goBack}
              style={[styles.topBtn, { backgroundColor: card, borderColor: border }]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name={step === 'where' ? 'close' : 'arrow-back'} size={18} color={text} />
            </TouchableOpacity>

            {/* Step indicator */}
            <View style={styles.stepIndicator}>
              {(['Where', 'When', 'Who'] as const).map((label, i) => (
                <View key={label} style={styles.stepItem}>
                  <View style={[
                    styles.stepDot,
                    i <= stepIdx ? { backgroundColor: tint } : { backgroundColor: border },
                    i === stepIdx && styles.stepDotActive,
                  ]} />
                  <Text style={[
                    styles.stepLabel,
                    { color: i === stepIdx ? tint : subtle },
                    i === stepIdx && { fontWeight: '700' },
                  ]}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => { reset(); onClose(); }}
              style={[styles.topBtn, { backgroundColor: card, borderColor: border }]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={18} color={text} />
            </TouchableOpacity>
          </View>

          {/* Scrollable content */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyInner}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ====== WHERE ====== */}
            {step === 'where' && (
              <>
                <Text style={[styles.heading, { color: text }]}>Where to?</Text>

                {/* Search input field */}
                <View style={[styles.searchField, { backgroundColor: card, borderColor: border }]}>
                  <Ionicons name="search" size={18} color={subtle} />
                  <TextInput
                    ref={inputRef}
                    style={[styles.searchInput, { color: text }]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search regions, districts..."
                    placeholderTextColor={subtle}
                    returnKeyType="search"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => { setSearchQuery(''); setSelectedLocation(null); }}>
                      <Ionicons name="close-circle" size={18} color={subtle} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Search results or destinations */}
                {searchQuery.length > 0 ? (
                  <View style={styles.results}>
                    {loadingLocs ? (
                      <ActivityIndicator color={tint} style={{ marginTop: 20 }} />
                    ) : locations.length > 0 ? (
                      locations.slice(0, 8).map((loc, i) => (
                        <TouchableOpacity key={`${loc.name}-${i}`} style={[styles.resultRow, { borderBottomColor: border }]} onPress={() => selectLocation(loc)}>
                          <View style={[styles.resultIcon, { backgroundColor: `${tint}12` }]}>
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
                    <Text style={[styles.sectionLabel, { color: subtle }]}>Popular destinations</Text>
                    <View style={styles.destGrid}>
                      {DESTINATIONS.map(d => (
                        <TouchableOpacity
                          key={d.name}
                          style={[styles.destCard, { backgroundColor: card, borderColor: border }]}
                          onPress={() => selectDestination(d)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.destEmoji}>{d.emoji}</Text>
                          <Text style={[styles.destName, { color: text }]}>{d.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Flexible option */}
                    <TouchableOpacity
                      style={[styles.flexBtn, { borderColor: border }]}
                      onPress={() => { setSelectedLocation(null); setSearchQuery(''); setStep('when'); }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="globe-outline" size={20} color={tint} />
                      <Text style={[styles.flexText, { color: text }]}>I'm flexible</Text>
                      <Ionicons name="chevron-forward" size={16} color={subtle} style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}

            {/* ====== WHEN ====== */}
            {step === 'when' && (
              <>
                <Text style={[styles.heading, { color: text }]}>When's your trip?</Text>

                {/* Context card showing where */}
                <TouchableOpacity
                  style={[styles.contextCard, { backgroundColor: card, borderColor: border }]}
                  onPress={() => setStep('where')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="location" size={16} color={tint} />
                  <Text style={[styles.contextText, { color: text }]}>{locationSummary}</Text>
                  <Ionicons name="pencil" size={14} color={subtle} />
                </TouchableOpacity>

                {/* Date selection */}
                <View style={styles.dateRow}>
                  <TouchableOpacity
                    style={[styles.dateBox, { borderColor: checkIn ? tint : border, backgroundColor: checkIn ? `${tint}08` : card }]}
                    onPress={() => setShowCalendar(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateLabel, { color: subtle }]}>CHECK-IN</Text>
                    <Text style={[styles.dateVal, { color: checkIn ? text : subtle }]}>
                      {checkIn ? formatDateShort(checkIn) : 'Add date'}
                    </Text>
                  </TouchableOpacity>
                  <View style={[styles.dateArrow, { backgroundColor: border }]}>
                    <Ionicons name="arrow-forward" size={12} color={subtle} />
                  </View>
                  <TouchableOpacity
                    style={[styles.dateBox, { borderColor: checkOut ? tint : border, backgroundColor: checkOut ? `${tint}08` : card }]}
                    onPress={() => setShowCalendar(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateLabel, { color: subtle }]}>CHECK-OUT</Text>
                    <Text style={[styles.dateVal, { color: checkOut ? text : subtle }]}>
                      {checkOut ? formatDateShort(checkOut) : 'Add date'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Quick select chips */}
                <Text style={[styles.sectionLabel, { color: subtle }]}>Quick select</Text>
                <View style={styles.chipRow}>
                  {[
                    { label: 'Tonight', days: 1, icon: 'moon-outline' as const },
                    { label: 'Weekend', days: 2, icon: 'sunny-outline' as const },
                    { label: 'Week', days: 7, icon: 'calendar-outline' as const },
                    { label: 'Month', days: 30, icon: 'calendar' as const },
                  ].map(opt => {
                    const active = checkIn && checkOut && Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000) === opt.days;
                    return (
                      <TouchableOpacity
                        key={opt.label}
                        style={[
                          styles.chip,
                          { borderColor: active ? tint : border, backgroundColor: active ? `${tint}10` : 'transparent' },
                        ]}
                        onPress={() => {
                          const d = new Date();
                          const e = new Date(d);
                          e.setDate(e.getDate() + opt.days);
                          setCheckIn(d.toISOString().split('T')[0]);
                          setCheckOut(e.toISOString().split('T')[0]);
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name={opt.icon} size={14} color={active ? tint : text} />
                        <Text style={[styles.chipText, { color: active ? tint : text }]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Skip / Next */}
                <View style={styles.whenActions}>
                  <TouchableOpacity onPress={() => { setCheckIn(''); setCheckOut(''); setStep('who'); }}>
                    <Text style={[styles.skipText, { color: subtle }]}>Skip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.nextBtn, { backgroundColor: text }]}
                    onPress={() => setStep('who')}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.nextBtnText, { color: bg }]}>Next</Text>
                    <Ionicons name="arrow-forward" size={14} color={bg} />
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ====== WHO ====== */}
            {step === 'who' && (
              <>
                <Text style={[styles.heading, { color: text }]}>Who's coming?</Text>

                {/* Context cards for where + when */}
                <View style={styles.contextRow}>
                  <TouchableOpacity
                    style={[styles.contextCardSmall, { backgroundColor: card, borderColor: border }]}
                    onPress={() => setStep('where')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="location" size={14} color={tint} />
                    <Text style={[styles.contextTextSmall, { color: text }]} numberOfLines={1}>{locationSummary}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.contextCardSmall, { backgroundColor: card, borderColor: border }]}
                    onPress={() => setStep('when')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="calendar-outline" size={14} color={tint} />
                    <Text style={[styles.contextTextSmall, { color: text }]} numberOfLines={1}>{dateSummary}</Text>
                  </TouchableOpacity>
                </View>

                {/* Guest counter */}
                <View style={[styles.guestCard, { backgroundColor: card, borderColor: border }]}>
                  <View>
                    <Text style={[styles.guestTitle, { color: text }]}>Guests</Text>
                    <Text style={[styles.guestSub, { color: subtle }]}>How many people?</Text>
                  </View>
                  <View style={styles.counter}>
                    <TouchableOpacity
                      style={[styles.counterBtn, { borderColor: guests <= 1 ? border : text, opacity: guests <= 1 ? 0.4 : 1 }]}
                      onPress={() => setGuests(Math.max(1, guests - 1))}
                      disabled={guests <= 1}
                    >
                      <Ionicons name="remove" size={18} color={text} />
                    </TouchableOpacity>
                    <Text style={[styles.counterNum, { color: text }]}>{guests}</Text>
                    <TouchableOpacity
                      style={[styles.counterBtn, { borderColor: text }]}
                      onPress={() => setGuests(Math.min(50, guests + 1))}
                    >
                      <Ionicons name="add" size={18} color={text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Search button */}
                <TouchableOpacity
                  style={[styles.searchBtn, { backgroundColor: tint }]}
                  onPress={handleSearch}
                  activeOpacity={0.85}
                >
                  <Ionicons name="search" size={20} color="#fff" />
                  <Text style={styles.searchBtnText}>Search stays</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          {/* Bottom safe area padding */}
          <View style={{ height: insets.bottom + 10 }} />

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
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: { flex: 1 },
  container: { flex: 1 },

  // Top bar — proper spacing so buttons are clickable
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
  },
  topBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stepDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Body
  body: { flex: 1 },
  bodyInner: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 },

  // Typography
  heading: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 12,
  },

  // Search field
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '500' },

  // Results
  results: { marginTop: 8 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  resultIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultName: { fontSize: 15, fontWeight: '600' },
  resultType: { fontSize: 12, marginTop: 2 },
  noResults: { textAlign: 'center', paddingVertical: 24, fontSize: 14 },

  // Destinations grid
  destGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  destCard: {
    width: '47%',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  destEmoji: { fontSize: 28 },
  destName: { fontSize: 13, fontWeight: '600' },

  // Flexible button
  flexBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  flexText: { fontSize: 15, fontWeight: '600' },

  // Context cards
  contextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  contextText: { flex: 1, fontSize: 14, fontWeight: '500' },
  contextRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  contextCardSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  contextTextSmall: { flex: 1, fontSize: 12, fontWeight: '500' },

  // Dates
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBox: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dateVal: { fontSize: 14, fontWeight: '600' },
  dateArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 13, fontWeight: '600' },

  // When actions
  whenActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  skipText: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextBtnText: { fontSize: 15, fontWeight: '700' },

  // Guest card
  guestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  guestTitle: { fontSize: 17, fontWeight: '600' },
  guestSub: { fontSize: 13, marginTop: 2 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterNum: { fontSize: 20, fontWeight: '700', minWidth: 28, textAlign: 'center' },

  // Search button
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  searchBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
