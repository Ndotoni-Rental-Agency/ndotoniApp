import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ReservationColors } from './types';

interface StepPaymentProps {
  colors: ReservationColors;
  total: number;
  currency: string;
  paymentMethod: 'mobile' | 'card' | null;
  phoneNumber: string;
  onPaymentMethodChange: (method: 'mobile' | 'card' | null) => void;
  onPhoneNumberChange: (value: string) => void;
}

export default function StepPayment({
  colors,
  total,
  currency,
  paymentMethod,
  phoneNumber,
  onPaymentMethodChange,
  onPhoneNumberChange,
}: StepPaymentProps) {
  const { text, tint, card, border, subtle } = colors;
  const cur = currency === 'TZS' ? 'Tshs' : currency;
  const fmt = (n: number) => (n ?? 0).toLocaleString();

  const handlePhoneChange = (t: string) => {
    let v = t.replace(/\D/g, '');
    if (v.startsWith('0')) v = '255' + v.substring(1);
    else if (v.startsWith('7') || v.startsWith('6')) v = '255' + v;
    onPhoneNumberChange(v.slice(0, 12));
  };

  return (
    <>
      <Text style={[styles.stepHeading, { color: text }]}>How do you want to pay?</Text>
      <Text style={[styles.payTotalBig, { color: text }]}>{cur} {fmt(total)}</Text>

      {/* Payment method selector */}
      {!paymentMethod && (
        <View style={styles.payMethods}>
          <TouchableOpacity
            style={[styles.payMethodCard, { borderColor: border, backgroundColor: card }]}
            onPress={() => onPaymentMethodChange('mobile')}
            activeOpacity={0.7}
          >
            <Text style={styles.payMethodIcon}>📱</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.payMethodTitle, { color: text }]}>Mobile Money</Text>
              <Text style={[styles.payMethodDesc, { color: subtle }]}>M-Pesa, Airtel, Tigo, Halotel</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={subtle} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.payMethodCard, { borderColor: border, backgroundColor: card }]}
            onPress={() => onPaymentMethodChange('card')}
            activeOpacity={0.7}
          >
            <Text style={styles.payMethodIcon}>💳</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.payMethodTitle, { color: text }]}>Card / Apple Pay</Text>
              <Text style={[styles.payMethodDesc, { color: subtle }]}>Visa, Mastercard, Google Pay</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={subtle} />
          </TouchableOpacity>
        </View>
      )}

      {/* Mobile money form */}
      {paymentMethod === 'mobile' && (
        <View style={styles.payForm}>
          <Text style={[styles.inputLabel, { color: text }]}>Phone number</Text>
          <TextInput
            style={[styles.input, styles.phoneInput, { color: text, borderColor: border, backgroundColor: card }]}
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            placeholder="0712 345 678"
            placeholderTextColor={subtle}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.switchMethod} onPress={() => onPaymentMethodChange(null)}>
            <Text style={[styles.switchMethodText, { color: tint }]}>← Use a different method</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Card — opens web */}
      {paymentMethod === 'card' && (
        <View style={styles.payForm}>
          <View style={[styles.cardInfo, { backgroundColor: card, borderColor: border }]}>
            <Ionicons name="globe-outline" size={20} color={tint} />
            <Text style={[styles.cardInfoText, { color: text }]}>
              You'll be redirected to our secure checkout to complete payment with your card.
            </Text>
          </View>
          <TouchableOpacity style={styles.switchMethod} onPress={() => onPaymentMethodChange(null)}>
            <Text style={[styles.switchMethodText, { color: tint }]}>← Use mobile money instead</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  stepHeading: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  payTotalBig: { fontSize: 32, fontWeight: '800', marginTop: 8, marginBottom: 24 },
  payMethods: { gap: 12 },
  payMethodCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 14, borderWidth: 1, gap: 14 },
  payMethodIcon: { fontSize: 28 },
  payMethodTitle: { fontSize: 15, fontWeight: '600' },
  payMethodDesc: { fontSize: 12, marginTop: 2 },
  payForm: { marginTop: 4 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  phoneInput: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
  switchMethod: { marginTop: 16, alignItems: 'center' },
  switchMethodText: { fontSize: 14, fontWeight: '600' },
  cardInfo: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  cardInfoText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
