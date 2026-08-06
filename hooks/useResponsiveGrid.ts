import { useWindowDimensions } from 'react-native';

// Width thresholds for stepping up column count. iPad mini portrait is
// ~744pt, 11"/13" portrait ~834-1032pt, and any landscape orientation is
// comfortably above 900 — so phones always land in the 2-column tier
// regardless of size, while iPads pick up 3 or 4 columns.
const BREAKPOINTS = { medium: 600, large: 900 } as const;

interface Options {
  /** Total horizontal space reserved outside the cards (both side paddings combined). Default 32. */
  horizontalPadding?: number;
  /** Space between adjacent cards in a row. Default 16. */
  columnGap?: number;
}

/**
 * Picks a column count and per-card width from the current window width, so
 * grids that hardcoded "2 columns" can instead widen to 3-4 on tablets
 * instead of just stretching 2 oversized cards across the screen.
 */
export function useResponsiveGrid(options?: Options) {
  const { width, height } = useWindowDimensions();
  const horizontalPadding = options?.horizontalPadding ?? 32;
  const columnGap = options?.columnGap ?? 16;

  const isTablet = width >= BREAKPOINTS.medium;
  const numColumns = width >= BREAKPOINTS.large ? 4 : width >= BREAKPOINTS.medium ? 3 : 2;
  const cardWidth = (width - horizontalPadding - columnGap * (numColumns - 1)) / numColumns;

  return { width, height, isTablet, numColumns, cardWidth };
}
