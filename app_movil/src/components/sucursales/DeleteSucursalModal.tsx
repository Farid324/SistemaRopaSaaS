//app_movil/src/components/sucursales/DeleteSucursalModal.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';
import api from '../../services/api';
import { Sucursal } from '../../types/sucursales/types';

interface DeleteInfo {
  usuarios: number;
  prendas: number;
  ventas: number;
}

interface Props {
  visible: boolean;
  sucursal: Sucursal | null;
  onDelete: () => Promise<void>;
  onCancel: () => void;
  colors: any;
}

export function DeleteSucursalModal({ visible, sucursal, onDelete, onCancel, colors }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [info, setInfo] = useState<DeleteInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar conteos cuando se abre el modal
  useEffect(() => {
    if (visible && sucursal) {
      setDownloaded(false);
      setError(null);
      setDeleting(false);
      loadDeleteInfo();
    }
  }, [visible, sucursal?.id]);

  const loadDeleteInfo = async () => {
    if (!sucursal) return;
    setLoadingInfo(true);
    try {
      const res = await api.get(`/sucursales/${sucursal.id}/delete-info`);
      setInfo(res.data);
    } catch (e) {
      console.error('Error cargando info:', e);
      // Usar los conteos locales como fallback
      setInfo({
        usuarios: sucursal._count?.usuarios || 0,
        prendas: sucursal._count?.prendas || 0,
        ventas: 0,
      });
    }
    setLoadingInfo(false);
  };

  if (!visible || !sucursal) return null;

  const hasData = (info?.usuarios || 0) > 0 || (info?.prendas || 0) > 0 || (info?.ventas || 0) > 0;

  // ── Generar y compartir archivo XML con prendas y ventas ──
  const handleDownloadXML = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/sucursales/${sucursal.id}/export-data`);
      const { prendas, ventas } = res.data;

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += `<SucursalExport nombre="${escapeXml(sucursal.nombre)}" fecha="${new Date().toISOString()}">\n`;

      // Prendas
      xml += '  <Prendas>\n';
      (prendas || []).forEach((p: any) => {
        xml += '    <Prenda>\n';
        xml += `      <Codigo>${escapeXml(p.codigo)}</Codigo>\n`;
        xml += `      <Marca>${escapeXml(p.marca || '-')}</Marca>\n`;
        xml += `      <Tipo>${escapeXml(p.tipo)}</Tipo>\n`;
        xml += `      <Detalles>${escapeXml(p.detalles || '-')}</Detalles>\n`;
        xml += `      <Estado>${escapeXml(p.estado)}</Estado>\n`;
        xml += `      <Precio>${p.precio}</Precio>\n`;
        xml += `      <Rebaja>${p.rebaja || 0}</Rebaja>\n`;
        xml += `      <EstadoVenta>${escapeXml(p.estadoVenta)}</EstadoVenta>\n`;
        xml += '    </Prenda>\n';
      });
      xml += '  </Prendas>\n';

      // Ventas
      xml += '  <Ventas>\n';
      (ventas || []).forEach((v: any) => {
        xml += '    <Venta>\n';
        xml += `      <Fecha>${v.fecha}</Fecha>\n`;
        xml += `      <TotalCobrado>${v.totalCobrado}</TotalCobrado>\n`;
        xml += `      <Vendedor>${escapeXml(v.vendedor?.nombreCompleto || '-')}</Vendedor>\n`;
        xml += '      <Prendas>\n';
        (v.detallesPrendas || []).forEach((d: any) => {
          xml += `        <PrendaVendida codigo="${escapeXml(d.prenda?.codigo || '-')}" tipo="${escapeXml(d.prenda?.tipo || '-')}" precioVendido="${d.precioVendido}" />\n`;
        });
        xml += '      </Prendas>\n';
        xml += '      <MetodosPago>\n';
        (v.metodosDePago || []).forEach((mp: any) => {
          xml += `        <Pago metodo="${escapeXml(mp.metodo)}" monto="${mp.monto}" />\n`;
        });
        xml += '      </MetodosPago>\n';
        xml += '    </Venta>\n';
      });
      xml += '  </Ventas>\n';
      xml += '</SucursalExport>\n';

      const fileName = `sucursal_${sucursal.nombre.replace(/\s+/g, '_')}_${Date.now()}.xml`;
      const file = new File(Paths.cache, fileName);
      file.create();
      file.write(xml);
      await Sharing.shareAsync(file.uri, { mimeType: 'text/xml', dialogTitle: 'Exportar datos de sucursal' });
      setDownloaded(true);
    } catch (error) {
      console.error('Error exportando XML:', error);
      setError('No se pudo generar el archivo');
    }
    setDownloading(false);
  };

  // ── Confirmar eliminación ──
  const handleConfirmDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onDelete();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al eliminar la sucursal');
      setDeleting(false);
    }
  };

  return (
    <Modal visible transparent animationType="fade">
      <View style={dm.overlay}>
        <View style={[dm.card, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
          {/* Ícono */}
          <View style={[dm.iconCircle, { backgroundColor: 'rgba(248,113,113,0.15)' }]}>
            <Ionicons name="storefront-outline" size={28} color={colors.acRed} />
          </View>

          <Text style={[dm.title, { color: colors.tx }]}>Eliminar sucursal</Text>
          <Text style={[dm.subtitle, { color: colors.tx3 }]}>{sucursal.nombre}</Text>

          {/* Cargando info */}
          {loadingInfo && (
            <ActivityIndicator size="small" color={colors.acRose} style={{ marginVertical: 12 }} />
          )}

          {/* Conteos de datos que se eliminarán */}
          {!loadingInfo && hasData && (
            <View style={[dm.countsBox, { backgroundColor: 'rgba(248,113,113,0.06)', borderColor: 'rgba(248,113,113,0.15)' }]}>
              <Ionicons name="warning-outline" size={18} color={colors.acRed} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ color: colors.acRed, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                  Se eliminarán permanentemente:
                </Text>
                <View style={{ gap: 3 }}>
                  {(info?.usuarios || 0) > 0 && (
                    <View style={dm.countRow}>
                      <Ionicons name="people-outline" size={14} color={colors.tx3} />
                      <Text style={{ color: colors.tx3, fontSize: 12 }}>
                        {info!.usuarios} usuario{info!.usuarios > 1 ? 's' : ''} → quedarán sin sucursal
                      </Text>
                    </View>
                  )}
                  {(info?.prendas || 0) > 0 && (
                    <View style={dm.countRow}>
                      <Ionicons name="pricetag-outline" size={14} color={colors.tx3} />
                      <Text style={{ color: colors.tx3, fontSize: 12 }}>
                        {info!.prendas} prenda{info!.prendas > 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                  {(info?.ventas || 0) > 0 && (
                    <View style={dm.countRow}>
                      <Ionicons name="receipt-outline" size={14} color={colors.tx3} />
                      <Text style={{ color: colors.tx3, fontSize: 12 }}>
                        {info!.ventas} venta{info!.ventas > 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Sin datos */}
          {!loadingInfo && !hasData && (
            <View style={[dm.countsBox, { backgroundColor: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.15)' }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.acEmerald} />
              <Text style={{ color: colors.tx3, fontSize: 12, marginLeft: 10, flex: 1 }}>
                Esta sucursal no tiene datos asociados.
              </Text>
            </View>
          )}

          {/* Botón descargar XML */}
          {hasData && !loadingInfo && (
            <TouchableOpacity
              onPress={handleDownloadXML}
              disabled={downloading}
              activeOpacity={0.7}
              style={[dm.downloadBtn, { backgroundColor: 'rgba(56,189,248,0.08)', borderColor: 'rgba(56,189,248,0.2)' }]}
            >
              {downloading ? (
                <ActivityIndicator size="small" color={colors.acSky} />
              ) : (
                <>
                  <Ionicons
                    name={downloaded ? 'checkmark-circle' : 'download-outline'}
                    size={18}
                    color={colors.acSky}
                  />
                  <Text style={{ color: colors.acSky, fontSize: 13, fontWeight: '500' }}>
                    {downloaded ? 'Archivo descargado ✓' : 'Descargar prendas y ventas (XML)'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Error inline */}
          {error && (
            <View style={[dm.errorBox, { backgroundColor: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)' }]}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.acRed} />
              <Text style={{ color: colors.acRed, fontSize: 12, flex: 1, marginLeft: 6 }}>{error}</Text>
            </View>
          )}

          {/* Botones de acción */}
          <View style={dm.btnRow}>
            <TouchableOpacity
              onPress={onCancel}
              disabled={deleting}
              activeOpacity={0.7}
              style={[dm.cancelBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}
            >
              <Text style={{ color: colors.tx3, fontSize: 14, fontWeight: '500' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirmDelete} disabled={deleting || loadingInfo} activeOpacity={0.85} style={{ flex: 1 }}>
              <LinearGradient
                colors={deleting ? ['#9ca3af', '#6b7280'] : ['#f87171', '#dc2626']}
                style={dm.deleteBtn}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Eliminar todo</Text>
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

// ── Helper para escapar caracteres especiales en XML ──
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const dm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  card: { width: '100%', borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center' },
  iconCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 16 },
  countsBox: { width: '100%', borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: 'row', marginBottom: 12 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  downloadBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, paddingVertical: 12, marginBottom: 12 },
  errorBox: { width: '100%', flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 10, marginBottom: 12 },
  btnRow: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});