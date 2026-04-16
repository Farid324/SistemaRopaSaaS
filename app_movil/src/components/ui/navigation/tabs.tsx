// app_movil/src/components/ui/navigation/tabs.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ViewStyle } from 'react-native';
import { useTheme } from '../utils';

interface TabsProps { defaultValue: string; children: React.ReactNode; style?: ViewStyle; onValueChange?: (val: string) => void }

export function Tabs({ defaultValue, children, style, onValueChange }: TabsProps) {
  const [active, setActive] = useState(defaultValue);
  const change = (val: string) => { setActive(val); onValueChange?.(val); };

  return (
    <View style={style}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) return React.cloneElement(child as React.ReactElement<any>, { activeValue: active, onSelect: change });
        return child;
      })}
    </View>
  );
}

interface TabsListProps { children: React.ReactNode; activeValue?: string; onSelect?: (val: string) => void; style?: ViewStyle }

export function TabsList({ children, activeValue, onSelect, style }: TabsListProps) {
  const { colors } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[{ marginBottom: 12 }, style]} contentContainerStyle={{ gap: 6 }}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) return React.cloneElement(child as React.ReactElement<any>, { activeValue, onSelect });
        return child;
      })}
    </ScrollView>
  );
}

interface TabsTriggerProps { value: string; children: React.ReactNode; activeValue?: string; onSelect?: (val: string) => void }

export function TabsTrigger({ value, children, activeValue, onSelect }: TabsTriggerProps) {
  const { colors } = useTheme();
  const isActive = activeValue === value;

  return (
    <TouchableOpacity
      onPress={() => onSelect?.(value)}
      activeOpacity={0.7}
      style={{
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
        backgroundColor: isActive ? 'rgba(251,113,133,0.15)' : colors.fiSolid,
        borderColor: isActive ? 'rgba(251,113,133,0.25)' : 'transparent',
      }}
    >
      <Text style={{ color: isActive ? colors.acRose : colors.tx4, fontSize: 12, fontWeight: '500' }}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

interface TabsContentProps { value: string; children: React.ReactNode; activeValue?: string }

export function TabsContent({ value, children, activeValue }: TabsContentProps) {
  if (activeValue !== value) return null;
  return <View>{children}</View>;
}