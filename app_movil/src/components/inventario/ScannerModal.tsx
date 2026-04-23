// app_movil/src/components/inventario/ScannerModal.tsx  (REEMPLAZA el existente)

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/forms/button';
import { Input } from '../../components/ui/forms/input';
import type { TipoCodigo } from '../../types/inventario/types';

interface Props {
  buscarPorCodigo: (c: string) => Promise<boolean>;
  onCodeScanned: (code: string, type: TipoCodigo) => void;
  onClose: () => void;
}

export default function ScannerModal({ buscarPorCodigo, onCodeScanned, onClose }: Props) {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [activeTab, setActiveTab] = useState<TipoCodigo>('BARRAS');
  const [manualCode, setManualCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<{ code: string; exists: boolean } | null>(null);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    const exists = await buscarPorCodigo(data);
    setResult({ code: data, exists });
  };

  const checkManualCode = async () => {
    if (!manualCode.trim()) return;
    setChecking(true);
    const exists = await buscarPorCodigo(manualCode.trim());
    setResult({ code: manualCode.trim(), exists });
    setChecking(false);
  };

  const resetScan = () => { setResult(null); setScanned(false); setManualCode(''); };

  const tabs: { id: TipoCodigo; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { id: 'BARRAS', icon: 'barcode-outline', label: 'Barras' },
    { id: 'QR', icon: 'qr-code-outline', label: 'QR' },
    { id: 'MANUAL', icon: 'keypad-outline', label: 'Manual' },
  ];

  const barcodeTypes = activeTab === 'QR'
    ? ['qr' as const]
    : ['ean13' as const, 'ean8' as const, 'code128' as const, 'code39' as const, 'upc_a' as const, 'upc_e' as const, 'codabar' as const, 'itf14' as const];

  const isBarras = activeTab === 'BARRAS';

  return (
    <Modal visible transparent animationType="slide">
      <View style={[s.overlay, { backgroundColor: colors.ov }]}>
        <View style={[s.sheet, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
          <View style={[s.header, { borderBottomColor: colors.bd }]}>
            <View>
              <Text style={[s.headerTitle, { color: colors.tx }]}>Paso 1: Escanear Código</Text>
              <Text style={{ color: colors.tx4, fontSize: 11 }}>Escanea o ingresa el código</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[s.closeBtn, { backgroundColor: colors.fiSolid }]}>
              <Ionicons name="close" size={16} color={colors.tx4} />
            </TouchableOpacity>
          </View>

          <View style={[s.tabsRow, { borderBottomColor: colors.bd }]}>
            {tabs.map((tab) => (
              <TouchableOpacity key={tab.id} onPress={() => { setActiveTab(tab.id); resetScan(); }}
                style={[s.tab, activeTab === tab.id && { borderBottomWidth: 2, borderBottomColor: colors.acRose }]}>
                <Ionicons name={tab.icon} size={20} color={activeTab === tab.id ? colors.acRose : colors.tx4} />
                <Text style={{ color: activeTab === tab.id ? colors.acRose : colors.tx4, fontSize: 11 }}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
            {activeTab !== 'MANUAL' && !result && (
              <>
                {!permission?.granted ? (
                  <View style={[s.cameraBox, { borderColor: colors.bd }]}>
                    <View style={{ alignItems: 'center', gap: 12 }}>
                      <Ionicons name="camera-outline" size={48} color={colors.tx4} style={{ opacity: 0.3 }} />
                      <Text style={{ color: colors.tx4, fontSize: 13, textAlign: 'center' }}>Se necesita permiso para usar la cámara</Text>
                      <Button variant="gradient" onPress={requestPermission}>Dar permiso</Button>
                    </View>
                  </View>
                ) : (
                  <View style={[s.cameraBox, { borderColor: colors.acRose, overflow: 'hidden' }]}>
                    <CameraView
                      style={StyleSheet.absoluteFillObject}
                      facing="back"
                      barcodeScannerSettings={{ barcodeTypes }}
                      onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    />
                    <View style={s.scanOverlay}>
                      {/* Guía adaptativa: horizontal para barras, cuadrado para QR */}
                      <View style={[s.scanGuide, isBarras ? s.guideBarras : s.guideQR]}>
                        <View style={[s.corner, s.cornerTL]} />
                        <View style={[s.corner, s.cornerTR]} />
                        <View style={[s.corner, s.cornerBL]} />
                        <View style={[s.corner, s.cornerBR]} />
                      </View>
                      <Text style={s.scanHint}>
                        {isBarras ? 'Apunta al código de barras' : 'Apunta al código QR'}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}

            {activeTab === 'MANUAL' && !result && (
              <>
                <View style={[s.infoBanner, { backgroundColor: 'rgba(251,113,133,0.1)', borderColor: 'rgba(251,113,133,0.2)' }]}>
                  <Text style={{ color: colors.acRose, fontSize: 12 }}>Ingresa un código único</Text>
                </View>
                <Input icon="keypad-outline" placeholder="Ej: PRENDA-001..." value={manualCode} onChangeText={setManualCode} />
                <Button variant="gradient" onPress={checkManualCode} disabled={!manualCode.trim() || checking} loading={checking}>
                  Verificar
                </Button>
              </>
            )}

            {result && (
              <>
                <View style={[s.resultBox, {
                  backgroundColor: result.exists ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.08)',
                  borderColor: result.exists ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)',
                }]}>
                  <Ionicons name={result.exists ? 'warning-outline' : 'checkmark-circle-outline'} size={24} color={result.exists ? colors.acRed : colors.acEmerald} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: result.exists ? colors.acRed : colors.acEmerald, fontSize: 14 }}>
                      {result.exists ? '¡Código ya registrado!' : '¡Código disponible!'}
                    </Text>
                    <Text style={{ color: colors.tx3, fontSize: 12, marginTop: 2 }}>{result.code}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={resetScan} style={[s.retryBtn, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
                    <Text style={{ color: colors.tx3, fontSize: 14 }}>Reintentar</Text>
                  </TouchableOpacity>
                  {!result.exists && (
                    <TouchableOpacity onPress={() => onCodeScanned(result.code, activeTab)} activeOpacity={0.85} style={{ flex: 1 }}>
                      <LinearGradient colors={['#34d399', '#059669']} style={s.continueBtn}>
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

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0, maxHeight: '90%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 12 },
  cameraBox: { aspectRatio: 3 / 4, borderRadius: 18, borderWidth: 2, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  scanOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  // Guía adaptativa
  scanGuide: { position: 'relative' },
  guideBarras: { width: 280, height: 100 },  // rectángulo horizontal para código de barras
  guideQR: { width: 200, height: 200 },       // cuadrado para QR
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#fb7185' },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  scanHint: { color: '#fff', fontSize: 12, marginTop: 12, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  infoBanner: { borderRadius: 14, borderWidth: 1, padding: 12 },
  resultBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 18, borderWidth: 1 },
  retryBtn: { flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  continueBtn: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
});