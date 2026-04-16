// app_movil/src/components/ui/overlays/dropdown-menu.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils';

interface DropdownMenuProps { children: React.ReactNode }

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) return React.cloneElement(child as React.ReactElement<any>, { open, setOpen });
        return child;
      })}
    </View>
  );
}

export function DropdownMenuTrigger({ children, setOpen }: { children: React.ReactNode; open?: boolean; setOpen?: (v: boolean) => void }) {
  return <TouchableOpacity onPress={() => setOpen?.(true)} activeOpacity={0.7}>{children}</TouchableOpacity>;
}

interface DropdownMenuContentProps { children: React.ReactNode; open?: boolean; setOpen?: (v: boolean) => void; style?: ViewStyle }

export function DropdownMenuContent({ children, open, setOpen, style }: DropdownMenuContentProps) {
  const { colors } = useTheme();
  if (!open) return null;
  return (
    <Modal visible={open} transparent animationType="fade">
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setOpen?.(false)} activeOpacity={1}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={[{ backgroundColor: colors.cdSolid, borderRadius: 14, borderWidth: 1, borderColor: colors.bd2Solid, minWidth: 180, paddingVertical: 6, ...colors.cardShadow }, style]} onStartShouldSetResponder={() => true}>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) return React.cloneElement(child as React.ReactElement<any>, { closeMenu: () => setOpen?.(false) });
              return child;
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

interface DropdownMenuItemProps { children: React.ReactNode; onPress?: () => void; icon?: keyof typeof Ionicons.glyphMap; destructive?: boolean; closeMenu?: () => void }

export function DropdownMenuItem({ children, onPress, icon, destructive, closeMenu }: DropdownMenuItemProps) {
  const { colors } = useTheme();
  const textColor = destructive ? colors.acRed : colors.tx;
  return (
    <TouchableOpacity onPress={() => { onPress?.(); closeMenu?.(); }} activeOpacity={0.6} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10 }}>
      {icon && <Ionicons name={icon} size={16} color={textColor} />}
      <Text style={{ color: textColor, fontSize: 14 }}>{children}</Text>
    </TouchableOpacity>
  );
}

export function DropdownMenuSeparator() {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.bd, marginVertical: 4 }} />;
}

export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={{ color: colors.tx4, fontSize: 11, fontWeight: '500', paddingHorizontal: 14, paddingVertical: 6 }}>{children}</Text>;
}