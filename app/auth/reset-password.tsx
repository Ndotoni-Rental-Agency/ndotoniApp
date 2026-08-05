import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BrandLoader from '@/components/ui/BrandLoader';

type Status = 'loading' | 'form' | 'submitting' | 'success' | 'missing-params';

/**
 * Deep-link landing screen for `ndotoniapp://auth/reset-password?email=...&code=...`.
 * Mirrors app/auth/verify-email.tsx, but a password can't be silently
 * generated, so this collects one before submitting.
 */
export default function ResetPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'icon');

  const [status, setStatus] = useState<Status>('loading');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      const url = await Linking.getInitialURL();
      if (!url) {
        setStatus('missing-params');
        return;
      }

      const { queryParams } = Linking.parse(url);
      const parsedEmail = typeof queryParams?.email === 'string' ? queryParams.email : undefined;
      const parsedCode = typeof queryParams?.code === 'string' ? queryParams.code : undefined;

      if (!parsedEmail || !parsedCode) {
        setStatus('missing-params');
        return;
      }

      setEmail(parsedEmail);
      setCode(parsedCode);
      setStatus('form');
    };

    run();
  }, []);

  async function handleSubmit() {
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError('');
    setStatus('submitting');
    try {
      await resetPassword(email, code, newPassword);
      setStatus('success');
    } catch (err: any) {
      setError(err?.message || 'This link may have expired. Request a new password reset to keep going.');
      setStatus('form');
    }
  }

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <BrandLoader />
      </View>
    );
  }

  if (status === 'missing-params') {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: textColor }]}>Invalid reset link</Text>
        <Text style={[styles.text, { color: textColor }]}>
          This link is missing some information. Open it directly from your password reset email.
        </Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: tintColor }]} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.buttonText}>Back to ndotoni</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'success') {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: textColor }]}>Password updated</Text>
        <Text style={[styles.text, { color: textColor }]}>You can sign in with your new password now.</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: tintColor }]} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.buttonText}>Go to ndotoni</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.formContainer]}>
      <Text style={[styles.title, { color: textColor }]}>Reset your password</Text>
      <Text style={[styles.text, { color: textColor, marginBottom: 24 }]}>Choose a new password for your account.</Text>

      <TextInput
        style={[styles.input, { color: textColor, borderColor }]}
        placeholder="New password (min 8 characters)"
        placeholderTextColor={`${textColor}80`}
        secureTextEntry
        autoCapitalize="none"
        value={newPassword}
        onChangeText={setNewPassword}
        editable={status !== 'submitting'}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, styles.submitButton, { backgroundColor: tintColor }]}
        onPress={handleSubmit}
        disabled={status === 'submitting'}
      >
        <Text style={styles.buttonText}>{status === 'submitting' ? 'Updating...' : 'Update password'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 32,
  },
  formContainer: {
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  text: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButton: {
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
