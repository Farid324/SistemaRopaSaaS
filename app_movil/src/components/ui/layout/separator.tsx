// app_movil/src/components/ui/layout/separator.tsx

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../utils';
 
interface SeparatorProps { orientation?: 'horizontal' | 'vertical'; style?: ViewStyle }
 
export function Separator({ orientation = 'horizontal', style }: SeparatorProps) {
  const { colors } = useTheme();
  return (
    <View style={[orientation === 'horizontal' ? { height: 1, width: '100%' } : { width: 1, height: '100%' }, { backgroundColor: colors.bd }, style]} />
  );
}
