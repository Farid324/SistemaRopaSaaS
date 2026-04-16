// app_movil/src/components/ui/forms/checkbox.tsx

import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils';
 
interface CheckboxProps { checked: boolean; onCheckedChange: (val: boolean) => void; disabled?: boolean; style?: ViewStyle }
 
export function Checkbox({ checked, onCheckedChange, disabled, style }: CheckboxProps) {
  const { colors } = useTheme();
 
  return (
    <TouchableOpacity
      onPress={() => !disabled && onCheckedChange(!checked)}
      activeOpacity={0.7}
      style={[{
        width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
        alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.5 : 1,
        backgroundColor: checked ? colors.acRose : 'transparent',
        borderColor: checked ? colors.acRose : colors.bd2Solid,
      }, style]}
    >
      {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
    </TouchableOpacity>
  );
}
