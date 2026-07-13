/**
 * ndotoni Stays color palette and typography.
 * Brand colors aligned with ndotonistays web app (green/emerald brand).
 */

import { Platform } from 'react-native';

// Brand green matching ndotonistays tailwind config
const tintColorLight = '#16a34a'; // brand-600
const tintColorDark = '#22c55e'; // brand-500

export const Colors = {
  light: {
    text: '#0f172a', // ink-900
    background: '#fff',
    tint: tintColorLight,
    icon: '#64748b', // ink-500
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f1f5f9', // ink-100
    background: '#000000',
    tint: tintColorDark,
    icon: '#94a3b8', // ink-400
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorDark,
  },
};

// Extended brand palette for component usage
export const Brand = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
};

export const Secondary = {
  50: '#FFF1F2',
  100: '#FFE4E6',
  200: '#FECDD3',
  300: '#FDA4AF',
  400: '#FB7185',
  500: '#F43F5E',
  600: '#E11D48',
  700: '#BE123C',
  800: '#9F1239',
  900: '#881337',
};

export const Ink = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
