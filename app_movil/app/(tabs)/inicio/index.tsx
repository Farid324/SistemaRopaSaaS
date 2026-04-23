import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Progress } from '../../../src/components/ui/feedback/progress';
import { Separator } from '../../../src/components/ui/layout/separator';
import api from '../../../src/services/api';

// ── Types locales para tipado ──
type Periodo = 'dia' | 'semana' | 'mes' | 'ano';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  
  const [periodoStats, setPeriodoStats] = useState<Periodo>('semana');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de datos del backend
  const [ventas, setVentas] = useState<any[]>([]);
  const [prendas, setPrendas] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  // ── Cargar datos del backend ──
  const fetchDashboardData = useCallback(async () => {
    try {
      // Hacemos las peticiones en paralelo para que cargue más rápido
      const [vRes, pRes, sRes, uRes] = await Promise.all([
        api.get('/ventas'),
        api.get('/prendas'),
        api.get('/sucursales'),
        api.get('/usuarios')
      ]);
      setVentas(vRes.data || []);
      setPrendas(pRes.data || []);
      setSucursales(sRes.data || []);
      setUsuarios(uRes.data || []);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (!currentUser) return null;

  const isOwner = currentUser.rol === 'OWNER_PRINCIPAL' || currentUser.rol === 'CO_OWNER' || currentUser.rol === 'SUPER_ADMIN';

  // ── Cálculos Reales con la Data ──
  const disponibles = prendas.filter(p => p.estadoVenta === 'DISPONIBLE').length;
  const vendidas = prendas.filter(p => p.estadoVenta !== 'DISPONIBLE').length;
  const totalPrendas = prendas.length;
  
  const totalIngresos = ventas.reduce((sum, v) => sum + (v.totalCobrado || 0), 0);
  const totalTransacciones = ventas.length;
  const totalPrendasVendidas = ventas.reduce((sum, v) => sum + (v.detallesPrendas?.length || 0), 0);

  // Saludo
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  // ── Chart data (Dinámico según las ventas reales) ──
  const baseData = useMemo(() => {
    const now = new Date();
    
    if (periodoStats === 'dia') {
      // Últimos 7 días
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(now.getDate() - (6 - i));
        const dayVentas = ventas.filter(v => new Date(v.fecha).toDateString() === d.toDateString());
        const ingresos = dayVentas.reduce((sum, v) => sum + v.totalCobrado, 0);
        const cantVentas = dayVentas.reduce((sum, v) => sum + (v.detallesPrendas?.length || 0), 0);
        return { label: d.toLocaleDateString('es', { weekday: 'short' }), ventas: cantVentas, ingresos };
      });
    } else if (periodoStats === 'semana') {
      // Últimas 4 semanas
      return Array.from({ length: 4 }, (_, i) => {
        const dEnd = new Date(); dEnd.setDate(now.getDate() - (3 - i) * 7);
        const dStart = new Date(dEnd); dStart.setDate(dEnd.getDate() - 7);
        const weekVentas = ventas.filter(v => {
          const vDate = new Date(v.fecha);
          return vDate > dStart && vDate <= dEnd;
        });
        const ingresos = weekVentas.reduce((sum, v) => sum + v.totalCobrado, 0);
        const cantVentas = weekVentas.reduce((sum, v) => sum + (v.detallesPrendas?.length || 0), 0);
        return { label: `Sem ${i + 1}`, ventas: cantVentas, ingresos };
      });
    } else if (periodoStats === 'mes') {
      // Últimos 6 meses
      return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(); d.setMonth(now.getMonth() - (5 - i));
        const monthVentas = ventas.filter(v => {
          const vDate = new Date(v.fecha);
          return vDate.getMonth() === d.getMonth() && vDate.getFullYear() === d.getFullYear();
        });
        const ingresos = monthVentas.reduce((sum, v) => sum + v.totalCobrado, 0);
        const cantVentas = monthVentas.reduce((sum, v) => sum + (v.detallesPrendas?.length || 0), 0);
        return { label: d.toLocaleDateString('es', { month: 'short' }), ventas: cantVentas, ingresos };
      });
    } else {
      // Últimos 4 años
      return Array.from({ length: 4 }, (_, i) => {
        const year = now.getFullYear() - (3 - i);
        const yearVentas = ventas.filter(v => new Date(v.fecha).getFullYear() === year);
        const ingresos = yearVentas.reduce((sum, v) => sum + v.totalCobrado, 0);
        const cantVentas = yearVentas.reduce((sum, v) => sum + (v.detallesPrendas?.length || 0), 0);
        return { label: year.toString(), ventas: cantVentas, ingresos };
      });
    }
  }, [periodoStats, ventas]);

  // Pie data
  const pieData = [
    { name: 'Disponibles', value: disponibles, color: '#f43f5e' },
    { name: 'Vendidas', value: vendidas, color: '#fbbf24' },
  ].filter((d) => d.value > 0);

  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

  // ── Placeholders para funciones de exportación ──
  const handleDownloadPDF = (periodo: Periodo) => {
    const labels: Record<Periodo, string> = { dia: 'Día', semana: 'Semana', mes: 'Mes', ano: 'Año' };
    Alert.alert('Reporte PDF', `Generando reporte de ${labels[periodo]}...\n\nEsta función se conectará al backend para generar el documento oficial.`);
  };

  const handleExportExcel = () => Alert.alert('Exportar', 'Exportar a Excel próximamente');
  const handleExportXML = () => Alert.alert('Exportar', 'Exportar a XML próximamente');
  const handleImportExcel = () => Alert.alert('Importar', 'Importar desde Excel próximamente');

  // ── Period tabs ──
  const periodos: { key: Periodo; label: string }[] = [
    { key: 'dia', label: 'Diario' },
    { key: 'semana', label: 'Semanal' },
    { key: 'mes', label: 'Mensual' },
    { key: 'ano', label: 'Anual' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.pg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.acRose} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.pg }]} 
      contentContainerStyle={styles.content} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.acRose} />}
    >

      {/* ── Saludo ── */}
      <View style={styles.greetingSection}>
        <Text style={[styles.greetingLabel, { color: colors.tx4 }]}>{greeting},</Text>
        <Text style={[styles.greetingName, { color: colors.tx }]}>
          {currentUser.nombreCompleto.split(' ')[0]} 👋
        </Text>
      </View>

      {/* ── Revenue Card ── */}
      <LinearGradient colors={['#fb7185', '#f59e0b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.revenueCard}>
        <View style={styles.revenueDecor1} />
        <View style={styles.revenueDecor2} />
        <Text style={styles.revenueLabel}>Ingresos totales</Text>
        <Text style={styles.revenueAmount}>Bs {totalIngresos.toLocaleString()}</Text>
        <View style={styles.revenueRow}>
          <View style={styles.revenueStat}>
            <View style={styles.dot} />
            <Text style={styles.revenueStatText}>{totalPrendasVendidas} prendas vendidas</Text>
          </View>
          <View style={styles.revenueStat}>
            <View style={styles.dot} />
            <Text style={styles.revenueStatText}>{totalTransacciones} transacciones</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Stats Cards ── */}
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

      {/* ── Estadísticas de Ventas (Charts) ── */}
      <View style={[styles.chartCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: colors.tx }]}>Estadísticas de Ventas</Text>
        </View>

        {/* Period tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodTabs}>
          {periodos.map((p) => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPeriodoStats(p.key)}
              activeOpacity={0.7}
              style={[
                styles.periodTab,
                {
                  backgroundColor: periodoStats === p.key ? 'rgba(251,113,133,0.15)' : colors.fiSolid,
                  borderColor: periodoStats === p.key ? 'rgba(251,113,133,0.25)' : 'transparent',
                },
              ]}
            >
              <Text style={{ color: periodoStats === p.key ? colors.acRose : colors.tx4, fontSize: 11, fontWeight: '500' }}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bar Chart - Prendas vendidas */}
        <View style={styles.chartSection}>
          <Text style={[styles.chartSectionLabel, { color: colors.tx4 }]}>Prendas vendidas</Text>
          <View style={styles.barChart}>
            {baseData.map((d, i) => {
              const mx = Math.max(...baseData.map((b) => b.ventas), 1);
              const pct = (d.ventas / mx) * 100;
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={[styles.barValue, { color: colors.tx4 }]}>{d.ventas}</Text>
                  <View style={[styles.barBg, { backgroundColor: colors.fiSolid }]}>
                    <LinearGradient
                      colors={['rgba(251,113,133,0.6)', '#fb7185']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={[styles.barFill, { height: `${Math.max(pct, 4)}%` }]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.tx4 }]} numberOfLines={1}>{d.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Horizontal Bars - Ingresos */}
        <View style={[styles.chartSection, { marginTop: 12 }]}>
          <Text style={[styles.chartSectionLabel, { color: colors.tx4 }]}>Ingresos (Bs)</Text>
          <View style={{ gap: 6 }}>
            {baseData.map((d, i) => {
              const mx = Math.max(...baseData.map((l) => l.ingresos), 1);
              const pct = (d.ingresos / mx) * 100;
              return (
                <View key={i} style={styles.hBarRow}>
                  <Text style={[styles.hBarLabel, { color: colors.tx4 }]} numberOfLines={1}>{d.label}</Text>
                  <View style={[styles.hBarBg, { backgroundColor: colors.fiSolid }]}>
                    <LinearGradient
                      colors={['#f59e0b', 'rgba(251,191,36,0.6)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.hBarFill, { width: `${Math.max(pct, 3)}%` }]}
                    />
                  </View>
                  <Text style={[styles.hBarValue, { color: colors.tx3 }]}>Bs {d.ingresos}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* ── Distribución del Inventario (Pie) ── */}
      <View style={[styles.pieCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
        <Text style={[styles.pieTitle, { color: colors.tx }]}>Distribución del Inventario</Text>
        <View style={styles.pieContent}>
          {/* Simple pie visualization */}
          <View style={styles.pieCircle}>
            {pieData.length > 0 ? (
              pieData.map((d, i) => {
                const pct = (d.value / pieTotal) * 100;
                return (
                  <View key={d.name} style={[styles.pieSegment, { backgroundColor: d.color, flex: pct }]} />
                );
              })
            ) : (
              <View style={[styles.pieEmpty, { backgroundColor: colors.fiSolid }]}>
                <Text style={{ color: colors.tx4, fontSize: 11 }}>Sin datos</Text>
              </View>
            )}
          </View>

          {/* Legend */}
          <View style={styles.pieLegend}>
            {pieData.map((d) => (
              <View key={d.name} style={styles.pieLegendRow}>
                <View style={styles.pieLegendLeft}>
                  <View style={[styles.pieLegendDot, { backgroundColor: d.color }]} />
                  <Text style={[styles.pieLegendLabel, { color: colors.tx3 }]}>{d.name}</Text>
                </View>
                <Text style={[styles.pieLegendValue, { color: colors.tx }]}>{d.value}</Text>
              </View>
            ))}
            <Separator style={{ marginVertical: 8 }} />
            <View style={styles.pieLegendRow}>
              <Text style={[styles.pieLegendLabel, { color: colors.tx4 }]}>Total</Text>
              <Text style={[styles.pieLegendValue, { color: colors.tx }]}>{totalPrendas}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Descargar Reporte PDF ── */}
      <View style={[styles.sectionCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
        <View style={styles.sectionRow}>
          <Ionicons name="document-text-outline" size={20} color={colors.acRose} />
          <Text style={[styles.sectionTitle, { color: colors.tx }]}>Descargar Reporte PDF</Text>
        </View>
        <Text style={[styles.sectionDesc, { color: colors.tx4 }]}>Genera un reporte de las ventas</Text>
        <View style={styles.pdfGrid}>
          {periodos.map((p) => (
            <TouchableOpacity
              key={p.key}
              onPress={() => handleDownloadPDF(p.key)}
              activeOpacity={0.7}
              style={[styles.pdfBtn, { backgroundColor: 'rgba(251,113,133,0.1)', borderColor: 'rgba(251,113,133,0.15)' }]}
            >
              <Ionicons name="download-outline" size={20} color={colors.acRose} />
              <Text style={{ color: colors.acRose, fontSize: 11 }}>
                {p.key === 'dia' ? 'Día' : p.key === 'semana' ? 'Semana' : p.key === 'mes' ? 'Mes' : 'Año'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Importar / Exportar (solo Owner) ── */}
      {isOwner && (
        <View style={[styles.sectionCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
          <View style={styles.sectionRow}>
            <Ionicons name="grid-outline" size={20} color={colors.acEmerald} />
            <Text style={[styles.sectionTitle, { color: colors.tx }]}>Importar / Exportar</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: colors.tx4 }]}>Gestiona tus datos masivamente</Text>

          <Text style={[styles.subLabel, { color: colors.tx4 }]}>Exportar</Text>
          <View style={styles.exportRow}>
            {/* Excel */}
            <TouchableOpacity onPress={handleExportExcel} activeOpacity={0.7} style={[styles.exportBtn, { backgroundColor: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.15)' }]}>
              <View style={[styles.exportIcon, { backgroundColor: 'rgba(52,211,153,0.15)' }]}>
                <Ionicons name="grid-outline" size={16} color={colors.acEmerald} />
              </View>
              <View>
                <Text style={{ color: colors.acEmerald, fontSize: 13 }}>Excel</Text>
                <Text style={{ color: colors.tx4, fontSize: 10 }}>.xlsx</Text>
              </View>
            </TouchableOpacity>
            {/* XML */}
            <TouchableOpacity onPress={handleExportXML} activeOpacity={0.7} style={[styles.exportBtn, { backgroundColor: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.15)' }]}>
              <View style={[styles.exportIcon, { backgroundColor: 'rgba(56,189,248,0.15)' }]}>
                <Ionicons name="document-text-outline" size={16} color={colors.acSky} />
              </View>
              <View>
                <Text style={{ color: colors.acSky, fontSize: 13 }}>XML</Text>
                <Text style={{ color: colors.tx4, fontSize: 10 }}>.xml</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={[styles.subLabel, { color: colors.tx4, marginTop: 12 }]}>Importar</Text>
          <TouchableOpacity onPress={handleImportExcel} activeOpacity={0.7} style={[styles.importBtn, { backgroundColor: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.15)' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.exportIcon, { backgroundColor: 'rgba(251,191,36,0.15)' }]}>
                <Ionicons name="cloud-upload-outline" size={16} color={colors.acAmber} />
              </View>
              <View>
                <Text style={{ color: colors.acAmber, fontSize: 13 }}>Importar Excel</Text>
                <Text style={{ color: colors.tx4, fontSize: 10 }}>.xlsx, .xls, .csv</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={16} color={colors.tx4} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Plan Actual (solo Owner) ── */}
      {isOwner && (
        <View style={[styles.planCard, { borderColor: 'rgba(251,113,133,0.15)' }]}>
          <View style={styles.planHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 22 }}>🌱</Text>
              <View>
                <Text style={[styles.planName, { color: colors.tx }]}>Plan Semilla</Text>
                <Text style={[styles.planDesc, { color: colors.tx4 }]}>Gratis por siempre</Text>
              </View>
            </View>
            <Ionicons name="trophy-outline" size={24} color={colors.acAmber} style={{ opacity: 0.5 }} />
          </View>

          <View style={{ gap: 10 }}>
            {/* Los valores current ahora son reales */}
            <PlanBar label="Sucursales" current={sucursales.length} max={1} icon="storefront-outline" colors={colors} />
            <PlanBar label="Empleados" current={usuarios.filter(u => u.rol === 'EMPLEADO').length} max={2} icon="people-outline" colors={colors} />
            <PlanBar label="Prendas" current={totalPrendas} max={500} icon="pricetag-outline" colors={colors} />
          </View>

          <Separator style={{ marginVertical: 12 }} />
          <Text style={[styles.planNote, { color: colors.tx4 }]}>Solo inventario local · Sin acceso a tienda web</Text>
        </View>
      )}

      {/* ── Mejorar Plan (solo Owner) ── */}
      {isOwner && (
        <View style={{ gap: 10 }}>
          <Text style={[styles.upgradeTitle, { color: colors.tx }]}>Mejorar Plan</Text>
          {[
            { name: 'Plan Crecimiento', emoji: '🚀', desc: 'Hasta 3 sucursales · 10 empleados · 3,000 prendas', prices: '100 Bs/mes', color: colors.acSky, bg: 'rgba(56,189,248,0.05)', border: 'rgba(56,189,248,0.15)' },
            { name: 'Plan Corporativo', emoji: '🏢', desc: 'Sin límites · Soporte prioritario', prices: '250 Bs/mes', color: colors.acViolet, bg: 'rgba(167,139,250,0.05)', border: 'rgba(167,139,250,0.15)' },
          ].map((plan) => (
            <View key={plan.name} style={[styles.upgradeCard, { backgroundColor: plan.bg, borderColor: plan.border, ...colors.cardShadow }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 16 }}>{plan.emoji}</Text>
                <Text style={{ color: plan.color, fontSize: 14 }}>{plan.name}</Text>
              </View>
              <Text style={{ color: colors.tx3, fontSize: 12 }}>{plan.desc}</Text>
              <Text style={{ color: colors.tx4, fontSize: 11, marginTop: 4 }}>{plan.prices}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── PlanBar sub-component ──
function PlanBar({ label, current, max, icon, colors }: { label: string; current: number; max: number; icon: keyof typeof Ionicons.glyphMap; colors: any }) {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <View>
      <View style={styles.planBarHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name={icon} size={14} color={colors.tx4} />
          <Text style={{ color: colors.tx3, fontSize: 11 }}>{label}</Text>
        </View>
        <Text style={{ color: colors.tx, fontSize: 11 }}>{current}/{max}</Text>
      </View>
      <Progress value={current} max={max} height={5} />
    </View>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100, gap: 16 },

  // Greeting
  greetingSection: { paddingTop: 4 },
  greetingLabel: { fontSize: 12 },
  greetingName: { fontSize: 20, fontWeight: '500', letterSpacing: -0.3 },

  // Revenue
  revenueCard: { borderRadius: 18, padding: 18, overflow: 'hidden', position: 'relative' },
  revenueDecor1: { position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' },
  revenueDecor2: { position: 'absolute', bottom: -20, left: -20, width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.05)' },
  revenueLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  revenueAmount: { color: '#fff', fontSize: 32, fontWeight: '600', marginTop: 4 },
  revenueRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  revenueStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  revenueStatText: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 18, padding: 14 },
  statValue: { fontSize: 22, fontWeight: '500', marginTop: 8 },
  statLabel: { fontSize: 10, marginTop: 4 },

  // Charts card
  chartCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  chartHeader: { padding: 16, paddingBottom: 8 },
  chartTitle: { fontSize: 15, fontWeight: '500' },
  periodTabs: { paddingHorizontal: 16, paddingBottom: 12, gap: 6 },
  periodTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  chartSection: { paddingHorizontal: 16, paddingBottom: 14 },
  chartSectionLabel: { fontSize: 11, marginBottom: 8 },

  // Bar chart
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 130 },
  barCol: { flex: 1, alignItems: 'center', gap: 3 },
  barValue: { fontSize: 9 },
  barBg: { width: '100%', flex: 1, borderTopLeftRadius: 4, borderTopRightRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barLabel: { fontSize: 8 },

  // Horizontal bars
  hBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hBarLabel: { fontSize: 10, width: 36, textAlign: 'right' },
  hBarBg: { flex: 1, height: 16, borderRadius: 8, overflow: 'hidden' },
  hBarFill: { height: '100%', borderRadius: 8 },
  hBarValue: { fontSize: 10, width: 56, textAlign: 'right' },

  // Pie
  pieCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
  pieTitle: { fontSize: 15, fontWeight: '500', marginBottom: 12 },
  pieContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  pieCircle: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', flexDirection: 'row' },
  pieSegment: { height: '100%' },
  pieEmpty: { width: '100%', height: '100%', borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  pieLegend: { flex: 1, gap: 10 },
  pieLegendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pieLegendLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pieLegendDot: { width: 10, height: 10, borderRadius: 5 },
  pieLegendLabel: { fontSize: 12 },
  pieLegendValue: { fontSize: 13 },

  // Section card (PDF, Import/Export)
  sectionCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '500' },
  sectionDesc: { fontSize: 12, marginBottom: 12 },
  subLabel: { fontSize: 11, marginBottom: 8 },

  // PDF grid
  pdfGrid: { flexDirection: 'row', gap: 8 },
  pdfBtn: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: 'center', gap: 6 },

  // Export
  exportRow: { flexDirection: 'row', gap: 8 },
  exportBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 1, padding: 12 },
  exportIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  importBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, borderWidth: 1, padding: 14 },

  // Plan
  planCard: { backgroundColor: 'rgba(251,113,133,0.06)', borderRadius: 18, padding: 18, borderWidth: 1 },
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  planName: { fontSize: 15, fontWeight: '500' },
  planDesc: { fontSize: 11, marginTop: 2 },
  planNote: { fontSize: 11, textAlign: 'center' },
  planBarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },

  // Upgrade
  upgradeTitle: { fontSize: 15, fontWeight: '500' },
  upgradeCard: { borderRadius: 18, padding: 16, borderWidth: 1 },
});