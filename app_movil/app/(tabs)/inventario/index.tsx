// app_movil/app/(tabs)/inventario/index.tsx

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Image, Dimensions, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { ConfirmModal, ConfirmModalState, INITIAL_CONFIRM_STATE } from '../../../src/components/ui/overlays/confirm-modal';
import api from '../../../src/services/api';
import type { Prenda, Sucursal, TipoCodigo, EstadoVenta } from '../../../src/components/inventario/types';
import ScannerModal from '../../../src/components/inventario/ScannerModal';
import PrendaFormModal from '../../../src/components/inventario/PrendaFormModal';
import PrendaViewModal from '../../../src/components/inventario/PrendaViewModal';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - 16 * 2 - 12) / 2;

export default function InventarioScreen() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();

  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [viewPrenda, setViewPrenda] = useState<Prenda | null>(null);
  const [flowStep, setFlowStep] = useState<'none' | 'scan' | 'form'>('none');
  const [scannedCode, setScannedCode] = useState('');
  const [scannedType, setScannedType] = useState<TipoCodigo>('MANUAL');
  const [editingPrenda, setEditingPrenda] = useState<Prenda | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(INITIAL_CONFIRM_STATE);

  const isOwner = currentUser?.rol === 'OWNER_PRINCIPAL' || currentUser?.rol === 'CO_OWNER' || currentUser?.rol === 'SUPER_ADMIN';
  const canEdit = currentUser?.rol !== 'EMPLEADO' || currentUser?.permisoEditarPrendas;

  const fetchData = useCallback(async () => {
    try {
      const [prendasRes, sucsRes] = await Promise.all([api.get('/prendas'), api.get('/sucursales')]);
      setPrendas(prendasRes.data);
      setSucursales(sucsRes.data);
    } catch (error) { console.error('Error cargando inventario:', error); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  if (!currentUser) return null;

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const filteredPrendas = prendas.filter((p) => {
    if (filterEstado !== 'todos' && p.estadoVenta !== filterEstado.toUpperCase()) return false;
    const q = search.toLowerCase();
    return !q || (p.marca || '').toLowerCase().includes(q) || p.tipo.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || (p.detalles || '').toLowerCase().includes(q);
  });

  const buscarPorCodigo = async (codigo: string): Promise<boolean> => {
    try { await api.get(`/prendas/codigo/${codigo}`); return true; } catch { return false; }
  };

  const handleSavePrenda = async (data: any) => {
    try {
      if (editingPrenda) await api.put(`/prendas/${editingPrenda.id}`, data);
      else await api.post('/prendas', data);
      fetchData();
    } catch (error: any) { console.error('Error guardando prenda:', error.response?.data?.message || error); }
    setFlowStep('none');
  };

  const deletePrenda = (prenda: Prenda) => {
    setConfirmModal({
      visible: true, title: 'Eliminar prenda',
      message: `¿Eliminar "${prenda.marca || ''} - ${prenda.tipo}"? Esta acción no se puede deshacer.`,
      icon: 'pricetag-outline', iconColor: colors.acRed, iconBg: 'rgba(248,113,113,0.15)',
      confirmLabel: 'Eliminar', confirmColor: ['#f87171', '#dc2626'],
      onConfirm: async () => {
        try { await api.delete(`/prendas/${prenda.id}`); fetchData(); } catch (error) { console.error('Error eliminando:', error); }
        setConfirmModal(INITIAL_CONFIRM_STATE);
      },
    });
  };

  const startAdd = () => { setEditingPrenda(null); setScannedCode(''); setScannedType('MANUAL'); setFlowStep('scan'); };
  const startEdit = (p: Prenda) => { setEditingPrenda(p); setScannedCode(p.codigo); setScannedType(p.tipoCodigo); setFlowStep('form'); };

  // ── Helpers ──
  const filters = ['todos', 'disponible', 'vendido', 'reservado'];
  const getEstadoBadge = (estado: EstadoVenta) => {
    if (estado === 'DISPONIBLE') return { bg: 'rgba(52,211,153,0.2)', text: '#34d399', border: 'rgba(52,211,153,0.2)' };
    if (estado === 'VENDIDO') return { bg: 'rgba(248,113,113,0.2)', text: '#f87171', border: 'rgba(248,113,113,0.2)' };
    return { bg: 'rgba(251,191,36,0.2)', text: '#fbbf24', border: 'rgba(251,191,36,0.2)' };
  };
  const estadoLabel = (e: EstadoVenta) => e === 'DISPONIBLE' ? 'Disponible' : e === 'VENDIDO' ? 'Vendido' : 'Reservado';

  if (loading) {
    return <View style={[st.container, { backgroundColor: colors.pg, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={colors.acRose} /></View>;
  }

  return (
    <View style={[st.container, { backgroundColor: colors.pg }]}>
      <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.acRose} />}>

        {/* Search + Add */}
        <View style={st.searchRow}>
          <View style={[st.searchWrap, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
            <Ionicons name="search-outline" size={16} color={colors.tx4} />
            <TextInput style={[st.searchInput, { color: colors.tx }]} placeholder="Buscar por código, marca, tipo..." placeholderTextColor={colors.tx4} value={search} onChangeText={setSearch} />
          </View>
          {canEdit && (
            <TouchableOpacity onPress={startAdd} activeOpacity={0.85}>
              <LinearGradient colors={['#fb7185', '#f59e0b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.addBtn}>
                <Ionicons name="add" size={22} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity key={f} onPress={() => setFilterEstado(f)} activeOpacity={0.7}
              style={[st.filterChip, { backgroundColor: filterEstado === f ? 'rgba(251,113,133,0.15)' : colors.fiSolid, borderColor: filterEstado === f ? 'rgba(251,113,133,0.25)' : colors.bd }]}>
              <Text style={{ color: filterEstado === f ? colors.acRose : colors.tx4, fontSize: 11 }}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Grid */}
        {filteredPrendas.length === 0 ? (
          <View style={st.emptyState}>
            <View style={[st.emptyIcon, { backgroundColor: colors.fiSolid }]}><Ionicons name="pricetag-outline" size={32} color={colors.tx4} style={{ opacity: 0.4 }} /></View>
            <Text style={{ color: colors.tx4, fontSize: 13 }}>No se encontraron prendas</Text>
          </View>
        ) : (
          <View style={st.grid}>
            {filteredPrendas.map((p) => {
              const badge = getEstadoBadge(p.estadoVenta);
              return (
                <View key={p.id} style={[st.prendaCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow, width: CARD_W }]}>
                  <View style={[st.prendaImg, { backgroundColor: colors.fiSolid }]}>
                    {p.foto ? <Image source={{ uri: p.foto }} style={st.prendaImgInner} /> : <Ionicons name="pricetag-outline" size={32} color={colors.tx4} />}
                    {p.publicadoWeb && <View style={st.onlineBadge}><Ionicons name="globe-outline" size={10} color="#fff" /></View>}
                    <View style={[st.estadoBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}><Text style={{ color: badge.text, fontSize: 9 }}>{estadoLabel(p.estadoVenta)}</Text></View>
                  </View>
                  <View style={st.prendaInfo}>
                    <Text style={[st.prendaName, { color: colors.tx }]} numberOfLines={1}>{p.marca ? `${p.marca} - ` : ''}{p.tipo}</Text>
                    <Text style={[st.prendaCode, { color: colors.tx4 }]} numberOfLines={1}>{p.tipoCodigo === 'BARRAS' ? '📊' : p.tipoCodigo === 'QR' ? '📱' : '✏️'} {p.codigo}</Text>
                    <View style={st.priceRow}>
                      {p.rebaja ? (<><Text style={[st.priceOld, { color: colors.tx4 }]}>Bs {p.precio}</Text><Text style={[st.priceNew, { color: colors.acAmber }]}>Bs {p.rebaja}</Text></>) : (<Text style={[st.priceNew, { color: colors.acRose }]}>Bs {p.precio}</Text>)}
                    </View>
                    <View style={st.actionRow}>
                      <TouchableOpacity onPress={() => setViewPrenda(p)} style={[st.actionBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}><Ionicons name="eye-outline" size={14} color={colors.tx4} /></TouchableOpacity>
                      {canEdit && (<>
                        <TouchableOpacity onPress={() => startEdit(p)} style={[st.actionBtn, { backgroundColor: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.2)' }]}><Ionicons name="create-outline" size={14} color={colors.acSky} /></TouchableOpacity>
                        <TouchableOpacity onPress={() => deletePrenda(p)} style={[st.actionBtn, { backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.2)' }]}><Ionicons name="trash-outline" size={14} color={colors.acRed} /></TouchableOpacity>
                      </>)}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modales */}
      {flowStep === 'scan' && (
        <ScannerModal buscarPorCodigo={buscarPorCodigo}
          onCodeScanned={(c, t) => { setScannedCode(c); setScannedType(t); setFlowStep('form'); }}
          onClose={() => setFlowStep('none')} />
      )}
      {flowStep === 'form' && (
        <PrendaFormModal editing={editingPrenda} scannedCode={scannedCode} scannedType={scannedType}
          sucursales={sucursales} isOwner={isOwner} currentSucursalId={currentUser.sucursalId}
          onSave={handleSavePrenda} onClose={() => setFlowStep('none')} />
      )}
      {viewPrenda && <PrendaViewModal prenda={viewPrenda} onClose={() => setViewPrenda(null)} />}
      <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal(INITIAL_CONFIRM_STATE)} />
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100, gap: 12 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, height: 44 },
  searchInput: { flex: 1, fontSize: 13 },
  addBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  filterRow: { gap: 8, paddingVertical: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  prendaCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  prendaImg: { aspectRatio: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  prendaImgInner: { width: '100%', height: '100%', resizeMode: 'cover' },
  onlineBadge: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(56,189,248,0.8)', alignItems: 'center', justifyContent: 'center' },
  estadoBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, borderWidth: 1 },
  prendaInfo: { padding: 12, gap: 2 },
  prendaName: { fontSize: 13, fontWeight: '500' },
  prendaCode: { fontSize: 10, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  priceOld: { fontSize: 11, textDecorationLine: 'line-through' },
  priceNew: { fontSize: 14, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  actionBtn: { flex: 1, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});