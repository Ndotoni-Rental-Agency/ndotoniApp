import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from './AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { GraphQLClient } from '@/lib/graphql-client';

interface PushNotificationContextType {
  expoPushToken: string | null;
  error: string | null;
}

const PushNotificationContext = createContext<PushNotificationContextType>({
  expoPushToken: null,
  error: null,
});

export function usePushNotificationContext() {
  return useContext(PushNotificationContext);
}

// GraphQL mutation to register the push token with the backend
const registerPushTokenMutation = /* GraphQL */ `
  mutation RegisterPushToken($token: String!) {
    registerPushToken(token: $token) {
      success
      message
    }
  }
`;

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const { expoPushToken, error, registerForPushNotifications } = usePushNotifications();
  const lastRegisteredToken = useRef<string | null>(null);
  const appState = useRef(AppState.currentState);

  /**
   * Send the push token to the backend so it can be stored with the user record.
   */
  const registerTokenWithBackend = useCallback(async (token: string) => {
    if (lastRegisteredToken.current === token) {
      console.log('[PushNotification] Token already registered, skipping');
      return;
    }

    try {
      console.log('[PushNotification] Registering token with backend...');
      await GraphQLClient.executeAuthenticated<{ registerPushToken: { success: boolean; message: string } }>(
        registerPushTokenMutation,
        { token }
      );
      lastRegisteredToken.current = token;
      console.log('[PushNotification] Token registered successfully');
    } catch (err) {
      console.error('[PushNotification] Failed to register token with backend:', err);
    }
  }, []);

  /**
   * Full registration flow: get permission, get token, send to backend.
   */
  const initializePushNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    const token = await registerForPushNotifications();
    if (token) {
      await registerTokenWithBackend(token);
    }
  }, [isAuthenticated, user, registerForPushNotifications, registerTokenWithBackend]);

  // Register when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      initializePushNotifications();
    } else {
      // Clear registered token on logout
      lastRegisteredToken.current = null;
    }
  }, [isAuthenticated, user, initializePushNotifications]);

  // Re-register when app comes back to foreground (token may have changed)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (isAuthenticated && user) {
          initializePushNotifications();
        }
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isAuthenticated, user, initializePushNotifications]);

  return (
    <PushNotificationContext.Provider value={{ expoPushToken, error }}>
      {children}
    </PushNotificationContext.Provider>
  );
}
