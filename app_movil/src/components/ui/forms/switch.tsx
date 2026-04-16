// app_movil/src/components/ui/forms/switch.tsx

import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../utils';
 
interface SwitchProps { checked: boolean; onCheckedChange: (val: boolean) => void; disabled?: boolean; activeColor?: string; style?: ViewStyle }
 
export function Switch({ checked, onCheckedChange, disabled, activeColor, style }: SwitchProps) {
  const { colors } = useTheme();
  const bg = checked ? (activeColor || colors.acEmerald) : (colors.tx4 + '4D');
 
  return (
    <TouchableOpacity
      onPress={() => !disabled && onCheckedChange(!checked)}
      activeOpacity={0.7}
      style={[{ width: 48, height: 28, borderRadius: 14, backgroundColor: bg, justifyContent: 'center', opacity: disabled ? 0.5 : 1 }, style]}
    >
      <View style={[{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', position: 'absolute' }, checked ? { right: 3 } : { left: 3 }]} />
    </TouchableOpacity>
  );
}
