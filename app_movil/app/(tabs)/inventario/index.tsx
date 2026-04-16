// app_movil/app/(tabs)/inventario/index.tsx

// app_movil/app/(tabs)/inventario/inventario.tsx  (REEMPLAZA el existente)

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Modal, Image, Dimensions, FlatList, Alert,ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Switch } from '../../../src/components/ui/forms/switch';
import { Button } from '../../../src/components/ui/forms/button';
import { Input } from '../../../src/components/ui/forms/input';
import { Badge } from '../../../src/components/ui/display/badge';
import { ConfirmModal, ConfirmModalState, INITIAL_CONFIRM_STATE } from '../../../src/components/ui/overlays/confirm-modal';
import api from '../../../src/services/api';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - 16 * 2 - 12) / 2;

// ── Types ──
type TipoCodigo = 'barras' | 'qr' | 'manual';
type EstadoPrenda = 'nuevo' | 'usado' | 'semi_nuevo';
type EstadoVenta = 'disponible' | 'vendido' | 'reservado';

interface Prenda {
  id: string;
  marca: string;
  tipo: string;
  codigo: string;
  tipoCodigo: TipoCodigo;
  detalles: string;
  estado: EstadoPrenda;
  foto?: string;
  precio: number;
  rebaja?: number;
  sucursalId: string;
  estadoVenta: EstadoVenta;
  publicarOnline: boolean;
}

interface Sucursal {
  id: string;
  nombre: string;
}

// ── Demo data ──
const demoSucursales: Sucursal[] = [
  { id: 's1', nombre: 'Casa Matriz - Boutique Elegance' },
  { id: 's2', nombre: 'Sucursal Centro' },
];

const demoPrendas: Prenda[] = [
  { id: 'p1', marca: 'Bershka', tipo: 'Blusa', codigo: '7501234567890', tipoCodigo: 'barras', detalles: 'Blusa floral manga corta', estado: 'nuevo', precio: 150, sucursalId: 's1', estadoVenta: 'disponible', publicarOnline: false },
  { id: 'p2', marca: 'Zara', tipo: 'Pantalón', codigo: 'QR-ZARA-001', tipoCodigo: 'qr', detalles: 'Pantalón slim fit negro', estado: 'nuevo', precio: 280, rebaja: 250, sucursalId: 's1', estadoVenta: 'disponible', publicarOnline: true },
  { id: 'p3', marca: 'H&M', tipo: 'Vestido', codigo: 'MAN-HM-055', tipoCodigo: 'manual', detalles: 'Vestido casual verano', estado: 'semi_nuevo', precio: 200, sucursalId: 's2', estadoVenta: 'disponible', publicarOnline: false },
  { id: 'p4', marca: 'Pull&Bear', tipo: 'Short', codigo: '8901234567890', tipoCodigo: 'barras', detalles: 'Short denim clásico', estado: 'nuevo', precio: 120, sucursalId: 's1', estadoVenta: 'disponible', publicarOnline: true },
  { id: 'p5', marca: 'Mango', tipo: 'Falda', codigo: 'QR-MNG-012', tipoCodigo: 'qr', detalles: 'Falda plisada midi', estado: 'nuevo', precio: 180, sucursalId: 's2', estadoVenta: 'disponible', publicarOnline: false },
];

// ── Helper ──
const uid = () => Math.random().toString(36).slice(2, 10);

