// app_movil/app/(tabs)/perfil/index.tsx  (REEMPLAZA el existente)

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Modal, Image, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth, Rol } from '../../../src/context/AuthContext';
import { router } from 'expo-router';
import api from '../../../src/services/api';

function getRolLabel(rol: Rol) {
  if (rol === 'OWNER_PRINCIPAL' || rol === 'CO_OWNER' || rol === 'SUPER_ADMIN') return 'Dueño';
  if (rol === 'ADMINISTRADOR') return 'Administrador';
  return 'Empleado';
}

function getRolBadge(rol: Rol, colors: any) {
  if (rol === 'OWNER_PRINCIPAL' || rol === 'CO_OWNER' || rol === 'SUPER_ADMIN') return { bg: 'rgba(251,113,133,0.15)', text: colors.acRose, border: 'rgba(251,113,133,0.2)' };
  if (rol === 'ADMINISTRADOR') return { bg: 'rgba(251,191,36,0.15)', text: colors.acAmber, border: 'rgba(251,191,36,0.2)' };
  return { bg: 'rgba(52,211,153,0.15)', text: colors.acEmerald, border: 'rgba(52,211,153,0.2)' };
}

export default function PerfilScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { currentUser, logout, profilePhoto, setProfilePhoto } = useAuth();

  const [showChangePass, setShowChangePass] = useState(false);
  const [passForm, setPassForm] = useState({ actual: '', nueva: '', confirmar: '' });
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  if (!currentUser) return null;
  const badge = getRolBadge(currentUser.rol, colors);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets[0]) setProfilePhoto(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets[0]) setProfilePhoto(result.assets[0].uri);
  };

  const showPhotoOptions = () => {
    Alert.alert('Foto de perfil', 'Elige una opción', [
      { text: 'Cámara', onPress: takePhoto },
      { text: 'Galería', onPress: pickPhoto },
      ...(profilePhoto ? [{ text: 'Quitar foto', style: 'destructive' as const, onPress: () => setProfilePhoto(null) }] : []),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);
  };

  const handleChangePass = async () => {
    if (passForm.nueva.length < 6) { setPassError('Mínimo 6 caracteres'); return; }
    if (passForm.nueva !== passForm.confirmar) { setPassError('Las contraseñas no coinciden'); return; }
    setPassLoading(true);
    try {
      await api.post('/auth/cambiar-contrasena', { contrasenaActual: passForm.actual, nuevaContrasena: passForm.nueva });
      Alert.alert('Listo', 'Contraseña cambiada correctamente');
      setShowChangePass(false);
      setPassForm({ actual: '', nueva: '', confirmar: '' });
    } catch (error: any) {
      setPassError(error.response?.data?.message || 'Error al cambiar contraseña');
    }
    setPassLoading(false);
  };

  const handleLogout = () => { logout(); router.replace('/(auth)/login'); };

  return (
    <ScrollView style={[st.container, { backgroundColor: colors.pg }]} contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
      {/* Avatar */}
      <View style={[st.card, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
        <View style={st.profileHeader}>
          <TouchableOpacity onPress={showPhotoOptions} activeOpacity={0.8} style={st.avatarWrap}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={st.avatarImg} />
            ) : (
              <LinearGradient colors={['#fb7185', '#f59e0b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.avatarCircle}>
                <Text style={st.avatarLetter}>{currentUser.nombreCompleto.charAt(0)}</Text>
              </LinearGradient>
            )}
            <View style={st.cameraBtn}>
              <LinearGradient colors={['#fb7185', '#f59e0b']} style={st.cameraBtnInner}>
                <Ionicons name="camera" size={12} color="#fff" />
              </LinearGradient>
            </View>
          </TouchableOpacity>
          <Text style={[st.userName, { color: colors.tx }]}>{currentUser.nombreCompleto}</Text>
          <View style={[st.rolBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
            <Text style={{ color: badge.text, fontSize: 11, fontWeight: '500' }}>{getRolLabel(currentUser.rol)}</Text>
          </View>
        </View>
      </View>

      {/* Info */}
      <View style={[st.card, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
        {[
          { icon: 'mail-outline' as const, label: 'Correo', value: currentUser.correo },
          { icon: 'call-outline' as const, label: 'Teléfono', value: currentUser.telefono || '-' },
          { icon: 'card-outline' as const, label: 'CI', value: currentUser.ci },
          { icon: 'storefront-outline' as const, label: 'Sucursal', value: currentUser.sucursal?.nombre || 'Sin asignar' },
          { icon: 'business-outline' as const, label: 'Empresa', value: currentUser.empresa?.nombre || '-' },
        ].map((item, i, arr) => (
          <View key={item.label} style={[st.infoRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.bd }]}>
            <View style={[st.infoIcon, { backgroundColor: colors.fiSolid }]}><Ionicons name={item.icon} size={16} color={colors.tx4} /></View>
            <View><Text style={{ color: colors.tx4, fontSize: 10 }}>{item.label}</Text><Text style={{ color: colors.tx, fontSize: 13, marginTop: 2 }}>{item.value}</Text></View>
          </View>
        ))}
      </View>

      {/* Apariencia */}
      <View style={[st.card, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
        <View style={st.sectionHeader}><Ionicons name="color-palette-outline" size={18} color={colors.acViolet} /><Text style={{ color: colors.tx, fontSize: 15, fontWeight: '500' }}>Apariencia</Text></View>
        <View style={[st.themeRow, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
          <View style={st.themeInfo}>
            <View style={[st.themeIcon, { backgroundColor: isDark ? 'rgba(167,139,250,0.15)' : 'rgba(251,191,36,0.15)' }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? colors.acViolet : colors.acAmber} />
            </View>
            <View><Text style={{ color: colors.tx, fontSize: 14, fontWeight: '500' }}>{isDark ? 'Modo Oscuro' : 'Modo Claro'}</Text></View>
          </View>
          <TouchableOpacity onPress={toggleTheme} style={[st.toggle, { backgroundColor: isDark ? '#a78bfa' : '#f59e0b' }]} activeOpacity={0.7}>
            <View style={[st.toggleDot, isDark ? st.toggleR : st.toggleL]}><Ionicons name={isDark ? 'moon' : 'sunny'} size={10} color={isDark ? '#7c3aed' : '#b45309'} /></View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Acciones */}
      <TouchableOpacity onPress={() => setShowChangePass(true)} style={[st.actionBtn, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]} activeOpacity={0.7}>
        <View style={[st.actionIcon, { backgroundColor: 'rgba(251,113,133,0.1)' }]}><Ionicons name="lock-closed-outline" size={18} color={colors.acRose} /></View>
        <Text style={{ flex: 1, color: colors.tx, fontSize: 15, fontWeight: '500' }}>Cambiar Contraseña</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.tx4} />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={[st.logoutBtn, { borderColor: 'rgba(248,113,113,0.15)' }]} activeOpacity={0.7}>
        <View style={[st.actionIcon, { backgroundColor: 'rgba(248,113,113,0.15)' }]}><Ionicons name="log-out-outline" size={18} color={colors.acRed} /></View>
        <Text style={{ color: colors.acRed, fontSize: 15, fontWeight: '500' }}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* Modal cambiar contraseña */}
      <Modal visible={showChangePass} transparent animationType="fade">
        <View style={st.modalOv}>
          <View style={[st.modalBox, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }]}>
            <Text style={{ color: colors.tx, fontSize: 17, fontWeight: '600', marginBottom: 8 }}>Cambiar Contraseña</Text>
            {passError !== '' && <View style={st.modalErr}><Text style={{ color: colors.acRed, fontSize: 13 }}>{passError}</Text></View>}
            {['Contraseña actual', 'Nueva contraseña', 'Confirmar nueva'].map((ph, i) => {
              const key = (['actual', 'nueva', 'confirmar'] as const)[i];
              return <TextInput key={key} style={[st.modalInput, { backgroundColor: colors.fiSolid, borderColor: colors.bd2Solid, color: colors.tx }]} placeholder={ph} placeholderTextColor={colors.tx4} secureTextEntry value={passForm[key]} onChangeText={(t) => { setPassForm({ ...passForm, [key]: t }); setPassError(''); }} />;
            })}
            <View style={st.modalBtns}>
              <TouchableOpacity onPress={() => { setShowChangePass(false); setPassError(''); }} style={[st.modalCancel, { backgroundColor: colors.fiSolid, borderColor: colors.bd }]}>
                <Text style={{ color: colors.tx3, fontSize: 14 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleChangePass} disabled={passLoading} activeOpacity={0.85}>
                <LinearGradient colors={['#fb7185', '#f59e0b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.modalConfirm}>
                  {passLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Cambiar</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 16, paddingBottom: 100, gap: 12 },
  card: { borderRadius: 18, padding: 18, borderWidth: 1 },
  profileHeader: { alignItems: 'center' },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  avatarLetter: { color: '#fff', fontSize: 32, fontWeight: '600' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0 },
  cameraBtnInner: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 17, fontWeight: '600' },
  rolBadge: { marginTop: 8, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  infoIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, padding: 14, borderWidth: 1 },
  themeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  themeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toggle: { width: 52, height: 30, borderRadius: 15, justifyContent: 'center' },
  toggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', position: 'absolute' },
  toggleL: { left: 4 }, toggleR: { right: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 16, borderWidth: 1, gap: 12 },
  actionIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 18, padding: 16, borderWidth: 1, gap: 12 },
  modalOv: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 24 },
  modalBox: { borderRadius: 24, padding: 22, borderWidth: 1, gap: 12 },
  modalErr: { backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 12, padding: 10 },
  modalInput: { borderRadius: 14, borderWidth: 1, height: 48, paddingHorizontal: 16, fontSize: 14 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalCancel: { flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  modalConfirm: { flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', minWidth: 140 },
});