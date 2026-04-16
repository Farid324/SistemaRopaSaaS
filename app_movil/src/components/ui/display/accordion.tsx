// app_movil/src/components/ui/display/accordion.tsx
 
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils';
 
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
 
interface AccordionProps { children: React.ReactNode; type?: 'single' | 'multiple'; style?: ViewStyle }
 
export function Accordion({ children, type = 'single', style }: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);
 
  const toggle = (value: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (type === 'single') {
      setOpenItems((prev) => prev.includes(value) ? [] : [value]);
    } else {
      setOpenItems((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]);
    }
  };
 
  return (
    <View style={style}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { openItems, toggle });
        }
        return child;
      })}
    </View>
  );
}
 
interface AccordionItemProps { value: string; children: React.ReactNode; openItems?: string[]; toggle?: (v: string) => void }
 
export function AccordionItem({ value, children, openItems, toggle }: AccordionItemProps) {
  const { colors } = useTheme();
  const isOpen = openItems?.includes(value) || false;
 
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.bd }}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { isOpen, onToggle: () => toggle?.(value) });
        }
        return child;
      })}
    </View>
  );
}
 
interface AccordionTriggerProps { children: React.ReactNode; isOpen?: boolean; onToggle?: () => void }
 
export function AccordionTrigger({ children, isOpen, onToggle }: AccordionTriggerProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 }}>
      <View style={{ flex: 1 }}>{typeof children === 'string' ? <Text style={{ color: colors.tx, fontSize: 14, fontWeight: '500' }}>{children}</Text> : children}</View>
      <Ionicons name="chevron-down" size={16} color={colors.tx4} style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }} />
    </TouchableOpacity>
  );
}
 
interface AccordionContentProps { children: React.ReactNode; isOpen?: boolean }
 
export function AccordionContent({ children, isOpen }: AccordionContentProps) {
  if (!isOpen) return null;
  return <View style={{ paddingBottom: 16 }}>{children}</View>;
}