/**
 * ndotoni Stays color palette and typography.
 * Brand colors aligned with ndotonistays web app (green/emerald brand).
 */

import { Platform } from 'react-native';

// Brand green sampled directly from the ndotoni app icon/logo (#00ce54) — not a generic
// Tailwind green. Kept identical across light/dark so the accent reads as "ndotoni" no
// matter the theme, the same way the logo itself never changes shade.
const tintColorLight = '#00ce54'; // brand-600
const tintColorDark = '#00ce54'; // brand-600

export const Colors = {
  light: {
    text: '#0f172a', // ink-900
    background: '#fff',
    tint: tintColorLight,
    icon: '#64748b', // ink-500
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorLight,
    // Semantic tokens for consistent surfaces/text hierarchy across the app.
    // Anchored to the Ink scale so every screen shares the same cool-gray undertone.
    textSecondary: '#64748b', // ink-500
    textTertiary: '#94a3b8', // ink-400 (placeholders, least-prominent text)
    border: '#e2e8f0', // ink-200
    card: '#ffffff', // elevated surface (modals, cards, inputs)
  },
  dark: {
    text: '#f1f5f9', // ink-100
    background: '#000000',
    tint: tintColorDark,
    icon: '#94a3b8', // ink-400
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorDark,
    textSecondary: '#94a3b8', // ink-400
    textTertiary: '#64748b', // ink-500 (placeholders, least-prominent text)
    border: '#1e293b', // ink-800
    card: '#1c1c1e', // elevated surface (modals, cards, inputs)
  },
};

// Extended brand palette for component usage — generated from the true logo green (#00ce54
// at 600) rather than a generic Tailwind scale, so every tint of green in the app traces
// back to the same source as the icon.
export const Brand = {
  50: '#f0fcf5',
  100: '#ddf8e8',
  200: '#b9f4d1',
  300: '#7ef1ad',
  400: '#34f482',
  500: '#00f062',
  600: '#00ce54', // = logo green
  700: '#00a845',
  800: '#037c35',
  900: '#075025',
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
