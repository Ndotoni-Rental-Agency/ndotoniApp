import { useTheme } from '@/contexts/ThemeContext';

export function useColorScheme() {
  try {
    const { colorScheme } = useTheme();
    return colorScheme;
  } catch {
    // Fallback if used outside ThemeProvider
    return 'light';
  }
}
