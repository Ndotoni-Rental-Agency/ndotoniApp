import { useAuth } from '@/contexts/AuthContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { initiatePayment } from '@/lib/graphql/mutations';
import { getPayment } from '@/lib/graphql/queries';
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
import { Booking, TripColors, formatDate, getNights } from './types';

interface PaymentModalProps {
  visible: boolean;
  booking: Booking | null;
  onClose: () => void;
  colors: TripColors;
}

export default function PaymentModal({ visible, booking, onClose, colors }: PaymentModalProps) {
  const { text, tint, card, border, subtle, bg } = colors;
  const { isAuthenticated } = useAuth();
  const [method, setMethod] = useState<'mobile' | 'card' | null>(null);
  const [phone, setPhone] = useState('');
  const [paying, setPaying] = useState(false);
  const [status, setStatus] = useState<'pick' | 'processing' | 'success' | 'failed'>('pick');
  const [error, setError] = useState('');
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = booking?.pricing?.total ?? booking?.totalPrice ?? 0;
  const currency = booking?.pricing?.currency || booking?.property?.currency || 'TZS';
  const cur = currency === 'TZS' ? 'Tshs' : currency;
  const nights = booking ? getNights(booking.checkInDate, booking.checkOutDate) : 0;

  useEffect(() => {
    if (visible) { setMethod(null); setStatus('pick'); setError(''); setPhone(''); setPollCount(0); }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [visible]);

  const handleMobilePay = async () => {
    const p = phone.replace(/\D/g, '');
    if (p.length < 10) { Alert.alert('Invalid number', 'Please enter a valid Tanzanian phone number'); return; }
    setPaying(true); setStatus('processing'); setError(''); setPollCount(0);
    try {
      const exec = isAuthenticated
        ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
        : GraphQLClient.executePublic.bind(GraphQLClient);
      const res = await exec<any>(initiatePayment, { input: { bookingId: booking?.bookingId, phoneNumber: p } });
      if (res.initiatePayment?.status === 'PENDING') {
        let attempts = 0;
        pollRef.current = setInterval(async () => {
          attempts++;
          setPollCount(attempts);
          try {
            const r = await exec<any>(getPayment, { paymentId: res.initiatePayment.reference });
            if (r.getPayment?.status === 'CAPTURED' || r.getPayment?.status === 'AUTHORIZED') {
              clearInterval(pollRef.current!); setStatus('success');
            } else if (r.getPayment?.status === 'FAILED') {
              clearInterval(pollRef.current!); setError('Payment was declined or cancelled'); setStatus('failed');
            }
          } catch {}
          if (attempts >= 30) { clearInterval(pollRef.current!); setError('We didn\'t receive confirmation yet. If you completed the payment, it may still be processing.'); setStatus('failed'); }
        }, 10000);
      } else if (res.initiatePayment?.status === 'CAPTURED' || res.initiatePayment?.status === 'COMPLETED') {
        setStatus('success');
      } else {
        setError(res.initiatePayment?.message || 'Something went wrong. Please try again.');
        setStatus('failed');
      }
    } catch (err: any) { setError(err?.message || 'Could not initiate payment. Check your connection and try again.'); setStatus('failed'); }
    finally { setPaying(false); }
  };

  const handleCardPay = () => {
    if (!booking) return;
    Linking.openURL(`https://www.ndotonistays.com/pay/${booking.bookingId}`);
  };

  if (!visible || !booking) return null;

  const thumbnail = booking.property?.thumbnail || booking.property?.images?.[0];

  const renderBookingSummary = () => (
    <View style={[s.summaryCard, { backgroundColor: card, borderColor: border }]}>
      <View style={s.summaryHeader}>
        {thumbnail && (
          <Image source={{ uri: thumbnail }} style={s.summaryThumb} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={[s.summaryTitle, { color: text }]}>{booking.property?.title}</Text>
          <Text style={[s.summaryDates, { color: subtle }]}>
            {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}  ({nights} night{nights !== 1 ? 's' : ''})
          </Text>
        </View>
      </View>
      <View style={s.summaryDivider} />
      <View style={s.priceRow}>
        <Text style={[s.totalLabel, { color: text }]}>Total</Text>
        <Text style={[s.totalValue, { color: text }]}>{cur} {total.toLocaleString()}</Text>
      </View>
    </View>
  );

  const renderMethodPicker = () => (
    <View style={s.methods}>
      <Text style={[s.sectionTitle, { color: text }]}>Choose payment method</Text>
      <TouchableOpacity
        style={[s.methodCard, { borderColor: border, backgroundColor: card }]}
        onPress={() => setMethod('mobile')}
        activeOpacity={0.7}
      >
        <View style={[s.methodIcon, { backgroundColor: '#f0fdf4' }]}>
          <Text style={s.methodEmoji}>📱</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.methodName, { color: text }]}>Mobile Money</Text>
          <Text style={[s.methodSub, { color: subtle }]}>M-Pesa, Airtel Money, Tigo Pesa, Halotel</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={subtle} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.methodCard, { borderColor: border, backgroundColor: card }]}
        onPress={() => setMethod('card')}
        activeOpacity={0.7}
      >
        <View style={[s.methodIcon, { backgroundColor: '#eff6ff' }]}>
          <Text style={s.methodEmoji}>💳</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.methodName, { color: text }]}>Card Payment</Text>
          <Text style={[s.methodSub, { color: subtle }]}>Visa, Mastercard, Apple Pay, Google Pay</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={subtle} />
      </TouchableOpacity>
    </View>
  );

  const renderMobileForm = () => (
    <View style={s.form}>
      <Text style={[s.sectionTitle, { color: text }]}>Pay with Mobile Money</Text>
      <View style={[s.instructionCard, { backgroundColor: '#fefce8', borderColor: '#fde047' }]}>
        <Ionicons name="information-circle" size={20} color="#ca8a04" />
        <View style={{ flex: 1 }}>
          <Text style={[s.instructionTitle, { color: '#92400e' }]}>How it works</Text>
          <Text style={s.instructionText}>
            1. Enter your mobile money number below{'\n'}
            2. Tap "Pay now" to send the request{'\n'}
            3. You'll receive a USSD prompt on your phone{'\n'}
            4. Enter your mobile money PIN to confirm{'\n'}
            5. Wait for confirmation (usually 10-30 seconds)
          </Text>
        </View>
      </View>

      <Text style={[s.label, { color: text }]}>Mobile money number</Text>
      <TextInput
        style={[s.input, { color: text, borderColor: border, backgroundColor: card }]}
        value={phone}
        onChangeText={(t) => {
          let v = t.replace(/\D/g, '');
          if (v.startsWith('0')) v = '255' + v.substring(1);
          else if (v.startsWith('7') || v.startsWith('6')) v = '255' + v;
          setPhone(v.slice(0, 12));
        }}
        placeholder="e.g. 0712 345 678"
        placeholderTextColor={subtle}
        keyboardType="phone-pad"
        accessibilityLabel="Mobile money phone number"
      />
      <Text style={[s.inputHint, { color: subtle }]}>
        Enter the number registered with your mobile money account
      </Text>

      <TouchableOpacity
        style={[s.payBtn, { backgroundColor: tint, opacity: paying ? 0.7 : 1 }]}
        onPress={handleMobilePay}
        disabled={paying}
        accessibilityRole="button"
        accessibilityLabel={`Pay ${cur} ${total.toLocaleString()}`}
      >
        {paying ? <ActivityIndicator color="#fff" /> : (
          <>
            <Ionicons name="phone-portrait-outline" size={18} color="#fff" />
            <Text style={s.payBtnText}>Pay now  {cur} {total.toLocaleString()}</Text>
          </>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={s.switchLink} onPress={() => setMethod(null)}>
        <Ionicons name="arrow-back" size={14} color={tint} />
        <Text style={[s.switchText, { color: tint }]}>Choose different method</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCardForm = () => (
    <View style={s.form}>
      <Text style={[s.sectionTitle, { color: text }]}>Pay with Card</Text>
      <View style={[s.instructionCard, { backgroundColor: '#eff6ff', borderColor: '#93c5fd' }]}>
        <Ionicons name="lock-closed" size={20} color="#1d4ed8" />
        <View style={{ flex: 1 }}>
          <Text style={[s.instructionTitle, { color: '#1e3a5f' }]}>Secure checkout</Text>
          <Text style={[s.instructionText, { color: '#374151' }]}>
            You'll be redirected to our secure payment page where you can pay using:{'\n'}
            {'\n'}
            {'\u2022'} Visa or Mastercard{'\n'}
            {'\u2022'} Apple Pay{'\n'}
            {'\u2022'} Google Pay{'\n'}
            {'\n'}
            Your card details are handled securely by Stripe and never stored on our servers.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[s.payBtn, { backgroundColor: tint }]}
        onPress={handleCardPay}
        accessibilityRole="button"
        accessibilityLabel="Pay with card via web checkout"
      >
        <Ionicons name="open-outline" size={18} color="#fff" />
        <Text style={s.payBtnText}>Continue to checkout</Text>
      </TouchableOpacity>
      <Text style={[s.cardNote, { color: subtle }]}>
        Opens in your browser. Come back here once payment is complete.
      </Text>
      <TouchableOpacity style={s.switchLink} onPress={() => setMethod(null)}>
        <Ionicons name="arrow-back" size={14} color={tint} />
        <Text style={[s.switchText, { color: tint }]}>Choose different method</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProcessing = () => (
    <View style={s.center}>
      <View style={[s.processingIcon, { borderColor: tint }]}>
        <ActivityIndicator size="large" color={tint} />
      </View>
      <Text style={[s.statusTitle, { color: text }]}>Waiting for payment</Text>
      <Text style={[s.statusSub, { color: subtle }]}>
        A payment prompt has been sent to your phone.{'\n'}
        Open your M-Pesa or mobile money app and enter your PIN to confirm.
      </Text>
      <View style={[s.processingSteps, { backgroundColor: card, borderColor: border }]}>
        <View style={s.stepRow}>
          <Ionicons name="checkmark-circle" size={20} color={tint} />
          <Text style={[s.stepText, { color: text }]}>Payment request sent</Text>
        </View>
        <View style={s.stepRow}>
          <Ionicons name={pollCount > 0 ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={pollCount > 0 ? tint : subtle} />
          <Text style={[s.stepText, { color: pollCount > 0 ? text : subtle }]}>Waiting for your confirmation...</Text>
        </View>
        <View style={s.stepRow}>
          <Ionicons name="ellipse-outline" size={20} color={subtle} />
          <Text style={[s.stepText, { color: subtle }]}>Payment verified</Text>
        </View>
      </View>
      <Text style={[s.processingHint, { color: subtle }]}>
        This usually takes 10-30 seconds. Don't close this screen.
      </Text>
    </View>
  );

  const renderSuccess = () => (
    <View style={s.center}>
      <View style={[s.successIcon, { backgroundColor: '#f0fdf4' }]}>
        <Ionicons name="checkmark-circle" size={64} color={tint} />
      </View>
      <Text style={[s.statusTitle, { color: text }]}>Payment successful!</Text>
      <Text style={[s.statusSub, { color: subtle }]}>
        Your booking for {booking.property?.title} is now confirmed.{'\n'}
        You'll receive a confirmation message shortly.
      </Text>
      <View style={[s.successDetails, { backgroundColor: card, borderColor: border }]}>
        <View style={s.successRow}>
          <Text style={[s.successLabel, { color: subtle }]}>Amount paid</Text>
          <Text style={[s.successValue, { color: text }]}>{cur} {total.toLocaleString()}</Text>
        </View>
        <View style={s.successRow}>
          <Text style={[s.successLabel, { color: subtle }]}>Check-in</Text>
          <Text style={[s.successValue, { color: text }]}>{formatDate(booking.checkInDate)}</Text>
        </View>
        <View style={s.successRow}>
          <Text style={[s.successLabel, { color: subtle }]}>Guests</Text>
          <Text style={[s.successValue, { color: text }]}>{booking.numberOfGuests}</Text>
        </View>
      </View>
      <TouchableOpacity style={[s.payBtn, { backgroundColor: tint, marginTop: 24 }]} onPress={onClose}>
        <Text style={s.payBtnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFailed = () => (
    <View style={s.center}>
      <View style={[s.failedIcon, { backgroundColor: '#fef2f2' }]}>
        <Ionicons name="close-circle" size={64} color="#ef4444" />
      </View>
      <Text style={[s.statusTitle, { color: text }]}>Payment not completed</Text>
      <Text style={[s.statusSub, { color: subtle }]}>{error}</Text>
      <View style={[s.helpCard, { backgroundColor: card, borderColor: border }]}>
        <Text style={[s.helpTitle, { color: text }]}>What you can try:</Text>
        <Text style={[s.helpText, { color: subtle }]}>
          {'\u2022'} Check that you have enough balance{'\n'}
          {'\u2022'} Make sure you entered the correct PIN{'\n'}
          {'\u2022'} Try a different phone number{'\n'}
          {'\u2022'} Try a different payment method
        </Text>
      </View>
      <TouchableOpacity style={[s.payBtn, { backgroundColor: tint, marginTop: 20 }]} onPress={() => { setStatus('pick'); setError(''); }}>
        <Ionicons name="refresh" size={18} color="#fff" />
        <Text style={s.payBtnText}>Try again</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.secondaryBtn, { borderColor: border }]} onPress={onClose}>
        <Text style={[s.secondaryBtnText, { color: text }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[s.container, { backgroundColor: bg }]} edges={['top', 'bottom']}>
        <View style={s.header}>
          <TouchableOpacity onPress={onClose} style={[s.closeBtn, { backgroundColor: `${text}08` }]} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={20} color={text} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: text }]}>
            {status === 'pick' ? 'Complete payment' : status === 'processing' ? 'Processing' : status === 'success' ? 'Confirmed' : 'Payment issue'}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={s.scrollContent} contentContainerStyle={s.scrollContentInner} showsVerticalScrollIndicator={false}>
          {status === 'pick' && (
            <>
              {renderBookingSummary()}
              {!method && renderMethodPicker()}
              {method === 'mobile' && renderMobileForm()}
              {method === 'card' && renderCardForm()}
            </>
          )}
          {status === 'processing' && renderProcessing()}
          {status === 'success' && renderSuccess()}
          {status === 'failed' && renderFailed()}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  scrollContent: { flex: 1 },
  scrollContentInner: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  // Booking summary
  summaryCard: { borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 24 },
  summaryHeader: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  summaryThumb: { width: 56, height: 56, borderRadius: 10 },
  summaryTitle: { fontSize: 16, fontWeight: '700' },
  summaryDates: { fontSize: 13, marginTop: 3 },
  summaryDivider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 14 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '800' },

  // Method picker
  methods: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  methodCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1, gap: 14 },
  methodIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  methodEmoji: { fontSize: 22 },
  methodName: { fontSize: 15, fontWeight: '600' },
  methodSub: { fontSize: 12, marginTop: 2 },

  // Forms
  form: { marginTop: 4 },
  instructionCard: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 20, alignItems: 'flex-start' },
  instructionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  instructionText: { fontSize: 13, lineHeight: 20, color: '#4b5563' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 20, fontWeight: '600', letterSpacing: 1 },
  inputHint: { fontSize: 12, marginTop: 6, marginLeft: 4 },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 12, marginTop: 16 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchLink: { flexDirection: 'row', marginTop: 16, alignItems: 'center', justifyContent: 'center', gap: 6 },
  switchText: { fontSize: 14, fontWeight: '600' },
  cardNote: { fontSize: 12, textAlign: 'center', marginTop: 10 },

  // Processing state
  center: { alignItems: 'center', paddingTop: 32 },
  processingIcon: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statusTitle: { fontSize: 22, fontWeight: '800', marginTop: 16, textAlign: 'center' },
  statusSub: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 22, paddingHorizontal: 10 },
  processingSteps: { width: '100%', borderRadius: 14, borderWidth: 1, padding: 18, marginTop: 24, gap: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepText: { fontSize: 14 },
  processingHint: { fontSize: 12, marginTop: 16, textAlign: 'center' },

  // Success state
  successIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  successDetails: { width: '100%', borderRadius: 14, borderWidth: 1, padding: 18, marginTop: 24, gap: 12 },
  successRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  successLabel: { fontSize: 14 },
  successValue: { fontSize: 14, fontWeight: '600' },

  // Failed state
  failedIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  helpCard: { width: '100%', borderRadius: 14, borderWidth: 1, padding: 18, marginTop: 20 },
  helpTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  helpText: { fontSize: 13, lineHeight: 22 },
  secondaryBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: 12, alignItems: 'center' },
  secondaryBtnText: { fontSize: 15, fontWeight: '600' },
});
