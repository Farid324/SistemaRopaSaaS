// app_movil/app/(tabs)/inicio/index.tsx  (REEMPLAZA el existente)
import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
  RefreshControl, Modal, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { File as ExpoFile } from 'expo-file-system/next';


import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Progress } from '../../../src/components/ui/feedback/progress';
import { Separator } from '../../../src/components/ui/layout/separator';
import api from '../../../src/services/api';

// Componentes extraídos
import { Periodo, ChartData } from '../../../src/types/inicio/types';
import { ReportPdfModal } from '../../../src/components/inicio/ReportPdfModal';
import { ChartsCard } from '../../../src/components/inicio/ChartsCard';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();

  const [periodoStats, setPeriodoStats] = useState<Periodo>('semana');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState<string>('ALL');

  // Modal PDF
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Modal Upgrade
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState('');

  // Importing
  const [importing, setImporting] = useState(false);

  // Datos
  const [ventas, setVentas] = useState<any[]>([]);
  const [prendas, setPrendas] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  // PUNTO 6: Plan real del backend
  const [planInfo, setPlanInfo] = useState<any>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [vRes, pRes, sRes, uRes, planRes] = await Promise.all([
        api.get('/ventas'),
        api.get('/prendas'),
        api.get('/sucursales'),
        api.get('/usuarios').catch(() => ({ data: [] })),
        api.get('/dashboard/plan-actual').catch(() => ({ data: null })),
      ]);
      setVentas(vRes.data || []);
      setPrendas(pRes.data || []);
      setSucursales(sRes.data || []);
      setUsuarios(uRes.data || []);
      setPlanInfo(planRes.data);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchDashboardData(); }, [fetchDashboardData]));

  // Lógica de Permisos
  const rol = currentUser?.rol || '';
  const isOwner = rol === 'OWNER_PRINCIPAL' || rol === 'CO_OWNER' || rol === 'SUPER_ADMIN';
  const activeSucursal = isOwner ? selectedSucursal : (currentUser?.sucursalId || 'ALL');

  // Filtramos la data real según la sucursal activa
  const filteredVentas = useMemo(() => ventas.filter(v => activeSucursal === 'ALL' || v.sucursalId === activeSucursal), [ventas, activeSucursal]);
  const filteredPrendas = useMemo(() => prendas.filter(p => activeSucursal === 'ALL' || p.sucursalId === activeSucursal), [prendas, activeSucursal]);
  const filteredUsuarios = useMemo(() => usuarios.filter(u => activeSucursal === 'ALL' || u.sucursalId === activeSucursal), [usuarios, activeSucursal]);

  const baseData = useMemo<ChartData[]>(() => {
    const now = new Date();
    if (periodoStats === 'dia') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(now.getDate() - (6 - i));
        const dayVentas = filteredVentas.filter(v => new Date(v.fecha).toDateString() === d.toDateString());
        const ingresos = dayVentas.reduce((sum, v) => sum + v.totalCobrado, 0);
        const cant = dayVentas.reduce((sum, v) => sum + (v.detallesPrendas?.length || 0), 0);
        return { label: d.toLocaleDateString('es', { weekday: 'short' }), ventas: cant, ingresos };
      });
    } else if (periodoStats === 'semana') {
      return Array.from({ length: 4 }, (_, i) => {
        const dEnd = new Date(); dEnd.setDate(now.getDate() - (3 - i) * 7);
        const dStart = new Date(dEnd); dStart.setDate(dEnd.getDate() - 7);
        const weekVentas = filteredVentas.filter(v => { const vD = new Date(v.fecha); return vD > dStart && vD <= dEnd; });
        const ingresos = weekVentas.reduce((sum, v) => sum + v.totalCobrado, 0);
        const cant = weekVentas.reduce((sum, v) => sum + (v.detallesPrendas?.length || 0), 0);
        return { label: `Sem ${i + 1}`, ventas: cant, ingresos };
      });
    } else if (periodoStats === 'mes') {
      return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(); d.setMonth(now.getMonth() - (5 - i));
        const monthVentas = filteredVentas.filter(v => { const vD = new Date(v.fecha); return vD.getMonth() === d.getMonth() && vD.getFullYear() === d.getFullYear(); });
        const ingresos = monthVentas.reduce((sum, v) => sum + v.totalCobrado, 0);
        const cant = monthVentas.reduce((sum, v) => sum + (v.detallesPrendas?.length || 0), 0);
        return { label: d.toLocaleDateString('es', { month: 'short' }), ventas: cant, ingresos };
      });
    } else {
      return Array.from({ length: 4 }, (_, i) => {
        const year = now.getFullYear() - (3 - i);
        const yearVentas = filteredVentas.filter(v => new Date(v.fecha).getFullYear() === year);
        const ingresos = yearVentas.reduce((sum, v) => sum + v.totalCobrado, 0);
        const cant = yearVentas.reduce((sum, v) => sum + (v.detallesPrendas?.length || 0), 0);
        return { label: year.toString(), ventas: cant, ingresos };
      });
    }
  }, [periodoStats, filteredVentas]);

  if (!currentUser) return null;
  if (loading) return <View style={[styles.container, { backgroundColor: colors.pg, justifyContent: 'center' }]}><ActivityIndicator size="large" color={colors.acRose} /></View>;

  // Métricas
  const disponibles = filteredPrendas.filter(p => p.estadoVenta === 'DISPONIBLE').length;
  const vendidas = filteredPrendas.filter(p => p.estadoVenta !== 'DISPONIBLE').length;
  const totalPrendas = filteredPrendas.length;
  const totalIngresos = filteredVentas.reduce((sum, v) => sum + (v.totalCobrado || 0), 0);
  const totalTransacciones = filteredVentas.length;
  const totalPrendasVendidas = filteredVentas.reduce((sum, v) => sum + (v.detallesPrendas?.length || 0), 0);

  const pieData = [
    { name: 'Disponibles', value: disponibles, color: '#f43f5e' },
    { name: 'Vendidas', value: vendidas, color: '#fbbf24' },
  ].filter((d) => d.value > 0);

  // ═══════════════════ PUNTO 3: Reportes PDF Real ═══════════════════
  const generatePDF = async (from: Date, to: Date, label: string) => {
    setGeneratingPdf(true);
    try {
      const params = new URLSearchParams();
      params.append('desde', from.toISOString());
      params.append('hasta', to.toISOString());
      if (activeSucursal !== 'ALL') params.append('sucursalId', activeSucursal);

      const { data } = await api.get(`/dashboard/reporte-data?${params.toString()}`);

      const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
      const fmtMoney = (n: number) => `Bs ${n.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`;

      const ventasRows = data.ventas.map((v: any) =>
        `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px">${new Date(v.fecha).toLocaleDateString('es-BO')}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px">${v.vendedor}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px">${v.sucursal}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px">${v.prendas.length}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px;text-align:right">${fmtMoney(v.totalCobrado)}</td>
        </tr>`
      ).join('');

      const html = `
        <html>
        <head><meta charset="utf-8"/><style>
          body { font-family: Helvetica, Arial, sans-serif; padding: 20px; color: #1a1a2e; }
          h1 { color: #e11d48; font-size: 22px; margin-bottom: 4px; }
          .subtitle { color: #6b7280; font-size: 13px; margin-bottom: 20px; }
          .summary { display: flex; gap: 12px; margin-bottom: 24px; }
          .stat-box { background: #fef2f2; border-radius: 12px; padding: 14px; flex: 1; text-align: center; }
          .stat-value { font-size: 24px; font-weight: 700; color: #e11d48; }
          .stat-label { font-size: 10px; color: #6b7280; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th { background: #1a1a2e; color: white; padding: 8px; font-size: 11px; text-align: left; }
          .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 10px; text-align: center; }
        </style></head>
        <body>
          <h1>${data.empresa}</h1>
          <div class="subtitle">Reporte de Ventas — ${label}<br/>
            ${data.sucursal} | ${fmtDate(data.periodo.desde)} → ${fmtDate(data.periodo.hasta)}
          </div>

          <div class="summary">
            <div class="stat-box"><div class="stat-value">${data.resumen.totalVentas}</div><div class="stat-label">Transacciones</div></div>
            <div class="stat-box"><div class="stat-value">${fmtMoney(data.resumen.totalIngresos)}</div><div class="stat-label">Ingresos</div></div>
            <div class="stat-box"><div class="stat-value">${data.resumen.totalPrendasVendidas}</div><div class="stat-label">Prendas Vendidas</div></div>
          </div>

          <div class="summary">
            <div class="stat-box"><div class="stat-value">${data.resumen.disponibles}</div><div class="stat-label">Inventario Disponible</div></div>
            <div class="stat-box"><div class="stat-value">${data.resumen.totalInventario}</div><div class="stat-label">Total Inventario</div></div>
          </div>

          <h3 style="font-size:14px;margin-bottom:4px">Detalle de Ventas</h3>
          <table>
            <thead><tr><th>Fecha</th><th>Vendedor</th><th>Sucursal</th><th>Prendas</th><th style="text-align:right">Total</th></tr></thead>
            <tbody>${ventasRows || '<tr><td colspan="5" style="padding:20px;text-align:center;color:#9ca3af">Sin ventas en este periodo</td></tr>'}</tbody>
          </table>

          <div class="footer">
            Generado el ${new Date().toLocaleDateString('es-BO')} a las ${new Date().toLocaleTimeString('es-BO')} — Boutique App SaaS
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Reporte ${label}` });
    } catch (error) {
      console.error('Error generando PDF:', error);
      Alert.alert('Error', 'No se pudo generar el PDF. Intenta de nuevo.');
    } finally {
      setGeneratingPdf(false);
      setShowPdfModal(false);
    }
  };

  const pdfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); generatePDF(d, new Date(), 'Hoy'); };
  const pdfWeek = () => { const d = new Date(); d.setDate(d.getDate() - 7); generatePDF(d, new Date(), 'Última semana'); };
  const pdfMonth = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); generatePDF(d, new Date(), 'Último mes'); };
  const pdfYear = () => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); generatePDF(d, new Date(), 'Último año'); };
  const pdfCustom = (from: Date, to: Date) => { generatePDF(from, to, 'Periodo Personalizado'); };

  // ═══════════════════ PUNTO 4: Importar datos ═══════════════════
  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel',
               'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
               'text/xml', 'application/xml'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      setImporting(true);

      // Leer el archivo
      const expoFile = new ExpoFile(file.uri);
      const content = expoFile.text();

      let prendasToImport: any[] = [];

      if (file.name?.endsWith('.csv') || file.mimeType?.includes('csv')) {
        // Parse CSV
        const lines = (await content).split('\n').filter(l => l.trim());
        if (lines.length < 2) { Alert.alert('Error', 'El CSV debe tener encabezados y al menos 1 fila'); setImporting(false); return; }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const row: any = {};
          headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
          prendasToImport.push({
            codigo: row.codigo || row.code || '',
            tipo: row.tipo || row.type || 'Sin tipo',
            marca: row.marca || row.brand || '',
            detalles: row.detalles || row.details || '',
            precio: parseFloat(row.precio || row.price || '0'),
            rebaja: row.rebaja ? parseFloat(row.rebaja) : undefined,
            estado: row.estado || 'NUEVO',
            tipoCodigo: row.tipocodigo || row.tipoCodigo || 'MANUAL',
            sucursalId: row.sucursalid || row.sucursalId || undefined,
          });
        }
      } else if (file.name?.endsWith('.xml')) {
        // Parse XML básico
        const items = (await content).match(/<prenda[^>]*>[\s\S]*?<\/prenda>/gi) || [];
        for (const item of items) {
          const getTag = (tag: string) => { const m = item.match(new RegExp(`<${tag}>([^<]*)</${tag}>`, 'i')); return m ? m[1].trim() : ''; };
          prendasToImport.push({
            codigo: getTag('codigo'), tipo: getTag('tipo'), marca: getTag('marca'),
            detalles: getTag('detalles'), precio: parseFloat(getTag('precio') || '0'),
            rebaja: getTag('rebaja') ? parseFloat(getTag('rebaja')) : undefined,
            estado: getTag('estado') || 'NUEVO', tipoCodigo: getTag('tipoCodigo') || 'MANUAL',
          });
        }
      } else {
        Alert.alert('Formato', 'Solo se aceptan archivos CSV o XML');
        setImporting(false);
        return;
      }

      if (prendasToImport.length === 0) {
        Alert.alert('Vacío', 'No se encontraron prendas en el archivo');
        setImporting(false);
        return;
      }

      // Enviar al backend
      const { data } = await api.post('/dashboard/importar-prendas', { prendas: prendasToImport });

      let msg = `Se importaron ${data.creadas} de ${data.total} prendas.`;
      if (data.errores.length > 0) {
        msg += `\n\n${data.errores.length} error(es):\n${data.errores.slice(0, 5).join('\n')}`;
        if (data.errores.length > 5) msg += `\n...y ${data.errores.length - 5} más`;
      }
      Alert.alert('Importación', msg);
      fetchDashboardData();
    } catch (error: any) {
      if (error.response?.data?.limitado) {
        setUpgradeMsg(error.response.data.message);
        setShowUpgradeModal(true);
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Error al importar');
      }
    } finally {
      setImporting(false);
    }
  };

  const periodosUI: { key: Periodo; label: string }[] = [
    { key: 'dia', label: 'Diario' }, { key: 'semana', label: 'Semanal' }, { key: 'mes', label: 'Mensual' }, { key: 'ano', label: 'Anual' }
  ];

  // Plan info from backend (PUNTO 6)
  const plan = planInfo?.plan;
  const uso = planInfo?.uso;
  const limites = planInfo?.limites;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.pg }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboardData(); }} tintColor={colors.acRose} />}>

      <View style={styles.greetingSection}>
        <Text style={[styles.greetingLabel, { color: colors.tx4 }]}>{new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 18 ? 'Buenas tardes' : 'Buenas noches'},</Text>
        <Text style={[styles.greetingName, { color: colors.tx }]}>{currentUser.nombreCompleto.split(' ')[0]} 👋</Text>
      </View>

      {/* PUNTO 2: Selector de Sucursal (Solo para Owners) */}
      {isOwner && sucursales.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
          <TouchableOpacity onPress={() => setSelectedSucursal('ALL')} style={[styles.branchChip, selectedSucursal === 'ALL' ? { backgroundColor: colors.acRose, borderColor: colors.acRose } : { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
            <Text style={{ color: selectedSucursal === 'ALL' ? '#fff' : colors.tx3, fontSize: 12, fontWeight: '500' }}>Todas las sucursales</Text>
          </TouchableOpacity>
          {sucursales.map(s => (
            <TouchableOpacity key={s.id} onPress={() => setSelectedSucursal(s.id)} style={[styles.branchChip, selectedSucursal === s.id ? { backgroundColor: colors.acRose, borderColor: colors.acRose } : { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
              <Text style={{ color: selectedSucursal === s.id ? '#fff' : colors.tx3, fontSize: 12, fontWeight: '500' }}>{s.nombre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Revenue Card */}
      <LinearGradient colors={['#fb7185', '#f59e0b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.revenueCard}>
        <View style={styles.revenueDecor1} />
        <View style={styles.revenueDecor2} />
        <Text style={styles.revenueLabel}>Ingresos totales</Text>
        <Text style={styles.revenueAmount}>Bs {totalIngresos.toLocaleString()}</Text>
        <View style={styles.revenueRow}>
          <View style={styles.revenueStat}><View style={styles.dot} /><Text style={styles.revenueStatText}>{totalPrendasVendidas} prendas vendidas</Text></View>
          <View style={styles.revenueStat}><View style={styles.dot} /><Text style={styles.revenueStatText}>{totalTransacciones} transacciones</Text></View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        {[
          { icon: 'cube-outline' as const, value: disponibles, label: 'Stock', bg: 'rgba(251,113,133,0.1)', color: colors.acRose },
          { icon: 'cart-outline' as const, value: vendidas, label: 'Vendidas', bg: 'rgba(251,191,36,0.1)', color: colors.acAmber },
          { icon: 'trending-up-outline' as const, value: totalPrendas, label: 'Total', bg: 'rgba(52,211,153,0.1)', color: colors.acEmerald },
        ].map((s, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: s.bg }]}>
            <Ionicons name={s.icon} size={18} color={s.color} style={{ opacity: 0.7 }} />
            <Text style={[styles.statValue, { color: colors.tx }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.tx4 }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Gráficos separados (PUNTO 2: datos ya filtrados por sucursal) */}
      <ChartsCard colors={colors} periodos={periodosUI} periodoStats={periodoStats} setPeriodoStats={setPeriodoStats} baseData={baseData} />

      {/* Distribución del Inventario (Pie) */}
      <View style={[styles.pieCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
        <Text style={[styles.pieTitle, { color: colors.tx }]}>Distribución del Inventario</Text>
        <View style={styles.pieContent}>
          <View style={styles.pieCircle}>
            {pieData.length > 0 ? (
              pieData.map((d) => (<View key={d.name} style={{ backgroundColor: d.color, flex: d.value }} />))
            ) : (
              <View style={[styles.pieEmpty, { backgroundColor: colors.fiSolid }]}><Text style={{ color: colors.tx4, fontSize: 11 }}>Sin datos</Text></View>
            )}
          </View>
          <View style={styles.pieLegend}>
            {pieData.map((d) => (
              <View key={d.name} style={styles.pieLegendRow}>
                <View style={styles.pieLegendLeft}><View style={[styles.pieLegendDot, { backgroundColor: d.color }]} /><Text style={[styles.pieLegendLabel, { color: colors.tx3 }]}>{d.name}</Text></View>
                <Text style={[styles.pieLegendValue, { color: colors.tx }]}>{d.value}</Text>
              </View>
            ))}
            <Separator style={{ marginVertical: 8 }} />
            <View style={styles.pieLegendRow}><Text style={[styles.pieLegendLabel, { color: colors.tx4 }]}>Total</Text><Text style={[styles.pieLegendValue, { color: colors.tx }]}>{totalPrendas}</Text></View>
          </View>
        </View>
      </View>

      {/* PUNTO 3: Descargar Reporte PDF Real */}
      <View style={[styles.sectionCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
        <View style={styles.sectionRow}>
          <Ionicons name="document-text-outline" size={20} color={colors.acRose} />
          <Text style={[styles.sectionTitle, { color: colors.tx }]}>Reportes PDF</Text>
        </View>
        <Text style={[styles.sectionDesc, { color: colors.tx4 }]}>Descarga documentos oficiales de ventas</Text>
        <View style={styles.pdfGrid}>
          {[{ label: 'Hoy', fn: pdfToday }, { label: 'Semana', fn: pdfWeek }, { label: 'Mes', fn: pdfMonth }, { label: 'Año', fn: pdfYear }].map((p) => (
            <TouchableOpacity key={p.label} onPress={p.fn} disabled={generatingPdf} activeOpacity={0.7} style={[styles.pdfBtn, { backgroundColor: 'rgba(251,113,133,0.1)', borderColor: 'rgba(251,113,133,0.15)' }]}>
              {generatingPdf ? <ActivityIndicator size="small" color={colors.acRose} /> : <Ionicons name="download-outline" size={16} color={colors.acRose} />}
              <Text style={{ color: colors.acRose, fontSize: 10 }}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={() => setShowPdfModal(true)} style={[styles.customRangeBtn, { backgroundColor: 'rgba(56,189,248,0.08)', borderColor: 'rgba(56,189,248,0.2)' }]}>
          <Ionicons name="calendar-outline" size={16} color={colors.acSky} />
          <Text style={{ color: colors.acSky, fontSize: 12 }}>Elegir rango de fechas para PDF</Text>
        </TouchableOpacity>
      </View>

      {/* PUNTO 4: Importar / Exportar (solo Owner) */}
      {isOwner && (
        <View style={[styles.sectionCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
          <View style={styles.sectionRow}>
            <Ionicons name="grid-outline" size={20} color={colors.acEmerald} />
            <Text style={[styles.sectionTitle, { color: colors.tx }]}>Importar / Exportar</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: colors.tx4 }]}>Gestiona tus datos masivamente</Text>
          <View style={styles.exportRow}>
            <TouchableOpacity onPress={handleImport} disabled={importing} style={[styles.exportBtn, { backgroundColor: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.15)' }]}>
              <View style={[styles.exportIcon, { backgroundColor: 'rgba(52,211,153,0.15)' }]}>
                {importing ? <ActivityIndicator size="small" color={colors.acEmerald} /> : <Ionicons name="cloud-upload-outline" size={16} color={colors.acEmerald} />}
              </View>
              <View><Text style={{ color: colors.acEmerald, fontSize: 13 }}>Importar</Text><Text style={{ color: colors.tx4, fontSize: 10 }}>CSV / XML</Text></View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => generatePDF(new Date(2020, 0, 1), new Date(), 'Exportación completa')} style={[styles.exportBtn, { backgroundColor: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.15)' }]}>
              <View style={[styles.exportIcon, { backgroundColor: 'rgba(56,189,248,0.15)' }]}><Ionicons name="download-outline" size={16} color={colors.acSky} /></View>
              <View><Text style={{ color: colors.acSky, fontSize: 13 }}>Exportar</Text><Text style={{ color: colors.tx4, fontSize: 10 }}>PDF completo</Text></View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* PUNTO 6: Plan Actual real (solo Owner) */}
      {isOwner && plan && uso && limites && (
        <View style={[styles.planCard, { borderColor: 'rgba(251,113,133,0.15)' }]}>
          <View style={styles.planHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 22 }}>{plan.nombre === 'Plan Semilla' ? '🌱' : plan.nombre === 'Plan Crecimiento' ? '🚀' : '🏢'}</Text>
              <View>
                <Text style={[styles.planName, { color: colors.tx }]}>{plan.nombre}</Text>
                <Text style={[styles.planDesc, { color: colors.tx4 }]}>
                  {plan.precioBsMensual === 0 ? 'Gratis por siempre' : `Bs ${plan.precioBsMensual}/mes`}
                </Text>
              </View>
            </View>
            <Ionicons name="trophy-outline" size={24} color={colors.acAmber} style={{ opacity: 0.5 }} />
          </View>
          <View style={{ gap: 10 }}>
            <PlanBar label="Sucursales" current={uso.sucursales} max={limites.sucursales} icon="storefront-outline" colors={colors} />
            <PlanBar label="Empleados" current={uso.empleados} max={limites.empleados} icon="people-outline" colors={colors} />
            <PlanBar label="Prendas" current={uso.prendas} max={limites.prendas} icon="pricetag-outline" colors={colors} />
          </View>
        </View>
      )}

      <ReportPdfModal visible={showPdfModal} colors={colors} generatingPdf={generatingPdf} onConfirm={pdfCustom} onCancel={() => setShowPdfModal(false)} />

      {/* PUNTO 5: Modal Upgrade */}
      <Modal visible={showUpgradeModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: colors.cdSolid, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.bd2Solid, alignItems: 'center' }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(251,191,36,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Ionicons name="alert-circle-outline" size={28} color={colors.acAmber} />
            </View>
            <Text style={{ color: colors.tx, fontSize: 17, fontWeight: '600', marginBottom: 8 }}>Límite del Plan</Text>
            <Text style={{ color: colors.tx3, fontSize: 13, textAlign: 'center', marginBottom: 20 }}>{upgradeMsg}</Text>
            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
              <TouchableOpacity onPress={() => setShowUpgradeModal(false)} style={{ flex: 1, height: 48, borderRadius: 14, backgroundColor: colors.fiSolid, borderWidth: 1, borderColor: colors.bd, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.tx3, fontSize: 14 }}>Entendido</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowUpgradeModal(false); Alert.alert('Upgrade', 'Contacta al desarrollador para cambiar de plan'); }} activeOpacity={0.85} style={{ flex: 1 }}>
                <LinearGradient colors={['#fb7185', '#f59e0b']} style={{ height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Ver Planes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── PlanBar sub-component ──
function PlanBar({ label, current, max, icon, colors }: { label: string; current: number; max: number; icon: keyof typeof Ionicons.glyphMap; colors: any }) {
  return (
    <View>
      <View style={styles.planBarHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Ionicons name={icon} size={14} color={colors.tx4} /><Text style={{ color: colors.tx3, fontSize: 11 }}>{label}</Text></View>
        <Text style={{ color: current >= max ? colors.acRed : colors.tx, fontSize: 11, fontWeight: current >= max ? '700' : '400' }}>{current}/{max === 999 ? '∞' : max}</Text>
      </View>
      <Progress value={current} max={max} height={5} />
    </View>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 16, paddingBottom: 100, gap: 16 },
  greetingSection: { paddingTop: 4 }, greetingLabel: { fontSize: 12 }, greetingName: { fontSize: 20, fontWeight: '500', letterSpacing: -0.3 },
  branchChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  revenueCard: { borderRadius: 18, padding: 18, overflow: 'hidden', position: 'relative' },
  revenueDecor1: { position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' },
  revenueDecor2: { position: 'absolute', bottom: -20, left: -20, width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.05)' },
  revenueLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 }, revenueAmount: { color: '#fff', fontSize: 32, fontWeight: '600', marginTop: 4 },
  revenueRow: { flexDirection: 'row', gap: 16, marginTop: 12 }, revenueStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' }, revenueStatText: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  statsRow: { flexDirection: 'row', gap: 10 }, statCard: { flex: 1, borderRadius: 18, padding: 14 }, statValue: { fontSize: 22, fontWeight: '500', marginTop: 8 }, statLabel: { fontSize: 10, marginTop: 4 },
  pieCard: { borderRadius: 18, borderWidth: 1, padding: 16 }, pieTitle: { fontSize: 15, fontWeight: '500', marginBottom: 12 },
  pieContent: { flexDirection: 'row', alignItems: 'center', gap: 16 }, pieCircle: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', flexDirection: 'row' },
  pieEmpty: { width: '100%', height: '100%', borderRadius: 50, alignItems: 'center', justifyContent: 'center' }, pieLegend: { flex: 1, gap: 10 },
  pieLegendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, pieLegendLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pieLegendDot: { width: 10, height: 10, borderRadius: 5 }, pieLegendLabel: { fontSize: 12 }, pieLegendValue: { fontSize: 13 },
  sectionCard: { borderRadius: 18, borderWidth: 1, padding: 16 }, sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '500' }, sectionDesc: { fontSize: 12, marginBottom: 12 },
  pdfGrid: { flexDirection: 'row', gap: 8 }, pdfBtn: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 10, alignItems: 'center', gap: 4 },
  customRangeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, paddingVertical: 10, marginTop: 12 },
  exportRow: { flexDirection: 'row', gap: 8 }, exportBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 1, padding: 12 },
  exportIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  planCard: { backgroundColor: 'rgba(251,113,133,0.06)', borderRadius: 18, padding: 18, borderWidth: 1 },
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  planName: { fontSize: 15, fontWeight: '500' }, planDesc: { fontSize: 11, marginTop: 2 }, planBarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }
});