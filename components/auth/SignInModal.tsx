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

interface SignInModalProps {
  visible: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
  onNeedsVerification: (email: string) => void;
}

export default function SignInModal({ visible, onClose, onSwitchToSignUp, onForgotPassword, onNeedsVerification }: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const inputBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  const { signIn, signInWithSocial } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[SignInModal] Starting sign in for:', email);
      await signIn(email, password);
      console.log('[SignInModal] Sign in successful');
      Alert.alert('Success', 'Signed in successfully!');
      onClose();
      setEmail('');
      setPassword('');
    } catch (error: any) {
      // Log full error details for debugging
      console.error('[SignInModal] Sign in error:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        underlyingError: error?.underlyingError,
        fullError: error
      });
      
      // Check if user needs email verification
      if (error.name === 'UserNotConfirmedException') {
        Alert.alert(
          'Email Not Verified',
          'Your account needs to be verified. Please check your email for the verification code.',
          [
            {
              text: 'Verify Now',
              onPress: () => {
                onNeedsVerification(email);
                onClose();
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else if (error.name === 'NotAuthorizedException') {
        Alert.alert('Sign In Failed', 'Incorrect email or password. Please try again.');
      } else if (error.name === 'UserNotFoundException') {
        Alert.alert('Sign In Failed', 'No account found with this email. Please sign up first.');
      } else if (error.name === 'Unknown' || !error.name) {
        // Check if it's the react-native linking issue
        const underlyingMessage = error?.underlyingError?.message || '';
        if (underlyingMessage.includes('@aws-amplify/react-native') || underlyingMessage.includes('Expo Go')) {
          Alert.alert(
            'Development Build Required',
            'Email/password sign-in requires a development build and cannot work with Expo Go.\n\nPlease use "Continue with Google" to sign in, or create a development build with:\n\nnpx expo run:ios\nor\nnpx expo run:android'
          );
        } else {
          // Unknown error - likely a configuration issue
          Alert.alert(
            'Sign In Error',
            'Unable to sign in. This might be a configuration issue. Please try signing in with Google or contact support.\n\nFor now, please use "Continue with Google" to sign in.'
          );
        }
      } else {
        // Show user-friendly error message
        const errorMessage = error?.message || error?.toString() || 'An error occurred during sign in';
        Alert.alert('Sign In Error', errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithSocial('google');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Google sign in failed');
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
            <Text style={[styles.modalTitle, { color: textColor }]}>Sign In</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Google Sign In */}
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: inputBg, borderColor }]}
              onPress={handleGoogleSignIn}
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
                  placeholder="Enter your password"
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

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword} onPress={onForgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: tintColor }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: tintColor }]}
              onPress={handleSignIn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Switch to Sign Up */}
            <View style={styles.switchMode}>
              <Text style={[styles.switchModeText, { color: placeholderColor }]}>Don't have an account? </Text>
              <TouchableOpacity onPress={onSwitchToSignUp}>
                <Text style={[styles.switchModeLink, { color: tintColor }]}>
                  Sign Up
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
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
