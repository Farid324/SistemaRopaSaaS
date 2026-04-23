//app_movil/app/(tabs)/personal/index.tsx

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

// Context & UI
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { ConfirmModal, ConfirmModalState, INITIAL_CONFIRM_STATE } from '../../../src/components/ui/overlays/confirm-modal';
import api from '../../../src/services/api';

// Tipos y Modal separados
import { Usuario, Sucursal, Rol } from '../../../src/types/personal/types';
import { PersonalFormModal } from '../../../src/components/personal/PersonalFormModal';

export default function PersonalScreen() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(INITIAL_CONFIRM_STATE);

  const isOwner = currentUser?.rol === 'OWNER_PRINCIPAL' || currentUser?.rol === 'CO_OWNER' || currentUser?.rol === 'SUPER_ADMIN';

  // ── Cargar datos del backend ──
  const fetchData = useCallback(async () => {
    try {
      const [usersRes, sucsRes] = await Promise.all([
        api.get('/usuarios'),
        api.get('/sucursales'),
      ]);
      setUsuarios(usersRes.data);
      setSucursales(sucsRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  if (!currentUser) return null;

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // Filtrar: owner ve todos, admin solo empleados de su sucursal
  const filtered = isOwner
    ? usuarios.filter((u) => u.id !== currentUser.id)
    : usuarios.filter((u) => u.rol === 'EMPLEADO' && u.sucursalId === currentUser.sucursalId);

  // ── Acciones con backend ──
  const handleToggleEstado = async (user: Usuario) => {
    const willBlock = user.estado === 'ACTIVO';
    setConfirmModal({
      visible: true,
      title: willBlock ? 'Bloquear usuario' : 'Activar usuario',
      message: willBlock
        ? `¿Bloquear a ${user.nombreCompleto}? No podrá iniciar sesión.`
        : `¿Activar a ${user.nombreCompleto}? Podrá iniciar sesión nuevamente.`,
      icon: willBlock ? 'shield-outline' : 'shield-checkmark-outline',
      iconColor: willBlock ? colors.acAmber : colors.acEmerald,
      iconBg: willBlock ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)',
      confirmLabel: willBlock ? 'Bloquear' : 'Activar',
      confirmColor: willBlock ? ['#fbbf24', '#b45309'] : ['#34d399', '#059669'],
      onConfirm: async () => {
        try {
          await api.put(`/usuarios/${user.id}`, { estado: willBlock ? 'BLOQUEADO' : 'ACTIVO' });
          fetchData();
        } catch (error) { console.error('Error actualizando estado:', error); }
        setConfirmModal(INITIAL_CONFIRM_STATE);
      },
    });
  };

  const handleDelete = (user: Usuario) => {
    setConfirmModal({
      visible: true,
      title: 'Eliminar usuario',
      message: `¿Eliminar a ${user.nombreCompleto}? Esta acción no se puede deshacer.`,
      icon: 'trash-outline',
      iconColor: colors.acRed,
      iconBg: 'rgba(248,113,113,0.15)',
      confirmLabel: 'Eliminar',
      confirmColor: ['#f87171', '#dc2626'],
      onConfirm: async () => {
        try {
          await api.delete(`/usuarios/${user.id}`);
          fetchData();
        } catch (error) { console.error('Error eliminando:', error); }
        setConfirmModal(INITIAL_CONFIRM_STATE);
      },
    });
  };

  // ── Helpers visuales ──
  const getRolBadge = (rol: Rol) => {
    if (rol === 'OWNER_PRINCIPAL' || rol === 'CO_OWNER') return { bg: 'rgba(251,113,133,0.15)', text: colors.acRose, border: 'rgba(251,113,133,0.2)' };
    if (rol === 'ADMINISTRADOR') return { bg: 'rgba(251,191,36,0.15)', text: colors.acAmber, border: 'rgba(251,191,36,0.2)' };
    return { bg: 'rgba(52,211,153,0.15)', text: colors.acEmerald, border: 'rgba(52,211,153,0.2)' };
  };
  const getRolGradient = (rol: Rol): [string, string] => {
    if (rol === 'OWNER_PRINCIPAL' || rol === 'CO_OWNER') return ['#fb7185', '#e11d48'];
    if (rol === 'ADMINISTRADOR') return ['#fbbf24', '#b45309'];
    return ['#34d399', '#059669'];
  };
  const getRolLabel = (rol: Rol) => {
    if (rol === 'OWNER_PRINCIPAL' || rol === 'CO_OWNER') return 'Dueño';
    if (rol === 'ADMINISTRADOR') return 'Admin';
    return 'Empleado';
  };

  if (loading) {
    return (
      <View style={[st.container, { backgroundColor: colors.pg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.acRose} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[st.container, { backgroundColor: colors.pg }]}
      contentContainerStyle={st.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.acRose} />}
    >
      <View style={st.headerRow}>
        <View>
          <Text style={[st.title, { color: colors.tx }]}>Personal</Text>
          <Text style={{ color: colors.tx4, fontSize: 12 }}>{filtered.length} usuarios</Text>
        </View>
        <TouchableOpacity onPress={() => { setEditing(null); setShowForm(true); }} activeOpacity={0.85}>
          <LinearGradient colors={['#fb7185', '#f59e0b']} style={st.addBtn}>
            <Ionicons name="person-add-outline" size={16} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Agregar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={{ gap: 10 }}>
        {filtered.map((u) => {
          const badge = getRolBadge(u.rol);
          return (
            <View key={u.id} style={[st.userCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
              <View style={st.userCardInner}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <LinearGradient colors={getRolGradient(u.rol)} style={st.userAvatar}>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{u.nombreCompleto.charAt(0)}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.tx, fontSize: 14, fontWeight: '500' }}>{u.nombreCompleto}</Text>
                    <Text style={{ color: colors.tx4, fontSize: 11 }}>{u.correo}</Text>
                    {u.edad ? <Text style={{ color: colors.tx4, fontSize: 10 }}>{u.edad} años</Text> : null}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      <View style={[st.pill, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                        <Text style={{ color: badge.text, fontSize: 9 }}>{getRolLabel(u.rol)}</Text>
                      </View>
                      <View style={[st.pill, {
                        backgroundColor: u.estado === 'ACTIVO' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
                        borderColor: u.estado === 'ACTIVO' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)',
                      }]}>
                        <Text style={{ color: u.estado === 'ACTIVO' ? colors.acEmerald : colors.acRed, fontSize: 9 }}>
                          {u.estado === 'ACTIVO' ? 'Activo' : 'Bloqueado'}
                        </Text>
                      </View>
                      {u.sucursal ? (
                        <Text style={{ color: colors.tx4, fontSize: 9 }}>{u.sucursal.nombre}</Text>
                      ) : u.sucursalId ? (
                        <View style={[st.pill, { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.2)' }]}>
                          <Text style={{ color: colors.acAmber, fontSize: 9 }}>Sin sucursal</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <TouchableOpacity onPress={() => handleToggleEstado(u)} style={[st.iconBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
                    <Ionicons name={u.estado === 'ACTIVO' ? 'shield-outline' : 'shield-checkmark-outline'} size={16} color={u.estado === 'ACTIVO' ? colors.acAmber : colors.acEmerald} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setEditing(u); setShowForm(true); }} style={[st.iconBtn, { backgroundColor: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.2)' }]}>
                    <Ionicons name="create-outline" size={16} color={colors.acSky} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(u)} style={[st.iconBtn, { backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.2)' }]}>
                    <Ionicons name="trash-outline" size={16} color={colors.acRed} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Form Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <PersonalFormModal
          colors={colors}
          isOwner={isOwner}
          editing={editing}
          sucursales={sucursales}
          currentSucursalId={currentUser.sucursalId}
          onSave={async (data) => {
            try {
              if (editing) await api.put(`/usuarios/${editing.id}`, data);
              else await api.post('/usuarios', data);
              fetchData();
            } catch (error: any) {
              console.error('Error guardando:', error.response?.data?.message || error);
            }
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      </Modal>

      <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal(INITIAL_CONFIRM_STATE)} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 16, paddingBottom: 100, gap: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 17, fontWeight: '600' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  userCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
  userCardInner: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  userAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, borderWidth: 1 },
  iconBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});