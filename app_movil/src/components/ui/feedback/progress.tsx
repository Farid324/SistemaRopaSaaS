// app_movil/src/components/ui/feedback/progress.tsx

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils';
 
interface ProgressProps { value: number; max?: number; height?: number; style?: ViewStyle; colors?: [string, string, ...string[]] }
 
export function Progress({ value, max = 100, height = 6, style, colors: gradColors }: ProgressProps) {
  const { colors } = useTheme();
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
 
  return (
    <View style={[{ height, borderRadius: height / 2, backgroundColor: colors.fiSolid, overflow: 'hidden' }, style]}>
      <LinearGradient
        colors={gradColors ?? ['#fb7185', '#f59e0b'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: '100%', width: `${pct}%`, borderRadius: height / 2 }}
      />
    </View>
  );
}
