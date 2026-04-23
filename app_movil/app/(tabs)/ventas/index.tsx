//app_movil/app/(tabs)/ventas/index.tsx

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Image, ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';

import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import api from '../../../src/services/api';

// Tipos y Modal separados
import { Venta } from '../../../src/types/ventas/types';
import { ReportDateModal } from '../../../src/components/ventas/ReportDateModal';

export default function VentasScreen() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Modal de reporte y loading de CSV
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const fetchVentas = useCallback(async () => {
    try { 
      const res = await api.get('/ventas'); 
      setVentas(res.data); 
    }
    catch (error) { console.error('Error cargando ventas:', error); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchVentas(); }, [fetchVentas]));
  if (!currentUser) return null;
  const onRefresh = () => { setRefreshing(true); fetchVentas(); };

  const filtered = ventas.filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return v.id.slice(0, 8).toLowerCase().includes(q) ||
      v.detallesPrendas.some((dp) => dp.prenda.codigo.toLowerCase().includes(q) || (dp.prenda.marca || '').toLowerCase().includes(q) || dp.prenda.tipo.toLowerCase().includes(q)) ||
      v.vendedor.nombreCompleto.toLowerCase().includes(q);
  });

  const totalIngresos = ventas.reduce((s, v) => s + v.totalCobrado, 0);
  const totalPrendas = ventas.reduce((s, v) => s + v.detallesPrendas.length, 0);
  
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const fmtShort = (d: Date) => d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
  
  const getMetodoIcon = (m: string): keyof typeof Ionicons.glyphMap => m === 'EFECTIVO' ? 'cash-outline' : m === 'QR' ? 'qr-code-outline' : 'card-outline';
  const getMetodoColor = (m: string) => m === 'EFECTIVO' ? '#34d399' : m === 'QR' ? '#60a5fa' : '#a78bfa';
  const getMetodoLabel = (m: string) => m === 'EFECTIVO' ? 'Efectivo' : m === 'QR' ? 'QR' : 'Tarjeta';

  // ── Generar reporte CSV por rango ──
  const generateReport = async (from: Date, to: Date, label: string) => {
    setGeneratingReport(true);
    try {
      const ventasInRange = ventas.filter((v) => {
        const d = new Date(v.fecha);
        return d >= from && d <= to;
      });

      if (ventasInRange.length === 0) {
        Alert.alert('Sin datos', `No hay ventas en el periodo: ${label}`);
        setGeneratingReport(false);
        return;
      }

      let csv = `REPORTE DE VENTAS - ${label}\n`;
      csv += `Periodo: ${fmtShort(from)} - ${fmtShort(to)}\n`;
      csv += `Total ventas: ${ventasInRange.length}\n`;
      csv += `Total ingresos: Bs ${ventasInRange.reduce((s, v) => s + v.totalCobrado, 0).toFixed(2)}\n\n`;
      csv += 'Codigo,Fecha,Vendedor,Sucursal,Prendas,Metodo Pago,Total\n';
      ventasInRange.forEach((v) => {
        const code = v.id.slice(0, 8).toUpperCase();
        const prendas = v.detallesPrendas.map((dp) => `${dp.prenda.marca || ''} ${dp.prenda.tipo}`).join(' | ');
        const pagos = v.metodosDePago.map((mp) => `${mp.metodo}:${mp.monto}`).join(' + ');
        csv += `#${code},${fmtDate(v.fecha)},${v.vendedor.nombreCompleto},${v.sucursal.nombre},"${prendas}",${pagos},${v.totalCobrado}\n`;
      });

      const fileName = `reporte_ventas_${label.replace(/\s+/g, '_')}_${Date.now()}.csv`;
      const file = new File(Paths.cache, fileName);
      file.create();
      file.write(csv);
      await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: `Reporte: ${label}` });
    } catch (error) {
      console.error('Error generando reporte:', error);
      Alert.alert('Error', 'No se pudo generar el reporte');
    }
    setGeneratingReport(false);
  };

  // Quick report helpers
  const reportToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); generateReport(d, new Date(), 'Hoy'); };
  const reportWeek = () => { const d = new Date(); d.setDate(d.getDate() - 7); generateReport(d, new Date(), 'Última semana'); };
  const reportMonth = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); generateReport(d, new Date(), 'Último mes'); };
  const reportYear = () => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); generateReport(d, new Date(), 'Último año'); };
  
  // Recibe los datos desde el modal y lanza el reporte
  const reportCustom = (from: Date, to: Date) => { 
    generateReport(from, to, `${fmtShort(from)} - ${fmtShort(to)}`); 
    setShowReportModal(false); 
  };

  // ── Factura individual ──
  const downloadInvoice = async (venta: Venta) => {
    try {
      const code = venta.id.slice(0, 8).toUpperCase();
      let txt = '================================\n       BOUTIQUE APP\n        FACTURA\n================================\n\n';
      txt += `Codigo: #${code}\nFecha: ${fmtDate(venta.fecha)}\nVendedor: ${venta.vendedor.nombreCompleto}\nSucursal: ${venta.sucursal.nombre}\n\n`;
      txt += '--------------------------------\nPRENDAS\n--------------------------------\n';
      venta.detallesPrendas.forEach((dp, i) => { txt += `${i + 1}. ${dp.prenda.marca ? dp.prenda.marca + ' - ' : ''}${dp.prenda.tipo}\n   Codigo: ${dp.prenda.codigo}\n   Precio: Bs ${dp.precioVendido}\n\n`; });
      txt += '--------------------------------\nPAGO\n--------------------------------\n';
      venta.metodosDePago.forEach((mp) => { txt += `${getMetodoLabel(mp.metodo)}: Bs ${mp.monto}\n`; });
      txt += `\nTOTAL: Bs ${venta.totalCobrado}\n================================\n    Gracias por su compra\n`;
      const file = new File(Paths.cache, `factura_${code}_${Date.now()}.txt`);
      file.create(); file.write(txt);
      await Sharing.shareAsync(file.uri, { mimeType: 'text/plain', dialogTitle: `Factura #${code}` });
    } catch (error) { Alert.alert('Error', 'No se pudo generar la factura'); }
  };

  if (loading) return <View style={[st.container, { backgroundColor: colors.pg, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={colors.acRose} /></View>;

  return (
    <ScrollView style={[st.container, { backgroundColor: colors.pg }]} contentContainerStyle={st.content} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.acRose} />}>

      <View style={st.headerRow}>
        <View><Text style={[st.title, { color: colors.tx }]}>Ventas</Text><Text style={{ color: colors.tx4, fontSize: 12 }}>{ventas.length} ventas</Text></View>
      </View>

      <View style={st.statsRow}>
        <View style={[st.statCard, { backgroundColor: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.15)' }]}>
          <Text style={{ color: colors.tx4, fontSize: 11 }}>Ingresos</Text>
          <Text style={{ color: colors.acEmerald, fontSize: 20, fontWeight: '600', marginTop: 4 }}>Bs {totalIngresos.toFixed(0)}</Text>
        </View>
        <View style={[st.statCard, { backgroundColor: 'rgba(251,113,133,0.1)', borderColor: 'rgba(251,113,133,0.15)' }]}>
          <Text style={{ color: colors.tx4, fontSize: 11 }}>Prendas</Text>
          <Text style={{ color: colors.acRose, fontSize: 20, fontWeight: '600', marginTop: 4 }}>{totalPrendas}</Text>
        </View>
      </View>

      {/* Reportes */}
      <View style={[st.reportCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Ionicons name="document-text-outline" size={20} color={colors.acRose} />
          <Text style={{ color: colors.tx, fontSize: 15, fontWeight: '500' }}>Descargar Reporte</Text>
        </View>
        <View style={st.quickBtnsRow}>
          {[{ label: 'Hoy', emoji: '📅', fn: reportToday }, { label: 'Semana', emoji: '📆', fn: reportWeek }, { label: 'Mes', emoji: '🗓️', fn: reportMonth }, { label: 'Año', emoji: '📊', fn: reportYear }].map((b) => (
            <TouchableOpacity key={b.label} onPress={b.fn} disabled={generatingReport} activeOpacity={0.7}
              style={[st.quickBtn, { backgroundColor: 'rgba(251,113,133,0.1)', borderColor: 'rgba(251,113,133,0.15)' }]}>
              <Text style={{ fontSize: 16 }}>{b.emoji}</Text>
              <Ionicons name="download-outline" size={14} color={colors.acRose} />
              <Text style={{ color: colors.acRose, fontSize: 10 }}>{b.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={() => setShowReportModal(true)} activeOpacity={0.7}
          style={[st.customRangeBtn, { backgroundColor: 'rgba(56,189,248,0.08)', borderColor: 'rgba(56,189,248,0.2)' }]}>
          <Ionicons name="calendar-outline" size={16} color={colors.acSky} />
          <Text style={{ color: colors.acSky, fontSize: 12 }}>Elegir rango de fechas</Text>
        </TouchableOpacity>
      </View>

      <View style={[st.searchWrap, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
        <Ionicons name="search-outline" size={18} color={colors.tx4} />
        <TextInput style={{ flex: 1, color: colors.tx, fontSize: 14 }} placeholder="Buscar por código, marca..." placeholderTextColor={colors.tx4} value={searchQuery} onChangeText={setSearchQuery} />
        {searchQuery !== '' && <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close" size={16} color={colors.tx4} /></TouchableOpacity>}
      </View>

      <Text style={{ color: colors.tx2, fontSize: 14, fontWeight: '500' }}>Historial</Text>

      {filtered.length === 0 ? (
        <View style={st.emptyState}>
          <View style={[st.emptyIcon, { backgroundColor: colors.fiSolid }]}><Ionicons name="receipt-outline" size={32} color={colors.tx4} style={{ opacity: 0.4 }} /></View>
          <Text style={{ color: colors.tx4, fontSize: 13 }}>{searchQuery ? 'Sin resultados' : 'Sin ventas'}</Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {filtered.map((v) => {
            const isExp = expandedId === v.id;
            const code = v.id.slice(0, 8).toUpperCase();
            const count = v.detallesPrendas.length;
            return (
              <View key={v.id} style={[st.ventaCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
                <TouchableOpacity activeOpacity={0.85} onPress={() => setExpandedId(isExp ? null : v.id)} style={st.ventaHeader}>
                  <View style={{ position: 'relative', width: count > 1 ? Math.min(count, 3) * 14 + 36 : 48, height: 48 }}>
                    {count === 1 ? (
                      <View style={[st.thumb, { backgroundColor: colors.fiSolid }]}>{v.detallesPrendas[0].prenda.foto ? <Image source={{ uri: v.detallesPrendas[0].prenda.foto }} style={st.thumbImg} /> : <Ionicons name="pricetag-outline" size={20} color={colors.tx4} />}</View>
                    ) : (v.detallesPrendas.slice(0, 3).map((dp, i) => (
                      <View key={dp.id} style={[st.thumbStack, { backgroundColor: colors.fiSolid, borderColor: colors.cdSolid, left: i * 14, zIndex: 3 - i }]}>{dp.prenda.foto ? <Image source={{ uri: dp.prenda.foto }} style={st.thumbImg} /> : <Ionicons name="pricetag-outline" size={14} color={colors.tx4} />}</View>
                    )))}
                    {count > 3 && <View style={[st.thumbStack, { left: 42, backgroundColor: 'rgba(251,113,133,0.15)', borderColor: colors.cdSolid }]}><Text style={{ color: colors.acRose, fontSize: 9, fontWeight: '600' }}>+{count - 3}</Text></View>}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: colors.tx, fontSize: 14, fontWeight: '500' }}>#{code}</Text><Text style={{ color: colors.acEmerald, fontSize: 15, fontWeight: '600' }}>Bs {v.totalCobrado}</Text></View>
                    <Text style={{ color: colors.tx4, fontSize: 10, marginTop: 2 }}>{fmtDate(v.fecha)}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      <View style={[st.pill, { backgroundColor: 'rgba(52,211,153,0.15)' }]}><Text style={{ color: colors.acEmerald, fontSize: 9 }}>{count} prenda{count > 1 ? 's' : ''}</Text></View>
                      {v.metodosDePago.map((mp) => (<View key={mp.id} style={[st.pill, { backgroundColor: `${getMetodoColor(mp.metodo)}15` }]}><Ionicons name={getMetodoIcon(mp.metodo)} size={10} color={getMetodoColor(mp.metodo)} /><Text style={{ color: getMetodoColor(mp.metodo), fontSize: 9, marginLeft: 3 }}>{mp.metodo === 'EFECTIVO' ? 'Efec' : mp.metodo}{v.metodosDePago.length > 1 ? ` ${mp.monto}` : ''}</Text></View>))}
                    </View>
                  </View>
                  <Ionicons name={isExp ? 'chevron-up' : 'chevron-down'} size={16} color={colors.tx4} />
                </TouchableOpacity>
                {isExp && (
                  <View style={[st.detail, { borderTopColor: colors.bd }]}>
                    {v.detallesPrendas.map((dp) => (
                      <View key={dp.id} style={[st.detailItem, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
                        <View style={[st.detailImg, { backgroundColor: colors.pg }]}>{dp.prenda.foto ? <Image source={{ uri: dp.prenda.foto }} style={st.thumbImg} /> : <Ionicons name="pricetag-outline" size={16} color={colors.tx4} />}</View>
                        <View style={{ flex: 1 }}><Text style={{ color: colors.tx, fontSize: 12 }}>{dp.prenda.marca ? `${dp.prenda.marca} - ` : ''}{dp.prenda.tipo}</Text><Text style={{ color: colors.tx4, fontSize: 10 }}>{dp.prenda.codigo}</Text></View>
                        <Text style={{ color: colors.acAmber, fontSize: 13, fontWeight: '500' }}>Bs {dp.precioVendido}</Text>
                      </View>
                    ))}
                    <View style={[st.detailFooter, { borderTopColor: colors.bd }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Ionicons name="person-outline" size={12} color={colors.tx4} /><Text style={{ color: colors.tx4, fontSize: 10 }}>{v.vendedor.nombreCompleto}</Text></View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Ionicons name="storefront-outline" size={12} color={colors.tx4} /><Text style={{ color: colors.tx4, fontSize: 10 }}>{v.sucursal.nombre}</Text></View>
                    </View>
                    <TouchableOpacity onPress={() => downloadInvoice(v)} activeOpacity={0.7} style={[st.invoiceBtn, { backgroundColor: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.2)' }]}>
                      <Ionicons name="download-outline" size={16} color={colors.acSky} /><Text style={{ color: colors.acSky, fontSize: 12 }}>Descargar factura</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      <ReportDateModal
        visible={showReportModal}
        colors={colors}
        generatingReport={generatingReport}
        onConfirm={reportCustom}
        onCancel={() => setShowReportModal(false)}
      />

    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 16, paddingBottom: 100, gap: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 17, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, borderRadius: 18, padding: 16, borderWidth: 1 },
  reportCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
  quickBtnsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  quickBtn: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 10, alignItems: 'center', gap: 4 },
  customRangeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, paddingVertical: 10 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 18, borderWidth: 1, height: 48, paddingHorizontal: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  ventaCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  ventaHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  thumb: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbStack: { position: 'absolute', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 2, top: 6 },
  thumbImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  detail: { borderTopWidth: 1, padding: 14, gap: 8 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, borderWidth: 1, padding: 10 },
  detailImg: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  detailFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 10, marginTop: 4 },
  invoiceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, borderWidth: 1, paddingVertical: 10, marginTop: 8 },
});