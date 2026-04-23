// app_movil/src/components/inventario/PrendaViewModal.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import type { Prenda } from '../../types/inventario/types';

interface Props {
  prenda: Prenda;
  onClose: () => void;
}

export default function PrendaViewModal({ prenda, onClose }: Props) {
  const { colors } = useTheme();

  const badge = prenda.estadoVenta === 'DISPONIBLE'
    ? { bg: 'rgba(52,211,153,0.15)', text: colors.acEmerald }
    : prenda.estadoVenta === 'VENDIDO'
      ? { bg: 'rgba(248,113,113,0.15)', text: colors.acRed }
      : { bg: 'rgba(251,191,36,0.15)', text: colors.acAmber };

  const estadoLabel = prenda.estado === 'NUEVO' ? 'Nuevo' : prenda.estado === 'SEMI_NUEVO' ? 'Semi nuevo' : 'Usado';
  const ventaLabel = prenda.estadoVenta === 'DISPONIBLE' ? 'Disponible' : prenda.estadoVenta === 'VENDIDO' ? 'Vendido' : 'Reservado';

  return (
    <Modal visible transparent animationType="slide">
      <View style={[s.overlay, { backgroundColor: colors.ov }]}>
        <View style={[s.sheet, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, maxHeight: '85%' }]}>
          <View style={[s.header, { borderBottomColor: colors.bd }]}>
            <Text style={[s.headerTitle, { color: colors.tx }]}>Detalle de Prenda</Text>
            <TouchableOpacity onPress={onClose} style={[s.closeBtn, { backgroundColor: colors.fiSolid }]}>
              <Ionicons name="close" size={16} color={colors.tx4} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
            {/* Foto */}
            <View style={[s.viewPhoto, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
              {prenda.foto
                ? <Image source={{ uri: prenda.foto }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                : <Ionicons name="pricetag-outline" size={40} color={colors.tx4} />}
            </View>

            {/* Nombre + badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.tx, fontSize: 16, fontWeight: '600', flex: 1 }}>
                {prenda.marca ? `${prenda.marca} - ` : ''}{prenda.tipo}
              </Text>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: badge.bg }}>
                <Text style={{ color: badge.text, fontSize: 11 }}>{ventaLabel}</Text>
              </View>
            </View>

            {/* Precio */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {prenda.rebaja ? (
                <>
                  <Text style={{ color: colors.tx4, textDecorationLine: 'line-through', fontSize: 14 }}>Bs {prenda.precio}</Text>
                  <Text style={{ color: colors.acAmber, fontSize: 18, fontWeight: '600' }}>Bs {prenda.rebaja}</Text>
                  <View style={{ backgroundColor: 'rgba(52,211,153,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
                    <Text style={{ color: colors.acEmerald, fontSize: 10 }}>
                      -{Math.round(((prenda.precio - prenda.rebaja) / prenda.precio) * 100)}%
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={{ color: colors.acRose, fontSize: 18, fontWeight: '600' }}>Bs {prenda.precio}</Text>
              )}
            </View>

            {/* Tabla de detalles */}
            <View style={[s.detailsTable, { backgroundColor: colors.fiSolid }]}>
              {[
                { l: 'Código', v: prenda.codigo },
                { l: 'Tipo código', v: prenda.tipoCodigo },
                { l: 'Estado', v: estadoLabel },
                { l: 'Sucursal', v: prenda.sucursal?.nombre || '-' },
              ].map((item, i, arr) => (
                <View key={item.l} style={[s.detailRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.bd }]}>
                  <Text style={{ color: colors.tx4, fontSize: 13 }}>{item.l}</Text>
                  <Text style={{ color: colors.tx2, fontSize: 13 }}>{item.v}</Text>
                </View>
              ))}
            </View>

            {prenda.detalles ? (
              <View style={[s.detailsBox, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
                <Text style={{ color: colors.tx4, fontSize: 12, marginBottom: 4 }}>Detalles</Text>
                <Text style={{ color: colors.tx2, fontSize: 13 }}>{prenda.detalles}</Text>
              </View>
            ) : null}
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
  viewPhoto: { height: 200, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1 },
  detailsTable: { borderRadius: 14, overflow: 'hidden' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  detailsBox: { borderRadius: 14, padding: 16, borderWidth: 1 },
});