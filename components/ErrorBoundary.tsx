import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { Component, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches JS errors in child components and shows a fallback UI
 * instead of crashing the whole app.
 */
class ErrorBoundaryClass extends Component<Props & { onReset: () => void; colorScheme: string }, State> {
  constructor(props: Props & { onReset: () => void; colorScheme: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      const isDark = this.props.colorScheme === 'dark';
      const bg = isDark ? '#000' : '#fff';
      const text = isDark ? '#f5f5f5' : '#1a1a1a';
      const subtext = isDark ? '#888' : '#666';
      const buttonBg = isDark ? '#1c1c1e' : '#f3f4f6';
      const border = isDark ? '#2c2c2e' : '#e5e7eb';

      return (
        <View style={[styles.container, { backgroundColor: bg }]}>
          <Ionicons name="warning-outline" size={48} color={subtext} />
          <Text style={[styles.title, { color: text }]}>Something went wrong</Text>
          <Text style={[styles.message, { color: subtext }]}>
            An unexpected error occurred. You can try going back or restarting the page.
          </Text>
          {__DEV__ && this.state.error && (
            <View style={[styles.errorBox, { backgroundColor: buttonBg, borderColor: border }]}>
              <Text style={[styles.errorLabel, { color: subtext }]}>Debug info (dev only):</Text>
              <Text style={[styles.errorText, { color: subtext }]} numberOfLines={4}>
                {this.state.error.message}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: buttonBg, borderColor: border }]}
            onPress={this.resetError}
          >
            <Text style={[styles.buttonText, { color: text }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

/** Functional wrapper so we can use hooks (router, colorScheme) */
export default function ErrorBoundary({ children }: Props) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  const handleReset = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  return (
    <ErrorBoundaryClass onReset={handleReset} colorScheme={colorScheme}>
      {children}
    </ErrorBoundaryClass>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  errorBox: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    width: '100%',
  },
  errorLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  button: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
