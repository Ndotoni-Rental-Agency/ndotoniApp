import { useAuth } from '@/contexts/AuthContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { initiatePayment } from '@/lib/graphql/mutations';
import { getPayment } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Booking, TripColors } from './types';

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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = booking?.pricing?.total ?? booking?.totalPrice ?? 0;
  const cur = (booking?.pricing?.currency || booking?.property?.currency || 'TZS') === 'TZS' ? 'Tshs' : (booking?.pricing?.currency || booking?.property?.currency || 'TZS');

  useEffect(() => {
    if (visible) { setMethod(null); setStatus('pick'); setError(''); setPhone(''); }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [visible]);

  const handleMobilePay = async () => {
    const p = phone.replace(/\D/g, '');
    if (p.length < 10) { Alert.alert('Invalid', 'Enter a valid phone number'); return; }
    setPaying(true); setStatus('processing'); setError('');
    try {
      const exec = isAuthenticated
        ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
        : GraphQLClient.executePublic.bind(GraphQLClient);
      const res = await exec<any>(initiatePayment, { input: { bookingId: booking?.bookingId, phoneNumber: p } });
      if (res.initiatePayment?.status === 'PENDING') {
        let attempts = 0;
        pollRef.current = setInterval(async () => {
          attempts++;
          try {
            const r = await exec<any>(getPayment, { paymentId: res.initiatePayment.reference });
            if (r.getPayment?.status === 'CAPTURED' || r.getPayment?.status === 'AUTHORIZED') { clearInterval(pollRef.current!); setStatus('success'); }
            else if (r.getPayment?.status === 'FAILED') { clearInterval(pollRef.current!); setError('Payment failed'); setStatus('failed'); }
          } catch {}
          if (attempts >= 30) { clearInterval(pollRef.current!); setError('Timeout — check your phone'); setStatus('failed'); }
        }, 10000);
      } else if (res.initiatePayment?.status === 'CAPTURED' || res.initiatePayment?.status === 'COMPLETED') { setStatus('success'); }
      else { setError(res.initiatePayment?.message || 'Payment failed'); setStatus('failed'); }
    } catch (err: any) { setError(err?.message || 'Payment failed'); setStatus('failed'); }
    finally { setPaying(false); }
  };

  const handleCardPay = () => {
    if (!booking) return;
    Linking.openURL(`https://www.ndotonistays.com/pay/${booking.bookingId}`);
  };

  if (!visible || !booking) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[s.container, { backgroundColor: bg }]} edges={['top', 'bottom']}>
        <View style={s.header}>
          <TouchableOpacity onPress={onClose} style={[s.closeBtn, { backgroundColor: `${text}08` }]}>
            <Ionicons name="close" size={20} color={text} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: text }]}>Complete payment</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={s.content}>
          {status === 'pick' && (
            <>
              <Text style={[s.amount, { color: text }]}>{cur} {total.toLocaleString()}</Text>
              <Text style={[s.forLabel, { color: subtle }]}>{booking.property?.title}</Text>

              {!method && (
                <View style={s.methods}>
                  <TouchableOpacity style={[s.methodCard, { borderColor: border, backgroundColor: card }]} onPress={() => setMethod('mobile')} activeOpacity={0.7}>
                    <Text style={s.methodEmoji}>📱</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.methodName, { color: text }]}>Mobile Money</Text>
                      <Text style={[s.methodSub, { color: subtle }]}>M-Pesa, Airtel, Tigo, Halotel</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={subtle} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.methodCard, { borderColor: border, backgroundColor: card }]} onPress={() => setMethod('card')} activeOpacity={0.7}>
                    <Text style={s.methodEmoji}>💳</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.methodName, { color: text }]}>Card / Apple Pay</Text>
                      <Text style={[s.methodSub, { color: subtle }]}>Visa, Mastercard, Google Pay</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={subtle} />
                  </TouchableOpacity>
                </View>
              )}

              {method === 'mobile' && (
                <View style={s.form}>
                  <Text style={[s.label, { color: text }]}>Phone number</Text>
                  <TextInput
                    style={[s.input, { color: text, borderColor: border, backgroundColor: card }]}
                    value={phone}
                    onChangeText={(t) => { let v = t.replace(/\D/g, ''); if (v.startsWith('0')) v = '255' + v.substring(1); else if (v.startsWith('7') || v.startsWith('6')) v = '255' + v; setPhone(v.slice(0, 12)); }}
                    placeholder="0712 345 678"
                    placeholderTextColor={subtle}
                    keyboardType="phone-pad"
                  />
                  <TouchableOpacity style={[s.payBtn, { backgroundColor: tint }]} onPress={handleMobilePay} disabled={paying}>
                    {paying ? <ActivityIndicator color="#fff" /> : <Text style={s.payBtnText}>Pay {cur} {total.toLocaleString()}</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={s.switchLink} onPress={() => setMethod(null)}>
                    <Text style={[s.switchText, { color: tint }]}>← Different method</Text>
                  </TouchableOpacity>
                </View>
              )}

              {method === 'card' && (
                <View style={s.form}>
                  <View style={[s.cardInfo, { backgroundColor: card, borderColor: border }]}>
                    <Ionicons name="globe-outline" size={20} color={tint} />
                    <Text style={[s.cardInfoText, { color: text }]}>You'll be redirected to our secure web checkout.</Text>
                  </View>
                  <TouchableOpacity style={[s.payBtn, { backgroundColor: tint }]} onPress={handleCardPay}>
                    <Ionicons name="open-outline" size={16} color="#fff" />
                    <Text style={s.payBtnText}>Pay with card</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.switchLink} onPress={() => setMethod(null)}>
                    <Text style={[s.switchText, { color: tint }]}>← Use mobile money</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {status === 'processing' && (
            <View style={s.center}>
              <ActivityIndicator size="large" color={tint} />
              <Text style={[s.statusTitle, { color: text }]}>Processing...</Text>
              <Text style={[s.statusSub, { color: subtle }]}>Check your phone and confirm the M-Pesa prompt</Text>
            </View>
          )}

          {status === 'success' && (
            <View style={s.center}>
              <Ionicons name="checkmark-circle" size={60} color={tint} />
              <Text style={[s.statusTitle, { color: text }]}>Payment confirmed!</Text>
              <Text style={[s.statusSub, { color: subtle }]}>Your trip is fully booked.</Text>
              <TouchableOpacity style={[s.payBtn, { backgroundColor: tint, marginTop: 24 }]} onPress={onClose}>
                <Text style={s.payBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'failed' && (
            <View style={s.center}>
              <Ionicons name="alert-circle" size={60} color="#ef4444" />
              <Text style={[s.statusTitle, { color: text }]}>Payment failed</Text>
              <Text style={[s.statusSub, { color: subtle }]}>{error}</Text>
              <TouchableOpacity style={[s.payBtn, { backgroundColor: tint, marginTop: 24 }]} onPress={() => { setStatus('pick'); setError(''); }}>
                <Text style={s.payBtnText}>Try again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  amount: { fontSize: 32, fontWeight: '800', textAlign: 'center' },
  forLabel: { fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: 28 },
  methods: { gap: 12 },
  methodCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 14, borderWidth: 1, gap: 14 },
  methodEmoji: { fontSize: 28 },
  methodName: { fontSize: 15, fontWeight: '600' },
  methodSub: { fontSize: 12, marginTop: 2 },
  form: { marginTop: 4 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 20, fontWeight: '600', letterSpacing: 1 },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 12, marginTop: 16 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchLink: { marginTop: 16, alignItems: 'center' },
  switchText: { fontSize: 14, fontWeight: '600' },
  cardInfo: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  cardInfoText: { flex: 1, fontSize: 14, lineHeight: 20 },
  center: { alignItems: 'center', paddingTop: 48 },
  statusTitle: { fontSize: 22, fontWeight: '800', marginTop: 16 },
  statusSub: { fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 },
});
