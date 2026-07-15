import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ReservationColors } from './types';

interface StepGuestInfoProps {
  colors: ReservationColors;
  firstName: string;
  lastName: string;
  guestEmail: string;
  guestPhone: string;
  isAuthenticated: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onGuestEmailChange: (value: string) => void;
  onGuestPhoneChange: (value: string) => void;
  onSignIn: () => void;
}

export default function StepGuestInfo({
  colors,
  firstName,
  lastName,
  guestEmail,
  guestPhone,
  isAuthenticated,
  onFirstNameChange,
  onLastNameChange,
  onGuestEmailChange,
  onGuestPhoneChange,
  onSignIn,
}: StepGuestInfoProps) {
  const { text, tint, card, border, subtle } = colors;

  const handlePhoneChange = (t: string) => {
    let v = t.replace(/\D/g, '');
    if (v.startsWith('0')) v = '255' + v.substring(1);
    else if (v.startsWith('7') || v.startsWith('6')) v = '255' + v;
    onGuestPhoneChange(v.slice(0, 12));
  };

  return (
    <>
      <Text style={[s.heading, { color: text }]}>Your details</Text>
      <Text style={[s.sub, { color: subtle }]}>
        We'll send booking confirmation to your email
      </Text>

      {/* Name row */}
      <View style={s.nameRow}>
        <View style={s.nameCol}>
          <Text style={[s.label, { color: text }]}>First name *</Text>
          <TextInput
            style={[s.input, { color: text, borderColor: border, backgroundColor: card }]}
            value={firstName}
            onChangeText={onFirstNameChange}
            placeholder="John"
            placeholderTextColor={subtle}
            autoCapitalize="words"
          />
        </View>
        <View style={s.nameCol}>
          <Text style={[s.label, { color: text }]}>Last name *</Text>
          <TextInput
            style={[s.input, { color: text, borderColor: border, backgroundColor: card }]}
            value={lastName}
            onChangeText={onLastNameChange}
            placeholder="Doe"
            placeholderTextColor={subtle}
            autoCapitalize="words"
          />
        </View>
      </View>

      <View style={s.formGroup}>
        <Text style={[s.label, { color: text }]}>Email *</Text>
        <TextInput
          style={[s.input, { color: text, borderColor: border, backgroundColor: card }]}
          value={guestEmail}
          onChangeText={onGuestEmailChange}
          placeholder="you@example.com"
          placeholderTextColor={subtle}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={s.formGroup}>
        <Text style={[s.label, { color: text }]}>
          WhatsApp / Phone <Text style={{ color: subtle, fontWeight: '400' }}>(optional)</Text>
        </Text>
        <TextInput
          style={[s.input, { color: text, borderColor: border, backgroundColor: card }]}
          value={guestPhone}
          onChangeText={handlePhoneChange}
          placeholder="0712 345 678"
          placeholderTextColor={subtle}
          keyboardType="phone-pad"
        />
        <Text style={[s.hint, { color: subtle }]}>For check-in details via WhatsApp</Text>
      </View>

      {!isAuthenticated && (
        <TouchableOpacity style={s.signInLink} onPress={onSignIn}>
          <Text style={[s.signInText, { color: tint }]}>Have an account? Sign in instead</Text>
        </TouchableOpacity>
      )}
    </>
  );
}

const s = StyleSheet.create({
  heading: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  sub: { fontSize: 14, marginTop: 6, lineHeight: 20, marginBottom: 4 },
  nameRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  nameCol: { flex: 1 },
  formGroup: { marginTop: 18 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  hint: { fontSize: 12, marginTop: 6 },
  signInLink: { marginTop: 24, alignItems: 'center' },
  signInText: { fontSize: 14, fontWeight: '600' },
});
