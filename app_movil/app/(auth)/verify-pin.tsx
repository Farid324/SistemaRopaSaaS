// app/(auth)/verify-pin.tsx

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
import { InputOTP } from '../../src/components/ui/forms/input-otp';
import { useToast } from '../../src/components/ui/feedback/sonner';
import api from '../../src/services/api';

export default function VerifyPinScreen() {
  const { colors, isDark } = useTheme();
  const toast = useToast();
  const { correo } = useLocalSearchParams<{ correo: string }>();
  
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (pin.length < 6) {
      toast.warning('PIN incompleto', 'Ingresa los 6 dígitos');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/verify-pin', { correo, pin });
      toast.success('PIN correcto', 'Ingresa tu nueva contraseña');
      router.push({ pathname: '/(auth)/reset-password', params: { correo, pin } } as any);
    } catch (error: any) {
      toast.error('Error', error.response?.data?.message || 'Código incorrecto');
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
              <Ionicons name="keypad" size={36} color="#fff" />
            </LinearGradient>
            <Text style={[styles.title, { color: colors.tx }]}>Verificar Código</Text>
            <Text style={[styles.subtitle, { color: colors.tx4 }]}>Se ha enviado un código de 6 dígitos a {correo}. Introdúcelo a continuación.</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
            
            <View style={{ marginBottom: 24, alignItems: 'center' }}>
              <InputOTP length={6} value={pin} onChange={setPin} style={{ width: '100%' }} />
            </View>

            <TouchableOpacity onPress={handleVerify} disabled={isLoading || pin.length < 6} activeOpacity={0.85}>
              <LinearGradient colors={['#38bdf8', '#0284c7']} style={[styles.btn, (isLoading || pin.length < 6) && { opacity: 0.7 }]}>
                {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnText}>Verificar</Text>}
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
  btn: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
