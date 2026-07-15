import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { createBooking, initiatePayment } from '@/lib/graphql/mutations';
import { getBlockedDates, getPayment } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarDatePicker from './CalendarDatePicker';

interface ReservationModalProps {
  visible: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  pricePerNight: number;
  currency?: string;
  minimumStay?: number;
  propertyImage?: string;
  instantBookEnabled?: boolean;
  cleaningFee?: number;
  serviceFeePercentage?: number;
  maxGuests?: number;
}

type BookingStep = 'dates' | 'payment' | 'processing' | 'success' | 'failed';

export default function ReservationModal({
  visible,
  onClose,
  propertyId,
  propertyTitle,
  pricePerNight,
  currency = 'TZS',
  minimumStay = 1,
  propertyImage,
  instantBookEnabled = false,
  cleaningFee = 0,
  serviceFeePercentage = 0,
  maxGuests = 10,
}: ReservationModalProps) {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState<BookingStep>('dates');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#f7f7f7', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ebebeb', dark: '#333' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  useEffect(() => {
    if (visible) { fetchBlockedDates(); setStep('dates'); setError(''); }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [visible]);

  const fetchBlockedDates = async () => {
    try {
      const today = new Date();
      const future = new Date(); future.setMonth(future.getMonth() + 6);
      const exec = isAuthenticated
        ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
        : GraphQLClient.executePublic.bind(GraphQLClient);
      const res = await exec<any>(getBlockedDates, {
        propertyId,
        startDate: today.toISOString().split('T')[0],
        endDate: future.toISOString().split('T')[0],
      });
      const dates: string[] = [];
      if (res.getBlockedDates?.blockedRanges) {
        res.getBlockedDates.blockedRanges.forEach((range: any) => {
          const start = new Date(range.startDate);
          const end = new Date(range.endDate);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(d.toISOString().split('T')[0]);
          }
        });
      }
      setBlockedDates(dates);
    } catch {}
  };

  const nights = checkInDate && checkOutDate
    ? Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000)
    : 0;
  const subtotal = nights * pricePerNight;
  const serviceFee = Math.round(subtotal * (serviceFeePercentage / 100));
  const total = subtotal + cleaningFee + serviceFee;
  const cur = currency === 'TZS' ? 'Tshs' : currency;
  const fmt = (n: number) => n.toLocaleString();

  const handleProceed = () => {
    if (!isAuthenticated) { setShowSignIn(true); return; }
    if (!checkInDate || !checkOutDate) { Alert.alert('Select dates', 'Pick check-in and check-out dates'); return; }
    if (nights < minimumStay) { Alert.alert('Minimum stay', `This property requires at least ${minimumStay} night${minimumStay > 1 ? 's' : ''}`); return; }
    handleCreateBooking();
  };

  const handleCreateBooking = async () => {
    setIsLoading(true); setError('');
    try {
      const res = await GraphQLClient.executeAuthenticated<any>(createBooking, {
        input: {
          propertyId,
          checkInDate: checkInDate.split('T')[0],
          checkOutDate: checkOutDate.split('T')[0],
          numberOfGuests: guests,
          numberOfAdults: guests,
          numberOfChildren: 0,
          numberOfInfants: 0,
          paymentMethodId: 'snippe_mpesa',
        },
      });
      const booking = res.createBooking?.booking;
      if (!booking) throw new Error(res.createBooking?.message || 'Failed to create booking');
      setBookingId(booking.bookingId);
      if (instantBookEnabled && booking.status === 'CONFIRMED') {
        setStep('payment');
      } else {
        setStep('success');
      }
    } catch (err: any) {
      const raw = err?.errors?.[0]?.message || err?.message || 'Booking failed';
      let msg = raw;
      if (raw.includes('not available for selected dates')) {
        msg = 'These dates are no longer available. Please select different dates.';
      } else if (raw.includes('Unauthorized') || raw.includes('expired')) {
        msg = 'Your session has expired. Please sign in again.';
      }
      setError(msg);
      setStep('failed');
    } finally { setIsLoading(false); }
  };

  const handlePay = async () => {
    const phone = phoneNumber.replace(/\D/g, '');
    if (phone.length < 10) { Alert.alert('Invalid number', 'Enter a valid M-Pesa number'); return; }
    setIsLoading(true); setError(''); setStep('processing');
    try {
      const res = await GraphQLClient.executeAuthenticated<any>(initiatePayment, { input: { bookingId, phoneNumber: phone } });
      const result = res.initiatePayment;
      if (result.status === 'PENDING') { pollPaymentStatus(result.reference); }
      else if (result.status === 'COMPLETED' || result.status === 'CAPTURED') { setStep('success'); }
      else { setError(result.message || 'Payment failed'); setStep('failed'); }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || err?.message || 'Payment failed');
      setStep('failed');
    } finally { setIsLoading(false); }
  };

  const pollPaymentStatus = (ref: string) => {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await GraphQLClient.executeAuthenticated<any>(getPayment, { paymentId: ref });
        if (res.getPayment?.status === 'CAPTURED' || res.getPayment?.status === 'AUTHORIZED') {
          clearInterval(pollRef.current!); setStep('success');
        } else if (res.getPayment?.status === 'FAILED') {
          clearInterval(pollRef.current!); setError('Payment failed'); setStep('failed');
        }
      } catch {}
      if (attempts >= 30) { clearInterval(pollRef.current!); setError('Payment timeout — check your phone'); setStep('failed'); }
    }, 10000);
  };

  const resetAndClose = () => {
    setStep('dates'); setCheckInDate(''); setCheckOutDate('');
    setGuests(2); setPhoneNumber(''); setError(''); setBookingId(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={resetAndClose}>
      <SafeAreaView style={[s.container, { backgroundColor: bg }]} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={resetAndClose} style={s.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={22} color={text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={s.body} contentContainerStyle={s.bodyContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ═══ DATES STEP ═══ */}
          {step === 'dates' && (
            <>
              {/* Hero property card */}
              <View style={[s.heroCard, { backgroundColor: card }]}>
                {propertyImage && <Image source={{ uri: propertyImage }} style={s.heroImg} />}
                <View style={s.heroOverlay}>
                  <Text style={[s.heroTitle, { color: text }]} numberOfLines={2}>{propertyTitle}</Text>
                  <View style={s.heroPriceRow}>
                    <Text style={[s.heroPrice, { color: text }]}>{cur} {fmt(pricePerNight)}</Text>
                    <Text style={[s.heroPriceUnit, { color: subtle }]}> / night</Text>
                    {instantBookEnabled && (
                      <View style={[s.instantBadge, { backgroundColor: `${tint}12` }]}>
                        <Ionicons name="flash" size={11} color={tint} />
                        <Text style={[s.instantText, { color: tint }]}>Instant</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Date selection */}
              <Text style={[s.sectionLabel, { color: text }]}>When are you going?</Text>
              <TouchableOpacity style={[s.dateCard, { borderColor: border, backgroundColor: card }]} onPress={() => setShowCalendar(true)} activeOpacity={0.7}>
                <View style={s.dateCol}>
                  <Text style={[s.dateCaption, { color: subtle }]}>CHECK-IN</Text>
                  <Text style={[s.dateValue, { color: checkInDate ? text : `${subtle}80` }]}>
                    {checkInDate ? new Date(checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add date'}
                  </Text>
                </View>
                <View style={[s.dateDivider, { backgroundColor: border }]} />
                <View style={s.dateCol}>
                  <Text style={[s.dateCaption, { color: subtle }]}>CHECK-OUT</Text>
                  <Text style={[s.dateValue, { color: checkOutDate ? text : `${subtle}80` }]}>
                    {checkOutDate ? new Date(checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add date'}
                  </Text>
                </View>
              </TouchableOpacity>
              {nights > 0 && (
                <Text style={[s.nightsLabel, { color: subtle }]}>{nights} night{nights !== 1 ? 's' : ''}{minimumStay > 1 ? ` (min ${minimumStay})` : ''}</Text>
              )}

              {/* Guests */}
              <Text style={[s.sectionLabel, { color: text, marginTop: 24 }]}>Guests</Text>
              <View style={[s.guestCard, { borderColor: border, backgroundColor: card }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.guestCount, { color: text }]}>{guests} guest{guests !== 1 ? 's' : ''}</Text>
                  <Text style={[s.guestMax, { color: subtle }]}>Max {maxGuests}</Text>
                </View>
                <View style={s.stepper}>
                  <TouchableOpacity style={[s.stepBtn, { borderColor: guests <= 1 ? border : subtle }]} onPress={() => setGuests(Math.max(1, guests - 1))} disabled={guests <= 1}>
                    <Ionicons name="remove" size={18} color={guests <= 1 ? border : text} />
                  </TouchableOpacity>
                  <Text style={[s.stepNum, { color: text }]}>{guests}</Text>
                  <TouchableOpacity style={[s.stepBtn, { borderColor: guests >= maxGuests ? border : subtle }]} onPress={() => setGuests(Math.min(maxGuests, guests + 1))} disabled={guests >= maxGuests}>
                    <Ionicons name="add" size={18} color={guests >= maxGuests ? border : text} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Price breakdown */}
              {nights > 0 && (
                <View style={[s.priceCard, { backgroundColor: card }]}>
                  <View style={s.priceLine}>
                    <Text style={[s.priceLabel, { color: subtle }]}>{cur} {fmt(pricePerNight)} × {nights} nights</Text>
                    <Text style={[s.priceAmount, { color: text }]}>{cur} {fmt(subtotal)}</Text>
                  </View>
                  {cleaningFee > 0 && (
                    <View style={s.priceLine}>
                      <Text style={[s.priceLabel, { color: subtle }]}>Cleaning fee</Text>
                      <Text style={[s.priceAmount, { color: text }]}>{cur} {fmt(cleaningFee)}</Text>
                    </View>
                  )}
                  {serviceFee > 0 && (
                    <View style={s.priceLine}>
                      <Text style={[s.priceLabel, { color: subtle }]}>Service fee</Text>
                      <Text style={[s.priceAmount, { color: text }]}>{cur} {fmt(serviceFee)}</Text>
                    </View>
                  )}
                  <View style={[s.priceDivider, { backgroundColor: border }]} />
                  <View style={s.priceLine}>
                    <Text style={[s.totalLabel, { color: text }]}>Total</Text>
                    <Text style={[s.totalAmount, { color: text }]}>{cur} {fmt(total)}</Text>
                  </View>
                </View>
              )}
            </>
          )}

          {/* ═══ PAYMENT STEP ═══ */}
          {step === 'payment' && (
            <View style={s.stepContent}>
              <View style={[s.payIcon, { backgroundColor: `${tint}10` }]}>
                <Ionicons name="phone-portrait-outline" size={32} color={tint} />
              </View>
              <Text style={[s.stepHeading, { color: text }]}>Pay with M-Pesa</Text>
              <Text style={[s.stepSub, { color: subtle }]}>
                All networks: Vodacom, Airtel, Tigo, Halotel
              </Text>
              <Text style={[s.payAmount, { color: text }]}>{cur} {fmt(total)}</Text>

              <View style={s.phoneWrap}>
                <Text style={[s.phoneLabel, { color: text }]}>Mobile number</Text>
                <TextInput
                  style={[s.phoneInput, { color: text, borderColor: border, backgroundColor: card }]}
                  value={phoneNumber}
                  onChangeText={(t) => {
                    let v = t.replace(/\D/g, '');
                    if (v.startsWith('0')) v = '255' + v.substring(1);
                    else if (v.startsWith('7') || v.startsWith('6')) v = '255' + v;
                    setPhoneNumber(v.slice(0, 12));
                  }}
                  placeholder="0712 345 678"
                  placeholderTextColor={subtle}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          )}

          {/* ═══ PROCESSING STEP ═══ */}
          {step === 'processing' && (
            <View style={s.centerWrap}>
              <ActivityIndicator size="large" color={tint} />
              <Text style={[s.stepHeading, { color: text, marginTop: 24 }]}>Processing payment</Text>
              <Text style={[s.stepSub, { color: subtle, textAlign: 'center' }]}>
                Check your phone and confirm{'\n'}the M-Pesa prompt
              </Text>
            </View>
          )}

          {/* ═══ SUCCESS STEP ═══ */}
          {step === 'success' && (
            <View style={s.centerWrap}>
              <View style={[s.resultCircle, { backgroundColor: `${tint}12` }]}>
                <Ionicons name="checkmark-circle" size={60} color={tint} />
              </View>
              <Text style={[s.stepHeading, { color: text, marginTop: 20 }]}>
                {instantBookEnabled ? 'Booking confirmed!' : 'Request sent!'}
              </Text>
              <Text style={[s.stepSub, { color: subtle, textAlign: 'center', lineHeight: 22 }]}>
                {instantBookEnabled
                  ? 'Your stay is booked. The host will share check-in details before your arrival.'
                  : 'The host will review and confirm your request. You\'ll get a notification once accepted.'}
              </Text>
            </View>
          )}

          {/* ═══ FAILED STEP ═══ */}
          {step === 'failed' && (
            <View style={s.centerWrap}>
              <View style={[s.resultCircle, { backgroundColor: '#fef2f2' }]}>
                <Ionicons name="alert-circle" size={60} color="#ef4444" />
              </View>
              <Text style={[s.stepHeading, { color: text, marginTop: 20 }]}>
                {error.includes('no longer available') ? 'Dates unavailable' : 'Booking failed'}
              </Text>
              <Text style={[s.stepSub, { color: subtle, textAlign: 'center', lineHeight: 22 }]}>{error}</Text>
            </View>
          )}

        </ScrollView>

        {/* ─── Bottom action bar ─── */}
        <View style={[s.bottomBar, { backgroundColor: bg, borderTopColor: border }]}>
          {step === 'dates' && (
            <>
              {nights > 0 && (
                <View style={s.bottomInfo}>
                  <Text style={[s.bottomTotal, { color: text }]}>{cur} {fmt(total)}</Text>
                  <Text style={[s.bottomNights, { color: subtle }]}>{nights} night{nights !== 1 ? 's' : ''}</Text>
                </View>
              )}
              <TouchableOpacity
                style={[s.bottomBtn, { backgroundColor: tint, opacity: nights > 0 ? 1 : 0.4 }]}
                onPress={handleProceed}
                disabled={nights <= 0 || isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? <ActivityIndicator color="#fff" size="small" /> : (
                  <>
                    {instantBookEnabled && <Ionicons name="flash" size={16} color="#fff" />}
                    <Text style={s.bottomBtnText}>{instantBookEnabled ? 'Reserve' : 'Request to book'}</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
          {step === 'payment' && (
            <TouchableOpacity
              style={[s.bottomBtn, { backgroundColor: tint, flex: 1 }]}
              onPress={handlePay}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : (
                <Text style={s.bottomBtnText}>Pay {cur} {fmt(total)}</Text>
              )}
            </TouchableOpacity>
          )}
          {step === 'success' && (
            <TouchableOpacity style={[s.bottomBtn, { backgroundColor: tint, flex: 1 }]} onPress={resetAndClose} activeOpacity={0.8}>
              <Text style={s.bottomBtnText}>Done</Text>
            </TouchableOpacity>
          )}
          {step === 'failed' && (
            <TouchableOpacity
              style={[s.bottomBtn, { backgroundColor: tint, flex: 1 }]}
              onPress={() => {
                if (error.includes('no longer available')) {
                  fetchBlockedDates(); setCheckInDate(''); setCheckOutDate(''); setError(''); setStep('dates');
                } else { setStep(bookingId ? 'payment' : 'dates'); }
              }}
              activeOpacity={0.8}
            >
              <Text style={s.bottomBtnText}>
                {error.includes('no longer available') ? 'Pick new dates' : 'Try again'}
              </Text>
            </TouchableOpacity>
          )}
          {step === 'dates' && !instantBookEnabled && nights > 0 && (
            <Text style={[s.disclaimer, { color: subtle }]}>You won't be charged yet</Text>
          )}
        </View>

        {/* Calendar picker */}
        <CalendarDatePicker
          visible={showCalendar}
          onClose={() => setShowCalendar(false)}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          onCheckInChange={setCheckInDate}
          onCheckOutChange={setCheckOutDate}
          blockedDates={blockedDates}
          textColor={text}
          tintColor={tint}
          backgroundColor={bg}
          borderColor={border}
          secondaryText={subtle}
          mode="range"
        />

        {/* Auth */}
        <SignInModal visible={showSignIn} onClose={() => setShowSignIn(false)} onSwitchToSignUp={() => { setShowSignIn(false); setShowSignUp(true); }} onForgotPassword={() => {}} onNeedsVerification={() => {}} />
        <SignUpModal visible={showSignUp} onClose={() => setShowSignUp(false)} onSwitchToSignIn={() => { setShowSignUp(false); setShowSignIn(true); }} onNeedsVerification={() => {}} />
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Body
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },

  // Hero property card
  heroCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 28 },
  heroImg: { width: '100%', height: 160, borderRadius: 16 },
  heroOverlay: { padding: 16 },
  heroTitle: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
  heroPriceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  heroPrice: { fontSize: 18, fontWeight: '700' },
  heroPriceUnit: { fontSize: 14, fontWeight: '400' },
  instantBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    marginLeft: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
  },
  instantText: { fontSize: 11, fontWeight: '700' },

  // Section
  sectionLabel: { fontSize: 16, fontWeight: '700', marginBottom: 12 },

  // Date card
  dateCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1, overflow: 'hidden',
  },
  dateCol: { flex: 1, paddingVertical: 16, paddingHorizontal: 18 },
  dateDivider: { width: 1, height: 40 },
  dateCaption: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  dateValue: { fontSize: 16, fontWeight: '600' },
  nightsLabel: { fontSize: 13, marginTop: 8 },

  // Guest card
  guestCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 14, borderWidth: 1,
  },
  guestCount: { fontSize: 16, fontWeight: '600' },
  guestMax: { fontSize: 12, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { fontSize: 17, fontWeight: '700', minWidth: 20, textAlign: 'center' },

  // Price card
  priceCard: { marginTop: 24, padding: 18, borderRadius: 14 },
  priceLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  priceLabel: { fontSize: 14 },
  priceAmount: { fontSize: 14, fontWeight: '600' },
  priceDivider: { height: 1, marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalAmount: { fontSize: 16, fontWeight: '700' },

  // Payment step
  stepContent: { alignItems: 'center', paddingTop: 20 },
  payIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  stepHeading: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  stepSub: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  payAmount: { fontSize: 32, fontWeight: '800', marginTop: 16, marginBottom: 24 },
  phoneWrap: { width: '100%', marginTop: 8 },
  phoneLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  phoneInput: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 16,
    fontSize: 20, fontWeight: '600', letterSpacing: 1,
  },

  // Center states
  centerWrap: { alignItems: 'center', paddingTop: 60 },
  resultCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8,
    borderTopWidth: 1,
  },
  bottomInfo: { marginBottom: 12 },
  bottomTotal: { fontSize: 18, fontWeight: '700' },
  bottomNights: { fontSize: 13, marginTop: 2 },
  bottomBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 12,
  },
  bottomBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disclaimer: { fontSize: 12, textAlign: 'center', marginTop: 10 },
});
