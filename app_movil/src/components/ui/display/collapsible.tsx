// app_movil/src/components/ui/display/collapsible.tsx

import React, { useState } from 'react';
import { View, TouchableOpacity, LayoutAnimation, Platform, UIManager, ViewStyle } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CollapsibleProps { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode; style?: ViewStyle }

export function Collapsible({ open: controlledOpen, onOpenChange, children, style }: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = !isOpen;
    setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <View style={style}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) return React.cloneElement(child as React.ReactElement<any>, { isOpen, onToggle: toggle });
        return child;
      })}
    </View>
  );
}

export function CollapsibleTrigger({ children, onToggle }: { children: React.ReactNode; isOpen?: boolean; onToggle?: () => void }) {
  return <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>{children}</TouchableOpacity>;
}

export function CollapsibleContent({ children, isOpen }: { children: React.ReactNode; isOpen?: boolean; onToggle?: () => void }) {
  if (!isOpen) return null;
  return <View>{children}</View>;
}
