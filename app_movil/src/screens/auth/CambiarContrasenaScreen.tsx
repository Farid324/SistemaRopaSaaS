// app_movil/src/screens/auth/CambiarContrasenaScreen.tsx  (REEMPLAZA el existente)

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function CambiarContrasenaScreen() {
  const { colors, isDark } = useTheme();
  const { cambiarPassword, isLoading, error: authError } = useAuth();

  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [localError, setLocalError] = useState('');

  const error = localError || authError || '';

  const handleSubmit = async () => {
    if (nueva.length < 6) { setLocalError('Mínimo 6 caracteres'); return; }
    if (nueva !== confirmar) { setLocalError('Las contraseñas no coinciden'); return; }

    const ok = await cambiarPassword(nueva);
    if (ok) {
      router.replace('/(tabs)/inicio');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.pg }]}>
      <View style={[styles.glowCircle, { backgroundColor: isDark ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.06)' }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
            <View style={styles.headerSection}>
              <LinearGradient colors={['#f59e0b', '#fb7185']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={32} color="#fff" />
              </LinearGradient>
              <Text style={[styles.title, { color: colors.tx }]}>Cambiar Contraseña</Text>
              <Text style={[styles.subtitle, { color: colors.tx3 }]}>Por seguridad, cambie su contraseña en su primer ingreso</Text>
            </View>

            {error !== '' && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.acRed} />
                <Text style={[styles.errorText, { color: colors.acRed }]}>{error}</Text>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.tx3 }]}>Nueva contraseña</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.fiSolid, borderColor: colors.bd2Solid }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.tx4} style={styles.inputIcon} />
                <TextInput style={[styles.input, { color: colors.tx }]} placeholder="Mínimo 6 caracteres" placeholderTextColor={colors.tx4}
                  value={nueva} onChangeText={(t) => { setNueva(t); setLocalError(''); }} secureTextEntry autoCapitalize="none" />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.tx3 }]}>Confirmar contraseña</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.fiSolid, borderColor: colors.bd2Solid }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.tx4} style={styles.inputIcon} />
                <TextInput style={[styles.input, { color: colors.tx }]} placeholder="Repita la contraseña" placeholderTextColor={colors.tx4}
                  value={confirmar} onChangeText={(t) => { setConfirmar(t); setLocalError(''); }} secureTextEntry autoCapitalize="none" />
              </View>
            </View>

            <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85} disabled={isLoading} style={styles.buttonWrapper}>
              <LinearGradient colors={['#f59e0b', '#fb7185']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.button, isLoading && { opacity: 0.6 }]}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Cambiar y Continuar</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  glowCircle: { position: 'absolute', top: -100, left: -50, width: 300, height: 300, borderRadius: 999 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  card: { borderRadius: 24, padding: 22, borderWidth: 1 },
  headerSection: { alignItems: 'center', marginBottom: 24 },
  iconContainer: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '600' },
  subtitle: { fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, gap: 8 },
  errorText: { fontSize: 13, flex: 1 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 12, marginBottom: 6, fontWeight: '500' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, height: 50 },
  inputIcon: { marginLeft: 14, marginRight: 10 },
  input: { flex: 1, fontSize: 15, paddingRight: 14 },
  buttonWrapper: { marginTop: 8 },
  button: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});