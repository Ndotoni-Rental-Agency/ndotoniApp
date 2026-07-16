import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// Load polyfills FIRST before any other imports
import '@/polyfills';

import { AuthProvider } from '@/contexts/AuthContext';
import { AlertProvider } from '@/contexts/AlertContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import ErrorBoundary from '@/components/ErrorBoundary';

// Initialize Amplify configuration
import '@/lib/amplify';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { colorScheme } = useTheme();

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="bookings" options={{ headerShown: false }} />
        <Stack.Screen 
          name="landlord" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen name="short-property/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="conversation/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
        <Stack.Screen name="profile/favorites" options={{ headerShown: false }} />
        <Stack.Screen name="profile/settings" options={{ headerShown: false }} />
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ChatProvider>
            <AlertProvider>
              <ErrorBoundary>
                <RootLayoutContent />
              </ErrorBoundary>
            </AlertProvider>
          </ChatProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
