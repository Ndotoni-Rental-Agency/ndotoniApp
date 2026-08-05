import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useOverlayModal } from '@/hooks/useOverlayModal';

interface ResetPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  email: string;
  onReset: () => void;
}

/**
 * Shown right after ForgotPasswordModal sends the reset email. Password
 * reset is link-based now: Cognito emails a deep link
 * (ndotoniapp://auth/reset-password?...) that lands on
 * app/auth/reset-password.tsx and collects the new password there, so this
 * modal just tells the user to check their email instead of asking for a
 * code + new password here.
 */
export default function ResetPasswordModal({
  visible,
  onClose,
  email,
  onReset,
}: ResetPasswordModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const { shouldRender, fadeAnim } = useOverlayModal(visible, onClose);

  if (!shouldRender) return null;

  return (
    <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
      <View style={styles.fill}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.modalContent, { backgroundColor }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Check your email
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={28} color={textColor} />
            </TouchableOpacity>
          </View>

          <View style={[styles.infoBox, { backgroundColor: `${tintColor}20`, borderColor: `${tintColor}40` }]}>
            <Text style={[styles.infoText, { color: textColor }]}>
              We sent a password reset link to{' '}
              <Text style={styles.emailText}>{email}</Text>. Tap it to choose a new password.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: tintColor }]}
            onPress={onReset}
          >
            <Text style={styles.submitButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
    elevation: 20,
  },
  fill: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emailText: {
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
