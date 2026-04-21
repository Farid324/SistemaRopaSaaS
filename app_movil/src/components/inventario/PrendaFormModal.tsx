// app_movil/app/(tabs)/inventario/components/PrendaFormModal.tsx

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Switch } from '../ui/forms/switch';
import { Button } from '../ui/forms/button';
import { Input } from '../ui/forms/input';
import type { Prenda, TipoCodigo, EstadoPrenda, Sucursal } from './types';

interface Props {
  editing: Prenda | null;
  scannedCode: string;
  scannedType: TipoCodigo;
  sucursales: Sucursal[];
  isOwner: boolean;
  currentSucursalId?: string;
  onSave: (data: any) => void;
  onClose: () => void;
}

export default function PrendaFormModal({ editing, scannedCode, scannedType, sucursales, isOwner, currentSucursalId, onSave, onClose }: Props) {
  const { colors } = useTheme();
  const [marca, setMarca] = useState(editing?.marca || '');
  const [tipo, setTipo] = useState(editing?.tipo || '');
  const [detalles, setDetalles] = useState(editing?.detalles || '');
  const [estado, setEstado] = useState(editing?.estado || 'NUEVO');
  const [precio, setPrecio] = useState(editing?.precio?.toString() || '');
  const [rebajaActiva, setRebajaActiva] = useState(!!editing?.rebaja);
  const [rebaja, setRebaja] = useState(editing?.rebaja?.toString() || '');
  const [sucursalId, setSucursalId] = useState(editing?.sucursalId || currentSucursalId || sucursales[0]?.id || '');
  const [error, setError] = useState('');

  const tipos = ['Blusa', 'Pantalón', 'Vestido', 'Falda', 'Short', 'Camisa', 'Chaqueta', 'Sudadera', 'Polera', 'Otro'];
  const codeIcon: keyof typeof Ionicons.glyphMap = scannedType === 'BARRAS' ? 'barcode-outline' : scannedType === 'QR' ? 'qr-code-outline' : 'keypad-outline';

  const handleSave = () => {
    if (!tipo || !precio) { setError('Completa los campos obligatorios'); return; }
    onSave({
      marca: marca || null, tipo, codigo: scannedCode, tipoCodigo: scannedType, detalles: detalles || null,
      estado, precio: parseFloat(precio), rebaja: rebajaActiva && rebaja ? parseFloat(rebaja) : null,
      sucursalId, estadoVenta: editing?.estadoVenta || 'DISPONIBLE', publicadoWeb: editing?.publicadoWeb || false,
    });
  };

  return (
    <Modal visible transparent animationType="slide">
      <View style={[s.overlay, { backgroundColor: colors.ov }]}>
        <View style={[s.sheet, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, maxHeight: '92%' }]}>
          <View style={[s.header, { borderBottomColor: colors.bd }]}>
            <View>
              <Text style={[s.headerTitle, { color: colors.tx }]}>{editing ? 'Editar Prenda' : 'Paso 2: Datos'}</Text>
              <Text style={{ color: colors.tx4, fontSize: 10 }}>{scannedCode} ({scannedType})</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[s.closeBtn, { backgroundColor: colors.fiSolid }]}>
              <Ionicons name="close" size={16} color={colors.tx4} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>
            {error !== '' && (
              <View style={[s.infoBanner, { backgroundColor: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)' }]}>
                <Text style={{ color: colors.acRed, fontSize: 13 }}>{error}</Text>
              </View>
            )}

            {/* Código escaneado */}
            <View style={[s.codeInfo, { backgroundColor: 'rgba(251,113,133,0.1)', borderColor: 'rgba(251,113,133,0.2)' }]}>
              <View style={[s.codeIconBox, { backgroundColor: 'rgba(251,113,133,0.15)' }]}>
                <Ionicons name={codeIcon} size={20} color={colors.acRose} />
              </View>
              <View>
                <Text style={{ color: colors.acRose, fontSize: 12 }}>Código {scannedType}</Text>
                <Text style={{ color: colors.tx4, fontSize: 10 }}>{scannedCode}</Text>
              </View>
            </View>

            {/* Foto */}
            <View>
              <Text style={[s.fieldLabel, { color: colors.tx3 }]}>Foto (Opcional)</Text>
              <TouchableOpacity onPress={() => Alert.alert('Foto', 'Cámara/galería próximamente')} style={[s.photoBtn, { borderColor: colors.bd2Solid }]}>
                <View style={[s.photoIcon, { backgroundColor: colors.fiSolid }]}>
                  <Ionicons name="image-outline" size={24} color={colors.tx4} />
                </View>
                <Text style={{ color: colors.tx4, fontSize: 12 }}>Tomar foto</Text>
              </TouchableOpacity>
            </View>

            <Input label="Marca" placeholder="Bershka, Zara, H&M..." value={marca} onChangeText={(v) => { setMarca(v); setError(''); }} />

            {/* Tipo */}
            <View>
              <Text style={[s.fieldLabel, { color: colors.tx3 }]}>Tipo de prenda *</Text>
              <View style={s.tiposWrap}>
                {tipos.map((t) => (
                  <TouchableOpacity key={t} onPress={() => { setTipo(t); setError(''); }} activeOpacity={0.7}
                    style={[s.tipoChip, { backgroundColor: tipo === t ? 'rgba(251,113,133,0.15)' : colors.fiSolid, borderColor: tipo === t ? 'rgba(251,113,133,0.25)' : colors.bd }]}>
                    <Text style={{ color: tipo === t ? colors.acRose : colors.tx4, fontSize: 12 }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Detalles */}
            <View>
              <Text style={[s.fieldLabel, { color: colors.tx3 }]}>Detalles</Text>
              <TextInput style={[s.textarea, { backgroundColor: colors.fiSolid, borderColor: colors.bd2Solid, color: colors.tx }]}
                placeholder="Color rojo, talla M..." placeholderTextColor={colors.tx4} value={detalles} onChangeText={setDetalles} multiline numberOfLines={2} textAlignVertical="top" />
            </View>

            {/* Estado */}
            <View>
              <Text style={[s.fieldLabel, { color: colors.tx3 }]}>Estado</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[{ v: 'NUEVO', l: 'Nuevo', e: '✨' }, { v: 'SEMI_NUEVO', l: 'Semi nuevo', e: '👍' }, { v: 'USADO', l: 'Usado', e: '📦' }].map((o) => (
                  <TouchableOpacity key={o.v} onPress={() => setEstado(o.v as EstadoPrenda)} activeOpacity={0.7}
                    style={[s.estadoBtn, { backgroundColor: estado === o.v ? 'rgba(251,113,133,0.15)' : colors.fiSolid, borderColor: estado === o.v ? 'rgba(251,113,133,0.25)' : colors.bd }]}>
                    <Text>{o.e}</Text>
                    <Text style={{ color: estado === o.v ? colors.acRose : colors.tx4, fontSize: 12 }}>{o.l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Precio */}
            <View>
              <Text style={[s.fieldLabel, { color: colors.tx3 }]}>Precio (Bs) *</Text>
              <View style={[s.priceWrap, { backgroundColor: colors.fiSolid, borderColor: colors.bd2Solid }]}>
                <Text style={{ color: colors.tx4, fontSize: 13 }}>Bs</Text>
                <TextInput style={[s.priceInput, { color: colors.tx }]} placeholder="0.00" placeholderTextColor={colors.tx4} value={precio} onChangeText={(v) => { setPrecio(v); setError(''); }} keyboardType="numeric" />
              </View>
            </View>

            {/* Rebaja */}
            <View style={[s.rebajaBox, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
              <View style={s.rebajaHeader}>
                <View><Text style={{ color: colors.tx2, fontSize: 13 }}>¿Tiene rebaja?</Text><Text style={{ color: colors.tx4, fontSize: 10 }}>Precio con descuento</Text></View>
                <Switch checked={rebajaActiva} onCheckedChange={(v) => { setRebajaActiva(v); if (!v) setRebaja(''); }} />
              </View>
              {rebajaActiva && (
                <View style={{ marginTop: 12 }}>
                  <View style={[s.priceWrap, { backgroundColor: colors.fiSolid, borderColor: colors.bd2Solid }]}>
                    <Text style={{ color: colors.tx4, fontSize: 13 }}>Bs</Text>
                    <TextInput style={[s.priceInput, { color: colors.tx }]} placeholder="Precio rebajado" placeholderTextColor={colors.tx4} value={rebaja} onChangeText={setRebaja} keyboardType="numeric" />
                  </View>
                  {precio && rebaja && parseFloat(rebaja) < parseFloat(precio) && (
                    <Text style={{ color: colors.acEmerald, fontSize: 10, marginTop: 4 }}>-{Math.round(((parseFloat(precio) - parseFloat(rebaja)) / parseFloat(precio)) * 100)}% descuento</Text>
                  )}
                </View>
              )}
            </View>

            {/* Sucursal */}
            <View>
              <Text style={[s.fieldLabel, { color: colors.tx3 }]}>Sucursal</Text>
              {isOwner ? (
                <View style={{ gap: 6 }}>
                  {sucursales.map((sc) => (
                    <TouchableOpacity key={sc.id} onPress={() => setSucursalId(sc.id)} activeOpacity={0.7}
                      style={[s.sucursalBtn, { backgroundColor: sucursalId === sc.id ? 'rgba(251,113,133,0.15)' : colors.fiSolid, borderColor: sucursalId === sc.id ? 'rgba(251,113,133,0.25)' : colors.bd }]}>
                      <Text style={{ color: sucursalId === sc.id ? colors.acRose : colors.tx3, fontSize: 13 }}>{sc.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={[s.sucursalBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
                  <Text style={{ color: colors.tx3, fontSize: 13 }}>{sucursales.find((sc) => sc.id === sucursalId)?.nombre || 'Asignada'}</Text>
                </View>
              )}
            </View>

            {/* Online (disabled) */}
            <View style={[s.rebajaBox, { backgroundColor: colors.fiSolid, borderColor: colors.bd, opacity: 0.4 }]}>
              <View style={s.rebajaHeader}>
                <View><Text style={{ color: colors.tx4, fontSize: 13 }}>Publicar en Tienda Online</Text><Text style={{ color: colors.tx4, fontSize: 10 }}>Próximamente</Text></View>
                <Switch checked={false} onCheckedChange={() => {}} disabled />
              </View>
            </View>

            <Button variant="gradient" size="lg" onPress={handleSave}>{editing ? 'Guardar Cambios' : 'Registrar Prenda'}</Button>
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  infoBanner: { borderRadius: 14, borderWidth: 1, padding: 12 },
  codeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, padding: 12 },
  codeIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  fieldLabel: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  photoBtn: { height: 140, borderRadius: 18, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tiposWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tipoChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, borderWidth: 1 },
  textarea: { borderRadius: 14, borderWidth: 1, padding: 14, fontSize: 13, minHeight: 70, textAlignVertical: 'top' },
  estadoBtn: { flex: 1, paddingVertical: 10, borderRadius: 14, borderWidth: 1, alignItems: 'center', gap: 2 },
  priceWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1, height: 48, paddingHorizontal: 14 },
  priceInput: { flex: 1, fontSize: 14 },
  rebajaBox: { borderRadius: 14, borderWidth: 1, padding: 14 },
  rebajaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sucursalBtn: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
});