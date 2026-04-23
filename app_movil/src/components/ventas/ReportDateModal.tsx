//app_movil/src/components/ventas/ReportDateModal.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  visible: boolean;
  colors: any;
  generatingReport: boolean;
  onConfirm: (from: Date, to: Date) => void;
  onCancel: () => void;
}

export function ReportDateModal({ visible, colors, generatingReport, onConfirm, onCancel }: Props) {
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const fmtShort = (d: Date) => d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });

  const handleConfirm = () => {
    const to = new Date(dateTo);
    to.setHours(23, 59, 59);
    onConfirm(dateFrom, to);
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={rm.overlay}>
        <View style={[rm.card, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
          <View style={[rm.iconCircle, { backgroundColor: 'rgba(56,189,248,0.15)' }]}>
            <Ionicons name="calendar-outline" size={28} color={colors.acSky} />
          </View>
          <Text style={[rm.title, { color: colors.tx }]}>Rango de fechas</Text>
          <Text style={{ color: colors.tx3, fontSize: 12, marginBottom: 16 }}>Selecciona el periodo del reporte</Text>

          <View style={{ width: '100%', gap: 12 }}>
            <TouchableOpacity onPress={() => setShowFromPicker(true)} style={[rm.dateBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
              <Ionicons name="calendar-outline" size={16} color={colors.tx4} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.tx4, fontSize: 10 }}>Desde</Text>
                <Text style={{ color: colors.tx, fontSize: 14 }}>{fmtShort(dateFrom)}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowToPicker(true)} style={[rm.dateBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
              <Ionicons name="calendar-outline" size={16} color={colors.tx4} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.tx4, fontSize: 10 }}>Hasta</Text>
                <Text style={{ color: colors.tx, fontSize: 14 }}>{fmtShort(dateTo)}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {(showFromPicker || showToPicker) && (
            <DateTimePicker
              value={showFromPicker ? dateFrom : dateTo}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, d) => {
                if (showFromPicker) { setShowFromPicker(false); if (d) setDateFrom(d); }
                else { setShowToPicker(false); if (d) setDateTo(d); }
              }}
            />
          )}

          <View style={rm.btnRow}>
            <TouchableOpacity onPress={onCancel} style={[rm.cancelBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
              <Text style={{ color: colors.tx3, fontSize: 14, fontWeight: '500' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} disabled={generatingReport} activeOpacity={0.85} style={{ flex: 1 }}>
              <LinearGradient colors={['#38bdf8', '#0284c7']} style={rm.downloadBtn}>
                {generatingReport ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="download-outline" size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Descargar</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const rm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  card: { width: '100%', borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center' },
  iconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  btnRow: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 20 },
  cancelBtn: { flex: 0.8, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  downloadBtn: { height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});