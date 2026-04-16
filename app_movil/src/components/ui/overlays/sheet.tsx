// app_movil/src/components/ui/overlays/sheet.tsx
 
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils';
 
interface SheetProps { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode; side?: 'bottom' | 'right' }
 
export function Sheet({ open, onOpenChange, children, side = 'bottom' }: SheetProps) {
  const { colors } = useTheme();
  return (
    <Modal visible={open} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} onPress={() => onOpenChange(false)} activeOpacity={1}>
        <View style={[side === 'bottom' ? styles.bottomSheet : styles.rightSheet, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]} onStartShouldSetResponder={() => true}>
          <View style={styles.handle}><View style={[styles.handleBar, { backgroundColor: colors.tx4 + '4D' }]} /></View>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '100%' }}>{children}</ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
 
export function SheetHeader({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme();
  return <View style={[{ paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.bd }, style]}>{children}</View>;
}
 
export function SheetTitle({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={{ fontSize: 17, fontWeight: '600', color: colors.tx }}>{children}</Text>;
}
 
export function SheetDescription({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={{ fontSize: 12, color: colors.tx4, marginTop: 2 }}>{children}</Text>;
}
 
export function SheetContent({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ padding: 20 }, style]}>{children}</View>;
}
 
export function SheetFooter({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ paddingHorizontal: 20, paddingBottom: 20 }, style]}>{children}</View>;
}
 
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', borderWidth: 1, borderBottomWidth: 0 },
  rightSheet: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '80%', borderLeftWidth: 1 },
  handle: { alignItems: 'center', paddingVertical: 12 },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
});
