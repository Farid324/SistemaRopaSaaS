// app_movil/app/(tabs)/ventas/index.tsx

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Modal, Image, Dimensions, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Button } from '../../../src/components/ui/forms/button';
import { Input } from '../../../src/components/ui/forms/input';

const { width: SW } = Dimensions.get('window');
const CW = (SW - 44) / 2;

type Periodo = 'dia' | 'semana' | 'mes' | 'ano';
interface Prenda { id: string; marca: string; tipo: string; codigo: string; detalles: string; foto?: string; precio: number; rebaja?: number; estadoVenta: string; sucursalId: string; estado: string; }
interface Venta { id: string; fecha: string; total: number; prendas: Prenda[]; vendedorId: string; sucursalId: string; }

// Demo data
const demoVentas: { venta: Venta; prenda: Prenda }[] = [];

export default function VentasScreen() {
  const { colors, isDark } = useTheme();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPOS, setShowPOS] = useState(false);
  const [detailItem, setDetailItem] = useState<{ venta: Venta; prenda: Prenda } | null>(null);

  if (!currentUser) return null;

  const totalVentas = 0;
  const totalPrendas = 0;

  const handleReport = (p: Periodo) => {
    const labels: Record<Periodo, string> = { dia: 'Día', semana: 'Semana', mes: 'Mes', ano: 'Año' };
    Alert.alert('Reporte PDF', `Generando reporte de ${labels[p]}...`);
  };

  const periodos: { key: Periodo; label: string; emoji: string }[] = [
    { key: 'dia', label: 'Día', emoji: '📅' },
    { key: 'semana', label: 'Semana', emoji: '📆' },
    { key: 'mes', label: 'Mes', emoji: '🗓️' },
    { key: 'ano', label: 'Año', emoji: '📊' },
  ];

  return (
    <ScrollView style={[v.container, { backgroundColor: colors.pg }]} contentContainerStyle={v.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={v.headerRow}>
        <View>
          <Text style={[v.title, { color: colors.tx }]}>Ventas</Text>
          <Text style={{ color: colors.tx4, fontSize: 12 }}>0 ventas realizadas</Text>
        </View>
        <TouchableOpacity onPress={() => setShowPOS(true)} activeOpacity={0.85}>
          <LinearGradient colors={['#34d399', '#059669']} style={v.posBtn}>
            <Ionicons name="cart-outline" size={16} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Punto de Venta</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={v.statsRow}>
        <View style={[v.statCard, { backgroundColor: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.15)' }]}>
          <Text style={{ color: colors.tx4, fontSize: 11 }}>Total Ventas</Text>
          <Text style={{ color: colors.acEmerald, fontSize: 20, fontWeight: '600', marginTop: 4 }}>Bs {totalVentas}</Text>
        </View>
        <View style={[v.statCard, { backgroundColor: 'rgba(251,113,133,0.1)', borderColor: 'rgba(251,113,133,0.15)' }]}>
          <Text style={{ color: colors.tx4, fontSize: 11 }}>Prendas Vendidas</Text>
          <Text style={{ color: colors.acRose, fontSize: 20, fontWeight: '600', marginTop: 4 }}>{totalPrendas}</Text>
        </View>
      </View>

      {/* PDF Reports */}
      <View style={[v.reportCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Ionicons name="document-text-outline" size={20} color={colors.acRose} />
          <Text style={{ color: colors.tx, fontSize: 15, fontWeight: '500' }}>Descargar Reporte PDF</Text>
        </View>
        <Text style={{ color: colors.tx4, fontSize: 11, marginBottom: 12 }}>Genera reportes de ventas por periodo</Text>
        <View style={v.reportGrid}>
          {periodos.map((p) => (
            <TouchableOpacity key={p.key} onPress={() => handleReport(p.key)} activeOpacity={0.7}
              style={[v.reportBtn, { backgroundColor: 'rgba(251,113,133,0.1)', borderColor: 'rgba(251,113,133,0.15)' }]}>
              <Text style={{ fontSize: 18 }}>{p.emoji}</Text>
              <Ionicons name="download-outline" size={16} color={colors.acRose} />
              <Text style={{ color: colors.acRose, fontSize: 10 }}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Search */}
      <View style={[v.searchWrap, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
        <Ionicons name="search-outline" size={18} color={colors.tx4} />
        <TextInput
          style={{ flex: 1, color: colors.tx, fontSize: 14 }}
          placeholder="Buscar por marca, tipo, código..."
          placeholderTextColor={colors.tx4}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close" size={16} color={colors.tx4} /></TouchableOpacity>
        )}
      </View>

      {/* History */}
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ color: colors.tx2, fontSize: 14, fontWeight: '500' }}>Historial de Ventas</Text>
        </View>
        {/* Empty state */}
        <View style={v.emptyState}>
          <View style={[v.emptyIcon, { backgroundColor: colors.fiSolid }]}>
            <Ionicons name="receipt-outline" size={32} color={colors.tx4} style={{ opacity: 0.4 }} />
          </View>
          <Text style={{ color: colors.tx4, fontSize: 13 }}>Sin ventas registradas</Text>
          <Text style={{ color: colors.tx4, fontSize: 11 }}>Usa el Escáner o Punto de Venta para registrar ventas</Text>
        </View>
      </View>

      {/* POS Modal placeholder */}
      <Modal visible={showPOS} transparent animationType="slide">
        <View style={[v.modalOv, { backgroundColor: colors.ov }]}>
          <View style={[v.modalSheet, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
            <View style={[v.modalHeader, { borderBottomColor: colors.bd }]}>
              <Text style={{ color: colors.tx, fontSize: 16, fontWeight: '600' }}>Punto de Venta</Text>
              <TouchableOpacity onPress={() => setShowPOS(false)}><Text style={{ color: colors.tx4, fontSize: 13 }}>Cerrar</Text></TouchableOpacity>
            </View>
            <View style={{ padding: 16, gap: 14 }}>
              <Input icon="keypad-outline" placeholder="Código de la prenda..." />
              <View style={v.posEmptyState}>
                <Ionicons name="cart-outline" size={40} color={colors.tx4} style={{ opacity: 0.3 }} />
                <Text style={{ color: colors.tx4, fontSize: 13 }}>Escanee o ingrese código</Text>
              </View>
              <Text style={{ color: colors.tx4, fontSize: 11, textAlign: 'center' }}>
                Usa el tab Escáner para un flujo completo con carrito
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const v = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 16, paddingBottom: 100, gap: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 17, fontWeight: '600' },
  posBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, borderRadius: 18, padding: 16, borderWidth: 1 },
  reportCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
  reportGrid: { flexDirection: 'row', gap: 8 },
  reportBtn: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: 'center', gap: 6 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 18, borderWidth: 1, height: 48, paddingHorizontal: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  modalOv: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  posEmptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
});