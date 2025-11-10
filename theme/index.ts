import { colors } from './colors';

export type { Colors } from './colors';

// Simple theme object
export const theme = {
  colors,
} as const;

export type Theme = typeof theme;

// Default export
export default theme;

