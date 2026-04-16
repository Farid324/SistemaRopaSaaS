// app_movil/src/components/ui/layout/aspect-ratio.tsx
 
import React from 'react';
import { View, ViewStyle } from 'react-native';
 
interface AspectRatioProps { ratio?: number; children: React.ReactNode; style?: ViewStyle }
 
export function AspectRatio({ ratio = 1, children, style }: AspectRatioProps) {
  return (
    <View style={[{ width: '100%', aspectRatio: ratio, overflow: 'hidden' }, style]}>
      {children}
    </View>
  );
}
