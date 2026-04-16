// app_movil/src/components/ui/forms/toggle-group.tsx
 
import React from 'react';
import { View, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { useTheme } from '../utils';
 
interface ToggleGroupProps { value: string | string[]; onValueChange: (val: string | string[]) => void; type?: 'single' | 'multiple'; children: React.ReactNode; style?: ViewStyle }
 
export function ToggleGroup({ value, onValueChange, type = 'single', children, style }: ToggleGroupProps) {
  return (
    <View style={[{ flexDirection: 'row', gap: 6 }, style]}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) return React.cloneElement(child as React.ReactElement<any>, { selectedValue: value, onSelect: onValueChange, type });
        return child;
      })}
    </View>
  );
}
 
interface ToggleGroupItemProps { value: string; children: React.ReactNode; selectedValue?: string | string[]; onSelect?: (val: any) => void; type?: 'single' | 'multiple' }
 
export function ToggleGroupItem({ value, children, selectedValue, onSelect, type }: ToggleGroupItemProps) {
  const { colors } = useTheme();
  const isSelected = Array.isArray(selectedValue) ? selectedValue.includes(value) : selectedValue === value;
 
  const handlePress = () => {
    if (type === 'multiple' && Array.isArray(selectedValue)) {
      onSelect?.(isSelected ? selectedValue.filter((v) => v !== value) : [...selectedValue, value]);
    } else {
      onSelect?.(value);
    }
  };
 
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{
        flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1,
        backgroundColor: isSelected ? 'rgba(251,113,133,0.15)' : colors.fiSolid,
        borderColor: isSelected ? 'rgba(251,113,133,0.25)' : 'transparent',
      }}
    >
      {typeof children === 'string' ? <Text style={{ color: isSelected ? colors.acRose : colors.tx4, fontSize: 13, fontWeight: '500' }}>{children}</Text> : children}
    </TouchableOpacity>
  );
}
