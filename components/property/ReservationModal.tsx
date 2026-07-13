import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { createBooking, initiatePayment } from '@/lib/graphql/mutations';
import { calculateBookingPrice, getBlockedDates, getPayment } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
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

type BookingStep = 'dates' | 'confirm' | 'payment' | 'processing' | 'success' | 'failed';

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
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<BookingStep>('dates');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
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
  const card = useThemeColor({ light: '#f9f9f9', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#e5e5e5', dark: '#333' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  useEffect(() => {
    if (visible) { fetchBlockedDates(); setStep('dates'); setError(''); }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [visible]);

  const fetchBlockedDates = async () => {
    try {
      const today = new Date();
      const future = new Date(); future.setMonth(future.getMonth() + 6);
      const exec = isAuthenticated ? GraphQLClient.executeAuthenticated.bind(GraphQLClient) : GraphQLClient.executePublic.bind(GraphQLClient);
      const res = await exec<any>(getBlockedDates, { propertyId, startDate: today.toISOString().split('T')[0], endDate: future.toISOString().split('T')[0] });
      setBlockedDates(res.getBlockedDates?.dates || []);
    } catch {}
  };

  const nights = checkInDate && checkOutDate ? Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000) : 0;
  const subtotal = nights * pricePerNight;
  const serviceFee = Math.round(subtotal * (serviceFeePercentage / 100));
  const total = subtotal + cleaningFee + serviceFee;
  const fmt = (n: number) => n.toLocaleString();
  const cur = currency === 'TZS' ? 'Tshs' : currency;

  const handleProceed = () => {
    if (!isAuthenticated) { setShowSignIn(true); return; }
    if (!checkInDate || !checkOutDate) { Alert.alert('Select dates'); return; }
    if (nights < minimumStay) { Alert.alert('Minimum stay', `Minimum ${minimumStay} nights required`); return; }
    // Skip confirmation step — go straight to booking creation
    handleCreateBooking();
  };

  const handleCreateBooking = async () => {
    setIsLoading(true); setError('');
    try {
      // Format dates as YYYY-MM-DD (AWSDate) — strip any time component
      const formattedCheckIn = checkInDate.split('T')[0];
      const formattedCheckOut = checkOutDate.split('T')[0];
      
      const res = await GraphQLClient.executeAuthenticated<any>(createBooking, {
        input: {
          propertyId,
          checkInDate: formattedCheckIn,
          checkOutDate: formattedCheckOut,
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
        // Request to book — host needs to confirm
        setStep('success');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || err?.message || 'Booking failed');
      setStep('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async () => {
    const phone = phoneNumber.replace(/\D/g, '');
    if (phone.length < 10) { Alert.alert('Invalid number', 'Enter a valid phone number'); return; }
    setIsLoading(true); setError(''); setStep('processing');
    try {
      const res = await GraphQLClient.executeAuthenticated<any>(initiatePayment, { input: { bookingId, phoneNumber: phone } });
      const result = res.initiatePayment;
      if (result.status === 'PENDING') {
        pollPaymentStatus(result.reference);
      } else if (result.status === 'COMPLETED' || result.status === 'CAPTURED') {
        setStep('success');
      } else {
        setError(result.message || 'Payment failed');
        setStep('failed');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || err?.message || 'Payment failed');
      setStep('failed');
    } finally {
      setIsLoading(false);
    }
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

  const resetAndClose = () => { setStep('dates'); setCheckInDate(''); setCheckOutDate(''); setGuests(1); setPhoneNumber(''); setError(''); setBookingId(null); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={resetAndClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: border }]}>
          <TouchableOpacity onPress={resetAndClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: text }]}>
            {step === 'dates' ? 'Book your stay' : step === 'payment' ? 'Payment' : step === 'processing' ? 'Processing' : step === 'success' ? 'Done' : 'Error'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>

          {/* ═══ STEP: DATES ═══ */}
          {step === 'dates' && (
            <>
              {/* Property card */}
              <View style={[styles.propCard, { backgroundColor: card, borderColor: border }]}>
                {propertyImage && <Image source={{ uri: propertyImage }} style={styles.propImg} />}
                <View style={styles.propInfo}>
                  <Text style={[styles.propName, { color: text }]} numberOfLines={2}>{propertyTitle}</Text>
                  <Text style={[styles.propPrice, { color: text }]}>{cur} {fmt(pricePerNight)} <Text style={{ color: subtle, fontWeight: '400' }}>/ night</Text></Text>
                  {instantBookEnabled && (
                    <View style={styles.instantRow}>
                      <Ionicons name="flash" size={12} color={tint} />
                      <Text style={{ fontSize: 12, color: tint, fontWeight: '600' }}>Instant Book</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Date selection */}
              <Text style={[styles.label, { color: text }]}>Dates</Text>
              <TouchableOpacity style={[styles.dateRow, { borderColor: border }]} onPress={() => setShowCalendar(true)}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dateLabel, { color: subtle }]}>CHECK-IN</Text>
                  <Text style={[styles.dateVal, { color: checkInDate ? text : subtle }]}>{checkInDate ? new Date(checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add date'}</Text>
                </View>
                <Ionicons name="arrow-forward" size={14} color={border} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dateLabel, { color: subtle }]}>CHECK-OUT</Text>
                  <Text style={[styles.dateVal, { color: checkOutDate ? text : subtle }]}>{checkOutDate ? new Date(checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add date'}</Text>
                </View>
                <Ionicons name="calendar-outline" size={20} color={tint} />
              </TouchableOpacity>

              {/* Guest selector */}
              <Text style={[styles.label, { color: text }]}>Guests</Text>
              <View style={[styles.guestRow, { borderColor: border }]}>
                <Text style={[{ fontSize: 15, color: text }]}>{guests} guest{guests !== 1 ? 's' : ''}</Text>
                <View style={styles.counter}>
                  <TouchableOpacity style={[styles.cBtn, { borderColor: guests <= 1 ? border : text }]} onPress={() => setGuests(Math.max(1, guests - 1))} disabled={guests <= 1}>
                    <Ionicons name="remove" size={18} color={guests <= 1 ? border : text} />
                  </TouchableOpacity>
                  <Text style={[styles.cNum, { color: text }]}>{guests}</Text>
                  <TouchableOpacity style={[styles.cBtn, { borderColor: text }]} onPress={() => setGuests(Math.min(maxGuests, guests + 1))}>
                    <Ionicons name="add" size={18} color={text} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Price preview */}
              {nights > 0 && (
                <View style={[styles.priceBox, { backgroundColor: card, borderColor: border }]}>
                  <View style={styles.priceRow}><Text style={{ color: subtle }}>{cur} {fmt(pricePerNight)} × {nights} nights</Text><Text style={{ color: text, fontWeight: '600' }}>{cur} {fmt(subtotal)}</Text></View>
                  {cleaningFee > 0 && <View style={styles.priceRow}><Text style={{ color: subtle }}>Cleaning fee</Text><Text style={{ color: text, fontWeight: '600' }}>{cur} {fmt(cleaningFee)}</Text></View>}
                  {serviceFee > 0 && <View style={styles.priceRow}><Text style={{ color: subtle }}>Service fee</Text><Text style={{ color: text, fontWeight: '600' }}>{cur} {fmt(serviceFee)}</Text></View>}
                  <View style={[styles.divider, { backgroundColor: border }]} />
                  <View style={styles.priceRow}><Text style={{ color: text, fontSize: 16, fontWeight: '700' }}>Total</Text><Text style={{ color: text, fontSize: 16, fontWeight: '700' }}>{cur} {fmt(total)}</Text></View>
                </View>
              )}

              {/* Action */}
              <TouchableOpacity style={[styles.mainBtn, { backgroundColor: tint, opacity: nights > 0 ? 1 : 0.4 }]} onPress={handleProceed} disabled={nights <= 0}>
                {instantBookEnabled && <Ionicons name="flash" size={16} color="#fff" />}
                <Text style={styles.mainBtnText}>{instantBookEnabled ? 'Reserve & Pay' : 'Request to Book'}</Text>
              </TouchableOpacity>
              {!instantBookEnabled && <Text style={[styles.hint, { color: subtle }]}>You won't be charged yet. The host will confirm your request.</Text>}
            </>
          )}

          {/* ═══ STEP: PAYMENT ═══ */}
          {step === 'payment' && (
            <>
              <Text style={[styles.heading, { color: text }]}>Pay with Mobile Money</Text>
              <Text style={[styles.sub, { color: subtle }]}>All Tanzanian networks: Vodacom, Airtel, Tigo, Halotel</Text>
              <Text style={[styles.amountBig, { color: text }]}>{cur} {fmt(total)}</Text>

              <Text style={[styles.label, { color: text }]}>Phone number</Text>
              <TextInput
                style={[styles.phoneInput, { color: text, borderColor: border, backgroundColor: card }]}
                value={phoneNumber}
                onChangeText={(t) => { let v = t.replace(/\D/g, ''); if (v.startsWith('0')) v = '255' + v.substring(1); else if (v.startsWith('7') || v.startsWith('6')) v = '255' + v; setPhoneNumber(v.slice(0, 12)); }}
                placeholder="0712 345 678"
                placeholderTextColor={subtle}
                keyboardType="phone-pad"
              />

              <TouchableOpacity style={[styles.mainBtn, { backgroundColor: tint }]} onPress={handlePay} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>Pay {cur} {fmt(total)}</Text>}
              </TouchableOpacity>
            </>
          )}

          {/* ═══ STEP: PROCESSING ═══ */}
          {step === 'processing' && (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={tint} />
              <Text style={[styles.heading, { color: text, marginTop: 20 }]}>Processing payment</Text>
              <Text style={[styles.sub, { color: subtle }]}>Check your phone and confirm the M-Pesa prompt</Text>
              <Text style={[styles.hint, { color: subtle, marginTop: 12 }]}>This may take up to a minute</Text>
            </View>
          )}

          {/* ═══ STEP: SUCCESS ═══ */}
          {step === 'success' && (
            <View style={styles.centerContent}>
              <View style={[styles.successCircle, { backgroundColor: `${tint}15` }]}>
                <Ionicons name="checkmark-circle" size={56} color={tint} />
              </View>
              <Text style={[styles.heading, { color: text, marginTop: 16 }]}>
                {instantBookEnabled ? 'Booking Confirmed!' : 'Request Sent!'}
              </Text>
              <Text style={[styles.sub, { color: subtle, textAlign: 'center' }]}>
                {instantBookEnabled
                  ? 'Your stay is booked. The host will share check-in details via WhatsApp.'
                  : 'The host will review your request and confirm. You\'ll be notified once confirmed.'}
              </Text>
              <TouchableOpacity style={[styles.mainBtn, { backgroundColor: tint, marginTop: 24 }]} onPress={resetAndClose}>
                <Text style={styles.mainBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ═══ STEP: FAILED ═══ */}
          {step === 'failed' && (
            <View style={styles.centerContent}>
              <View style={[styles.successCircle, { backgroundColor: '#fef2f2' }]}>
                <Ionicons name="close-circle" size={56} color="#ef4444" />
              </View>
              <Text style={[styles.heading, { color: text, marginTop: 16 }]}>Something went wrong</Text>
              <Text style={[styles.sub, { color: subtle, textAlign: 'center' }]}>{error}</Text>
              <TouchableOpacity style={[styles.mainBtn, { backgroundColor: tint, marginTop: 24 }]} onPress={() => setStep(bookingId ? 'payment' : 'dates')}>
                <Text style={styles.mainBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Calendar */}
        <CalendarDatePicker visible={showCalendar} onClose={() => setShowCalendar(false)} checkInDate={checkInDate} checkOutDate={checkOutDate} onCheckInChange={setCheckInDate} onCheckOutChange={setCheckOutDate} blockedDates={blockedDates} textColor={text} tintColor={tint} backgroundColor={bg} borderColor={border} secondaryText={subtle} mode="range" />

        {/* Auth modals */}
        <SignInModal visible={showSignIn} onClose={() => setShowSignIn(false)} onSwitchToSignUp={() => { setShowSignIn(false); setShowSignUp(true); }} onForgotPassword={() => {}} onNeedsVerification={() => {}} />
        <SignUpModal visible={showSignUp} onClose={() => setShowSignUp(false)} onSwitchToSignIn={() => { setShowSignUp(false); setShowSignIn(true); }} onNeedsVerification={() => {}} />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  body: { flex: 1 },
  bodyContent: { padding: 20, paddingBottom: 40 },

  // Property card
  propCard: { flexDirection: 'row', padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 24, gap: 12 },
  propImg: { width: 80, height: 80, borderRadius: 10 },
  propInfo: { flex: 1, justifyContent: 'center' },
  propName: { fontSize: 15, fontWeight: '600', lineHeight: 20, marginBottom: 4 },
  propPrice: { fontSize: 14, fontWeight: '600' },
  instantRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },

  // Labels
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  heading: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  sub: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  hint: { fontSize: 13, textAlign: 'center', marginTop: 10, lineHeight: 18 },

  // Date row
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, borderWidth: 1 },
  dateLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  dateVal: { fontSize: 15, fontWeight: '600', marginTop: 3 },

  // Guest row
  guestRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderWidth: 1 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  cNum: { fontSize: 17, fontWeight: '700', minWidth: 24, textAlign: 'center' },

  // Price box
  priceBox: { marginTop: 20, padding: 16, borderRadius: 14, borderWidth: 1 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  divider: { height: 1, marginVertical: 10 },

  // Main button
  mainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 12, marginTop: 20 },
  mainBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Summary
  summaryCard: { padding: 16, borderRadius: 14, borderWidth: 1, marginTop: 16 },
  summaryLine: { fontSize: 15, paddingVertical: 4 },
  summaryTotal: { fontSize: 18, fontWeight: '700' },

  // Payment
  amountBig: { fontSize: 32, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  phoneInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, fontWeight: '600', letterSpacing: 1 },

  // Center content
  centerContent: { alignItems: 'center', paddingTop: 40 },
  successCircle: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
});
