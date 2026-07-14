import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { updateUser } from '@/lib/graphql/mutations';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HostWhatsApp() {
  const { user } = useAuth();
  const [phone, setPhone] = useState(user?.whatsappNumber || user?.phoneNumber || '');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(!user?.whatsappNumber);

  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ebebeb', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const handleSave = async () => {
    let normalized = phone.replace(/\D/g, '');
    if (normalized.startsWith('0') && normalized.length === 10) normalized = '255' + normalized.slice(1);
    else if (normalized.length === 9 && /^[67]/.test(normalized)) normalized = '255' + normalized;

    if (normalized.length < 10) { Alert.alert('Invalid', 'Enter a valid WhatsApp number'); return; }

    setSaving(true);
    try {
      await GraphQLClient.executeAuthenticated<any>(updateUser, { input: { whatsappNumber: normalized } });
      Alert.alert('✅ Saved', 'WhatsApp number updated. Guests and booking notifications will be sent here.');
      setEditing(false);
      setPhone(normalized);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (!editing && user?.whatsappNumber) {
    return (
      <View>
        <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>
          <View style={styles.row}>
            <Ionicons name="logo-whatsapp" size={28} color="#25d366" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: text }]}>WhatsApp Connected</Text>
              <Text style={[styles.number, { color: subtle }]}>+{user.whatsappNumber}</Text>
            </View>
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={[{ color: tint, fontWeight: '600', fontSize: 14 }]}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: `${tint}08`, borderColor: `${tint}20` }]}>
          <Ionicons name="information-circle-outline" size={16} color={tint} />
          <Text style={[styles.infoText, { color: text }]}>
            Booking notifications, guest messages, and check-in reminders will be sent to this number.
          </Text>
        </View>

        <TouchableOpacity style={[styles.testBtn, { borderColor: '#25d366' }]} onPress={() => Linking.openURL(`https://wa.me/${user.whatsappNumber}`)}>
          <Ionicons name="logo-whatsapp" size={18} color="#25d366" />
          <Text style={{ color: '#25d366', fontSize: 14, fontWeight: '600' }}>Test WhatsApp</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <Text style={[styles.heading, { color: text }]}>Connect WhatsApp</Text>
      <Text style={[styles.sub, { color: subtle }]}>We'll send booking notifications and guest messages to your WhatsApp.</Text>

      <Text style={[styles.label, { color: text }]}>WhatsApp number</Text>
      <TextInput
        style={[styles.input, { color: text, borderColor: border }]}
        value={phone}
        onChangeText={setPhone}
        placeholder="e.g. 0712345678 or 255712345678"
        placeholderTextColor={subtle}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#25d366', opacity: saving ? 0.6 : 1 }]} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Connect WhatsApp</Text>
          </View>
        )}
      </TouchableOpacity>

      {user?.whatsappNumber && (
        <TouchableOpacity onPress={() => setEditing(false)} style={{ alignItems: 'center', marginTop: 12 }}>
          <Text style={[{ color: subtle, fontSize: 14 }]}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  sub: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, fontWeight: '500', letterSpacing: 0.5 },
  saveBtn: { marginTop: 20, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  card: { borderRadius: 14, borderWidth: 1, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 15, fontWeight: '600' },
  number: { fontSize: 14, marginTop: 2, fontFamily: 'monospace' },

  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 14, padding: 12, borderRadius: 10, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  testBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5 },
});
