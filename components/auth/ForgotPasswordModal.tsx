import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Reanimated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AnimatedPressable from '@/components/ui/AnimatedPressable';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOverlayModal } from '@/hooks/useOverlayModal';
import { useFocusBorderStyle } from '@/hooks/useFocusBorderStyle';
import { getSafeErrorMessage } from '@/lib/utils/errorUtils';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onCodeSent: (email: string) => void;
}

export default function ForgotPasswordModal({
  visible,
  onClose,
  onCodeSent,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const inputBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const placeholderColor = useThemeColor({}, 'textTertiary');

  const { forgotPassword } = useAuth();
  const { showAlert } = useAlert();
  const { shouldRender, fadeAnim, slideAnim } = useOverlayModal(visible, onClose);
  const emailFocus = useFocusBorderStyle(borderColor, tintColor);

  const handleSubmit = async () => {
    if (!email) {
      showAlert({ title: 'Email required', message: 'Please enter your email address', icon: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      showAlert({
        title: 'Check your email',
        message: `We sent a password reset link to ${email}`,
        icon: 'success',
        buttons: [
          {
            text: 'OK',
            onPress: () => {
              onCodeSent(email);
              setEmail('');
            },
          },
        ],
      });
    } catch (error: any) {
      showAlert({ title: 'Error', message: getSafeErrorMessage(error, 'sending reset email'), icon: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.fill}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View style={[styles.modalContent, { backgroundColor, transform: [{ translateY: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Reset Password
            </Text>
            <AnimatedPressable onPress={onClose} style={styles.closeButton} pressedScale={0.85} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={28} color={textColor} />
            </AnimatedPressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Instructions */}
            <Text style={[styles.instructions, { color: placeholderColor }]}>
              Enter your email address and we'll send you a link to reset your
              password.
            </Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: textColor }]}>Email</Text>
              <Reanimated.View style={[styles.input, { backgroundColor: inputBg }, emailFocus.style]}>
                <TextInput
                  style={{ color: textColor, fontSize: 16 }}
                  placeholder="Enter your email"
                  placeholderTextColor={placeholderColor}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={emailFocus.onFocus}
                  onBlur={emailFocus.onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Reanimated.View>
            </View>

            {/* Submit Button */}
            <AnimatedPressable
              style={[styles.submitButton, { backgroundColor: tintColor }]}
              pressedScale={0.97}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Send Reset Link</Text>
              )}
            </AnimatedPressable>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
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
    maxHeight: '70%',
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
  instructions: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
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
