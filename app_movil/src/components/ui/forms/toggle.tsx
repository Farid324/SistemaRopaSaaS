// app_movil/src/components/ui/forms/toggle.tsx
 
import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../utils';
 
interface ToggleProps { pressed: boolean; onPressedChange: (pressed: boolean) => void; children: React.ReactNode; variant?: 'default' | 'outline'; size?: 'sm' | 'default' | 'lg'; disabled?: boolean; style?: ViewStyle }
 
export function Toggle({ pressed, onPressedChange, children, variant = 'default', size = 'default', disabled, style }: ToggleProps) {
  const { colors } = useTheme();
  const sizes = { sm: { h: 32, px: 8 }, default: { h: 36, px: 10 }, lg: { h: 40, px: 12 } };
  const s = sizes[size];
 
  return (
    <TouchableOpacity
      onPress={() => !disabled && onPressedChange(!pressed)}
      activeOpacity={0.7}
      style={[{
        height: s.h, paddingHorizontal: s.px, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
        backgroundColor: pressed ? 'rgba(251,113,133,0.15)' : 'transparent',
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: colors.bd2Solid,
        opacity: disabled ? 0.5 : 1,
      }, style]}
    >
      {children}
    </TouchableOpacity>
  );
}
