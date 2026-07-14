import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { updateUser } from '@/lib/graphql/mutations';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type PayoutMethod = 'MPESA' | 'BANK';

export default function HostPayouts() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [method, setMethod] = useState<PayoutMethod>('MPESA');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [mpesaName, setMpesaName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ebebeb', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const u = user as any;
  const hasSaved = !!u?.payoutMethod;

  useEffect(() => {
    if (u) {
      setMethod(u.payoutMethod || 'MPESA');
      setMpesaName(u.payoutMpesaName || '');
      setBankName(u.payoutBankName || '');
      setBankAccountName(u.payoutBankAccountName || '');
      if (!u.payoutMethod) setEditing(true);
    }
  }, [u]);

  const handleSave = async () => {
    if (method === 'MPESA') {
      const digits = mpesaPhone.replace(/\D/g, '');
      if (digits.length < 9) { Alert.alert('Invalid', 'Enter a valid M-Pesa number'); return; }
      if (!mpesaName.trim()) { Alert.alert('Required', 'Enter M-Pesa name'); return; }
    } else {
      if (!bankName || !bankAccountName || !bankAccount) { Alert.alert('Required', 'Fill all bank details'); return; }
    }

    setSaving(true);
    try {
      let phone = mpesaPhone.replace(/\D/g, '');
      if (phone.startsWith('0') && phone.length === 10) phone = '255' + phone.slice(1);
      else if (phone.length === 9 && /^[67]/.test(phone)) phone = '255' + phone;

      const input: any = { payoutMethod: method };
      if (method === 'MPESA') {
        input.payoutMpesaPhone = phone;
        input.payoutMpesaName = mpesaName.trim();
      } else {
        input.payoutBankName = bankName;
        input.payoutBankAccountName = bankAccountName;
        input.payoutBankAccountNumber = bankAccount;
      }

      await GraphQLClient.executeAuthenticated<any>(updateUser, { input });
      Alert.alert('✅ Saved', 'Payout details updated');
      setEditing(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  // Saved display
  if (hasSaved && !editing) {
    return (
      <View>
        <View style={[styles.savedCard, { backgroundColor: card, borderColor: border }]}>
          <View style={styles.savedHeader}>
            <Text style={{ fontSize: 24 }}>{u.payoutMethod === 'MPESA' ? '📱' : '🏦'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.savedTitle, { color: text }]}>{u.payoutMethod === 'MPESA' ? 'M-Pesa' : 'Bank Transfer'}</Text>
              <Text style={[{ fontSize: 12, color: tint }]}>Connected ✓</Text>
            </View>
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={[{ color: tint, fontSize: 14, fontWeight: '600' }]}>Edit</Text>
            </TouchableOpacity>
          </View>
          {u.payoutMethod === 'MPESA' && (
            <View style={styles.savedDetails}>
              <Text style={[styles.savedLine, { color: subtle }]}>Name: {u.payoutMpesaName || '—'}</Text>
              <Text style={[styles.savedLine, { color: subtle }]}>Number: {u.payoutMpesaPhone || '—'}</Text>
            </View>
          )}
          {u.payoutMethod === 'BANK' && (
            <View style={styles.savedDetails}>
              <Text style={[styles.savedLine, { color: subtle }]}>Bank: {u.payoutBankName || '—'}</Text>
              <Text style={[styles.savedLine, { color: subtle }]}>Account: {u.payoutBankAccountName || '—'}</Text>
            </View>
          )}
        </View>
        <View style={[styles.note, { backgroundColor: `${border}` }]}>
          <Ionicons name="lock-closed-outline" size={14} color={subtle} />
          <Text style={[{ fontSize: 12, color: subtle, flex: 1 }]}>Payouts are sent within 24h after guest checkout</Text>
        </View>
      </View>
    );
  }

  // Edit form
  return (
    <View>
      <Text style={[styles.heading, { color: text }]}>Payout method</Text>
      <View style={styles.methodRow}>
        <TouchableOpacity style={[styles.methodCard, { borderColor: method === 'MPESA' ? tint : border, backgroundColor: method === 'MPESA' ? `${tint}08` : card }]} onPress={() => setMethod('MPESA')}>
          <Text style={{ fontSize: 24 }}>📱</Text>
          <Text style={[styles.methodLabel, { color: text }]}>M-Pesa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.methodCard, { borderColor: method === 'BANK' ? tint : border, backgroundColor: method === 'BANK' ? `${tint}08` : card }]} onPress={() => setMethod('BANK')}>
          <Text style={{ fontSize: 24 }}>🏦</Text>
          <Text style={[styles.methodLabel, { color: text }]}>Bank</Text>
        </TouchableOpacity>
      </View>

      {method === 'MPESA' ? (
        <>
          <Text style={[styles.label, { color: text }]}>M-Pesa name</Text>
          <TextInput style={[styles.input, { color: text, borderColor: border }]} value={mpesaName} onChangeText={setMpesaName} placeholder="As registered on M-Pesa" placeholderTextColor={subtle} />
          <Text style={[styles.label, { color: text }]}>M-Pesa number</Text>
          <TextInput style={[styles.input, { color: text, borderColor: border }]} value={mpesaPhone} onChangeText={setMpesaPhone} placeholder="0712345678" placeholderTextColor={subtle} keyboardType="phone-pad" />
        </>
      ) : (
        <>
          <Text style={[styles.label, { color: text }]}>Bank name</Text>
          <TextInput style={[styles.input, { color: text, borderColor: border }]} value={bankName} onChangeText={setBankName} placeholder="e.g. CRDB Bank" placeholderTextColor={subtle} />
          <Text style={[styles.label, { color: text }]}>Account name</Text>
          <TextInput style={[styles.input, { color: text, borderColor: border }]} value={bankAccountName} onChangeText={setBankAccountName} placeholder="Name on account" placeholderTextColor={subtle} />
          <Text style={[styles.label, { color: text }]}>Account number</Text>
          <TextInput style={[styles.input, { color: text, borderColor: border }]} value={bankAccount} onChangeText={setBankAccount} placeholder="0123456789" placeholderTextColor={subtle} keyboardType="number-pad" />
        </>
      )}

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: tint, opacity: saving ? 0.6 : 1 }]} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Payout Details</Text>}
      </TouchableOpacity>
      {hasSaved && (
        <TouchableOpacity onPress={() => setEditing(false)} style={{ alignItems: 'center', marginTop: 12 }}>
          <Text style={[{ color: subtle, fontSize: 14, fontWeight: '600' }]}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  methodRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  methodCard: { flex: 1, alignItems: 'center', paddingVertical: 18, borderRadius: 14, borderWidth: 1.5, gap: 6 },
  methodLabel: { fontSize: 13, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  saveBtn: { marginTop: 24, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  savedCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  savedHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  savedTitle: { fontSize: 15, fontWeight: '600' },
  savedDetails: { marginTop: 12, gap: 4 },
  savedLine: { fontSize: 13 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 12, borderRadius: 10 },
});
