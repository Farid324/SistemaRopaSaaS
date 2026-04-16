// app_movil/src/components/ui/forms/label.tsx

import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '../utils';
 
interface LabelProps { children: React.ReactNode; style?: TextStyle; required?: boolean }
 
export function Label({ children, style, required }: LabelProps) {
  const { colors } = useTheme();
  return (
    <Text style={[{ fontSize: 12, fontWeight: '500', color: colors.tx3, marginBottom: 6 }, style]}>
      {children}{required && <Text style={{ color: colors.acRose }}> *</Text>}
    </Text>
  );
}
 