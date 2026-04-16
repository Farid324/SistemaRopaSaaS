// app_movil/src/components/ui/overlays/alert-dialog.tsx

import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils';
 
interface AlertDialogProps { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; cancelText?: string; confirmText?: string; onConfirm: () => void; destructive?: boolean }
 
export function AlertDialog({ open, onOpenChange, title, description, cancelText = 'Cancelar', confirmText = 'Confirmar', onConfirm, destructive }: AlertDialogProps) {
  const { colors } = useTheme();
 
  return (
    <Modal visible={open} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
          <Text style={[styles.title, { color: colors.tx }]}>{title}</Text>
          <Text style={[styles.desc, { color: colors.tx3 }]}>{description}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity onPress={() => onOpenChange(false)} style={[styles.cancelBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]} activeOpacity={0.7}>
              <Text style={{ color: colors.tx3, fontSize: 14 }}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onConfirm(); onOpenChange(false); }} activeOpacity={0.85} style={{ flex: 1 }}>
              {destructive ? (
                <View style={[styles.confirmBtn, { backgroundColor: colors.acRed }]}>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{confirmText}</Text>
                </View>
              ) : (
                <LinearGradient colors={['#fb7185', '#f59e0b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.confirmBtn}>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{confirmText}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
 
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 24 },
  content: { borderRadius: 24, padding: 22, borderWidth: 1 },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 8 },
  desc: { fontSize: 13, lineHeight: 19, marginBottom: 20 },
  buttons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  confirmBtn: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
