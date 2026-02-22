import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
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

interface SignUpModalProps {
  visible: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
  onNeedsVerification: (email: string) => void;
}

export default function SignUpModal({ visible, onClose, onSwitchToSignIn, onNeedsVerification }: SignUpModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const inputBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  const { signUp, signUpWithSocial } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[SignUpModal] Starting sign up for:', email);
      const result = await signUp({ email, password, firstName, lastName, phoneNumber });
      console.log('[SignUpModal] Sign up result:', result);
      
      if (result.requiresVerification) {
        // Clear form
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setPhoneNumber('');
        
        // Immediately redirect to verification
        onNeedsVerification(email);
        onClose();
      }
    } catch (error: any) {
      console.error('[SignUpModal] Sign up error:', error?.name || 'Unknown', '-', error?.message);
      
      // Show user-friendly error message
      Alert.alert(
        'Sign Up Error', 
        error?.message || 'An error occurred during sign up. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signUpWithSocial('google');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Google sign up failed');
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
            <Text style={[styles.modalTitle, { color: textColor }]}>Create Account</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Google Sign Up */}
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: inputBg, borderColor }]}
              onPress={handleGoogleSignUp}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={[styles.socialButtonText, { color: textColor }]}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
              <Text style={[styles.dividerText, { color: placeholderColor }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
            </View>

            {/* Name Inputs */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={[styles.label, { color: textColor }]}>First Name</Text>
                <TextInput
                  style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor }]}
                  placeholder="First name"
                  placeholderTextColor={placeholderColor}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={[styles.label, { color: textColor }]}>Last Name</Text>
                <TextInput
                  style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor }]}
                  placeholder="Last name"
                  placeholderTextColor={placeholderColor}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: textColor }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor }]}
                placeholder="+255 XXX XXX XXX"
                placeholderTextColor={placeholderColor}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: textColor }]}>Email</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor }]}
                placeholder="Enter your email"
                placeholderTextColor={placeholderColor}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: textColor }]}>Password</Text>
              <View style={[styles.passwordContainer, { backgroundColor: inputBg, borderColor }]}>
                <TextInput
                  style={[styles.passwordInput, { color: textColor }]}
                  placeholder="At least 8 characters"
                  placeholderTextColor={placeholderColor}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
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

            {/* Terms */}
            <Text style={[styles.termsText, { color: placeholderColor }]}>
              By signing up, you agree to our{' '}
              <Text style={[styles.termsLink, { color: tintColor }]}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={[styles.termsLink, { color: tintColor }]}>Privacy Policy</Text>
            </Text>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: tintColor }]}
              onPress={handleSignUp}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Switch to Sign In */}
            <View style={styles.switchMode}>
              <Text style={[styles.switchModeText, { color: placeholderColor }]}>Already have an account? </Text>
              <TouchableOpacity onPress={onSwitchToSignIn}>
                <Text style={[styles.switchModeLink, { color: tintColor }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
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
    maxHeight: '90%',
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
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
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
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  termsLink: {
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
  switchMode: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  switchModeText: {
    fontSize: 14,
  },
  switchModeLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
