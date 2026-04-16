// app_movil/src/components/ui/overlays/popover.tsx

import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../utils';

interface PopoverProps { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode; anchorStyle?: ViewStyle }

export function Popover({ open, onOpenChange, children }: PopoverProps) {
  const { colors } = useTheme();
  return (
    <>
      {React.Children.toArray(children).find((c: any) => c?.type?.displayName === 'PopoverTrigger' || c?.type === PopoverTrigger)}
      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => onOpenChange(false)} activeOpacity={1}>
          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
            <View style={{ backgroundColor: colors.cdSolid, borderRadius: 18, borderWidth: 1, borderColor: colors.bd2Solid, padding: 16, ...colors.cardShadow }} onStartShouldSetResponder={() => true}>
              {React.Children.toArray(children).filter((c: any) => c?.type !== PopoverTrigger)}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export function PopoverTrigger({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{children}</TouchableOpacity>;
}

export function PopoverContent({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={style}>{children}</View>;
}