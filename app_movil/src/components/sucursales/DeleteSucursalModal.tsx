//app_movil/src/components/sucursales/DeleteSucursalModal.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';
import api from '../../services/api';
import { Sucursal } from '../../types/sucursales/types';

interface Props {
  visible: boolean;
  sucursal: Sucursal | null;
  onDelete: () => void;
  onCancel: () => void;
  colors: any;
}

export function DeleteSucursalModal({ visible, sucursal, onDelete, onCancel, colors }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!visible || !sucursal) return null;

  const userCount = sucursal._count?.usuarios || 0;
  const prendaCount = sucursal._count?.prendas || 0;
  const hasData = userCount > 0 || prendaCount > 0;

  const handleDownloadCSV = async () => {
    setDownloading(true);
    try {
      const [usersRes, prendasRes] = await Promise.all([
        api.get(`/usuarios?sucursalId=${sucursal.id}`),
        api.get(`/prendas?sucursalId=${sucursal.id}`),
      ]);

      let csv = 'REPORTE DE SUCURSAL: ' + sucursal.nombre + '\n\n';
      csv += 'USUARIOS\n';
      csv += 'Nombre,CI,Correo,Rol,Estado\n';
      (usersRes.data || []).forEach((u: any) => {
        csv += `${u.nombreCompleto},${u.ci},${u.correo},${u.rol},${u.estado}\n`;
      });
      csv += '\nPRENDAS\n';
      csv += 'Codigo,Marca,Tipo,Precio,Rebaja,Estado Venta\n';
      (prendasRes.data || []).forEach((p: any) => {
        csv += `${p.codigo},${p.marca || '-'},${p.tipo},${p.precio},${p.rebaja || '-'},${p.estadoVenta}\n`;
      });

      const fileName = `sucursal_${sucursal.nombre.replace(/\s+/g, '_')}_${Date.now()}.csv`;
      const file = new File(Paths.cache, fileName);
      file.create();
      file.write(csv);
      await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Descargar reporte' });
      setDownloaded(true);
    } catch (error) {
      console.error('Error descargando CSV:', error);
      Alert.alert('Error', 'No se pudo generar el archivo');
    }
    setDownloading(false);
  };

  return (
    <Modal visible transparent animationType="fade">
      <View style={dm.overlay}>
        <View style={[dm.card, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
          <View style={[dm.iconCircle, { backgroundColor: 'rgba(248,113,113,0.15)' }]}>
            <Ionicons name="storefront-outline" size={28} color={colors.acRed} />
          </View>
          <Text style={[dm.title, { color: colors.tx }]}>Eliminar sucursal</Text>
          <Text style={[dm.subtitle, { color: colors.tx3 }]}>{sucursal.nombre}</Text>

          {hasData && (
            <View style={[dm.countsBox, { backgroundColor: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.2)' }]}>
              <Ionicons name="warning-outline" size={18} color={colors.acAmber} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={{ color: colors.acAmber, fontSize: 12, fontWeight: '500' }}>Se eliminarán:</Text>
                <View style={{ gap: 2, marginTop: 4 }}>
                  {userCount > 0 && <View style={dm.countRow}><Ionicons name="people-outline" size={14} color={colors.tx3} /><Text style={{ color: colors.tx3, fontSize: 12 }}>{userCount} usuario{userCount > 1 ? 's' : ''} (quedarán sin sucursal)</Text></View>}
                  {prendaCount > 0 && <View style={dm.countRow}><Ionicons name="pricetag-outline" size={14} color={colors.tx3} /><Text style={{ color: colors.tx3, fontSize: 12 }}>{prendaCount} prenda{prendaCount > 1 ? 's' : ''} (se eliminarán)</Text></View>}
                </View>
              </View>
            </View>
          )}

          {hasData && (
            <TouchableOpacity onPress={handleDownloadCSV} disabled={downloading} activeOpacity={0.7}
              style={[dm.downloadBtn, { backgroundColor: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.2)' }]}>
              {downloading ? <ActivityIndicator size="small" color={colors.acSky} /> : (
                <><Ionicons name={downloaded ? 'checkmark-circle' : 'download-outline'} size={18} color={colors.acSky} />
                <Text style={{ color: colors.acSky, fontSize: 13 }}>{downloaded ? 'Descarga lista' : 'Descargar datos antes de eliminar'}</Text></>
              )}
            </TouchableOpacity>
          )}

          {!hasData && <Text style={{ color: colors.tx3, fontSize: 13, textAlign: 'center', marginVertical: 8 }}>Esta sucursal no tiene datos.</Text>}

          <View style={dm.btnRow}>
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7} style={[dm.cancelBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
              <Text style={{ color: colors.tx3, fontSize: 14, fontWeight: '500' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} activeOpacity={0.85} style={{ flex: 1 }}>
              <LinearGradient colors={['#f87171', '#dc2626']} style={dm.deleteBtn}>
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Eliminar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const dm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  card: { width: '100%', borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center' },
  iconCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 16 },
  countsBox: { width: '100%', borderRadius: 14, borderWidth: 1, padding: 12, flexDirection: 'row', marginBottom: 12 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  downloadBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, paddingVertical: 12, marginBottom: 16 },
  btnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});