import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/AuthContext';

interface ResetPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  email: string;
  onReset: () => void;
}

export default function ResetPasswordModal({
  visible,
  onClose,
  email,
  onReset,
}: ResetPasswordModalProps) {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const inputBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  const { resetPassword } = useAuth();

  const handleReset = async () => {
    if (!code || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email, code, newPassword);
      Alert.alert(
        'Success',
        'Password reset successfully! You can now sign in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              onReset();
              setCode('');
              setNewPassword('');
              setConfirmPassword('');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Password reset failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.modalContent, { backgroundColor }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Reset Password
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Email Info */}
            <View style={[styles.infoBox, { backgroundColor: `${tintColor}20`, borderColor: `${tintColor}40` }]}>
              <Text style={[styles.infoText, { color: textColor }]}>
                Enter the code sent to{' '}
                <Text style={styles.emailText}>{email}</Text>
              </Text>
            </View>

            {/* Code Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: textColor }]}>
                Verification Code
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, backgroundColor: inputBg, borderColor },
                ]}
                placeholder="Enter 6-digit code"
                placeholderTextColor={placeholderColor}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: textColor }]}>
                New Password
              </Text>
              <View
                style={[
                  styles.passwordContainer,
                  { backgroundColor: inputBg, borderColor },
                ]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: textColor }]}
                  placeholder="At least 8 characters"
                  placeholderTextColor={placeholderColor}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color={placeholderColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: textColor }]}>
                Confirm Password
              </Text>
              <View
                style={[
                  styles.passwordContainer,
                  { backgroundColor: inputBg, borderColor },
                ]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: textColor }]}
                  placeholder="Re-enter password"
                  placeholderTextColor={placeholderColor}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color={placeholderColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: tintColor }]}
              onPress={handleReset}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
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
    maxHeight: '85%',
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
  inputContainer: {
    marginBottom: 20,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 16,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
