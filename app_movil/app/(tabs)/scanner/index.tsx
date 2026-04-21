// app_movil/app/(tabs)/scanner/index.tsx  (REEMPLAZA el existente)

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  Modal, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Button } from '../../../src/components/ui/forms/button';
import { Input } from '../../../src/components/ui/forms/input';
import { ConfirmModal, ConfirmModalState, INITIAL_CONFIRM_STATE } from '../../../src/components/ui/overlays/confirm-modal';
//import PaymentModal from '../../../../../../src/components/scanner/PaymentModal';
import PaymentModal from '../../../src/components/scanner/PaymentModal';
import api from '../../../src/services/api';

interface Prenda {
  id: string; marca?: string; tipo: string; codigo: string; tipoCodigo: string;
  detalles?: string; foto?: string; precio: number; rebaja?: number;
  sucursalId: string; estadoVenta: string;
  sucursal?: { nombre: string };
}

type TipoCodigo = 'BARRAS' | 'QR' | 'MANUAL';
type MetodoPago = 'EFECTIVO' | 'QR' | 'TARJETA';

export default function ScannerScreen() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();

  const [activeTab, setActiveTab] = useState<TipoCodigo>('BARRAS');
  const [manualSearch, setManualSearch] = useState('');
  const [scanned, setScanned] = useState(false);
  const [cart, setCart] = useState<Prenda[]>([]);
  const [lastFound, setLastFound] = useState<Prenda | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [ventaExitosa, setVentaExitosa] = useState(false);
  const [ventaId, setVentaId] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(INITIAL_CONFIRM_STATE);

  // Reset scanner when tab loses focus
  useFocusEffect(useCallback(() => { return () => { setScanned(false); }; }, []));

  if (!currentUser) return null;

  const resetSearch = () => { setLastFound(null); setNotFound(false); setScannedCode(''); setManualSearch(''); setScanned(false); };
  const resetAll = () => { resetSearch(); setCart([]); setVentaExitosa(false); setVentaId(''); setShowCart(false); };

  // ── Buscar prenda en backend ──
  const searchByCode = async (code: string) => {
    if (!code.trim()) return;
    setScannedCode(code);
    try {
      const res = await api.get(`/prendas/codigo/${code}`);
      setLastFound(res.data);
      setNotFound(false);
    } catch {
      setLastFound(null);
      setNotFound(true);
    }
  };

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    await searchByCode(data);
  };

  const addToCart = (p: Prenda) => {
    if (cart.find((c) => c.id === p.id)) return;
    setCart((prev) => [...prev, p]);
    resetSearch();
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id));
  const total = cart.reduce((s, p) => s + (p.rebaja || p.precio), 0);
  const alreadyInCart = lastFound ? cart.some((c) => c.id === lastFound.id) : false;
  const showScanArea = !lastFound && !notFound;

  // ── Confirmar venta con método de pago ──
  const handleConfirmSale = async (metodosPago: { metodo: MetodoPago; monto: number }[]) => {
    setShowPayment(false);
    setProcessing(true);
    try {
      const res = await api.post('/ventas', {
        prendaIds: cart.map((p) => p.id),
        sucursalId: currentUser.sucursalId || cart[0]?.sucursalId,
        metodosPago,
      });
      setVentaId(res.data.id?.slice(0, 8)?.toUpperCase() || '');
      setCart([]);
      setVentaExitosa(true);
      setShowCart(false);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al registrar venta';
      setConfirmModal({
        visible: true, title: 'Error', message: msg,
        icon: 'alert-circle-outline', iconColor: colors.acRed, iconBg: 'rgba(248,113,113,0.15)',
        confirmLabel: 'OK', confirmColor: ['#f87171', '#dc2626'],
        onConfirm: () => setConfirmModal(INITIAL_CONFIRM_STATE),
      });
    }
    setProcessing(false);
  };

  const barcodeTypes = activeTab === 'QR'
    ? ['qr' as const]
    : ['ean13' as const, 'ean8' as const, 'code128' as const, 'code39' as const, 'upc_a' as const, 'upc_e' as const];

  const tabs: { id: TipoCodigo; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { id: 'BARRAS', icon: 'barcode-outline', label: 'Barras' },
    { id: 'QR', icon: 'qr-code-outline', label: 'QR' },
    { id: 'MANUAL', icon: 'keypad-outline', label: 'Manual' },
  ];

  return (
    <ScrollView style={[st.container, { backgroundColor: colors.pg }]} contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={st.headerRow}>
        <View>
          <Text style={[st.title, { color: colors.tx }]}>Escáner</Text>
          <Text style={{ color: colors.tx4, fontSize: 12, marginTop: 2 }}>Escanea prendas para vender</Text>
        </View>
        {cart.length > 0 && (
          <TouchableOpacity onPress={() => setShowCart(true)} activeOpacity={0.85}>
            <LinearGradient colors={['#fb7185', '#f59e0b']} style={st.cartBtn}>
              <Ionicons name="cart-outline" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Bs {total}</Text>
              <View style={st.cartCount}><Text style={{ color: '#fb7185', fontSize: 10, fontWeight: '700' }}>{cart.length}</Text></View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Venta exitosa */}
      {ventaExitosa && (
        <View style={[st.successCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
          <View style={st.successIcon}><Ionicons name="checkmark-circle" size={40} color={colors.acEmerald} /></View>
          <Text style={{ color: colors.acEmerald, fontSize: 18, fontWeight: '600' }}>¡Venta Exitosa!</Text>
          {ventaId && <Text style={{ color: colors.tx3, fontSize: 12, marginTop: 4 }}>Código: #{ventaId}</Text>}
          <Text style={{ color: colors.tx4, fontSize: 12, marginTop: 2 }}>Las prendas han sido registradas como vendidas</Text>
          <Button variant="gradient" onPress={resetAll} style={{ marginTop: 20 }}>Escanear más</Button>
        </View>
      )}

      {/* Scanner card */}
      {!ventaExitosa && (
        <View style={[st.scanCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
          {/* Tabs */}
          <View style={[st.tabsRow, { borderBottomColor: colors.bd }]}>
            {tabs.map((tab) => (
              <TouchableOpacity key={tab.id} onPress={() => { setActiveTab(tab.id); resetSearch(); }}
                style={[st.tab, activeTab === tab.id && { borderBottomWidth: 2, borderBottomColor: colors.acRose, backgroundColor: 'rgba(251,113,133,0.05)' }]}>
                <Ionicons name={tab.icon} size={20} color={activeTab === tab.id ? colors.acRose : colors.tx4} />
                <Text style={{ color: activeTab === tab.id ? colors.acRose : colors.tx4, fontSize: 11 }}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ padding: 16, gap: 14 }}>
            {/* Camera real */}
            {activeTab !== 'MANUAL' && showScanArea && (
              <>
                {!permission?.granted ? (
                  <View style={[st.cameraBox, { borderColor: colors.bd }]}>
                    <View style={{ alignItems: 'center', gap: 12 }}>
                      <Ionicons name="camera-outline" size={44} color={colors.tx4} style={{ opacity: 0.3 }} />
                      <Text style={{ color: colors.tx4, fontSize: 13 }}>Se necesita permiso de cámara</Text>
                      <Button variant="gradient" onPress={requestPermission}>Dar permiso</Button>
                    </View>
                  </View>
                ) : (
                  <View style={[st.cameraBox, { borderColor: colors.acRose, overflow: 'hidden' }]}>
                    <CameraView style={StyleSheet.absoluteFillObject} facing="back"
                      barcodeScannerSettings={{ barcodeTypes }}
                      onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} />
                    <View style={st.scanOverlay}>
                      <View style={st.scanGuide}>
                        <View style={[st.corner, st.cTL]} /><View style={[st.corner, st.cTR]} />
                        <View style={[st.corner, st.cBL]} /><View style={[st.corner, st.cBR]} />
                      </View>
                      <Text style={st.scanHint}>{activeTab === 'QR' ? 'Apunta al QR' : 'Apunta al código de barras'}</Text>
                    </View>
                    {cart.length > 0 && (
                      <View style={st.cartBadgeOverlay}>
                        <Text style={{ color: '#fff', fontSize: 10 }}>{cart.length} en carrito</Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}

            {/* Manual */}
            {activeTab === 'MANUAL' && showScanArea && (
              <>
                <Input icon="keypad-outline" placeholder="Código de la prenda..." value={manualSearch} onChangeText={setManualSearch} onSubmitEditing={() => searchByCode(manualSearch)} />
                {cart.length > 0 && <Text style={{ color: colors.acRose, fontSize: 11 }}>{cart.length} prenda{cart.length > 1 ? 's' : ''} en carrito</Text>}
                <Button variant="gradient" onPress={() => searchByCode(manualSearch)} disabled={!manualSearch.trim()}>Buscar Prenda</Button>
              </>
            )}

            {/* Prenda encontrada */}
            {lastFound && (
              <View style={{ gap: 12 }}>
                <View style={[st.foundBanner, { backgroundColor: 'rgba(52,211,153,0.08)', borderColor: 'rgba(52,211,153,0.2)' }]}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.acEmerald} />
                  <Text style={{ color: colors.acEmerald, fontSize: 13, flex: 1 }}>Prenda encontrada</Text>
                  <Text style={{ color: colors.tx4, fontSize: 10 }}>{scannedCode}</Text>
                </View>
                <View style={st.foundRow}>
                  <View style={[st.foundImg, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
                    {lastFound.foto ? <Image source={{ uri: lastFound.foto }} style={{ width: '100%', height: '100%' }} /> : <Ionicons name="pricetag-outline" size={28} color={colors.tx4} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.tx, fontSize: 15, fontWeight: '500' }}>{lastFound.marca ? `${lastFound.marca} - ` : ''}{lastFound.tipo}</Text>
                    {lastFound.detalles && <Text style={{ color: colors.tx3, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{lastFound.detalles}</Text>}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      {lastFound.rebaja ? (<><Text style={{ color: colors.tx4, textDecorationLine: 'line-through', fontSize: 12 }}>Bs {lastFound.precio}</Text><Text style={{ color: colors.acAmber, fontSize: 16, fontWeight: '600' }}>Bs {lastFound.rebaja}</Text></>) : (<Text style={{ color: colors.acRose, fontSize: 16, fontWeight: '600' }}>Bs {lastFound.precio}</Text>)}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <View style={[st.miniPill, { backgroundColor: lastFound.estadoVenta === 'DISPONIBLE' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)' }]}>
                        <Text style={{ color: lastFound.estadoVenta === 'DISPONIBLE' ? colors.acEmerald : colors.acRed, fontSize: 9 }}>{lastFound.estadoVenta === 'DISPONIBLE' ? 'Disponible' : 'Vendido'}</Text>
                      </View>
                      {lastFound.sucursal && <Text style={{ color: colors.tx4, fontSize: 10 }}>{lastFound.sucursal.nombre}</Text>}
                    </View>
                  </View>
                </View>

                {lastFound.estadoVenta === 'DISPONIBLE' && !alreadyInCart && (
                  <TouchableOpacity onPress={() => addToCart(lastFound)} activeOpacity={0.85}>
                    <LinearGradient colors={['#34d399', '#059669']} style={st.addCartBtn}>
                      <Ionicons name="add" size={20} color="#fff" />
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Añadir · Bs {lastFound.rebaja || lastFound.precio}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                {alreadyInCart && (
                  <View style={[st.infoBanner, { backgroundColor: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.2)' }]}>
                    <Text style={{ color: colors.acAmber, fontSize: 13, textAlign: 'center' }}>Ya está en el carrito</Text>
                  </View>
                )}
                {lastFound.estadoVenta !== 'DISPONIBLE' && (
                  <View style={[st.infoBanner, { backgroundColor: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)' }]}>
                    <Text style={{ color: colors.acRed, fontSize: 13, textAlign: 'center' }}>Esta prenda ya fue vendida</Text>
                  </View>
                )}
                <Button variant="outline" onPress={resetSearch}>Escanear otra</Button>
              </View>
            )}

            {/* No encontrada */}
            {notFound && (
              <View style={{ alignItems: 'center', paddingVertical: 16, gap: 8 }}>
                <View style={[st.notFoundIcon, { backgroundColor: 'rgba(251,191,36,0.1)' }]}><Ionicons name="search" size={32} color={colors.acAmber} style={{ opacity: 0.6 }} /></View>
                <Text style={{ color: colors.acAmber, fontSize: 14 }}>No se encontró prenda</Text>
                <Text style={{ color: colors.tx4, fontSize: 12 }}>Código: {scannedCode}</Text>
                <Button variant="secondary" onPress={resetSearch}>Reintentar</Button>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Carrito inline */}
      {!ventaExitosa && cart.length > 0 && !showCart && (
        <View style={[st.cartPreview, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
          <View style={st.cartPreviewHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="cart" size={18} color={colors.acRose} />
              <Text style={{ color: colors.tx, fontSize: 15, fontWeight: '500' }}>Carrito ({cart.length})</Text>
            </View>
            <TouchableOpacity onPress={() => setShowCart(true)}><Text style={{ color: colors.acRose, fontSize: 12 }}>Ver todo</Text></TouchableOpacity>
          </View>
          {cart.map((p) => (
            <View key={p.id} style={[st.cartItem, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.tx, fontSize: 12 }} numberOfLines={1}>{p.marca ? `${p.marca} - ` : ''}{p.tipo}</Text>
                <Text style={{ color: colors.tx4, fontSize: 10 }}>{p.codigo}</Text>
              </View>
              <Text style={{ color: colors.acAmber, fontSize: 13 }}>Bs {p.rebaja || p.precio}</Text>
              <TouchableOpacity onPress={() => removeFromCart(p.id)}><Ionicons name="trash-outline" size={14} color={colors.acRed} /></TouchableOpacity>
            </View>
          ))}
          <View style={[st.cartTotalRow, { borderTopColor: colors.bd }]}>
            <Text style={{ color: colors.tx3, fontSize: 13 }}>Total</Text>
            <Text style={{ color: colors.acRose, fontSize: 18, fontWeight: '600' }}>Bs {total}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowPayment(true)} activeOpacity={0.85}>
            <LinearGradient colors={['#34d399', '#059669']} style={st.confirmBtn}>
              {processing ? <ActivityIndicator color="#fff" /> : (<>
                <Ionicons name="cart" size={20} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Vender {cart.length} prenda{cart.length > 1 ? 's' : ''} · Bs {total}</Text>
              </>)}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Cart Modal */}
      <Modal visible={showCart} transparent animationType="slide">
        <View style={[st.modalOv, { backgroundColor: colors.ov }]}>
          <View style={[st.modalSheet, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
            <View style={[st.modalHeader, { borderBottomColor: colors.bd }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="cart" size={20} color={colors.acRose} />
                <Text style={{ color: colors.tx, fontSize: 16, fontWeight: '600' }}>Carrito de Venta</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCart(false)} style={[st.closeBtn, { backgroundColor: colors.fiSolid }]}>
                <Ionicons name="close" size={16} color={colors.tx4} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
              {cart.map((p, idx) => (
                <View key={p.id} style={[st.cartModalItem, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
                  <Text style={{ color: colors.tx4, fontSize: 10, width: 20 }}>{idx + 1}.</Text>
                  <View style={[st.cartModalImg, { backgroundColor: colors.pg, borderColor: colors.bd }]}>
                    {p.foto ? <Image source={{ uri: p.foto }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <Ionicons name="pricetag-outline" size={18} color={colors.tx4} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.tx, fontSize: 13 }}>{p.marca ? `${p.marca} - ` : ''}{p.tipo}</Text>
                    <Text style={{ color: colors.tx4, fontSize: 10 }}>{p.codigo}</Text>
                    <Text style={{ color: colors.acAmber, fontSize: 13, marginTop: 2 }}>Bs {p.rebaja || p.precio}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeFromCart(p.id)} style={[st.cartDelBtn, { borderColor: 'rgba(248,113,113,0.2)' }]}>
                    <Ionicons name="trash-outline" size={16} color={colors.acRed} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={() => setShowCart(false)} style={[st.addMoreBtn, { borderColor: 'rgba(251,113,133,0.2)' }]}>
                <Ionicons name="add" size={16} color={colors.acRose} />
                <Text style={{ color: colors.acRose, fontSize: 13 }}>Escanear más prendas</Text>
              </TouchableOpacity>
              <View style={[st.totalCard, { borderColor: 'rgba(251,113,133,0.15)' }]}>
                <View style={st.totalRow}><Text style={{ color: colors.tx3, fontSize: 13 }}>Prendas ({cart.length})</Text><Text style={{ color: colors.tx }}>Bs {total}</Text></View>
                <View style={[st.totalDivider, { borderTopColor: 'rgba(251,113,133,0.15)' }]} />
                <View style={st.totalRow}><Text style={{ color: colors.acRose, fontSize: 15 }}>Total a cobrar</Text><Text style={{ color: colors.acRose, fontSize: 20, fontWeight: '600' }}>Bs {total}</Text></View>
              </View>
              <TouchableOpacity onPress={() => { setShowCart(false); setShowPayment(true); }} activeOpacity={0.85}>
                <LinearGradient colors={['#34d399', '#059669']} style={st.confirmBtnLg}>
                  <Ionicons name="wallet-outline" size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Elegir método de pago</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal visible={showPayment} total={total} itemCount={cart.length}
        onConfirm={handleConfirmSale} onCancel={() => setShowPayment(false)} />

      <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal(INITIAL_CONFIRM_STATE)} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
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
  cameraBox: { aspectRatio: 3 / 4, borderRadius: 18, borderWidth: 2, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  scanOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  scanGuide: { width: 200, height: 200, position: 'relative' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#fb7185' },
  cTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  cTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  cBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  cBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  scanHint: { color: '#fff', fontSize: 12, marginTop: 16, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  cartBadgeOverlay: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(251,113,133,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
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
  cartModalImg: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, overflow: 'hidden' },
  cartDelBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  addMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 2, borderStyle: 'dashed', borderRadius: 14, paddingVertical: 14 },
  totalCard: { backgroundColor: 'rgba(251,113,133,0.1)', borderRadius: 18, borderWidth: 1, padding: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalDivider: { borderTopWidth: 1, marginVertical: 8 },
  confirmBtnLg: { height: 56, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});