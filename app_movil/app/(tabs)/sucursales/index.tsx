// app_movil/app/(tabs)/sucursales/index.tsx  (REEMPLAZA el existente)

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Button } from '../../../src/components/ui/forms/button';
import { Input } from '../../../src/components/ui/forms/input';
import api from '../../../src/services/api';

interface Sucursal {
  id: string; nombre: string; detalles?: string; direccion?: string;
  estado: string; horarios?: string; maxAdministradores: number;
  _count?: { usuarios: number; prendas: number };
}

function DeleteSucursalModal({ visible, sucursal, onDelete, onCancel, colors }: {
  visible: boolean; sucursal: Sucursal | null; onDelete: () => void; onCancel: () => void; colors: any;
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!visible || !sucursal) return null;

  const userCount = sucursal._count?.usuarios || 0;
  const prendaCount = sucursal._count?.prendas || 0;
  const hasData = userCount > 0 || prendaCount > 0;

  const handleDownloadCSV = async () => {
    setDownloading(true);
    try {
      const [usersRes, prendasRes] = await Promise.all([
        api.get(`/usuarios?sucursalId=${sucursal.id}`),
        api.get(`/prendas?sucursalId=${sucursal.id}`),
      ]);

      let csv = 'REPORTE DE SUCURSAL: ' + sucursal.nombre + '\n\n';
      csv += 'USUARIOS\n';
      csv += 'Nombre,CI,Correo,Rol,Estado\n';
      (usersRes.data || []).forEach((u: any) => {
        csv += `${u.nombreCompleto},${u.ci},${u.correo},${u.rol},${u.estado}\n`;
      });
      csv += '\nPRENDAS\n';
      csv += 'Codigo,Marca,Tipo,Precio,Rebaja,Estado Venta\n';
      (prendasRes.data || []).forEach((p: any) => {
        csv += `${p.codigo},${p.marca || '-'},${p.tipo},${p.precio},${p.rebaja || '-'},${p.estadoVenta}\n`;
      });

      const fileName = `sucursal_${sucursal.nombre.replace(/\s+/g, '_')}_${Date.now()}.csv`;
      const file = new File(Paths.cache, fileName);
      file.create();
      file.write(csv);
      await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Descargar reporte' });
      setDownloaded(true);
    } catch (error) {
      console.error('Error descargando CSV:', error);
      Alert.alert('Error', 'No se pudo generar el archivo');
    }
    setDownloading(false);
  };

  return (
    <Modal visible transparent animationType="fade">
      <View style={dm.overlay}>
        <View style={[dm.card, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
          <View style={[dm.iconCircle, { backgroundColor: 'rgba(248,113,113,0.15)' }]}>
            <Ionicons name="storefront-outline" size={28} color={colors.acRed} />
          </View>
          <Text style={[dm.title, { color: colors.tx }]}>Eliminar sucursal</Text>
          <Text style={[dm.subtitle, { color: colors.tx3 }]}>{sucursal.nombre}</Text>

          {hasData && (
            <View style={[dm.countsBox, { backgroundColor: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.2)' }]}>
              <Ionicons name="warning-outline" size={18} color={colors.acAmber} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={{ color: colors.acAmber, fontSize: 12, fontWeight: '500' }}>Se eliminarán:</Text>
                <View style={{ gap: 2, marginTop: 4 }}>
                  {userCount > 0 && <View style={dm.countRow}><Ionicons name="people-outline" size={14} color={colors.tx3} /><Text style={{ color: colors.tx3, fontSize: 12 }}>{userCount} usuario{userCount > 1 ? 's' : ''} (quedarán sin sucursal)</Text></View>}
                  {prendaCount > 0 && <View style={dm.countRow}><Ionicons name="pricetag-outline" size={14} color={colors.tx3} /><Text style={{ color: colors.tx3, fontSize: 12 }}>{prendaCount} prenda{prendaCount > 1 ? 's' : ''} (se eliminarán)</Text></View>}
                </View>
              </View>
            </View>
          )}

          {hasData && (
            <TouchableOpacity onPress={handleDownloadCSV} disabled={downloading} activeOpacity={0.7}
              style={[dm.downloadBtn, { backgroundColor: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.2)' }]}>
              {downloading ? <ActivityIndicator size="small" color={colors.acSky} /> : (
                <><Ionicons name={downloaded ? 'checkmark-circle' : 'download-outline'} size={18} color={colors.acSky} />
                <Text style={{ color: colors.acSky, fontSize: 13 }}>{downloaded ? 'Descarga lista' : 'Descargar datos antes de eliminar'}</Text></>
              )}
            </TouchableOpacity>
          )}

          {!hasData && <Text style={{ color: colors.tx3, fontSize: 13, textAlign: 'center', marginVertical: 8 }}>Esta sucursal no tiene datos.</Text>}

          <View style={dm.btnRow}>
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7} style={[dm.cancelBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
              <Text style={{ color: colors.tx3, fontSize: 14, fontWeight: '500' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} activeOpacity={0.85} style={{ flex: 1 }}>
              <LinearGradient colors={['#f87171', '#dc2626']} style={dm.deleteBtn}>
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Eliminar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const dm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  card: { width: '100%', borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center' },
  iconCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 16 },
  countsBox: { width: '100%', borderRadius: 14, borderWidth: 1, padding: 12, flexDirection: 'row', marginBottom: 12 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  downloadBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, paddingVertical: 12, marginBottom: 16 },
  btnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});

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
    try { const res = await api.get('/sucursales'); setSucursales(res.data); }
    catch (error) { console.error('Error cargando sucursales:', error); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchSucursales(); }, [fetchSucursales]));
  if (!currentUser) return null;
  const onRefresh = () => { setRefreshing(true); fetchSucursales(); };

  const handleDelete = async () => {
    if (!deletingSuc) return;
    try { await api.delete(`/sucursales/${deletingSuc.id}`); fetchSucursales(); }
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
          <LinearGradient colors={['#fb7185', '#f59e0b']} style={st.addBtn}><Ionicons name="add" size={16} color="#fff" /><Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Nueva</Text></LinearGradient>
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
        <SucursalFormModal colors={colors} editing={editing}
          onSave={async (data) => { try { if (editing) await api.put(`/sucursales/${editing.id}`, data); else await api.post('/sucursales', data); fetchSucursales(); } catch (e) { console.error(e); } setShowForm(false); }}
          onClose={() => setShowForm(false)} />
      </Modal>
      <DeleteSucursalModal visible={!!deletingSuc} sucursal={deletingSuc} onDelete={handleDelete} onCancel={() => setDeletingSuc(null)} colors={colors} />
    </ScrollView>
  );
}

function SucursalFormModal({ colors, editing, onSave, onClose }: { colors: any; editing: Sucursal | null; onSave: (d: any) => void; onClose: () => void; }) {
  const [form, setForm] = useState({ nombre: editing?.nombre || '', detalles: editing?.detalles || '', direccion: editing?.direccion || '', estado: editing?.estado || 'ACTIVO', horarios: editing?.horarios || '08:00 - 20:00', maxAdministradores: editing?.maxAdministradores?.toString() || '2' });
  const handleSave = () => { if (!form.nombre || !form.direccion) return; onSave({ ...form, maxAdministradores: parseInt(form.maxAdministradores) || 2 }); };
  return (
    <View style={[ms.overlay, { backgroundColor: colors.ov }]}>
      <View style={[ms.sheet, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
        <View style={[ms.header, { borderBottomColor: colors.bd }]}>
          <Text style={[ms.headerTitle, { color: colors.tx }]}>{editing ? 'Editar Sucursal' : 'Nueva Sucursal'}</Text>
          <TouchableOpacity onPress={onClose} style={[ms.closeBtn, { backgroundColor: colors.fiSolid }]}><Ionicons name="close" size={16} color={colors.tx4} /></TouchableOpacity>
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
const ms = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0, maxHeight: '90%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  chip: { flex: 1, paddingVertical: 10, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
});