/**
 * Push Notifications Hook
 *
 * Uses expo-notifications for push token registration and notification handling.
 * Gracefully no-ops when running in Expo Go (where the native module isn't available).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

// Lazy-load expo-notifications and expo-device to avoid bundler crash in Expo Go
let Notifications: typeof import('expo-notifications') | null = null;
let Device: typeof import('expo-device') | null = null;

try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');

  // Configure foreground notification behavior
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (e) {
  console.log('[PushNotifications] expo-notifications not available (Expo Go?). Push notifications disabled.');
}

export interface PushNotificationState {
  expoPushToken: string | null;
  notification: any | null;
  error: string | null;
}

/**
 * Hook to manage push notification registration, permissions, and listeners.
 * Returns the Expo push token and handles notification tap navigation.
 * No-ops gracefully when expo-notifications is unavailable (Expo Go).
 */
export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const router = useRouter();

  /**
   * Register for push notifications and return the Expo push token.
   */
  const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
    if (!Notifications || !Device) {
      console.log('[PushNotifications] Native module not available, skipping registration');
      return null;
    }

    try {
      // Push notifications only work on physical devices
      if (!Device.isDevice) {
        console.log('[PushNotifications] Must use physical device for push notifications');
        setError('Push notifications require a physical device');
        return null;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[PushNotifications] Permission not granted');
        setError('Push notification permission was not granted');
        return null;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'b77e1d8b-2cdb-4d4e-aba1-5f755f2bae26',
      });

      const token = tokenData.data;
      console.log('[PushNotifications] Token obtained:', token);
      setExpoPushToken(token);
      setError(null);

      // Android-specific notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('messages', {
          name: 'Messages',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#16a34a',
          sound: 'default',
        });
      }

      return token;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[PushNotifications] Registration error:', errorMessage);
      setError(errorMessage);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!Notifications) return;

    // Listen for incoming notifications (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notif: any) => {
        console.log('[PushNotifications] Notification received:', notif.request.content.title);
        setNotification(notif);
      }
    );

    // Listen for notification taps (user interaction)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        const data = response.notification.request.content.data;
        console.log('[PushNotifications] Notification tapped, data:', data);

        // Navigate to the conversation when a message notification is tapped
        if (data?.conversationId) {
          const encodedId = encodeURIComponent(data.conversationId);
          router.push(`/conversation/${encodedId}` as any);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);

  return {
    expoPushToken,
    notification,
    error,
    registerForPushNotifications,
  };
}
