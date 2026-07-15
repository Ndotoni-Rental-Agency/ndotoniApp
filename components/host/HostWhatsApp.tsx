import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { confirmWhatsAppAssociation, initiateWhatsAppAssociation } from '@/lib/graphql/mutations';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const NDOTONI_WHATSAPP = '255703290148';

type Step = 'input' | 'code' | 'success';

export default function HostWhatsApp() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(user?.whatsappNumber ? 'success' : 'input');
  const [phone, setPhone] = useState(user?.whatsappNumber || user?.phoneNumber || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ebebeb', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const normalize = (input: string): string => {
    let d = input.replace(/\D/g, '');
    if (d.startsWith('0') && d.length === 10) d = '255' + d.slice(1);
    else if (d.length === 9 && /^[67]/.test(d)) d = '255' + d;
    return d;
  };

  const handleInitiate = async () => {
    const normalized = normalize(phone);
    if (normalized.length < 10 || normalized.length > 15) {
      setError('Enter a valid phone number'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await GraphQLClient.executeAuthenticated<any>(initiateWhatsAppAssociation, { whatsappNumber: normalized });
      setPhone(normalized);
      setMessage(res.initiateWhatsAppAssociation?.message || 'Code sent to your WhatsApp');
      setStep('code');
    } catch (err: any) {
      const raw = err?.errors?.[0]?.message || err?.message || '';
      setError(raw.includes('Cannot return null') ? 'WhatsApp service unavailable. Try again later.' : raw || 'Failed to send code');
    } finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    if (code.length !== 5) { setError('Enter the 5-digit code'); return; }
    setLoading(true); setError('');
    try {
      const res = await GraphQLClient.executeAuthenticated<any>(confirmWhatsAppAssociation, { whatsappNumber: phone, code: code.trim() });
      setMessage(res.confirmWhatsAppAssociation?.message || 'WhatsApp connected!');
      setStep('success');
    } catch (err: any) {
      const raw = err?.errors?.[0]?.message || err?.message || '';
      setError(raw.includes('Cannot return null') ? 'Verification failed. Try again.' : raw || 'Invalid code');
    } finally { setLoading(false); }
  };

  // ─── Connected state ───
  if (step === 'success') {
    return (
      <View>
        <View style={[s.card, { backgroundColor: card, borderColor: border }]}>
          <View style={s.connectedRow}>
            <View style={s.connectedIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#25d366" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.connectedTitle, { color: text }]}>WhatsApp connected</Text>
              <Text style={[s.connectedNum, { color: subtle }]}>+{user?.whatsappNumber || phone}</Text>
            </View>
            <TouchableOpacity onPress={() => { setStep('input'); setCode(''); setError(''); }}>
              <Text style={[s.changeLink, { color: tint }]}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[s.infoBox, { backgroundColor: `${tint}06` }]}>
          <Ionicons name="information-circle-outline" size={16} color={tint} />
          <Text style={[s.infoText, { color: subtle }]}>
            Booking notifications, guest messages, and check-in reminders are sent to this number.
          </Text>
        </View>

        {message ? <Text style={[s.successMsg, { color: '#25d366' }]}>{message}</Text> : null}
      </View>
    );
  }

  // ─── Input step (enter phone) ───
  if (step === 'input') {
    return (
      <View>
        <Text style={[s.heading, { color: text }]}>Connect WhatsApp</Text>
        <Text style={[s.sub, { color: subtle }]}>
          We'll send a verification code to confirm your number. Notifications will go here.
        </Text>

        <Text style={[s.label, { color: text }]}>Your WhatsApp number</Text>
        <TextInput
          style={[s.input, { color: text, borderColor: border, backgroundColor: card }]}
          value={phone}
          onChangeText={(t) => { setPhone(t); setError(''); }}
          placeholder="e.g. 0712345678"
          placeholderTextColor={subtle}
          keyboardType="phone-pad"
        />

        {error ? <Text style={s.error}>{error}</Text> : null}

        <TouchableOpacity style={[s.primaryBtn, { backgroundColor: '#25d366', opacity: loading ? 0.6 : 1 }]} onPress={handleInitiate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <View style={s.btnInner}>
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
              <Text style={s.primaryBtnText}>Send verification code</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={[s.hint, { color: subtle }]}>
          A 5-digit code will be sent from{' '}
          <Text style={{ fontWeight: '600' }}>+255 703 290 148</Text> via WhatsApp.
        </Text>

        <TouchableOpacity onPress={() => setStep('code')} style={s.secondaryLink}>
          <Text style={[s.secondaryText, { color: tint }]}>I already have a code</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Code step (enter verification code) ───
  return (
    <View>
      <Text style={[s.heading, { color: text }]}>Enter verification code</Text>
      <Text style={[s.sub, { color: subtle }]}>
        We sent a 5-digit code to{' '}
        <Text style={{ fontWeight: '600' }}>+{phone}</Text> via WhatsApp.
      </Text>

      <TextInput
        style={[s.codeInput, { color: text, borderColor: border, backgroundColor: card }]}
        value={code}
        onChangeText={(t) => { setCode(t.replace(/\D/g, '').slice(0, 5)); setError(''); }}
        placeholder="12345"
        placeholderTextColor={subtle}
        keyboardType="number-pad"
        maxLength={5}
        textAlign="center"
        autoFocus
      />

      {error ? <Text style={s.error}>{error}</Text> : null}

      <TouchableOpacity style={[s.primaryBtn, { backgroundColor: tint, opacity: loading || code.length !== 5 ? 0.5 : 1 }]} onPress={handleConfirm} disabled={loading || code.length !== 5}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Verify & connect</Text>}
      </TouchableOpacity>

      <View style={s.codeActions}>
        <TouchableOpacity onPress={handleInitiate} disabled={loading}>
          <Text style={[s.secondaryText, { color: tint }]}>Resend code</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setStep('input'); setError(''); setCode(''); }}>
          <Text style={[s.secondaryText, { color: subtle }]}>Change number</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={s.waLink} onPress={() => Linking.openURL(`https://wa.me/${NDOTONI_WHATSAPP}?text=associate`)}>
        <Ionicons name="logo-whatsapp" size={16} color="#25d366" />
        <Text style={s.waLinkText}>Didn't get it? Message us on WhatsApp</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  sub: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 17, fontWeight: '500', letterSpacing: 0.5 },
  codeInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 28, fontWeight: '700', letterSpacing: 8 },
  error: { color: '#ef4444', fontSize: 13, marginTop: 8 },
  primaryBtn: { marginTop: 18, paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hint: { fontSize: 12, lineHeight: 18, marginTop: 14, textAlign: 'center' },
  secondaryLink: { marginTop: 16, alignItems: 'center' },
  secondaryText: { fontSize: 14, fontWeight: '600' },
  codeActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  waLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24, paddingVertical: 10 },
  waLinkText: { fontSize: 13, color: '#25d366', fontWeight: '500' },

  // Connected state
  card: { borderRadius: 14, borderWidth: 1, padding: 16 },
  connectedRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  connectedIcon: {},
  connectedTitle: { fontSize: 16, fontWeight: '600' },
  connectedNum: { fontSize: 14, marginTop: 2 },
  changeLink: { fontSize: 14, fontWeight: '600' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 14, padding: 12, borderRadius: 10 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  successMsg: { fontSize: 13, marginTop: 10, textAlign: 'center', fontWeight: '500' },
});
