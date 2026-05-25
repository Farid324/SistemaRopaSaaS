// app/(auth)/reset-password.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { Input } from '../../src/components/ui/forms/input';
import { useToast } from '../../src/components/ui/feedback/sonner';
import api from '../../src/services/api';

export default function ResetPasswordScreen() {
  const { colors, isDark } = useTheme();
  const toast = useToast();
  const { correo, pin } = useLocalSearchParams<{ correo: string, pin: string }>();
  
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const handleReset = async () => {
    if (nuevaPassword.length < 6) {
      toast.warning('Contraseña muy corta', 'Debe tener al menos 6 caracteres');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      toast.warning('No coinciden', 'Las contraseñas no son iguales');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { correo, pin, nuevaPassword });
      toast.success('¡Contraseña cambiada!', 'Ahora puedes iniciar sesión');
      // Go back to login
      router.replace('/(auth)/login' as any);
    } catch (error: any) {
      toast.error('Error', error.response?.data?.message || 'No se pudo cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.pg }]}>
      <View style={[styles.glowCircle, { top: -100, right: -100, width: 350, height: 350, backgroundColor: isDark ? 'rgba(56,189,248,0.08)' : 'rgba(56,189,248,0.06)' }]} />
      <View style={[styles.glowCircle, { bottom: -80, left: -80, width: 280, height: 280, backgroundColor: isDark ? 'rgba(56,189,248,0.06)' : 'rgba(56,189,248,0.04)' }]} />

      <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.fiSolid }]} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={colors.tx2} />
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerSection}>
            <LinearGradient colors={['#38bdf8', '#0284c7']} style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={36} color="#fff" />
            </LinearGradient>
            <Text style={[styles.title, { color: colors.tx }]}>Nueva Contraseña</Text>
            <Text style={[styles.subtitle, { color: colors.tx4 }]}>Ingresa una nueva contraseña segura para tu cuenta.</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
            
            <View style={{ marginBottom: 16 }}>
              <Input
                icon="key-outline"
                placeholder="Nueva contraseña"
                value={nuevaPassword}
                onChangeText={setNuevaPassword}
                secureTextEntry={!showPass1}
                rightElement={
                  <TouchableOpacity onPress={() => setShowPass1(!showPass1)} style={styles.eyeBtn}>
                    <Ionicons name={showPass1 ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.tx4} />
                  </TouchableOpacity>
                }
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Input
                icon="checkmark-done-outline"
                placeholder="Confirmar contraseña"
                value={confirmarPassword}
                onChangeText={setConfirmarPassword}
                secureTextEntry={!showPass2}
                rightElement={
                  <TouchableOpacity onPress={() => setShowPass2(!showPass2)} style={styles.eyeBtn}>
                    <Ionicons name={showPass2 ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.tx4} />
                  </TouchableOpacity>
                }
              />
            </View>

            <TouchableOpacity onPress={handleReset} disabled={isLoading} activeOpacity={0.85}>
              <LinearGradient colors={['#38bdf8', '#0284c7']} style={[styles.btn, isLoading && { opacity: 0.7 }]}>
                {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnText}>Guardar Cambios</Text>}
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
  glowCircle: { position: 'absolute', borderRadius: 999 },
  backBtn: { position: 'absolute', top: 56, left: 20, zIndex: 10, width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  headerSection: { alignItems: 'center', marginBottom: 36, marginTop: 40 },
  iconContainer: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  title: { fontSize: 26, fontWeight: '600', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
  card: { borderRadius: 24, padding: 22, borderWidth: 1 },
  eyeBtn: { padding: 14, justifyContent: 'center' },
  btn: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
