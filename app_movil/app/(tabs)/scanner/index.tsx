// app_movil/app/(tabs)/scanner/index.tsx

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Modal, Image, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Button } from '../../../src/components/ui/forms/button';
import { Input } from '../../../src/components/ui/forms/input';

type TipoCodigo = 'barras' | 'qr' | 'manual';
interface Prenda { id: string; marca: string; tipo: string; codigo: string; tipoCodigo: TipoCodigo; detalles: string; foto?: string; precio: number; rebaja?: number; sucursalId: string; estadoVenta: string; }
interface Sucursal { id: string; nombre: string; }

const demoSucursales: Sucursal[] = [{ id: 's1', nombre: 'Casa Matriz' }, { id: 's2', nombre: 'Sucursal Centro' }];
const demoPrendas: Prenda[] = [
  { id: 'p1', marca: 'Bershka', tipo: 'Blusa', codigo: '7501234567890', tipoCodigo: 'barras', detalles: 'Blusa floral', precio: 150, sucursalId: 's1', estadoVenta: 'disponible' },
  { id: 'p2', marca: 'Zara', tipo: 'Pantalón', codigo: 'QR-ZARA-001', tipoCodigo: 'qr', detalles: 'Slim fit negro', precio: 280, rebaja: 250, sucursalId: 's1', estadoVenta: 'disponible' },
  { id: 'p3', marca: 'H&M', tipo: 'Vestido', codigo: 'MAN-HM-055', tipoCodigo: 'manual', detalles: 'Casual verano', precio: 200, sucursalId: 's2', estadoVenta: 'disponible' },
  { id: 'p4', marca: 'Pull&Bear', tipo: 'Short', codigo: '8901234567890', tipoCodigo: 'barras', detalles: 'Denim clásico', precio: 120, sucursalId: 's1', estadoVenta: 'disponible' },
  { id: 'p5', marca: 'Mango', tipo: 'Falda', codigo: 'QR-MNG-012', tipoCodigo: 'qr', detalles: 'Plisada midi', precio: 180, sucursalId: 's2', estadoVenta: 'disponible' },
];

