// app_movil/app/(tabs)/personal/index.tsx  (REEMPLAZA el existente)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Button } from '../../../src/components/ui/forms/button';
import { Input } from '../../../src/components/ui/forms/input';
import { Switch } from '../../../src/components/ui/forms/switch';
import { ConfirmModal, ConfirmModalState, INITIAL_CONFIRM_STATE } from '../../../src/components/ui/overlays/confirm-modal';
import api from '../../../src/services/api';
import { useFocusEffect } from 'expo-router';

// ── Types ──
type Rol = 'OWNER_PRINCIPAL' | 'CO_OWNER' | 'ADMINISTRADOR' | 'EMPLEADO';
type Estado = 'ACTIVO' | 'BLOQUEADO';

interface Usuario {
  id: string;
  nombreCompleto: string;
  ci: string;
  correo: string;
  telefono: string;
  edad?: number;
  rol: Rol;
  estado: Estado;
  sucursalId?: string;
  permisoEditarPrendas?: boolean;
  sucursal?: { nombre: string };
}

interface Sucursal {
  id: string;
  nombre: string;
}

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

// ══════════════════════════════════════════════════════════
// ── PersonalFormModal ──
// ══════════════════════════════════════════════════════════
function PersonalFormModal({ colors, isOwner, editing, sucursales, currentSucursalId, onSave, onClose }: {
  colors: any; isOwner: boolean; editing: Usuario | null; sucursales: Sucursal[]; currentSucursalId?: string;
  onSave: (data: any) => void; onClose: () => void;
}) {
  const editingSucursalExists = editing?.sucursalId ? sucursales.some((s) => s.id === editing.sucursalId) : false;

  const [form, setForm] = useState({
    nombreCompleto: editing?.nombreCompleto || '',
    ci: editing?.ci || '',
    telefono: editing?.telefono || '',
    correo: editing?.correo || '',
    edad: editing?.edad?.toString() || '',
    rol: editing?.rol || 'EMPLEADO' as Rol,
    sucursalId: editingSucursalExists ? editing!.sucursalId! : (currentSucursalId || ''),
    permisoEditarPrendas: editing?.permisoEditarPrendas || false,
  });
  const [error, setError] = useState('');

  const roles: { v: Rol; l: string }[] = isOwner
    ? [{ v: 'CO_OWNER', l: 'Dueño' }, { v: 'ADMINISTRADOR', l: 'Admin' }, { v: 'EMPLEADO', l: 'Empleado' }]
    : [{ v: 'EMPLEADO', l: 'Empleado' }];

  const needsSucursal = form.rol !== 'CO_OWNER' && form.rol !== 'OWNER_PRINCIPAL';

  const handleSave = () => {
    if (!form.nombreCompleto || !form.ci || !form.correo) { setError('Complete campos obligatorios'); return; }
    if (needsSucursal && !form.sucursalId) { setError('Seleccione una sucursal'); return; }
    onSave({
      ...form,
      edad: form.edad ? parseInt(form.edad) : undefined,
      estado: editing?.estado || 'ACTIVO',
      sucursalId: needsSucursal ? form.sucursalId : undefined,
    });
  };

  return (
    <View style={[ms.overlay, { backgroundColor: colors.ov }]}>
      <View style={[ms.sheet, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
        <View style={[ms.header, { borderBottomColor: colors.bd }]}>
          <Text style={[ms.headerTitle, { color: colors.tx }]}>{editing ? 'Editar Personal' : 'Nuevo Personal'}</Text>
          <TouchableOpacity onPress={onClose} style={[ms.closeBtn, { backgroundColor: colors.fiSolid }]}>
            <Ionicons name="close" size={16} color={colors.tx4} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>
          {error !== '' && (
            <View style={[ms.errBanner, { borderColor: 'rgba(248,113,113,0.2)' }]}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.acRed} />
              <Text style={{ color: colors.acRed, fontSize: 13, flex: 1 }}>{error}</Text>
            </View>
          )}

          <Input label="Nombre Completo *" placeholder="Nombre y apellido" value={form.nombreCompleto} onChangeText={(v) => { setForm({ ...form, nombreCompleto: v }); setError(''); }} />
          <Input label="CI *" placeholder="12345678" value={form.ci} onChangeText={(v) => setForm({ ...form, ci: v })} keyboardType="numeric" />
          <Input label="Correo *" placeholder="correo@email.com" value={form.correo} onChangeText={(v) => setForm({ ...form, correo: v })} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Teléfono" placeholder="70012345" value={form.telefono} onChangeText={(v) => setForm({ ...form, telefono: v })} keyboardType="phone-pad" />
          <Input label="Edad" placeholder="25" value={form.edad} onChangeText={(v) => setForm({ ...form, edad: v })} keyboardType="numeric" />

          <View>
            <Text style={[ms.label, { color: colors.tx3 }]}>Rol</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {roles.map((r) => (
                <TouchableOpacity key={r.v} onPress={() => setForm({ ...form, rol: r.v })} activeOpacity={0.7}
                  style={[ms.chip, { backgroundColor: form.rol === r.v ? 'rgba(251,113,133,0.15)' : colors.fiSolid, borderColor: form.rol === r.v ? 'rgba(251,113,133,0.25)' : colors.bd }]}>
                  <Text style={{ color: form.rol === r.v ? colors.acRose : colors.tx4, fontSize: 12 }}>{r.l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {needsSucursal && (
            <View>
              <Text style={[ms.label, { color: colors.tx3 }]}>Sucursal *</Text>
              {sucursales.length === 0 ? (
                <View style={[ms.infoBanner, { backgroundColor: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.2)' }]}>
                  <Ionicons name="warning-outline" size={16} color={colors.acAmber} />
                  <Text style={{ color: colors.acAmber, fontSize: 12, flex: 1, marginLeft: 8 }}>No hay sucursales. Crea una primero.</Text>
                </View>
              ) : (
                <View style={{ gap: 6 }}>
                  {sucursales.map((su) => (
                    <TouchableOpacity key={su.id} onPress={() => { setForm({ ...form, sucursalId: su.id }); setError(''); }} activeOpacity={0.7}
                      style={[ms.sucBtn, { backgroundColor: form.sucursalId === su.id ? 'rgba(251,113,133,0.15)' : colors.fiSolid, borderColor: form.sucursalId === su.id ? 'rgba(251,113,133,0.25)' : colors.bd }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name="storefront-outline" size={16} color={form.sucursalId === su.id ? colors.acRose : colors.tx4} />
                        <Text style={{ color: form.sucursalId === su.id ? colors.acRose : colors.tx3, fontSize: 13 }}>{su.nombre}</Text>
                      </View>
                      {form.sucursalId === su.id && <Ionicons name="checkmark-circle" size={18} color={colors.acRose} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {editing?.sucursalId && !editingSucursalExists && (
                <View style={[ms.infoBanner, { backgroundColor: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.2)', marginTop: 8 }]}>
                  <Ionicons name="warning-outline" size={16} color={colors.acAmber} />
                  <Text style={{ color: colors.acAmber, fontSize: 11, flex: 1, marginLeft: 8 }}>La sucursal anterior fue eliminada. Asigne una nueva.</Text>
                </View>
              )}
            </View>
          )}

          {form.rol === 'EMPLEADO' && (
            <View style={[ms.permRow, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.tx2, fontSize: 13 }}>Permiso editar prendas</Text>
                <Text style={{ color: colors.tx4, fontSize: 10 }}>Puede agregar/editar prendas</Text>
              </View>
              <Switch checked={form.permisoEditarPrendas} onCheckedChange={(v) => setForm({ ...form, permisoEditarPrendas: v })} />
            </View>
          )}

          {!editing && (
            <View style={[ms.infoBanner, { backgroundColor: 'rgba(56,189,248,0.08)', borderColor: 'rgba(56,189,248,0.2)' }]}>
              <Ionicons name="key-outline" size={16} color={colors.acSky} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={{ color: colors.acSky, fontSize: 12 }}>Contraseña inicial: CI {form.ci || '(ingrese CI)'}</Text>
                <Text style={{ color: colors.tx4, fontSize: 10, marginTop: 2 }}>Se pedirá cambiarla al ingresar</Text>
              </View>
            </View>
          )}

          <Button variant="gradient" size="lg" onPress={handleSave}>{editing ? 'Guardar Cambios' : 'Registrar Personal'}</Button>
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </View>
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

const ms = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0, maxHeight: '90%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  chip: { flex: 1, paddingVertical: 10, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  sucBtn: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  permRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, borderWidth: 1, padding: 14 },
  infoBanner: { borderRadius: 14, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center' },
  errBanner: { backgroundColor: 'rgba(248,113,113,0.08)', borderRadius: 14, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
});