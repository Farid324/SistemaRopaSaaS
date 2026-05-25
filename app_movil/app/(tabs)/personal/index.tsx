//app_movil/app/(tabs)/personal/index.tsx

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, ActivityIndicator, RefreshControl, Image,
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
import { Input } from '../../../src/components/ui/forms/input';
import { useToast } from '../../../src/components/ui/feedback/sonner';

export default function PersonalScreen() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const toast = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(INITIAL_CONFIRM_STATE);

  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRol, setFilterRol] = useState<string>('ALL');
  const [filterEstado, setFilterEstado] = useState<string>('ALL');
  const [filterSucursal, setFilterSucursal] = useState<string>('ALL');
  const [activeFilterMenu, setActiveFilterMenu] = useState<'rol' | 'estado' | 'sucursal' | null>(null);

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

  // Filtrar: owner ve todos (excepto OWNER_PRINCIPAL y a sí mismo), admin solo empleados de su sucursal
  // OWNER_PRINCIPAL nunca aparece en la lista — es el dueño, no personal gestionable
  let filtered = isOwner
    ? usuarios.filter((u) => u.id !== currentUser.id && u.rol !== 'OWNER_PRINCIPAL')
    : usuarios.filter((u) => u.rol === 'EMPLEADO' && u.sucursalId === currentUser.sucursalId);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(u => u.nombreCompleto.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q));
  }
  if (filterRol !== 'ALL') {
    if (filterRol === 'DUEÑO') filtered = filtered.filter(u => u.rol === 'OWNER_PRINCIPAL' || u.rol === 'CO_OWNER');
    else filtered = filtered.filter(u => u.rol === filterRol);
  }
  if (filterEstado !== 'ALL') {
    filtered = filtered.filter(u => u.estado === filterEstado);
  }
  if (filterSucursal !== 'ALL') {
    if (filterSucursal === 'NONE') filtered = filtered.filter(u => !u.sucursalId);
    else filtered = filtered.filter(u => u.sucursalId === filterSucursal);
  }

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
          await fetchData();
          toast.success(willBlock ? 'Usuario bloqueado exitosamente' : 'Usuario activado exitosamente');
        } catch (error) { 
          console.error('Error actualizando estado:', error);
          toast.error('Error al actualizar estado'); 
        }
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
          await fetchData();
          toast.success('Usuario eliminado exitosamente');
        } catch (error: any) { 
            const msg = error.response?.data?.message || 'No se pudo eliminar el usuario';
            toast.error(msg);
            console.error('Error eliminando:', error); 
          }
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

      <View style={{ gap: 12, marginBottom: 8 }}>
        <Input 
          icon="search-outline" 
          placeholder="Buscar por nombre o correo..." 
          value={searchQuery} 
          onChangeText={setSearchQuery} 
          containerStyle={{ marginBottom: 4 }}
        />
        
        {/* Main Filter Buttons Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <TouchableOpacity 
            onPress={() => setActiveFilterMenu(activeFilterMenu === 'rol' ? null : 'rol')}
            style={[st.filterChip, { backgroundColor: activeFilterMenu === 'rol' ? colors.acRose : colors.fiSolid, borderColor: activeFilterMenu === 'rol' ? colors.acRose : colors.bd }]}
          >
            <Text style={{ color: activeFilterMenu === 'rol' ? '#fff' : colors.tx3, fontSize: 12 }}>
              {filterRol === 'ALL' ? 'Todos los roles' : filterRol === 'DUEÑO' ? 'Dueños' : filterRol === 'ADMINISTRADOR' ? 'Admins' : 'Empleados'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveFilterMenu(activeFilterMenu === 'estado' ? null : 'estado')}
            style={[st.filterChip, { backgroundColor: activeFilterMenu === 'estado' ? colors.acRose : colors.fiSolid, borderColor: activeFilterMenu === 'estado' ? colors.acRose : colors.bd }]}
          >
            <Text style={{ color: activeFilterMenu === 'estado' ? '#fff' : colors.tx3, fontSize: 12 }}>
              {filterEstado === 'ALL' ? 'Todos los estados' : filterEstado === 'ACTIVO' ? 'Activos' : 'Bloqueados'}
            </Text>
          </TouchableOpacity>

          {isOwner && (
            <TouchableOpacity 
              onPress={() => setActiveFilterMenu(activeFilterMenu === 'sucursal' ? null : 'sucursal')}
              style={[st.filterChip, { backgroundColor: activeFilterMenu === 'sucursal' ? colors.acRose : colors.fiSolid, borderColor: activeFilterMenu === 'sucursal' ? colors.acRose : colors.bd }]}
            >
              <Text style={{ color: activeFilterMenu === 'sucursal' ? '#fff' : colors.tx3, fontSize: 12 }}>
                {filterSucursal === 'ALL' ? 'Todas las sucursales' : filterSucursal === 'NONE' ? 'Sin sucursal' : sucursales.find(s => s.id === filterSucursal)?.nombre || 'Sucursal'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Sub-menu Row (Active Options) */}
        {activeFilterMenu && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(251,113,133,0.05)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(251,113,133,0.2)' }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {activeFilterMenu === 'rol' && (['ALL', 'EMPLEADO', 'ADMINISTRADOR', 'DUEÑO'] as const).map(rol => (
                <TouchableOpacity 
                  key={`rol-${rol}`} 
                  onPress={() => { setFilterRol(rol); setActiveFilterMenu(null); }}
                  style={[st.subFilterChip, { backgroundColor: filterRol === rol ? colors.acRose : colors.fiSolid, borderColor: filterRol === rol ? colors.acRose : colors.bd }]}
                >
                  <Text style={{ color: filterRol === rol ? '#fff' : colors.tx3, fontSize: 12 }}>
                    {rol === 'ALL' ? 'Todos los roles' : rol === 'DUEÑO' ? 'Dueños' : rol === 'ADMINISTRADOR' ? 'Admins' : 'Empleados'}
                  </Text>
                </TouchableOpacity>
              ))}
              {activeFilterMenu === 'estado' && (['ALL', 'ACTIVO', 'BLOQUEADO'] as const).map(estado => (
                <TouchableOpacity 
                  key={`est-${estado}`} 
                  onPress={() => { setFilterEstado(estado); setActiveFilterMenu(null); }}
                  style={[st.subFilterChip, { backgroundColor: filterEstado === estado ? colors.acRose : colors.fiSolid, borderColor: filterEstado === estado ? colors.acRose : colors.bd }]}
                >
                  <Text style={{ color: filterEstado === estado ? '#fff' : colors.tx3, fontSize: 12 }}>
                    {estado === 'ALL' ? 'Todos los estados' : estado === 'ACTIVO' ? 'Activos' : 'Bloqueados'}
                  </Text>
                </TouchableOpacity>
              ))}
              {activeFilterMenu === 'sucursal' && isOwner && (
                <>
                  <TouchableOpacity 
                    onPress={() => { setFilterSucursal('ALL'); setActiveFilterMenu(null); }}
                    style={[st.subFilterChip, { backgroundColor: filterSucursal === 'ALL' ? colors.acRose : colors.fiSolid, borderColor: filterSucursal === 'ALL' ? colors.acRose : colors.bd }]}
                  >
                    <Text style={{ color: filterSucursal === 'ALL' ? '#fff' : colors.tx3, fontSize: 12 }}>Todas</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => { setFilterSucursal('NONE'); setActiveFilterMenu(null); }}
                    style={[st.subFilterChip, { backgroundColor: filterSucursal === 'NONE' ? colors.acRose : colors.fiSolid, borderColor: filterSucursal === 'NONE' ? colors.acRose : colors.bd }]}
                  >
                    <Text style={{ color: filterSucursal === 'NONE' ? '#fff' : colors.tx3, fontSize: 12 }}>Ninguna</Text>
                  </TouchableOpacity>
                  {sucursales.map(s => (
                    <TouchableOpacity 
                      key={`suc-${s.id}`} 
                      onPress={() => { setFilterSucursal(s.id); setActiveFilterMenu(null); }}
                      style={[st.subFilterChip, { backgroundColor: filterSucursal === s.id ? colors.acRose : colors.fiSolid, borderColor: filterSucursal === s.id ? colors.acRose : colors.bd }]}
                    >
                      <Text style={{ color: filterSucursal === s.id ? '#fff' : colors.tx3, fontSize: 12 }}>{s.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </ScrollView>
            <TouchableOpacity onPress={() => setActiveFilterMenu(null)} style={{ padding: 4, backgroundColor: colors.cdSolid, borderRadius: 12, borderWidth: 1, borderColor: colors.bd, marginLeft: 'auto' }}>
              <Ionicons name="close" size={16} color={colors.tx4} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={{ gap: 10 }}>
        {filtered.map((u) => {
          const badge = getRolBadge(u.rol);
          return (
            <View key={u.id} style={[st.userCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
              <View style={st.userCardInner}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  {u.fotoPerfil ? (
                    <Image source={{ uri: u.fotoPerfil }} style={st.userAvatarImg} />
                  ) : (
                    <LinearGradient colors={getRolGradient(u.rol)} style={st.userAvatar}>
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{u.nombreCompleto.charAt(0)}</Text>
                    </LinearGradient>
                  )}
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
                      ) : (
                        <View style={[st.pill, { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.2)' }]}>
                          <Text style={{ color: colors.acAmber, fontSize: 9 }}>Sin sucursal</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {(() => {
                  const myRol = currentUser.rol;
                  const targetRol = u.rol;
                  // ¿Puede gestionar (bloquear/eliminar) a este usuario?
                  const canManage =
                    myRol === 'SUPER_ADMIN' ||
                    myRol === 'OWNER_PRINCIPAL' ||
                    (myRol === 'CO_OWNER' && targetRol !== 'OWNER_PRINCIPAL' && targetRol !== 'CO_OWNER') ||
                    (myRol === 'ADMINISTRADOR' && targetRol === 'EMPLEADO');

                  return (
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      {canManage && (
                        <TouchableOpacity onPress={() => handleToggleEstado(u)} style={[st.iconBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
                          <Ionicons name={u.estado === 'ACTIVO' ? 'shield-outline' : 'shield-checkmark-outline'} size={16} color={u.estado === 'ACTIVO' ? colors.acAmber : colors.acEmerald} />
                        </TouchableOpacity>
                      )}
                      {canManage && (
                        <TouchableOpacity onPress={() => { setEditing(u); setShowForm(true); }} style={[st.iconBtn, { backgroundColor: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.2)' }]}>
                          <Ionicons name="create-outline" size={16} color={colors.acSky} />
                        </TouchableOpacity>
                      )}
                      {canManage && (
                        <TouchableOpacity onPress={() => handleDelete(u)} style={[st.iconBtn, { backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.2)' }]}>
                          <Ionicons name="trash-outline" size={16} color={colors.acRed} />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })()}
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
          currentUserRol={currentUser.rol}
          editing={editing}
          sucursales={sucursales}
          currentSucursalId={currentUser.sucursalId}
          onSave={async (data) => {
            try {
              if (editing) {
                await api.put(`/usuarios/${editing.id}`, data);
                toast.success('Usuario actualizado exitosamente');
              } else {
                await api.post('/usuarios', data);
                toast.success('Usuario registrado exitosamente');
              }
              await fetchData();
              setShowForm(false);
            } catch (error: any) {
              if (error.response?.data?.reactivateId) {
                setConfirmModal({
                  visible: true,
                  title: 'Reactivar Usuario',
                  message: error.response.data.message,
                  icon: 'refresh-circle-outline',
                  iconColor: colors.acSky,
                  iconBg: 'rgba(56,189,248,0.15)',
                  confirmLabel: 'Reactivar',
                  confirmColor: ['#38bdf8', '#0284c7'],
                  onConfirm: async () => {
                    try {
                      await api.put(`/usuarios/${error.response.data.reactivateId}`, { ...data, estado: 'ACTIVO' });
                      toast.success('Usuario reactivado exitosamente');
                      await fetchData();
                      setShowForm(false);
                      setConfirmModal(INITIAL_CONFIRM_STATE);
                    } catch (e: any) {
                      toast.error(e.response?.data?.message || 'No se pudo reactivar');
                      setConfirmModal(INITIAL_CONFIRM_STATE);
                    }
                  },
                });
                return;
              }
              const msg = error.response?.data?.message || 'Error al guardar usuario';
              toast.error(msg);
              console.error('Error guardando:', msg);
              throw error; // Lanzar para que el modal sepa que falló
            }
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
  userAvatarImg: { width: 40, height: 40, borderRadius: 20 },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, borderWidth: 1 },
  iconBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  subFilterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
});