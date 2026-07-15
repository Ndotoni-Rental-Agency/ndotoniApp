import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { submitContactInquiry } from '@/lib/graphql/mutations';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ContactSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

const INQUIRY_TYPES = [
  { key: 'SUPPORT', label: 'Technical Support', icon: 'build' as const },
  { key: 'GENERAL', label: 'General Question', icon: 'help-circle' as const },
  { key: 'PROPERTY', label: 'Property Issue', icon: 'home' as const },
  { key: 'PARTNERSHIP', label: 'Partnership', icon: 'handshake' as const },
] as const;

export default function ContactSupportModal({ visible, onClose }: ContactSupportModalProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#f7f7f7', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#e5e5e5', dark: '#333' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const [inquiryType, setInquiryType] = useState<string>('SUPPORT');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState(user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = subject.trim() && message.trim() && name.trim() && email.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await GraphQLClient.executePublic(submitContactInquiry, {
        input: {
          inquiryType,
          subject: subject.trim(),
          message: message.trim(),
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
        },
      });
      Alert.alert('Sent!', 'We received your message and will get back to you soon.');
      setSubject('');
      setMessage('');
      onClose();
    } catch (err: any) {
      console.error('[ContactSupport] Error:', err);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: bg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: border, paddingTop: insets.top || 16 }]}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={24} color={text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: text }]}>Contact Support</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Inquiry Type */}
          <Text style={[styles.label, { color: text }]}>What can we help with?</Text>
          <View style={styles.typeGrid}>
            {INQUIRY_TYPES.map(type => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.typeCard,
                  { borderColor: inquiryType === type.key ? tint : border, backgroundColor: inquiryType === type.key ? `${tint}10` : card },
                ]}
                onPress={() => setInquiryType(type.key)}
                activeOpacity={0.8}
              >
                <Ionicons name={type.icon} size={20} color={inquiryType === type.key ? tint : subtle} />
                <Text style={[styles.typeLabel, { color: inquiryType === type.key ? tint : text }]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name */}
          <Text style={[styles.label, { color: text }]}>Name</Text>
          <TextInput
            style={[styles.input, { color: text, backgroundColor: card, borderColor: border }]}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={subtle}
          />

          {/* Email */}
          <Text style={[styles.label, { color: text }]}>Email</Text>
          <TextInput
            style={[styles.input, { color: text, backgroundColor: card, borderColor: border }]}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={subtle}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Phone (optional) */}
          <Text style={[styles.label, { color: text }]}>Phone (optional)</Text>
          <TextInput
            style={[styles.input, { color: text, backgroundColor: card, borderColor: border }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="+255..."
            placeholderTextColor={subtle}
            keyboardType="phone-pad"
          />

          {/* Subject */}
          <Text style={[styles.label, { color: text }]}>Subject</Text>
          <TextInput
            style={[styles.input, { color: text, backgroundColor: card, borderColor: border }]}
            value={subject}
            onChangeText={setSubject}
            placeholder="Brief description of your issue"
            placeholderTextColor={subtle}
          />

          {/* Message */}
          <Text style={[styles.label, { color: text }]}>Message</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: text, backgroundColor: card, borderColor: border }]}
            value={message}
            onChangeText={setMessage}
            placeholder="Tell us more about your issue or question..."
            placeholderTextColor={subtle}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={2000}
          />
        </ScrollView>

        {/* Submit */}
        <View style={[styles.footer, { borderTopColor: border, paddingBottom: insets.bottom || 16 }]}>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: tint, opacity: canSubmit ? 1 : 0.5 }]}
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Send Message</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  body: { padding: 24, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
    lineHeight: 22,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  typeLabel: { fontSize: 13, fontWeight: '600' },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
