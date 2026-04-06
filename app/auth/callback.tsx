import { handleAuthCallback } from '@/lib/auth/oidc-manager';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/**
 * OAuth callback route handler for Android.
 * On Android, the OAuth redirect (ndotoniapp://auth/callback?code=...)
 * is handled by Expo Router as a deep link. This route catches it,
 * exchanges the auth code for tokens, reloads auth state, and
 * navigates back to the main app — all seamlessly.
 */
export default function AuthCallback() {
  const router = useRouter();
  const { reloadAuth } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const url = await Linking.getInitialURL();
        
        if (url && url.includes('code=')) {
          console.log('[AuthCallback] Processing OAuth callback');
          await handleAuthCallback(url);
          // Re-initialize auth so the user is fully loaded before navigating
          await reloadAuth();
          console.log('[AuthCallback] Auth complete');
        } else {
          console.warn('[AuthCallback] No auth code found in URL');
        }
      } catch (error) {
        console.error('[AuthCallback] Error:', error);
      } finally {
        router.replace('/(tabs)');
      }
    };

    processCallback();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.text}>Signing you in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
