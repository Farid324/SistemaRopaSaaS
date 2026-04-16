// app_movil/src/components/ui/overlays/dialog.tsx

import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils';
 
interface DialogProps { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }
 
export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const { colors } = useTheme();
  return (
    <Modal visible={open} transparent animationType="fade">
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => onOpenChange(false)} activeOpacity={1} />
        <View style={[styles.content, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
          {children}
        </View>
      </View>
    </Modal>
  );
}
 
export function DialogHeader({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ marginBottom: 12 }, style]}>{children}</View>;
}
 
export function DialogTitle({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={{ fontSize: 17, fontWeight: '600', color: colors.tx }}>{children}</Text>;
}
 
export function DialogDescription({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={{ fontSize: 13, color: colors.tx3, marginTop: 4 }}>{children}</Text>;
}
 
export function DialogFooter({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', gap: 12, marginTop: 16 }, style]}>{children}</View>;
}
 
export function DialogClose({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{children}</TouchableOpacity>;
}
 
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 24 },
  content: { borderRadius: 24, padding: 22, borderWidth: 1 },
});
