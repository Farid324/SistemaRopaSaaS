// app_movil/src/components/ui/utils.ts

import { useTheme, ThemeColors } from '../../context/ThemeContext';

export { useTheme };
export type { ThemeColors };

// Merge styles helper (like cn() but for RN StyleSheet objects)
export function mergeStyles(...styles: (object | undefined | null | false)[]): object {
  return Object.assign({}, ...styles.filter(Boolean));
}