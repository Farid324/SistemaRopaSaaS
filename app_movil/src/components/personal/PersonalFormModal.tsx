//app_movil/src/components/personal/PersonalFormModal.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../ui/forms/button';
import { Input } from '../ui/forms/input';
import { Switch } from '../ui/forms/switch';
import { Usuario, Sucursal, Rol } from '../../types/personal/types';

interface PersonalFormModalProps {
  colors: any;
  isOwner: boolean;
  editing: Usuario | null;
  sucursales: Sucursal[];
  currentSucursalId?: string;
  onSave: (data: any) => void;
  onClose: () => void;
}

export function PersonalFormModal({ colors, isOwner, editing, sucursales, currentSucursalId, onSave, onClose }: PersonalFormModalProps) {
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