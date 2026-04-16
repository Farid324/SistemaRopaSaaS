// app_movil/src/components/ui/forms/radio-group.tsx

import React from 'react';
import { View, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { useTheme } from '../utils';
 
interface RadioGroupProps { value: string; onValueChange: (val: string) => void; children: React.ReactNode; style?: ViewStyle }
 
export function RadioGroup({ value, onValueChange, children, style }: RadioGroupProps) {
  return (
    <View style={[{ gap: 10 }, style]}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { selectedValue: value, onSelect: onValueChange });
        }
        return child;
      })}
    </View>
  );
}
 
interface RadioGroupItemProps { value: string; label: string; selectedValue?: string; onSelect?: (val: string) => void; disabled?: boolean }
 
export function RadioGroupItem({ value, label, selectedValue, onSelect, disabled }: RadioGroupItemProps) {
  const { colors } = useTheme();
  const selected = selectedValue === value;
 
  return (
    <TouchableOpacity
      onPress={() => !disabled && onSelect?.(value)}
      activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, opacity: disabled ? 0.5 : 1 }}
    >
      <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selected ? colors.acRose : colors.bd2Solid, alignItems: 'center', justifyContent: 'center' }}>
        {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.acRose }} />}
      </View>
      <Text style={{ color: colors.tx, fontSize: 14 }}>{label}</Text>
    </TouchableOpacity>
  );
}
