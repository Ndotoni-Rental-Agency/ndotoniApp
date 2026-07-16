import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { type EventSubscription } from 'expo-notifications';
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: string | null;
}

/**
 * Hook to manage push notification registration, permissions, and listeners.
 * Returns the Expo push token and handles notification tap navigation.
 */
export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);
  const router = useRouter();

  /**
   * Register for push notifications and return the Expo push token.
   */
  const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
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
    // Listen for incoming notifications (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[PushNotifications] Notification received:', notification.request.content.title);
        setNotification(notification);
      }
    );

    // Listen for notification taps (user interaction)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('[PushNotifications] Notification tapped, data:', data);

        // Navigate to the conversation when a message notification is tapped
        if (data?.conversationId) {
          router.push(`/conversation/${data.conversationId}` as any);
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
