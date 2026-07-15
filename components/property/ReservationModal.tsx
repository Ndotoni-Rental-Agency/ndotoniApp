import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import { 
  StepAuthChoice, 
  StepDates, 
  StepGuestInfo, 
  StepPayment, 
  StepResult 
} from '@/components/reservation';
import { 
  BookingStep, 
  ReservationColors 
} from '@/components/reservation/types';
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
  Keyboard,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
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

export default function ReservationModal({
  visible, onClose, propertyId, propertyTitle, pricePerNight,
  currency = 'TZS', minimumStay = 1, propertyImage,
  instantBookEnabled = false, cleaningFee = 0, serviceFeePercentage = 0, maxGuests = 10,
}: ReservationModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<BookingStep>('dates');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string>('');
  const [error, setError] = useState('');
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Guest info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#f7f7f7', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ebebeb', dark: '#333' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const colors: ReservationColors = { text, tint, card, border, subtle, bg };

  useEffect(() => {
    if (visible) {
      fetchBlockedDates();
      setStep('dates'); setError('');
      // Pre-fill from auth
      if (user) {
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setGuestEmail(user.email || '');
        setGuestPhone(user.phoneNumber || user.whatsappNumber || '');
      }
      // Auto-open calendar so users immediately see dates
      setTimeout(() => setShowCalendar(true), 400);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // When user signs in while modal is open, auto-fill and advance
  useEffect(() => {
    if (user && isAuthenticated && (step === 'auth-choice' || showSignIn || showSignUp)) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.phoneNumber || user.whatsappNumber || '');
      setShowSignIn(false);
      setShowSignUp(false);
      setStep('guest-info');
    }
  }, [user, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Business logic ───

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
    ? Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000) : 0;
  const subtotal = nights * pricePerNight;
  const serviceFee = Math.round(subtotal * (serviceFeePercentage / 100));
  const total = subtotal + cleaningFee + serviceFee;
  const cur = currency === 'TZS' ? 'Tshs' : currency;
  const fmt = (n: number) => (n ?? 0).toLocaleString();

  const handleDatesNext = () => {
    if (!checkInDate || !checkOutDate) { Alert.alert('Select dates'); return; }
    if (nights < minimumStay) { Alert.alert('Minimum stay', `At least ${minimumStay} night${minimumStay > 1 ? 's' : ''} required`); return; }
    // If already authenticated, skip the auth choice screen
    if (isAuthenticated) {
      setStep('guest-info');
    } else {
      setStep('auth-choice');
    }
  };

  const handleGuestInfoNext = async () => {
    if (!firstName.trim()) { Alert.alert('Name required', 'Please enter your first name'); return; }
    if (!lastName.trim()) { Alert.alert('Name required', 'Please enter your last name'); return; }
    if (!guestEmail.trim() || !guestEmail.includes('@')) { Alert.alert('Email required', 'Please enter a valid email'); return; }

    setIsLoading(true); setError('');
    try {
      const exec = isAuthenticated
        ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
        : GraphQLClient.executePublic.bind(GraphQLClient);

      const res = await exec<any>(createBooking, {
        input: {
          propertyId,
          checkInDate: checkInDate.split('T')[0],
          checkOutDate: checkOutDate.split('T')[0],
          numberOfGuests: guests,
          numberOfAdults: guests,
          numberOfChildren: 0,
          numberOfInfants: 0,
          paymentMethodId: 'snippe_mpesa',
          guestName: `${firstName.trim()} ${lastName.trim()}`,
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.replace(/\D/g, '') || undefined,
        },
      });
      const booking = res.createBooking?.booking;
      if (!booking) throw new Error(res.createBooking?.message || 'Failed to create booking');
      setBookingId(booking.bookingId);
      setBookingStatus(booking.status);

      if (booking.status === 'CONFIRMED') {
        setStep('payment');
      } else {
        setStep('success');
      }
    } catch (err: any) {
      const raw = err?.errors?.[0]?.message || err?.message || 'Booking failed';
      let msg = raw;
      if (raw.includes('not available')) msg = 'These dates are no longer available. Please select different dates.';
      else if (raw.includes('Unauthorized') || raw.includes('expired')) msg = 'Session expired. Please try again.';
      setError(msg); setStep('failed');
    } finally { setIsLoading(false); }
  };

  const handleMobilePay = async () => {
    const phone = phoneNumber.replace(/\D/g, '');
    if (phone.length < 10) { Alert.alert('Invalid number', 'Enter a valid phone number'); return; }
    setIsLoading(true); setError(''); setStep('processing');
    try {
      const exec = isAuthenticated
        ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
        : GraphQLClient.executePublic.bind(GraphQLClient);
      const res = await exec<any>(initiatePayment, { input: { bookingId, phoneNumber: phone } });
      const result = res.initiatePayment;
      if (result.status === 'PENDING') { pollPaymentStatus(result.reference); }
      else if (result.status === 'COMPLETED' || result.status === 'CAPTURED') { setStep('success'); }
      else { setError(result.message || 'Payment failed'); setStep('failed'); }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || err?.message || 'Payment failed');
      setStep('failed');
    } finally { setIsLoading(false); }
  };

  const handleCardPay = () => {
    if (!bookingId) return;
    const payUrl = `https://www.ndotonistays.com/pay/${bookingId}`;
    Linking.openURL(payUrl);
  };

  const pollPaymentStatus = (ref: string) => {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const exec = isAuthenticated
          ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
          : GraphQLClient.executePublic.bind(GraphQLClient);
        const res = await exec<any>(getPayment, { paymentId: ref });
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
    setStep('dates'); setCheckInDate(''); setCheckOutDate(''); setGuests(2);
    setFirstName(''); setLastName('');
    setPhoneNumber(''); setError(''); setBookingId(null); setBookingStatus('');
    setPaymentMethod(null);
    onClose();
  };

  // ─── Render ───

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={resetAndClose}>
      <SafeAreaView style={[s.container, { backgroundColor: bg }]} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={step === 'dates' ? resetAndClose : () => {
            if (step === 'auth-choice') setStep('dates');
            else if (step === 'guest-info') setStep(isAuthenticated ? 'dates' : 'auth-choice');
            else if (step === 'payment') setStep('guest-info');
            else resetAndClose();
          }} style={[s.closeBtn, { backgroundColor: `${text}08` }]}>
            <Ionicons name={step === 'dates' ? 'close' : 'arrow-back'} size={20} color={text} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: text }]}>
            {step === 'dates' ? 'Book your stay' : step === 'auth-choice' ? '' : step === 'guest-info' ? 'Your details' : step === 'payment' ? 'Payment' : ''}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView style={s.body} contentContainerStyle={s.bodyContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {step === 'dates' && (
              <StepDates
                colors={colors}
                propertyTitle={propertyTitle}
                propertyImage={propertyImage}
                pricePerNight={pricePerNight}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                guests={guests}
                maxGuests={maxGuests}
                price={{ nights, pricePerNight, subtotal, cleaningFee, serviceFee, total, currency }}
                onOpenCalendar={() => setShowCalendar(true)}
                onGuestsChange={setGuests}
              />
            )}

            {step === 'auth-choice' && (
              <StepAuthChoice
                colors={colors}
                onSignIn={() => setShowSignIn(true)}
                onContinueAsGuest={() => setStep('guest-info')}
              />
            )}

            {step === 'guest-info' && (
              <StepGuestInfo
                colors={colors}
                firstName={firstName}
                lastName={lastName}
                guestEmail={guestEmail}
                guestPhone={guestPhone}
                isAuthenticated={isAuthenticated}
                onFirstNameChange={setFirstName}
                onLastNameChange={setLastName}
                onGuestEmailChange={setGuestEmail}
                onGuestPhoneChange={setGuestPhone}
                onSignIn={() => setShowSignIn(true)}
              />
            )}

            {step === 'payment' && (
              <StepPayment
                colors={colors}
                total={total}
                currency={currency}
                paymentMethod={paymentMethod}
                phoneNumber={phoneNumber}
                onPaymentMethodChange={setPaymentMethod}
                onPhoneNumberChange={setPhoneNumber}
              />
            )}

            {(step === 'processing' || step === 'success' || step === 'failed') && (
              <StepResult
                colors={colors}
                state={step}
                bookingStatus={bookingStatus}
                error={error}
              />
            )}

          </ScrollView>
        </TouchableWithoutFeedback>

        {/* ─── Bottom bar ─── */}
        <View style={[s.bottomBar, { backgroundColor: bg, borderTopColor: border }]}>
          {step === 'dates' && (
            <>
              {nights > 0 && <View style={s.bottomInfo}><Text style={[s.bottomTotal, { color: text }]}>{cur} {fmt(total)}</Text><Text style={[s.bottomSub, { color: subtle }]}>for {nights} night{nights !== 1 ? 's' : ''}</Text></View>}
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: tint, opacity: nights > 0 ? 1 : 0.4 }]} onPress={nights > 0 ? handleDatesNext : () => setShowCalendar(true)} disabled={false}>
                <Text style={s.actionBtnText}>{nights > 0 ? 'Next: your details' : 'Select dates'}</Text>
              </TouchableOpacity>
            </>
          )}
          {step === 'guest-info' && (
            <>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: tint, opacity: isLoading ? 0.5 : 1 }]} onPress={handleGuestInfoNext} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" size="small" /> : (
                  <>
                    {instantBookEnabled && <Ionicons name="flash" size={16} color="#fff" />}
                    <Text style={s.actionBtnText}>{instantBookEnabled ? 'Confirm & pay' : 'Send request'}</Text>
                  </>
                )}
              </TouchableOpacity>
              {!instantBookEnabled && <Text style={[s.disclaimer, { color: subtle }]}>You won't be charged yet</Text>}
            </>
          )}
          {step === 'payment' && !paymentMethod && (
            <View style={[s.actionBtn, { backgroundColor: `${border}`, opacity: 0.6 }]}>
              <Text style={[s.actionBtnText, { color: subtle }]}>Choose a payment method above</Text>
            </View>
          )}
          {step === 'payment' && paymentMethod === 'mobile' && (
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: tint }]} onPress={handleMobilePay} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.actionBtnText}>Pay {cur} {fmt(total)}</Text>}
            </TouchableOpacity>
          )}
          {step === 'payment' && paymentMethod === 'card' && (
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: tint }]} onPress={handleCardPay}>
              <Ionicons name="open-outline" size={16} color="#fff" />
              <Text style={s.actionBtnText}>Pay with card</Text>
            </TouchableOpacity>
          )}
          {step === 'success' && (
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: tint }]} onPress={resetAndClose}>
              <Text style={s.actionBtnText}>Done</Text>
            </TouchableOpacity>
          )}
          {step === 'failed' && (
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: tint }]} onPress={() => {
              if (error.includes('no longer available')) { fetchBlockedDates(); setCheckInDate(''); setCheckOutDate(''); setError(''); setStep('dates'); }
              else { setError(''); setStep(bookingId ? 'payment' : 'dates'); }
            }}>
              <Text style={s.actionBtnText}>{error.includes('no longer available') ? 'Pick new dates' : 'Try again'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Calendar */}
        <CalendarDatePicker visible={showCalendar} onClose={() => setShowCalendar(false)} checkInDate={checkInDate} checkOutDate={checkOutDate} onCheckInChange={setCheckInDate} onCheckOutChange={setCheckOutDate} blockedDates={blockedDates} textColor={text} tintColor={tint} backgroundColor={bg} borderColor={border} secondaryText={subtle} mode="range" />

        {/* Auth modals */}
        <SignInModal
          visible={showSignIn}
          onClose={() => {
            setShowSignIn(false);
            // After successful sign-in, pre-fill and advance to guest-info
          }}
          onSwitchToSignUp={() => { setShowSignIn(false); setShowSignUp(true); }}
          onForgotPassword={() => {}}
          onNeedsVerification={() => {}}
        />
        <SignUpModal
          visible={showSignUp}
          onClose={() => {
            setShowSignUp(false);
          }}
          onSwitchToSignIn={() => { setShowSignUp(false); setShowSignIn(true); }}
          onNeedsVerification={() => {}}
        />
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  bottomBar: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6, borderTopWidth: 1 },
  bottomInfo: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 10 },
  bottomTotal: { fontSize: 18, fontWeight: '700' },
  bottomSub: { fontSize: 13 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 12 },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disclaimer: { fontSize: 12, textAlign: 'center', marginTop: 8 },
});
