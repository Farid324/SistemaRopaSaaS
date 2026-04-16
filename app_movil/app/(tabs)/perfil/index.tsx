// app_movil/app/(tabs)/perfil/index.tsx

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth, Rol } from '../../../src/context/AuthContext';
import { router } from 'expo-router';

function getRolLabel(rol: Rol) {
  if (rol === 'OWNER_PRINCIPAL' || rol === 'CO_OWNER' || rol === 'SUPER_ADMIN') return 'Dueño';
  if (rol === 'ADMINISTRADOR') return 'Administrador';
  return 'Empleado';
}

function getRolBadge(rol: Rol, colors: any) {
  if (rol === 'OWNER_PRINCIPAL' || rol === 'CO_OWNER' || rol === 'SUPER_ADMIN')
    return { bg: 'rgba(251,113,133,0.15)', text: colors.acRose, border: 'rgba(251,113,133,0.2)' };
  if (rol === 'ADMINISTRADOR')
    return { bg: 'rgba(251,191,36,0.15)', text: colors.acAmber, border: 'rgba(251,191,36,0.2)' };
  return { bg: 'rgba(52,211,153,0.15)', text: colors.acEmerald, border: 'rgba(52,211,153,0.2)' };
}

export default function PerfilScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const [showChangePass, setShowChangePass] = useState(false);
  const [passForm, setPassForm] = useState({ actual: '', nueva: '', confirmar: '' });
  const [passError, setPassError] = useState('');

  if (!currentUser) return null;

  const badge = getRolBadge(currentUser.rol, colors);

  const handleChangePass = () => {
    if (passForm.nueva.length < 6) { setPassError('Mínimo 6 caracteres'); return; }
    if (passForm.nueva !== passForm.confirmar) { setPassError('No coinciden'); return; }
    // TODO: api.post('/auth/cambiar-contrasena', ...)
    setShowChangePass(false);
    setPassForm({ actual: '', nueva: '', confirmar: '' });
  };

  const handleLogout = () => { logout(); router.replace('/(auth)/login'); };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.pg }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ── Avatar ── */}
      <View style={[styles.card, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            <LinearGradient colors={['#fb7185', '#f59e0b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{currentUser.nombreCompleto.charAt(0)}</Text>
            </LinearGradient>
            <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.7}>
              <LinearGradient colors={['#fb7185', '#f59e0b']} style={styles.cameraBtnInner}>
                <Ionicons name="camera" size={12} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: colors.tx }]}>{currentUser.nombreCompleto}</Text>
          <View style={[styles.rolBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
            <Text style={[styles.rolText, { color: badge.text }]}>{getRolLabel(currentUser.rol)}</Text>
          </View>
        </View>
      </View>

      {/* ── Info ── */}
      <View style={[styles.card, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
        {[
          { icon: 'mail-outline' as const, label: 'Correo', value: currentUser.correo },
          { icon: 'call-outline' as const, label: 'Teléfono', value: currentUser.telefono || '-' },
          { icon: 'card-outline' as const, label: 'CI', value: currentUser.ci },
        ].map((item, i, arr) => (
          <View key={item.label} style={[styles.infoRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.bd }]}>
            <View style={[styles.infoIcon, { backgroundColor: colors.fiSolid }]}>
              <Ionicons name={item.icon} size={16} color={colors.tx4} />
            </View>
            <View>
              <Text style={[styles.infoLabel, { color: colors.tx4 }]}>{item.label}</Text>
              <Text style={[styles.infoValue, { color: colors.tx }]}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Apariencia ── */}
      <View style={[styles.card, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="color-palette-outline" size={18} color={colors.acViolet} />
          <Text style={[styles.sectionTitle, { color: colors.tx }]}>Apariencia</Text>
        </View>
        <View style={[styles.themeRow, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
          <View style={styles.themeInfo}>
            <View style={[styles.themeIcon, { backgroundColor: isDark ? 'rgba(167,139,250,0.15)' : 'rgba(251,191,36,0.15)' }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? colors.acViolet : colors.acAmber} />
            </View>
            <View>
              <Text style={[styles.themeLabel, { color: colors.tx }]}>{isDark ? 'Modo Oscuro' : 'Modo Claro'}</Text>
              <Text style={[styles.themeDesc, { color: colors.tx4 }]}>{isDark ? 'Ideal para uso nocturno' : 'Ideal para uso diurno'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={toggleTheme} style={[styles.toggle, { backgroundColor: isDark ? '#a78bfa' : '#f59e0b' }]} activeOpacity={0.7}>
            <View style={[styles.toggleDot, isDark ? styles.toggleR : styles.toggleL]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={10} color={isDark ? '#7c3aed' : '#b45309'} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.previewRow}>
          <TouchableOpacity onPress={() => { if (!isDark) toggleTheme(); }} style={[styles.previewBox, { borderColor: isDark ? 'rgba(167,139,250,0.3)' : colors.bd }, isDark && styles.previewActive]} activeOpacity={0.7}>
            <View style={[styles.previewInner, { backgroundColor: '#0c0c10' }]}>
              <View style={styles.pDots}><View style={[styles.pDot, { backgroundColor: 'rgba(251,113,133,0.4)' }]} /><View style={[styles.pDot, { backgroundColor: 'rgba(251,191,36,0.4)' }]} /></View>
              <View style={[styles.pLine, { backgroundColor: 'rgba(255,255,255,0.1)', width: '75%' }]} />
              <View style={[styles.pLine, { backgroundColor: 'rgba(255,255,255,0.1)', width: '50%' }]} />
            </View>
            <Text style={[styles.previewLabel, { color: colors.tx3 }]}>Oscuro</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { if (isDark) toggleTheme(); }} style={[styles.previewBox, { borderColor: !isDark ? 'rgba(251,191,36,0.3)' : colors.bd }, !isDark && styles.previewActive]} activeOpacity={0.7}>
            <View style={[styles.previewInner, { backgroundColor: '#f6f5f2' }]}>
              <View style={styles.pDots}><View style={[styles.pDot, { backgroundColor: 'rgba(251,113,133,0.3)' }]} /><View style={[styles.pDot, { backgroundColor: 'rgba(251,191,36,0.3)' }]} /></View>
              <View style={[styles.pLine, { backgroundColor: 'rgba(0,0,0,0.1)', width: '75%' }]} />
              <View style={[styles.pLine, { backgroundColor: 'rgba(0,0,0,0.1)', width: '50%' }]} />
            </View>
            <Text style={[styles.previewLabel, { color: colors.tx3 }]}>Claro</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Acciones ── */}
      <TouchableOpacity onPress={() => setShowChangePass(true)} style={[styles.actionBtn, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]} activeOpacity={0.7}>
        <View style={[styles.actionIcon, { backgroundColor: 'rgba(251,113,133,0.1)' }]}><Ionicons name="lock-closed-outline" size={18} color={colors.acRose} /></View>
        <Text style={[styles.actionText, { color: colors.tx }]}>Cambiar Contraseña</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.tx4} />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={[styles.logoutBtn, { borderColor: 'rgba(248,113,113,0.15)' }]} activeOpacity={0.7}>
        <View style={[styles.actionIcon, { backgroundColor: 'rgba(248,113,113,0.15)' }]}><Ionicons name="log-out-outline" size={18} color={colors.acRed} /></View>
        <Text style={[styles.logoutText, { color: colors.acRed }]}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* ── Modal cambiar contraseña ── */}
      <Modal visible={showChangePass} transparent animationType="fade">
        <View style={styles.modalOv}>
          <View style={[styles.modalBox, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
            <Text style={[styles.modalTitle, { color: colors.tx }]}>Cambiar Contraseña</Text>
            {passError !== '' && <View style={styles.modalErr}><Text style={{ color: colors.acRed, fontSize: 13 }}>{passError}</Text></View>}
            {['Contraseña actual', 'Nueva contraseña', 'Confirmar nueva'].map((ph, i) => {
              const key = (['actual', 'nueva', 'confirmar'] as const)[i];
              return <TextInput key={key} style={[styles.modalInput, { backgroundColor: colors.fiSolid, borderColor: colors.bd2Solid, color: colors.tx }]} placeholder={ph} placeholderTextColor={colors.tx4} secureTextEntry value={passForm[key]} onChangeText={(t) => { setPassForm({ ...passForm, [key]: t }); setPassError(''); }} />;
            })}
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowChangePass(false)} style={[styles.modalCancel, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}><Text style={{ color: colors.tx3, fontSize: 14 }}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleChangePass} activeOpacity={0.85}><LinearGradient colors={['#fb7185', '#f59e0b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalConfirm}><Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Cambiar</Text></LinearGradient></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100, gap: 12 },
  card: { borderRadius: 18, padding: 18, borderWidth: 1 },
  profileHeader: { alignItems: 'center' },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#fff', fontSize: 32, fontWeight: '600' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0 },
  cameraBtnInner: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 17, fontWeight: '600' },
  rolBadge: { marginTop: 8, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  rolText: { fontSize: 11, fontWeight: '500' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  infoIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 10 },
  infoValue: { fontSize: 13, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '500' },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, padding: 14, borderWidth: 1 },
  themeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  themeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  themeLabel: { fontSize: 14, fontWeight: '500' },
  themeDesc: { fontSize: 10, marginTop: 2 },
  toggle: { width: 52, height: 30, borderRadius: 15, justifyContent: 'center' },
  toggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', position: 'absolute' },
  toggleL: { left: 4 },
  toggleR: { right: 4 },
  previewRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  previewBox: { flex: 1, borderRadius: 14, padding: 10, borderWidth: 1 },
  previewActive: { borderWidth: 2 },
  previewInner: { borderRadius: 8, padding: 8, marginBottom: 6 },
  pDots: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  pDot: { width: 8, height: 8, borderRadius: 4 },
  pLine: { height: 4, borderRadius: 2, marginBottom: 3 },
  previewLabel: { fontSize: 10, textAlign: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 16, borderWidth: 1, gap: 12 },
  actionIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionText: { flex: 1, fontSize: 15, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 18, padding: 16, borderWidth: 1, gap: 12 },
  logoutText: { fontSize: 15, fontWeight: '500' },
  modalOv: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 24 },
  modalBox: { borderRadius: 24, padding: 22, borderWidth: 1, gap: 12 },
  modalTitle: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  modalErr: { backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 12, padding: 10 },
  modalInput: { borderRadius: 14, borderWidth: 1, height: 48, paddingHorizontal: 16, fontSize: 14 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalCancel: { flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  modalConfirm: { flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', minWidth: 140 },
});
