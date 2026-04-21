// app_movil/src/components/scanner/PaymentModal.tsx

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

type MetodoPago = 'EFECTIVO' | 'QR' | 'TARJETA';

interface PaymentMethod {
  metodo: MetodoPago;
  monto: number;
}

interface Props {
  visible: boolean;
  total: number;
  itemCount: number;
  onConfirm: (metodos: PaymentMethod[]) => void;
  onCancel: () => void;
}

const METODOS: { id: MetodoPago; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { id: 'EFECTIVO', label: 'Efectivo', icon: 'cash-outline', color: '#34d399' },
  { id: 'QR', label: 'QR', icon: 'qr-code-outline', color: '#60a5fa' },
  { id: 'TARJETA', label: 'Tarjeta', icon: 'card-outline', color: '#a78bfa' },
];

export default function PaymentModal({ visible, total, itemCount, onConfirm, onCancel }: Props) {
  const { colors } = useTheme();
  const [mode, setMode] = useState<'single' | 'split'>('single');
  const [selectedMetodo, setSelectedMetodo] = useState<MetodoPago>('EFECTIVO');
  const [splits, setSplits] = useState<{ metodo: MetodoPago; monto: string }[]>([
    { metodo: 'EFECTIVO', monto: '' },
    { metodo: 'QR', monto: '' },
  ]);

  const handleConfirmSingle = () => {
    onConfirm([{ metodo: selectedMetodo, monto: total }]);
  };

  const handleConfirmSplit = () => {
    const payments = splits
      .filter((s) => s.monto && parseFloat(s.monto) > 0)
      .map((s) => ({ metodo: s.metodo, monto: parseFloat(s.monto) }));

    const totalPagos = payments.reduce((sum, p) => sum + p.monto, 0);

    if (Math.abs(totalPagos - total) > 0.01) return; // no coincide
    onConfirm(payments);
  };

  const splitTotal = splits.reduce((sum, s) => sum + (parseFloat(s.monto) || 0), 0);
  const splitDiff = total - splitTotal;
  const splitValid = Math.abs(splitDiff) < 0.01;

  const addSplit = () => {
    const unused = METODOS.find((m) => !splits.some((s) => s.metodo === m.id));
    if (unused) setSplits([...splits, { metodo: unused.id, monto: '' }]);
  };

  const removeSplit = (idx: number) => {
    if (splits.length <= 2) return;
    setSplits(splits.filter((_, i) => i !== idx));
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={s.overlay}>
        <View style={[s.card, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
          {/* Header */}
          <View style={s.headerRow}>
            <View style={[s.iconCircle, { backgroundColor: 'rgba(52,211,153,0.15)' }]}>
              <Ionicons name="wallet-outline" size={28} color="#34d399" />
            </View>
            <Text style={[s.title, { color: colors.tx }]}>Método de Pago</Text>
            <Text style={[s.subtitle, { color: colors.tx3 }]}>
              {itemCount} prenda{itemCount > 1 ? 's' : ''} · Total: Bs {total}
            </Text>
          </View>

          {/* Mode toggle */}
          <View style={[s.modeRow, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
            <TouchableOpacity onPress={() => setMode('single')} activeOpacity={0.7}
              style={[s.modeBtn, mode === 'single' && { backgroundColor: 'rgba(251,113,133,0.15)' }]}>
              <Text style={{ color: mode === 'single' ? colors.acRose : colors.tx4, fontSize: 12 }}>Un método</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode('split')} activeOpacity={0.7}
              style={[s.modeBtn, mode === 'split' && { backgroundColor: 'rgba(251,113,133,0.15)' }]}>
              <Text style={{ color: mode === 'split' ? colors.acRose : colors.tx4, fontSize: 12 }}>Dividir pago</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 300 }} contentContainerStyle={{ gap: 8 }}>
            {/* Single mode */}
            {mode === 'single' && (
              <View style={{ gap: 8 }}>
                {METODOS.map((m) => (
                  <TouchableOpacity key={m.id} onPress={() => setSelectedMetodo(m.id)} activeOpacity={0.7}
                    style={[s.metodoBtn, {
                      backgroundColor: selectedMetodo === m.id ? `${m.color}15` : colors.fiSolid,
                      borderColor: selectedMetodo === m.id ? `${m.color}40` : colors.bd,
                    }]}>
                    <View style={[s.metodoIcon, { backgroundColor: `${m.color}20` }]}>
                      <Ionicons name={m.icon} size={20} color={m.color} />
                    </View>
                    <Text style={{ color: selectedMetodo === m.id ? colors.tx : colors.tx3, fontSize: 14, flex: 1 }}>{m.label}</Text>
                    {selectedMetodo === m.id && <Ionicons name="checkmark-circle" size={20} color={m.color} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Split mode */}
            {mode === 'split' && (
              <View style={{ gap: 10 }}>
                {splits.map((sp, idx) => {
                  const metodo = METODOS.find((m) => m.id === sp.metodo)!;
                  return (
                    <View key={idx} style={[s.splitRow, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
                      <View style={[s.metodoIcon, { backgroundColor: `${metodo.color}20` }]}>
                        <Ionicons name={metodo.icon} size={18} color={metodo.color} />
                      </View>
                      <Text style={{ color: colors.tx3, fontSize: 12, width: 60 }}>{metodo.label}</Text>
                      <View style={[s.splitInput, { borderColor: colors.bd2Solid }]}>
                        <Text style={{ color: colors.tx4, fontSize: 12 }}>Bs</Text>
                        <TextInput
                          style={{ flex: 1, color: colors.tx, fontSize: 14, textAlign: 'right' }}
                          placeholder="0.00"
                          placeholderTextColor={colors.tx4}
                          keyboardType="numeric"
                          value={sp.monto}
                          onChangeText={(v) => {
                            const updated = [...splits];
                            updated[idx].monto = v;
                            setSplits(updated);
                          }}
                        />
                      </View>
                      {splits.length > 2 && (
                        <TouchableOpacity onPress={() => removeSplit(idx)}>
                          <Ionicons name="close-circle" size={20} color={colors.acRed} />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}

                {splits.length < 3 && (
                  <TouchableOpacity onPress={addSplit} style={[s.addSplitBtn, { borderColor: colors.bd }]}>
                    <Ionicons name="add" size={16} color={colors.acRose} />
                    <Text style={{ color: colors.acRose, fontSize: 12 }}>Agregar método</Text>
                  </TouchableOpacity>
                )}

                {/* Balance indicator */}
                <View style={[s.balanceRow, {
                  backgroundColor: splitValid ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.08)',
                  borderColor: splitValid ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)',
                }]}>
                  <Text style={{ color: splitValid ? colors.acEmerald : colors.acAmber, fontSize: 12 }}>
                    {splitValid ? '✓ Pago completo' : `Faltan Bs ${splitDiff.toFixed(2)}`}
                  </Text>
                  <Text style={{ color: colors.tx3, fontSize: 12 }}>Bs {splitTotal.toFixed(2)} / {total}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Buttons */}
          <View style={s.btnRow}>
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7} style={[s.cancelBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
              <Text style={{ color: colors.tx3, fontSize: 14, fontWeight: '500' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={mode === 'single' ? handleConfirmSingle : handleConfirmSplit}
              disabled={mode === 'split' && !splitValid}
              activeOpacity={0.85} style={{ flex: 1, opacity: mode === 'split' && !splitValid ? 0.5 : 1 }}>
              <LinearGradient colors={['#34d399', '#059669']} style={s.confirmBtn}>
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Confirmar Venta</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', borderRadius: 24, borderWidth: 1, padding: 24 },
  headerRow: { alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 13, textAlign: 'center' },
  modeRow: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 3, marginBottom: 16 },
  modeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  metodoBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  metodoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  splitRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 14, borderWidth: 1 },
  splitInput: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, borderWidth: 1, height: 38, paddingHorizontal: 10 },
  addSplitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 10 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 12, borderWidth: 1, padding: 12 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: { flex: 0.8, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  confirmBtn: { height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});