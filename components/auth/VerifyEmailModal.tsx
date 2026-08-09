import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedPressable from '@/components/ui/AnimatedPressable';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOverlayModal } from '@/hooks/useOverlayModal';
import { getSafeErrorMessage } from '@/lib/utils/errorUtils';

interface VerifyEmailModalProps {
  visible: boolean;
  onClose: () => void;
  email: string;
  onVerified: () => void;
}

/**
 * Shown right after sign-up (or when signing in to an unverified account).
 * Verification is link-based now: Cognito emails a deep link
 * (ndotoniapp://auth/verify-email?...) that lands on app/auth/verify-email.tsx
 * and confirms silently, so this modal just tells the user to check their
 * email instead of asking them to type a code.
 */
export default function VerifyEmailModal({
  visible,
  onClose,
  email,
  onVerified,
}: VerifyEmailModalProps) {
  const [isResending, setIsResending] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const placeholderColor = useThemeColor({}, 'textTertiary');

  const { resendVerificationCode } = useAuth();
  const { showAlert } = useAlert();
  const { shouldRender, fadeAnim, slideAnim } = useOverlayModal(visible, onClose);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerificationCode(email);
      showAlert({ title: 'Success', message: 'Confirmation link resent to your email', icon: 'success' });
    } catch (error: any) {
      showAlert({ title: 'Error', message: getSafeErrorMessage(error, 'resending confirmation email'), icon: 'error' });
    } finally {
      setIsResending(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
      <View style={styles.fill}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View style={[styles.modalContent, { backgroundColor, transform: [{ translateY: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Check your email
            </Text>
            <AnimatedPressable onPress={onClose} style={styles.closeButton} pressedScale={0.85} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={28} color={textColor} />
            </AnimatedPressable>
          </View>

          <View style={[styles.infoBox, { backgroundColor: `${tintColor}20`, borderColor: `${tintColor}40` }]}>
            <Text style={[styles.infoText, { color: textColor }]}>
              We sent a confirmation link to{' '}
              <Text style={styles.emailText}>{email}</Text>. Tap it to activate your account, then sign in.
            </Text>
          </View>

          <AnimatedPressable
            style={[styles.submitButton, { backgroundColor: tintColor }]}
            pressedScale={0.97}
            onPress={() => {
              onVerified();
            }}
          >
            <Text style={styles.submitButtonText}>Got it</Text>
          </AnimatedPressable>

          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: placeholderColor }]}>
              Didn't receive the link?{' '}
            </Text>
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              <Text style={[styles.resendLink, { color: tintColor }]}>
                {isResending ? 'Sending...' : 'Resend'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 4,
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
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
