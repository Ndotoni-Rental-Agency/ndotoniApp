import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOverlayModal } from '@/hooks/useOverlayModal';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getSafeErrorMessage } from '@/lib/utils/errorUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
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
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const inputBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  const { signIn, signInWithSocial, isAuthenticated } = useAuth();
  const { showAlert } = useAlert();
  const { shouldRender, fadeAnim } = useOverlayModal(visible, onClose);

  // Auto-close modal when auth state changes to authenticated (covers both platforms)
  useEffect(() => {
    if (isAuthenticated && visible && isSocialLoading) {
      setIsSocialLoading(false);
      onClose();
    }
  }, [isAuthenticated, visible, isSocialLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignIn = async () => {
    if (!email || !password) {
      showAlert({ title: 'Missing info', message: 'Please enter email and password', icon: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[SignInModal] Starting sign in for:', email);
      await signIn(email, password);
      console.log('[SignInModal] Sign in successful');
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
        const message = error.codeResent 
          ? 'Your account needs to be verified. A new verification code has been sent to your email.'
          : 'Your account needs to be verified. Please check your email for the verification code.';
        
        showAlert({
          title: 'Email Not Verified',
          message,
          icon: 'warning',
          buttons: [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Verify Now',
              onPress: () => {
                onNeedsVerification(email);
                onClose();
              },
            },
          ],
        });
      } else if (error.name === 'NotAuthorizedException') {
        showAlert({ title: 'Sign In Failed', message: 'Incorrect email or password. Please try again.', icon: 'error' });
      } else if (error.name === 'UserNotFoundException') {
        showAlert({ title: 'Sign In Failed', message: 'No account found with this email. Please sign up first.', icon: 'error' });
      } else if (error.name === 'Unknown' || !error.name) {
        // Check if it's the react-native linking issue
        const underlyingMessage = error?.underlyingError?.message || '';
        const combinedMessage = `${error?.message || ''} ${underlyingMessage}`.toLowerCase();
        if (underlyingMessage.includes('@aws-amplify/react-native') || underlyingMessage.includes('Expo Go')) {
          showAlert({
            title: 'Development Build Required',
            message: 'Email/password sign-in requires a development build and cannot work with Expo Go.\n\nPlease use "Continue with Google" to sign in, or create a development build with:\n\nnpx expo run:ios\nor\nnpx expo run:android',
            icon: 'info',
          });
        } else if (/network|fetch|timeout|offline|internet/.test(combinedMessage)) {
          // Genuinely unreachable — don't guess at a config problem when it's just connectivity
          showAlert({ title: 'No Connection', message: "We couldn't reach the server. Check your internet connection and try again.", icon: 'error' });
        } else {
          // Unrecognized error — show what actually happened instead of guessing
          showAlert({ title: 'Sign In Error', message: getSafeErrorMessage(error, 'signing in'), icon: 'error' });
        }
      } else {
        // Show user-friendly error message
        showAlert({ title: 'Sign In Error', message: getSafeErrorMessage(error, 'signing in'), icon: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSocialLoading(true);
    try {
      await signInWithSocial('google');
      // On iOS, this resolves after auth completes. Close the modal.
      onClose();
    } catch (error: any) {
      setIsSocialLoading(false);
      showAlert({ title: 'Sign In Error', message: getSafeErrorMessage(error, 'signing in with Google'), icon: 'error' });
    }
  };

  const handleAppleSignIn = async () => {
    setIsSocialLoading(true);
    try {
      await signInWithSocial('apple');
      onClose();
    } catch (error: any) {
      setIsSocialLoading(false);
      showAlert({ title: 'Sign In Error', message: getSafeErrorMessage(error, 'signing in with Apple'), icon: 'error' });
    }
  };

  const handleFacebookSignIn = async () => {
    setIsSocialLoading(true);
    try {
      await signInWithSocial('facebook');
      onClose();
    } catch (error: any) {
      setIsSocialLoading(false);
      showAlert({ title: 'Sign In Error', message: getSafeErrorMessage(error, 'signing in with Facebook'), icon: 'error' });
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
        <View style={[styles.modalContent, { backgroundColor }]}>
          {/* Social sign-in loading overlay */}
          {isSocialLoading && (
            <View style={[styles.loadingOverlay, { backgroundColor }]}>
              <View style={[styles.loadingCard, { backgroundColor: inputBg, borderColor }]}>
                <ActivityIndicator size="large" color={tintColor} />
                <Text style={[styles.loadingText, { color: textColor }]}>Signing you in...</Text>
                <Text style={[styles.loadingSubtext, { color: placeholderColor }]}>Please wait while we set things up</Text>
              </View>
            </View>
          )}

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Sign In</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Close">
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

            {/* Apple Sign In */}
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: inputBg, borderColor }]}
              onPress={handleAppleSignIn}
            >
              <Ionicons name="logo-apple" size={20} color={textColor} />
              <Text style={[styles.socialButtonText, { color: textColor }]}>Continue with Apple</Text>
            </TouchableOpacity>

            {/* Facebook Sign In - disabled until Consumer app is created */}
            {process.env.EXPO_PUBLIC_ENABLE_FACEBOOK_SIGNIN === 'true' && (
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: inputBg, borderColor }]}
              onPress={handleFacebookSignIn}
            >
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              <Text style={[styles.socialButtonText, { color: textColor }]}>Continue with Facebook</Text>
            </TouchableOpacity>
            )}

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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  loadingCard: {
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 17,
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
  },
});
