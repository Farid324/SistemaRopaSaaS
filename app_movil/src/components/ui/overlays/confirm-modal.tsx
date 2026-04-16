// app_movil/src/components/ui/overlays/confirm-modal.tsx

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  confirmLabel: string;
  confirmColor: [string, string];
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ visible, title, message, icon, iconColor, iconBg, confirmLabel, confirmColor, onConfirm, onCancel }: ConfirmModalProps) {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={s.overlay}>
        <View style={[s.card, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
          <View style={[s.iconCircle, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={28} color={iconColor} />
          </View>
          <Text style={[s.title, { color: colors.tx }]}>{title}</Text>
          <Text style={[s.message, { color: colors.tx3 }]}>{message}</Text>
          <View style={s.btnRow}>
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7} style={[s.cancelBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
              <Text style={{ color: colors.tx3, fontSize: 14, fontWeight: '500' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} activeOpacity={0.85} style={{ flex: 1 }}>
              <LinearGradient colors={confirmColor} style={s.confirmBtn}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{confirmLabel}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Helper para crear el estado del modal fácilmente
export interface ConfirmModalState {
  visible: boolean;
  title: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  confirmLabel: string;
  confirmColor: [string, string];
  onConfirm: () => void;
}

export const INITIAL_CONFIRM_STATE: ConfirmModalState = {
  visible: false, title: '', message: '',
  icon: 'alert-circle', iconColor: '', iconBg: '',
  confirmLabel: '', confirmColor: ['#000', '#000'],
  onConfirm: () => {},
};

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  card: { width: '100%', borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center' },
  iconCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  btnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  confirmBtn: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});