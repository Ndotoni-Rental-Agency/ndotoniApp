import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BrandLoader from '@/components/ui/BrandLoader';

type Status = 'confirming' | 'success' | 'error' | 'missing-params';

/**
 * Deep-link landing screen for `ndotoniapp://auth/verify-email?email=...&code=...`.
 * The CustomMessage Cognito trigger emails this link instead of a raw code
 * when the sign-up/resend request was tagged with clientMetadata.platform
 * === 'ndotoniapp'. Mirrors app/auth/callback.tsx's shape.
 */
export default function VerifyEmailScreen() {
  const router = useRouter();
  const { verifyEmail } = useAuth();
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const [status, setStatus] = useState<Status>('confirming');
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (!url) {
          setStatus('missing-params');
          return;
        }

        const { queryParams } = Linking.parse(url);
        const email = typeof queryParams?.email === 'string' ? queryParams.email : undefined;
        const code = typeof queryParams?.code === 'string' ? queryParams.code : undefined;

        if (!email || !code) {
          setStatus('missing-params');
          return;
        }

        await verifyEmail(email, code);
        setStatus('success');
      } catch (err: any) {
        setError(err?.message || 'This link may have expired. Try signing up again to get a new one.');
        setStatus('error');
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'confirming') {
    return (
      <View style={styles.container}>
        <BrandLoader />
        <Text style={[styles.text, { color: textColor }]}>Confirming your email...</Text>
      </View>
    );
  }

  const isSuccess = status === 'success';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>
        {isSuccess ? 'Email confirmed' : status === 'missing-params' ? 'Invalid confirmation link' : "Couldn't confirm your email"}
      </Text>
      <Text style={[styles.text, { color: textColor }]}>
        {isSuccess
          ? 'Your account is ready. Sign in to get started.'
          : status === 'missing-params'
            ? 'This link is missing some information. Open it directly from your confirmation email.'
            : error}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: tintColor }]}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.buttonText}>{isSuccess ? 'Go to ndotoni' : 'Back to ndotoni'}</Text>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
