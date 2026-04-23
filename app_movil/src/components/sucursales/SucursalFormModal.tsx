//app_movil/src/components/sucursales/SucursalFormModal.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/forms/button';
import { Input } from '../ui/forms/input';
import { Sucursal } from '../../types/sucursales/types';

interface Props {
  colors: any;
  editing: Sucursal | null;
  onSave: (d: any) => void;
  onClose: () => void;
}

export function SucursalFormModal({ colors, editing, onSave, onClose }: Props) {
  const [form, setForm] = useState({ 
    nombre: editing?.nombre || '', 
    detalles: editing?.detalles || '', 
    direccion: editing?.direccion || '', 
    estado: editing?.estado || 'ACTIVO', 
    horarios: editing?.horarios || '08:00 - 20:00', 
    maxAdministradores: editing?.maxAdministradores?.toString() || '2' 
  });

  const handleSave = () => { 
    if (!form.nombre || !form.direccion) return; 
    onSave({ ...form, maxAdministradores: parseInt(form.maxAdministradores) || 2 }); 
  };

  return (
    <View style={[ms.overlay, { backgroundColor: colors.ov }]}>
      <View style={[ms.sheet, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
        <View style={[ms.header, { borderBottomColor: colors.bd }]}>
          <Text style={[ms.headerTitle, { color: colors.tx }]}>{editing ? 'Editar Sucursal' : 'Nueva Sucursal'}</Text>
          <TouchableOpacity onPress={onClose} style={[ms.closeBtn, { backgroundColor: colors.fiSolid }]}>
            <Ionicons name="close" size={16} color={colors.tx4} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>
          <Input label="Nombre *" placeholder="Nombre de sucursal" value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} />
          <Input label="Dirección *" placeholder="Dirección completa" value={form.direccion} onChangeText={(v) => setForm({ ...form, direccion: v })} />
          <Input label="Detalles" placeholder="Detalles adicionales" value={form.detalles} onChangeText={(v) => setForm({ ...form, detalles: v })} />
          <Input label="Horarios" placeholder="08:00 - 20:00" value={form.horarios} onChangeText={(v) => setForm({ ...form, horarios: v })} />
          <Input label="Max. Admins" placeholder="2" value={form.maxAdministradores} onChangeText={(v) => setForm({ ...form, maxAdministradores: v })} keyboardType="numeric" />
          <View>
            <Text style={[ms.label, { color: colors.tx3 }]}>Estado</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['ACTIVO', 'CERRADO'] as const).map((e) => (
                <TouchableOpacity key={e} onPress={() => setForm({ ...form, estado: e })} activeOpacity={0.7}
                  style={[ms.chip, { backgroundColor: form.estado === e ? 'rgba(251,113,133,0.15)' : colors.fiSolid, borderColor: form.estado === e ? 'rgba(251,113,133,0.25)' : colors.bd }]}>
                  <Text style={{ color: form.estado === e ? colors.acRose : colors.tx4, fontSize: 13 }}>{e === 'ACTIVO' ? 'Abierto' : 'Cerrado'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <Button variant="gradient" size="lg" onPress={handleSave}>{editing ? 'Guardar Cambios' : 'Crear Sucursal'}</Button>
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
});