export default function InventarioScreen() {
  const { colors, isDark } = useTheme();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [prendas, setPrendas] = useState<Prenda[]>(demoPrendas);
  const [viewPrenda, setViewPrenda] = useState<Prenda | null>(null);
  const [flowStep, setFlowStep] = useState<'none' | 'scan' | 'form'>('none');
  const [scannedCode, setScannedCode] = useState('');
  const [scannedType, setScannedType] = useState<TipoCodigo>('manual');
  const [editingPrenda, setEditingPrenda] = useState<Prenda | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(INITIAL_CONFIRM_STATE);

  if (!currentUser) return null;
  const isOwner = currentUser.rol === 'OWNER_PRINCIPAL' || currentUser.rol === 'CO_OWNER' || currentUser.rol === 'SUPER_ADMIN';
  const canEdit = currentUser.rol !== 'EMPLEADO'; // TODO: check permisoEditarPrendas

  const filteredPrendas = prendas.filter((p) => {
    if (!isOwner && currentUser.sucursalId && p.sucursalId !== currentUser.sucursalId) return false;
    if (filterEstado !== 'todos' && p.estadoVenta !== filterEstado) return false;
    const q = search.toLowerCase();
    return !q || p.marca.toLowerCase().includes(q) || p.tipo.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.detalles.toLowerCase().includes(q);
  });

  const buscarPorCodigo = (codigo: string) => prendas.find((p) => p.codigo === codigo);

  const addPrenda = (data: Omit<Prenda, 'id'>) => setPrendas((prev) => [...prev, { ...data, id: uid() }]);
  const updatePrenda = (id: string, data: Partial<Prenda>) => setPrendas((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  const deletePrenda = (prenda: Prenda) => {
    setConfirmModal({
      visible: true,
      title: 'Eliminar prenda',
      message: `¿Eliminar "${prenda.marca} - ${prenda.tipo}"? Esta acción no se puede deshacer.`,
      icon: 'pricetag-outline',
      iconColor: colors.acRed,
      iconBg: 'rgba(248,113,113,0.15)',
      confirmLabel: 'Eliminar',
      confirmColor: ['#f87171', '#dc2626'],
      onConfirm: () => {
        setPrendas((prev) => prev.filter((p) => p.id !== prenda.id));
        setConfirmModal(INITIAL_CONFIRM_STATE);
      },
    });
  };

  const startAdd = () => { setEditingPrenda(null); setScannedCode(''); setScannedType('manual'); setFlowStep('scan'); };
  const startEdit = (p: Prenda) => { setEditingPrenda(p); setScannedCode(p.codigo); setScannedType(p.tipoCodigo); setFlowStep('form'); };

  const filters = ['todos', 'disponible', 'vendido', 'reservado'];

  const getEstadoBadge = (estado: EstadoVenta): { bg: string; text: string; border: string } => {
    if (estado === 'disponible') return { bg: 'rgba(52,211,153,0.2)', text: '#34d399', border: 'rgba(52,211,153,0.2)' };
    if (estado === 'vendido') return { bg: 'rgba(248,113,113,0.2)', text: '#f87171', border: 'rgba(248,113,113,0.2)' };
    return { bg: 'rgba(251,191,36,0.2)', text: '#fbbf24', border: 'rgba(251,191,36,0.2)' };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.pg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Search + Add ── */}
        <View style={styles.searchRow}>
          <View style={[styles.searchWrap, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
            <Ionicons name="search-outline" size={16} color={colors.tx4} />
            <TextInput
              style={[styles.searchInput, { color: colors.tx }]}
              placeholder="Buscar por código, marca, tipo..."
              placeholderTextColor={colors.tx4}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          {canEdit && (
            <TouchableOpacity onPress={startAdd} activeOpacity={0.85}>
              <LinearGradient colors={['#fb7185', '#f59e0b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.addBtn}>
                <Ionicons name="add" size={22} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Filters ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilterEstado(f)}
              activeOpacity={0.7}
              style={[styles.filterChip, {
                backgroundColor: filterEstado === f ? 'rgba(251,113,133,0.15)' : colors.fiSolid,
                borderColor: filterEstado === f ? 'rgba(251,113,133,0.25)' : colors.bd,
              }]}
            >
              <Text style={{ color: filterEstado === f ? colors.acRose : colors.tx4, fontSize: 11 }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Grid de prendas ── */}
        {filteredPrendas.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.fiSolid }]}>
              <Ionicons name="pricetag-outline" size={32} color={colors.tx4} style={{ opacity: 0.4 }} />
            </View>
            <Text style={{ color: colors.tx4, fontSize: 13 }}>No se encontraron prendas</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredPrendas.map((p) => {
              const badge = getEstadoBadge(p.estadoVenta);
              return (
                <View key={p.id} style={[styles.prendaCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow, width: CARD_W }]}>
                  {/* Image */}
                  <View style={[styles.prendaImg, { backgroundColor: colors.fiSolid }]}>
                    {p.foto ? (
                      <Image source={{ uri: p.foto }} style={styles.prendaImgInner} />
                    ) : (
                      <Ionicons name="pricetag-outline" size={32} color={colors.tx4} />
                    )}
                    {/* Online badge */}
                    {p.publicarOnline && (
                      <View style={styles.onlineBadge}>
                        <Ionicons name="globe-outline" size={10} color="#fff" />
                      </View>
                    )}
                    {/* Estado badge */}
                    <View style={[styles.estadoBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                      <Text style={{ color: badge.text, fontSize: 9 }}>{p.estadoVenta}</Text>
                    </View>
                  </View>

                  {/* Info */}
                  <View style={styles.prendaInfo}>
                    <Text style={[styles.prendaName, { color: colors.tx }]} numberOfLines={1}>{p.marca} - {p.tipo}</Text>
                    <Text style={[styles.prendaCode, { color: colors.tx4 }]} numberOfLines={1}>
                      {p.tipoCodigo === 'barras' ? '📊' : p.tipoCodigo === 'qr' ? '📱' : '✏️'} {p.codigo}
                    </Text>
                    <View style={styles.priceRow}>
                      {p.rebaja ? (
                        <>
                          <Text style={[styles.priceOld, { color: colors.tx4 }]}>Bs {p.precio}</Text>
                          <Text style={[styles.priceNew, { color: colors.acAmber }]}>Bs {p.rebaja}</Text>
                        </>
                      ) : (
                        <Text style={[styles.priceNew, { color: colors.acRose }]}>Bs {p.precio}</Text>
                      )}
                    </View>

                    {/* Action buttons */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity onPress={() => setViewPrenda(p)} style={[styles.actionBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
                        <Ionicons name="eye-outline" size={14} color={colors.tx4} />
                      </TouchableOpacity>
                      {canEdit && (
                        <>
                          <TouchableOpacity onPress={() => startEdit(p)} style={[styles.actionBtn, { backgroundColor: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.2)' }]}>
                            <Ionicons name="create-outline" size={14} color={colors.acSky} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => deletePrenda(p)} style={[styles.actionBtn, { backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.2)' }]}>
                            <Ionicons name="trash-outline" size={14} color={colors.acRed} />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Modales ── */}
      {flowStep === 'scan' && (
        <ScannerModal
          colors={colors}
          isDark={isDark}
          buscarPorCodigo={buscarPorCodigo}
          onCodeScanned={(c, t) => { setScannedCode(c); setScannedType(t); setFlowStep('form'); }}
          onClose={() => setFlowStep('none')}
        />
      )}
      {flowStep === 'form' && (
        <PrendaFormModal
          colors={colors}
          isDark={isDark}
          editing={editingPrenda}
          scannedCode={scannedCode}
          scannedType={scannedType}
          sucursales={demoSucursales}
          isOwner={isOwner}
          currentSucursalId={currentUser.sucursalId}
          onSave={(data) => {
            if (editingPrenda) updatePrenda(editingPrenda.id, data);
            else addPrenda(data as Omit<Prenda, 'id'>);
            setFlowStep('none');
          }}
          onClose={() => setFlowStep('none')}
        />
      )}
      {viewPrenda && (
        <PrendaViewModal colors={colors} prenda={viewPrenda} sucursales={demoSucursales} onClose={() => setViewPrenda(null)} />
      )}
      <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal(INITIAL_CONFIRM_STATE)} />
    </View>
  );
}

// ══════════════════════════════════════════════════════════
// ── ScannerModal ──
// ══════════════════════════════════════════════════════════
function ScannerModal({ colors, isDark, buscarPorCodigo, onCodeScanned, onClose }: {
  colors: any; isDark: boolean;
  buscarPorCodigo: (c: string) => Prenda | undefined;
  onCodeScanned: (code: string, type: TipoCodigo) => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TipoCodigo>('barras');
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ code: string; exists: boolean } | null>(null);

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      const code = activeTab === 'barras'
        ? String(Math.floor(1000000000000 + Math.random() * 9000000000000))
        : `QR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      setScanning(false);
      setResult({ code, exists: !!buscarPorCodigo(code) });
    }, 2000);
  };

  const tabs: { id: TipoCodigo; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { id: 'barras', icon: 'barcode-outline', label: 'Barras' },
    { id: 'qr', icon: 'qr-code-outline', label: 'QR' },
    { id: 'manual', icon: 'keypad-outline', label: 'Manual' },
  ];

  return (
    <Modal visible transparent animationType="slide">
      <View style={[ms.overlay, { backgroundColor: colors.ov }]}>
        <View style={[ms.sheet, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
          {/* Header */}
          <View style={[ms.header, { borderBottomColor: colors.bd }]}>
            <View>
              <Text style={[ms.headerTitle, { color: colors.tx }]}>Paso 1: Escanear Código</Text>
              <Text style={{ color: colors.tx4, fontSize: 11 }}>Escanea o ingresa el código</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[ms.closeBtn, { backgroundColor: colors.fiSolid }]}>
              <Ionicons name="close" size={16} color={colors.tx4} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={[ms.tabsRow, { borderBottomColor: colors.bd }]}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => { setActiveTab(tab.id); setResult(null); setManualCode(''); }}
                style={[ms.tab, activeTab === tab.id && { borderBottomWidth: 2, borderBottomColor: colors.acRose }]}
              >
                <Ionicons name={tab.icon} size={20} color={activeTab === tab.id ? colors.acRose : colors.tx4} />
                <Text style={{ color: activeTab === tab.id ? colors.acRose : colors.tx4, fontSize: 11 }}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
            {/* Camera area (barras/qr) */}
            {activeTab !== 'manual' && !result && (
              <>
                <View style={[ms.cameraBox, { borderColor: colors.bd }]}>
                  {scanning ? (
                    <ActivityIndicator size="large" color={colors.acRose} />
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="camera-outline" size={48} color={colors.tx4} style={{ opacity: 0.3 }} />
                      <Text style={{ color: colors.tx4, fontSize: 13, marginTop: 8 }}>Presiona para escanear</Text>
                    </View>
                  )}
                </View>
                <Button variant="gradient" onPress={simulateScan} disabled={scanning} loading={scanning}>
                  {scanning ? 'Escaneando...' : 'Activar Cámara'}
                </Button>
              </>
            )}

            {/* Manual input */}
            {activeTab === 'manual' && !result && (
              <>
                <View style={[ms.infoBanner, { backgroundColor: 'rgba(251,113,133,0.1)', borderColor: 'rgba(251,113,133,0.2)' }]}>
                  <Text style={{ color: colors.acRose, fontSize: 12 }}>Ingresa un código único</Text>
                </View>
                <Input
                  icon="keypad-outline"
                  placeholder="Ej: PRENDA-001..."
                  value={manualCode}
                  onChangeText={setManualCode}
                />
                <Button variant="gradient" onPress={() => { if (manualCode.trim()) setResult({ code: manualCode.trim(), exists: !!buscarPorCodigo(manualCode.trim()) }); }} disabled={!manualCode.trim()}>
                  Verificar
                </Button>
              </>
            )}

            {/* Result */}
            {result && (
              <>
                <View style={[ms.resultBox, { backgroundColor: result.exists ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.08)', borderColor: result.exists ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)' }]}>
                  <Ionicons name={result.exists ? 'warning-outline' : 'checkmark-circle-outline'} size={24} color={result.exists ? colors.acRed : colors.acEmerald} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: result.exists ? colors.acRed : colors.acEmerald, fontSize: 14 }}>
                      {result.exists ? '¡Código ya registrado!' : '¡Código disponible!'}
                    </Text>
                    <Text style={{ color: colors.tx3, fontSize: 12, marginTop: 2 }}>{result.code}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => { setResult(null); setManualCode(''); }} style={[ms.retryBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
                    <Text style={{ color: colors.tx3, fontSize: 14 }}>Reintentar</Text>
                  </TouchableOpacity>
                  {!result.exists && (
                    <TouchableOpacity onPress={() => onCodeScanned(result.code, activeTab)} activeOpacity={0.85} style={{ flex: 1 }}>
                      <LinearGradient colors={['#34d399', '#059669']} style={ms.continueBtn}>
                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Continuar</Text>
                        <Ionicons name="arrow-forward" size={16} color="#fff" />
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════
// ── PrendaFormModal ──
// ══════════════════════════════════════════════════════════
function PrendaFormModal({ colors, isDark, editing, scannedCode, scannedType, sucursales, isOwner, currentSucursalId, onSave, onClose }: {
  colors: any; isDark: boolean;
  editing: Prenda | null; scannedCode: string; scannedType: TipoCodigo;
  sucursales: Sucursal[]; isOwner: boolean; currentSucursalId?: string;
  onSave: (data: any) => void; onClose: () => void;
}) {
  const [marca, setMarca] = useState(editing?.marca || '');
  const [tipo, setTipo] = useState(editing?.tipo || '');
  const [detalles, setDetalles] = useState(editing?.detalles || '');
  const [estado, setEstado] = useState(editing?.estado || 'nuevo');
  const [precio, setPrecio] = useState(editing?.precio?.toString() || '');
  const [rebajaActiva, setRebajaActiva] = useState(!!editing?.rebaja);
  const [rebaja, setRebaja] = useState(editing?.rebaja?.toString() || '');
  const [sucursalId, setSucursalId] = useState(editing?.sucursalId || currentSucursalId || sucursales[0]?.id || '');
  const [error, setError] = useState('');

  const tipos = ['Blusa', 'Pantalón', 'Vestido', 'Falda', 'Short', 'Camisa', 'Chaqueta', 'Sudadera', 'Polera', 'Otro'];

  const handleSave = () => {
    if (!marca || !tipo || !precio) { setError('Completa los campos obligatorios'); return; }
    onSave({
      marca, tipo, codigo: scannedCode, tipoCodigo: scannedType, detalles,
      estado, precio: parseFloat(precio),
      rebaja: rebajaActiva && rebaja ? parseFloat(rebaja) : undefined,
      sucursalId, estadoVenta: editing?.estadoVenta || 'disponible',
      publicarOnline: false,
    });
  };

  const codeIcon: keyof typeof Ionicons.glyphMap = scannedType === 'barras' ? 'barcode-outline' : scannedType === 'qr' ? 'qr-code-outline' : 'keypad-outline';

  return (
    <Modal visible transparent animationType="slide">
      <View style={[ms.overlay, { backgroundColor: colors.ov }]}>
        <View style={[ms.sheet, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, maxHeight: '92%' }]}>
          {/* Header */}
          <View style={[ms.header, { borderBottomColor: colors.bd }]}>
            <View>
              <Text style={[ms.headerTitle, { color: colors.tx }]}>{editing ? 'Editar Prenda' : 'Paso 2: Datos'}</Text>
              <Text style={{ color: colors.tx4, fontSize: 10 }}>{scannedCode} ({scannedType.toUpperCase()})</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[ms.closeBtn, { backgroundColor: colors.fiSolid }]}>
              <Ionicons name="close" size={16} color={colors.tx4} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>
            {error !== '' && (
              <View style={[ms.infoBanner, { backgroundColor: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)' }]}>
                <Text style={{ color: colors.acRed, fontSize: 13 }}>{error}</Text>
              </View>
            )}

            {/* Code info */}
            <View style={[ms.codeInfo, { backgroundColor: 'rgba(251,113,133,0.1)', borderColor: 'rgba(251,113,133,0.2)' }]}>
              <View style={[ms.codeIconBox, { backgroundColor: 'rgba(251,113,133,0.15)' }]}>
                <Ionicons name={codeIcon} size={20} color={colors.acRose} />
              </View>
              <View>
                <Text style={{ color: colors.acRose, fontSize: 12 }}>Código {scannedType}</Text>
                <Text style={{ color: colors.tx4, fontSize: 10 }}>{scannedCode}</Text>
              </View>
            </View>

            {/* Photo placeholder */}
            <View>
              <Text style={[ms.fieldLabel, { color: colors.tx3 }]}>Foto (Opcional)</Text>
              <TouchableOpacity onPress={() => Alert.alert('Foto', 'Cámara/galería próximamente')} style={[ms.photoBtn, { borderColor: colors.bd2Solid }]}>
                <View style={[ms.photoIcon, { backgroundColor: colors.fiHSolid }]}>
                  <Ionicons name="image-outline" size={24} color={colors.tx4} />
                </View>
                <Text style={{ color: colors.tx4, fontSize: 12 }}>Tomar foto</Text>
              </TouchableOpacity>
            </View>

            {/* Marca */}
            <Input label="Marca *" placeholder="Bershka, Zara, H&M..." value={marca} onChangeText={(v) => { setMarca(v); setError(''); }} />

            {/* Tipo de prenda */}
            <View>
              <Text style={[ms.fieldLabel, { color: colors.tx3 }]}>Tipo de prenda *</Text>
              <View style={ms.tiposWrap}>
                {tipos.map((t) => (
                  <TouchableOpacity key={t} onPress={() => { setTipo(t); setError(''); }} activeOpacity={0.7}
                    style={[ms.tipoChip, { backgroundColor: tipo === t ? 'rgba(251,113,133,0.15)' : colors.fiSolid, borderColor: tipo === t ? 'rgba(251,113,133,0.25)' : colors.bd }]}>
                    <Text style={{ color: tipo === t ? colors.acRose : colors.tx4, fontSize: 12 }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Detalles */}
            <View>
              <Text style={[ms.fieldLabel, { color: colors.tx3 }]}>Detalles</Text>
              <TextInput
                style={[ms.textarea, { backgroundColor: colors.fiSolid, borderColor: colors.bd2Solid, color: colors.tx }]}
                placeholder="Color rojo, talla M..."
                placeholderTextColor={colors.tx4}
                value={detalles}
                onChangeText={setDetalles}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            {/* Estado */}
            <View>
              <Text style={[ms.fieldLabel, { color: colors.tx3 }]}>Estado</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[{ v: 'nuevo', l: 'Nuevo', e: '✨' }, { v: 'semi_nuevo', l: 'Semi nuevo', e: '👍' }, { v: 'usado', l: 'Usado', e: '📦' }].map((o) => (
                  <TouchableOpacity key={o.v} onPress={() => setEstado(o.v as EstadoPrenda)} activeOpacity={0.7}
                    style={[ms.estadoBtn, { backgroundColor: estado === o.v ? 'rgba(251,113,133,0.15)' : colors.fiSolid, borderColor: estado === o.v ? 'rgba(251,113,133,0.25)' : colors.bd }]}>
                    <Text>{o.e}</Text>
                    <Text style={{ color: estado === o.v ? colors.acRose : colors.tx4, fontSize: 12 }}>{o.l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Precio */}
            <View>
              <Text style={[ms.fieldLabel, { color: colors.tx3 }]}>Precio (Bs) *</Text>
              <View style={[ms.priceWrap, { backgroundColor: colors.fiSolid, borderColor: colors.bd2Solid }]}>
                <Text style={{ color: colors.tx4, fontSize: 13 }}>Bs</Text>
                <TextInput
                  style={[ms.priceInput, { color: colors.tx }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.tx4}
                  value={precio}
                  onChangeText={(v) => { setPrecio(v); setError(''); }}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Rebaja toggle */}
            <View style={[ms.rebajaBox, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
              <View style={ms.rebajaHeader}>
                <View>
                  <Text style={{ color: colors.tx2, fontSize: 13 }}>¿Tiene rebaja?</Text>
                  <Text style={{ color: colors.tx4, fontSize: 10 }}>Precio con descuento</Text>
                </View>
                <Switch checked={rebajaActiva} onCheckedChange={(v) => { setRebajaActiva(v); if (!v) setRebaja(''); }} />
              </View>
              {rebajaActiva && (
                <View style={{ marginTop: 12 }}>
                  <View style={[ms.priceWrap, { backgroundColor: colors.fiSolid, borderColor: colors.bd2Solid }]}>
                    <Text style={{ color: colors.tx4, fontSize: 13 }}>Bs</Text>
                    <TextInput
                      style={[ms.priceInput, { color: colors.tx }]}
                      placeholder="Precio rebajado"
                      placeholderTextColor={colors.tx4}
                      value={rebaja}
                      onChangeText={setRebaja}
                      keyboardType="numeric"
                    />
                  </View>
                  {precio && rebaja && parseFloat(rebaja) < parseFloat(precio) && (
                    <Text style={{ color: colors.acEmerald, fontSize: 10, marginTop: 4 }}>
                      -{Math.round(((parseFloat(precio) - parseFloat(rebaja)) / parseFloat(precio)) * 100)}% descuento
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Sucursal */}
            <View>
              <Text style={[ms.fieldLabel, { color: colors.tx3 }]}>Sucursal</Text>
              {isOwner ? (
                <View style={{ gap: 6 }}>
                  {sucursales.map((s) => (
                    <TouchableOpacity key={s.id} onPress={() => setSucursalId(s.id)} activeOpacity={0.7}
                      style={[ms.sucursalBtn, { backgroundColor: sucursalId === s.id ? 'rgba(251,113,133,0.15)' : colors.fiSolid, borderColor: sucursalId === s.id ? 'rgba(251,113,133,0.25)' : colors.bd }]}>
                      <Text style={{ color: sucursalId === s.id ? colors.acRose : colors.tx3, fontSize: 13 }}>{s.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={[ms.sucursalBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
                  <Text style={{ color: colors.tx3, fontSize: 13 }}>{sucursales.find((s) => s.id === sucursalId)?.nombre || 'Asignada'}</Text>
                </View>
              )}
            </View>

            {/* Publicar online (disabled) */}
            <View style={[ms.rebajaBox, { backgroundColor: colors.fiSolid, borderColor: colors.bd, opacity: 0.4 }]}>
              <View style={ms.rebajaHeader}>
                <View>
                  <Text style={{ color: colors.tx4, fontSize: 13 }}>Publicar en Tienda Online</Text>
                  <Text style={{ color: colors.tx4, fontSize: 10 }}>Próximamente</Text>
                </View>
                <Switch checked={false} onCheckedChange={() => {}} disabled />
              </View>
            </View>

            {/* Save button */}
            <Button variant="gradient" size="lg" onPress={handleSave}>
              {editing ? 'Guardar Cambios' : 'Registrar Prenda'}
            </Button>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════
// ── PrendaViewModal ──
// ══════════════════════════════════════════════════════════
function PrendaViewModal({ colors, prenda, sucursales, onClose }: {
  colors: any; prenda: Prenda; sucursales: Sucursal[]; onClose: () => void;
}) {
  const suc = sucursales.find((s) => s.id === prenda.sucursalId);
  const badge = prenda.estadoVenta === 'disponible'
    ? { bg: 'rgba(52,211,153,0.15)', text: colors.acEmerald }
    : prenda.estadoVenta === 'vendido'
      ? { bg: 'rgba(248,113,113,0.15)', text: colors.acRed }
      : { bg: 'rgba(251,191,36,0.15)', text: colors.acAmber };

  return (
    <Modal visible transparent animationType="slide">
      <View style={[ms.overlay, { backgroundColor: colors.ov }]}>
        <View style={[ms.sheet, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, maxHeight: '85%' }]}>
          <View style={[ms.header, { borderBottomColor: colors.bd }]}>
            <Text style={[ms.headerTitle, { color: colors.tx }]}>Detalle de Prenda</Text>
            <TouchableOpacity onPress={onClose} style={[ms.closeBtn, { backgroundColor: colors.fiSolid }]}>
              <Ionicons name="close" size={16} color={colors.tx4} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
            {/* Photo */}
            <View style={[ms.viewPhoto, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
              {prenda.foto ? (
                <Image source={{ uri: prenda.foto }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <Ionicons name="pricetag-outline" size={40} color={colors.tx4} />
              )}
            </View>

            {/* Name + badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.tx, fontSize: 16, fontWeight: '600', flex: 1 }}>{prenda.marca} - {prenda.tipo}</Text>
              <View style={[{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: badge.bg }]}>
                <Text style={{ color: badge.text, fontSize: 11 }}>{prenda.estadoVenta}</Text>
              </View>
            </View>

            {/* Price */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {prenda.rebaja ? (
                <>
                  <Text style={{ color: colors.tx4, textDecorationLine: 'line-through', fontSize: 14 }}>Bs {prenda.precio}</Text>
                  <Text style={{ color: colors.acAmber, fontSize: 18, fontWeight: '600' }}>Bs {prenda.rebaja}</Text>
                  <View style={{ backgroundColor: 'rgba(52,211,153,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
                    <Text style={{ color: colors.acEmerald, fontSize: 10 }}>-{Math.round(((prenda.precio - prenda.rebaja) / prenda.precio) * 100)}%</Text>
                  </View>
                </>
              ) : (
                <Text style={{ color: colors.acRose, fontSize: 18, fontWeight: '600' }}>Bs {prenda.precio}</Text>
              )}
            </View>

            {/* Details table */}
            <View style={[ms.detailsTable, { backgroundColor: colors.fiSolid }]}>
              {[
                { l: 'Código', v: prenda.codigo },
                { l: 'Tipo código', v: prenda.tipoCodigo },
                { l: 'Estado', v: prenda.estado.replace('_', ' ') },
                { l: 'Sucursal', v: suc?.nombre || '-' },
              ].map((item, i, arr) => (
                <View key={item.l} style={[ms.detailRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.bd }]}>
                  <Text style={{ color: colors.tx4, fontSize: 13 }}>{item.l}</Text>
                  <Text style={{ color: colors.tx2, fontSize: 13 }}>{item.v}</Text>
                </View>
              ))}
            </View>

            {/* Detalles text */}
            {prenda.detalles ? (
              <View style={[ms.detailsBox, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
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

// ══════════════════════════════════════════════════════════
// ── Styles ──
// ══════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100, gap: 12 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, height: 44 },
  searchInput: { flex: 1, fontSize: 13 },
  addBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  filterRow: { gap: 8, paddingVertical: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  prendaCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  prendaImg: { aspectRatio: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  prendaImgInner: { width: '100%', height: '100%', resizeMode: 'cover' },
  onlineBadge: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(56,189,248,0.8)', alignItems: 'center', justifyContent: 'center' },
  estadoBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, borderWidth: 1 },
  prendaInfo: { padding: 12, gap: 2 },
  prendaName: { fontSize: 13, fontWeight: '500' },
  prendaCode: { fontSize: 10, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  priceOld: { fontSize: 11, textDecorationLine: 'line-through' },
  priceNew: { fontSize: 14, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  actionBtn: { flex: 1, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});

// ── Modal shared styles ──
const ms = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0, maxHeight: '90%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 12 },
  cameraBox: { aspectRatio: 4 / 3, borderRadius: 18, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  infoBanner: { borderRadius: 14, borderWidth: 1, padding: 12 },
  resultBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 18, borderWidth: 1 },
  retryBtn: { flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  continueBtn: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
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
  viewPhoto: { height: 200, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1 },
  detailsTable: { borderRadius: 14, overflow: 'hidden' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  detailsBox: { borderRadius: 14, padding: 16, borderWidth: 1 },
});