export default function ScannerScreen() {
  const { colors, isDark } = useTheme();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TipoCodigo>('barras');
  const [manualSearch, setManualSearch] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cart, setCart] = useState<Prenda[]>([]);
  const [lastFound, setLastFound] = useState<Prenda | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [ventaExitosa, setVentaExitosa] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const buscar = (c: string) => demoPrendas.find((p) => p.codigo === c);
  const resetSearch = () => { setLastFound(null); setNotFound(false); setScannedCode(''); setManualSearch(''); };
  const resetAll = () => { resetSearch(); setCart([]); setVentaExitosa(false); setShowCart(false); };

  const searchByCode = (code: string) => {
    if (!code.trim()) return;
    const p = buscar(code);
    setScannedCode(code);
    if (p) { setLastFound(p); setNotFound(false); } else { setLastFound(null); setNotFound(true); }
  };

  const addToCart = (p: Prenda) => { if (cart.find((c) => c.id === p.id)) return; setCart((prev) => [...prev, p]); resetSearch(); };
  const removeFromCart = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id));

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      const allCodes = demoPrendas.map((p) => p.codigo);
      const available = allCodes.filter((c) => { const p = buscar(c); return p && !cart.find((x) => x.id === p.id); });
      if (available.length > 0) searchByCode(available[Math.floor(Math.random() * available.length)]);
      else { setNotFound(true); setScannedCode('---'); }
    }, 2000);
  };

  const total = cart.reduce((s, p) => s + (p.rebaja || p.precio), 0);
  const confirmarVenta = () => { if (cart.length === 0) return; setCart([]); setVentaExitosa(true); setShowCart(false); };
  const suc = lastFound ? demoSucursales.find((s) => s.id === lastFound.sucursalId) : null;
  const alreadyInCart = lastFound ? cart.some((c) => c.id === lastFound.id) : false;
  const showScanArea = !lastFound && !notFound;

  const tabs: { id: TipoCodigo; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { id: 'barras', icon: 'barcode-outline', label: 'Barras' },
    { id: 'qr', icon: 'qr-code-outline', label: 'QR' },
    { id: 'manual', icon: 'keypad-outline', label: 'Manual' },
  ];

  return (
    <ScrollView style={[s.container, { backgroundColor: colors.pg }]} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.headerRow}>
        <View>
          <Text style={[s.title, { color: colors.tx }]}>Escáner</Text>
          <Text style={{ color: colors.tx4, fontSize: 12, marginTop: 2 }}>Escanea prendas para vender</Text>
        </View>
        {cart.length > 0 && (
          <TouchableOpacity onPress={() => setShowCart(true)} activeOpacity={0.85}>
            <LinearGradient colors={['#fb7185', '#f59e0b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.cartBtn}>
              <Ionicons name="cart-outline" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Bs {total}</Text>
              <View style={s.cartCount}><Text style={{ color: '#fb7185', fontSize: 10, fontWeight: '700' }}>{cart.length}</Text></View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Venta exitosa */}
      {ventaExitosa && (
        <View style={[s.successCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
          <View style={s.successIcon}><Ionicons name="checkmark-circle" size={40} color={colors.acEmerald} /></View>
          <Text style={{ color: colors.acEmerald, fontSize: 18, fontWeight: '600' }}>¡Venta Exitosa!</Text>
          <Text style={{ color: colors.tx3, fontSize: 13, marginTop: 4 }}>Todas las prendas han sido vendidas correctamente</Text>
          <Button variant="gradient" onPress={resetAll} style={{ marginTop: 20 }}>Escanear más</Button>
        </View>
      )}

      {/* Scanner card */}
      {!ventaExitosa && (
        <View style={[s.scanCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
          {/* Tabs */}
          <View style={[s.tabsRow, { borderBottomColor: colors.bd }]}>
            {tabs.map((tab) => (
              <TouchableOpacity key={tab.id} onPress={() => { setActiveTab(tab.id); resetSearch(); }}
                style={[s.tab, activeTab === tab.id && { borderBottomWidth: 2, borderBottomColor: colors.acRose, backgroundColor: 'rgba(251,113,133,0.05)' }]}>
                <Ionicons name={tab.icon} size={20} color={activeTab === tab.id ? colors.acRose : colors.tx4} />
                <Text style={{ color: activeTab === tab.id ? colors.acRose : colors.tx4, fontSize: 11 }}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ padding: 16, gap: 14 }}>
            {/* Camera scan area */}
            {activeTab !== 'manual' && showScanArea && (
              <>
                <View style={[s.cameraBox, { borderColor: colors.bd }]}>
                  {scanning ? <ActivityIndicator size="large" color={colors.acRose} /> : (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="camera-outline" size={44} color={colors.tx4} style={{ opacity: 0.4 }} />
                      <Text style={{ color: colors.tx4, fontSize: 13, marginTop: 8 }}>{activeTab === 'barras' ? 'Escanear código de barras' : 'Escanear código QR'}</Text>
                      {cart.length > 0 && <Text style={{ color: colors.acRose, fontSize: 11, marginTop: 4 }}>{cart.length} prenda{cart.length > 1 ? 's' : ''} en carrito</Text>}
                    </View>
                  )}
                </View>
                <Button variant="gradient" onPress={simulateScan} disabled={scanning} loading={scanning}>
                  {scanning ? 'Escaneando...' : cart.length > 0 ? 'Escanear otra prenda' : 'Activar Cámara'}
                </Button>
              </>
            )}

            {/* Manual input */}
            {activeTab === 'manual' && showScanArea && (
              <>
                <Input icon="keypad-outline" placeholder="Ingrese el código de la prenda..." value={manualSearch} onChangeText={setManualSearch} onSubmitEditing={() => searchByCode(manualSearch)} />
                {cart.length > 0 && <Text style={{ color: colors.acRose, fontSize: 11 }}>{cart.length} prenda{cart.length > 1 ? 's' : ''} en carrito</Text>}
                <Button variant="gradient" onPress={() => searchByCode(manualSearch)} disabled={!manualSearch.trim()}>Buscar Prenda</Button>
              </>
            )}

            {/* Found prenda */}
            {lastFound && (
              <View style={{ gap: 12 }}>
                <View style={[s.foundBanner, { backgroundColor: 'rgba(52,211,153,0.08)', borderColor: 'rgba(52,211,153,0.2)' }]}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.acEmerald} />
                  <Text style={{ color: colors.acEmerald, fontSize: 13, flex: 1 }}>Prenda encontrada</Text>
                  <Text style={{ color: colors.tx4, fontSize: 10 }}>{scannedCode}</Text>
                </View>
                <View style={s.foundRow}>
                  <View style={[s.foundImg, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
                    {lastFound.foto ? <Image source={{ uri: lastFound.foto }} style={{ width: '100%', height: '100%' }} /> : <Ionicons name="pricetag-outline" size={28} color={colors.tx4} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.tx, fontSize: 15, fontWeight: '500' }}>{lastFound.marca} - {lastFound.tipo}</Text>
                    {lastFound.detalles ? <Text style={{ color: colors.tx3, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{lastFound.detalles}</Text> : null}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      {lastFound.rebaja ? (
                        <><Text style={{ color: colors.tx4, textDecorationLine: 'line-through', fontSize: 12 }}>Bs {lastFound.precio}</Text><Text style={{ color: colors.acAmber, fontSize: 16, fontWeight: '600' }}>Bs {lastFound.rebaja}</Text></>
                      ) : <Text style={{ color: colors.acRose, fontSize: 16, fontWeight: '600' }}>Bs {lastFound.precio}</Text>}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <View style={[s.miniPill, { backgroundColor: lastFound.estadoVenta === 'disponible' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)' }]}>
                        <Text style={{ color: lastFound.estadoVenta === 'disponible' ? colors.acEmerald : colors.acRed, fontSize: 9 }}>{lastFound.estadoVenta}</Text>
                      </View>
                      <Text style={{ color: colors.tx4, fontSize: 10 }}>{suc?.nombre}</Text>
                    </View>
                  </View>
                </View>

                {lastFound.estadoVenta === 'disponible' && !alreadyInCart && (
                  <TouchableOpacity onPress={() => addToCart(lastFound)} activeOpacity={0.85}>
                    <LinearGradient colors={['#34d399', '#059669']} style={s.addCartBtn}>
                      <Ionicons name="add" size={20} color="#fff" />
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Añadir al carrito · Bs {lastFound.rebaja || lastFound.precio}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                {lastFound.estadoVenta === 'disponible' && alreadyInCart && (
                  <View style={[s.infoBanner, { backgroundColor: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.2)' }]}>
                    <Text style={{ color: colors.acAmber, fontSize: 13, textAlign: 'center' }}>Esta prenda ya está en el carrito</Text>
                  </View>
                )}
                {lastFound.estadoVenta === 'vendido' && (
                  <View style={[s.infoBanner, { backgroundColor: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)' }]}>
                    <Text style={{ color: colors.acRed, fontSize: 13, textAlign: 'center' }}>Esta prenda ya fue vendida</Text>
                  </View>
                )}
                <Button variant="outline" onPress={resetSearch}>Escanear otra prenda</Button>
              </View>
            )}

            {/* Not found */}
            {notFound && (
              <View style={{ alignItems: 'center', paddingVertical: 16, gap: 8 }}>
                <View style={[s.notFoundIcon, { backgroundColor: 'rgba(251,191,36,0.1)' }]}><Ionicons name="search" size={32} color={colors.acAmber} style={{ opacity: 0.6 }} /></View>
                <Text style={{ color: colors.acAmber, fontSize: 14 }}>No se encontró prenda</Text>
                <Text style={{ color: colors.tx4, fontSize: 12 }}>Código: {scannedCode}</Text>
                <Button variant="secondary" onPress={resetSearch}>Intentar de nuevo</Button>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Inline cart preview */}
      {!ventaExitosa && cart.length > 0 && !showCart && (
        <View style={[s.cartPreview, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
          <View style={s.cartPreviewHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="cart" size={18} color={colors.acRose} />
              <Text style={{ color: colors.tx, fontSize: 15, fontWeight: '500' }}>Carrito ({cart.length})</Text>
            </View>
            <TouchableOpacity onPress={() => setShowCart(true)}><Text style={{ color: colors.acRose, fontSize: 12 }}>Ver todo</Text></TouchableOpacity>
          </View>
          {cart.map((p) => (
            <View key={p.id} style={[s.cartItem, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.tx, fontSize: 12 }} numberOfLines={1}>{p.marca} - {p.tipo}</Text>
                <Text style={{ color: colors.tx4, fontSize: 10 }}>{p.codigo}</Text>
              </View>
              <Text style={{ color: colors.acAmber, fontSize: 13 }}>Bs {p.rebaja || p.precio}</Text>
              <TouchableOpacity onPress={() => removeFromCart(p.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="trash-outline" size={14} color={colors.acRed} />
              </TouchableOpacity>
            </View>
          ))}
          <View style={[s.cartTotalRow, { borderTopColor: colors.bd }]}>
            <Text style={{ color: colors.tx3, fontSize: 13 }}>Total</Text>
            <Text style={{ color: colors.acRose, fontSize: 18, fontWeight: '600' }}>Bs {total}</Text>
          </View>
          <TouchableOpacity onPress={confirmarVenta} activeOpacity={0.85}>
            <LinearGradient colors={['#34d399', '#059669']} style={s.confirmBtn}>
              <Ionicons name="cart" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Vender {cart.length} prenda{cart.length > 1 ? 's' : ''} · Bs {total}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Full Cart Modal */}
      <Modal visible={showCart} transparent animationType="slide">
        <View style={[s.modalOv, { backgroundColor: colors.ov }]}>
          <View style={[s.modalSheet, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
            <View style={[s.modalHeader, { borderBottomColor: colors.bd }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="cart" size={20} color={colors.acRose} />
                <Text style={{ color: colors.tx, fontSize: 16, fontWeight: '600' }}>Carrito de Venta</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCart(false)} style={[s.closeBtn, { backgroundColor: colors.fiSolid }]}><Ionicons name="close" size={16} color={colors.tx4} /></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
              {cart.map((p, idx) => (
                <View key={p.id} style={[s.cartModalItem, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
                  <Text style={{ color: colors.tx4, fontSize: 10, width: 20 }}>{idx + 1}.</Text>
                  <View style={[s.cartModalImg, { backgroundColor: colors.fiHSolid, borderColor: colors.bd }]}>
                    <Ionicons name="pricetag-outline" size={18} color={colors.tx4} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.tx, fontSize: 13 }}>{p.marca} - {p.tipo}</Text>
                    <Text style={{ color: colors.tx4, fontSize: 10 }}>{p.codigo}</Text>
                    <Text style={{ color: colors.acAmber, fontSize: 13, marginTop: 2 }}>Bs {p.rebaja || p.precio}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeFromCart(p.id)} style={[s.cartDelBtn, { borderColor: 'rgba(248,113,113,0.2)' }]}>
                    <Ionicons name="trash-outline" size={16} color={colors.acRed} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={() => setShowCart(false)} style={[s.addMoreBtn, { borderColor: 'rgba(251,113,133,0.2)' }]}>
                <Ionicons name="add" size={16} color={colors.acRose} />
                <Text style={{ color: colors.acRose, fontSize: 13 }}>Escanear y añadir más prendas</Text>
              </TouchableOpacity>
              <View style={[s.totalCard, { borderColor: 'rgba(251,113,133,0.15)' }]}>
                <View style={s.totalRow}><Text style={{ color: colors.tx3, fontSize: 13 }}>Prendas ({cart.length})</Text><Text style={{ color: colors.tx }}>Bs {total}</Text></View>
                <View style={[s.totalDivider, { borderTopColor: 'rgba(251,113,133,0.15)' }]} />
                <View style={s.totalRow}><Text style={{ color: colors.acRose, fontSize: 15 }}>Total a cobrar</Text><Text style={{ color: colors.acRose, fontSize: 20, fontWeight: '600' }}>Bs {total}</Text></View>
              </View>
              <TouchableOpacity onPress={confirmarVenta} activeOpacity={0.85}>
                <LinearGradient colors={['#34d399', '#059669']} style={s.confirmBtnLg}>
                  <Ionicons name="cart" size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Confirmar Venta · Bs {total}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 16, paddingBottom: 100, gap: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 17, fontWeight: '600' },
  cartBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  cartCount: { position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  successCard: { borderRadius: 18, borderWidth: 1, padding: 32, alignItems: 'center' },
  successIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(52,211,153,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  scanCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 12 },
  cameraBox: { aspectRatio: 4 / 3, borderRadius: 18, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  foundBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1, padding: 12 },
  foundRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  foundImg: { width: 88, height: 88, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1 },
  miniPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  addCartBtn: { height: 52, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  infoBanner: { borderRadius: 14, borderWidth: 1, padding: 12 },
  notFoundIcon: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  cartPreview: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 8 },
  cartPreviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  cartTotalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 12, marginTop: 4 },
  confirmBtn: { height: 52, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  modalOv: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cartModalItem: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 1, padding: 12 },
  cartModalImg: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cartDelBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  addMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 2, borderStyle: 'dashed', borderRadius: 14, paddingVertical: 14 },
  totalCard: { backgroundColor: 'rgba(251,113,133,0.1)', borderRadius: 18, borderWidth: 1, padding: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalDivider: { borderTopWidth: 1, marginVertical: 8 },
  confirmBtnLg: { height: 56, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});