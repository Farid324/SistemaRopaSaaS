//app_movil/app/(tabs)/sucursales/index.tsx

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, ActivityIndicator, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import api from '../../../src/services/api';

// Tipos y Modales separados
import { Sucursal } from '../../../src/types/sucursales/types';
import { SucursalFormModal } from '../../../src/components/sucursales/SucursalFormModal';
import { DeleteSucursalModal } from '../../../src/components/sucursales/DeleteSucursalModal';

export default function SucursalesScreen() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Sucursal | null>(null);
  const [deletingSuc, setDeletingSuc] = useState<Sucursal | null>(null);

  const fetchSucursales = useCallback(async () => {
    try { 
      const res = await api.get('/sucursales'); 
      setSucursales(res.data); 
    }
    catch (error) { console.error('Error cargando sucursales:', error); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchSucursales(); }, [fetchSucursales]));
  if (!currentUser) return null;
  const onRefresh = () => { setRefreshing(true); fetchSucursales(); };

  const handleDelete = async () => {
    if (!deletingSuc) return;
    try { 
      await api.delete(`/sucursales/${deletingSuc.id}`); 
      fetchSucursales(); 
    }
    catch (error) { console.error('Error eliminando:', error); }
    setDeletingSuc(null);
  };

  if (loading) return <View style={[st.container, { backgroundColor: colors.pg, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={colors.acRose} /></View>;

  return (
    <ScrollView style={[st.container, { backgroundColor: colors.pg }]} contentContainerStyle={st.content} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.acRose} />}>
      
      <View style={st.headerRow}>
        <View><Text style={[st.title, { color: colors.tx }]}>Sucursales</Text><Text style={{ color: colors.tx4, fontSize: 12 }}>{sucursales.length} sucursales</Text></View>
        <TouchableOpacity onPress={() => { setEditing(null); setShowForm(true); }} activeOpacity={0.85}>
          <LinearGradient colors={['#fb7185', '#f59e0b']} style={st.addBtn}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Nueva</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={{ gap: 10 }}>
        {sucursales.map((s) => {
          const isOpen = s.estado === 'ACTIVO';
          return (
            <View key={s.id} style={[st.sucCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
              <View style={st.sucCardInner}>
                <View style={{ flexDirection: 'row', gap: 12, flex: 1 }}>
                  <View style={[st.sucIcon, { borderColor: 'rgba(251,113,133,0.15)' }]}><Ionicons name="storefront-outline" size={20} color={colors.acRose} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.tx, fontSize: 14, fontWeight: '500' }}>{s.nombre}</Text>
                    {s.direccion && <View style={st.infoRow}><Ionicons name="location-outline" size={12} color={colors.tx4} /><Text style={{ color: colors.tx4, fontSize: 11 }}>{s.direccion}</Text></View>}
                    {s.horarios && <View style={st.infoRow}><Ionicons name="time-outline" size={12} color={colors.tx4} /><Text style={{ color: colors.tx4, fontSize: 11 }}>{s.horarios}</Text></View>}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <View style={[st.pill, { backgroundColor: isOpen ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)', borderColor: isOpen ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)' }]}>
                        <Text style={{ color: isOpen ? colors.acEmerald : colors.acRed, fontSize: 9 }}>{isOpen ? 'Abierto' : 'Cerrado'}</Text>
                      </View>
                      <Text style={{ color: colors.tx4, fontSize: 9 }}>{s._count?.usuarios || 0} usuarios · {s._count?.prendas || 0} prendas</Text>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <TouchableOpacity onPress={() => { setEditing(s); setShowForm(true); }} style={[st.iconBtn, { backgroundColor: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.2)' }]}><Ionicons name="create-outline" size={16} color={colors.acSky} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => setDeletingSuc(s)} style={[st.iconBtn, { backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.2)' }]}><Ionicons name="trash-outline" size={16} color={colors.acRed} /></TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <Modal visible={showForm} transparent animationType="slide">
        <SucursalFormModal 
          colors={colors} 
          editing={editing}
          onSave={async (data) => { 
            try { 
              if (editing) await api.put(`/sucursales/${editing.id}`, data); 
              else await api.post('/sucursales', data); 
              fetchSucursales(); 
            } catch (e) { console.error(e); } 
            setShowForm(false); 
          }}
          onClose={() => setShowForm(false)} 
        />
      </Modal>

      <DeleteSucursalModal 
        visible={!!deletingSuc} 
        sucursal={deletingSuc} 
        onDelete={handleDelete} 
        onCancel={() => setDeletingSuc(null)} 
        colors={colors} 
      />

    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 16, paddingBottom: 100, gap: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 17, fontWeight: '600' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  sucCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
  sucCardInner: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  sucIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(251,113,133,0.1)', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, borderWidth: 1 },
  iconBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});