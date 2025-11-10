export const colors = {
  // Base colors
  background: '#171616',
  surface: '#2c2c2c',
  disabled: '#525151',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#2c2c2c',
  textMuted: '#575757',
  textDisabled: '#dfdfdf',
  
  // Accent colors
  green: '#016937',
  greenMuted: '#578155',
  blue: '#273ba3',
  red: '#943d40',
  yellow: '#fbb03c',
  
  // Status colors
  success: '#016937',
  warning: '#fbb03c',
  error: '#943d40',
  info: '#273ba3',
} as const;

export type Colors = typeof colors;

