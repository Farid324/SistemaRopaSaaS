// app_movil/src/screens/auth/LoginScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function LoginScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { login, isLoading, error, clearError } = useAuth();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPass, setIsFocusedPass] = useState(false);

  const handleLogin = async () => {
    if (!correo.trim() || !contrasena.trim()) return;
    const success = await login(correo.trim(), contrasena);
    if (success) {
      // TODO: Verificar debeCambiarPass → redirigir a cambio de contraseña
      // TODO: Redirigir según rol (owner, admin, empleado)
      router.replace('/(tabs)/inicio');
    }
  };

  // Auto-rellenar credenciales demo
  const fillDemo = (email: string) => {
    setCorreo(email);
    setContrasena('admin123');
    clearError();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.pg }]}>
      {/* ── Círculos decorativos de fondo (glow) ── */}
      <View
        style={[
          styles.glowCircle,
          {
            top: -100,
            right: -100,
            width: 350,
            height: 350,
            backgroundColor: isDark ? 'rgba(251,113,133,0.08)' : 'rgba(251,113,133,0.06)',
          },
        ]}
      />
      <View
        style={[
          styles.glowCircle,
          {
            bottom: -80,
            left: -80,
            width: 280,
            height: 280,
            backgroundColor: isDark ? 'rgba(251,191,36,0.06)' : 'rgba(251,191,36,0.04)',
          },
        ]}
      />

      {/* ── Botón cambiar tema (oscuro/claro) ── */}
      <TouchableOpacity
        style={[styles.themeToggle, { backgroundColor: colors.fiSolid }]}
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isDark ? 'sunny-outline' : 'moon-outline'}
          size={20}
          color={colors.tx3}
        />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo y Título ── */}
          <View style={styles.headerSection}>
            <LinearGradient
              colors={['#fb7185', '#f59e0b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoContainer}
            >
              <Ionicons name="sparkles" size={36} color="#fff" />
            </LinearGradient>
            <Text style={[styles.appTitle, { color: colors.tx }]}>Boutique App</Text>
            <Text style={[styles.appSubtitle, { color: colors.tx4 }]}>
              Sistema de Inventario & Ventas
            </Text>
          </View>

          {/* ── Card del Login ── */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.cdSolid,
                borderColor: colors.bd2Solid,
                ...colors.cardShadow,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.tx }]}>Iniciar Sesión</Text>

            {/* Mensaje de error */}
            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.acRed} />
                <Text style={[styles.errorText, { color: colors.acRed }]}>{error}</Text>
              </View>
            )}

            {/* ── Campo: Correo electrónico ── */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.tx3 }]}>Correo electrónico</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.fiSolid,
                    borderColor: isFocusedEmail
                      ? isDark ? 'rgba(251,113,133,0.4)' : 'rgba(225,29,72,0.4)'
                      : colors.bd2Solid,
                  },
                ]}
              >
                <Ionicons name="mail-outline" size={18} color={colors.tx4} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.tx }]}
                  placeholder="correo@email.com"
                  placeholderTextColor={colors.tx4}
                  value={correo}
                  onChangeText={(text) => { setCorreo(text); clearError(); }}
                  onFocus={() => setIsFocusedEmail(true)}
                  onBlur={() => setIsFocusedEmail(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* ── Campo: Contraseña ── */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.tx3 }]}>Contraseña</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.fiSolid,
                    borderColor: isFocusedPass
                      ? isDark ? 'rgba(251,113,133,0.4)' : 'rgba(225,29,72,0.4)'
                      : colors.bd2Solid,
                  },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={18} color={colors.tx4} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.tx, flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.tx4}
                  value={contrasena}
                  onChangeText={(text) => { setContrasena(text); clearError(); }}
                  onFocus={() => setIsFocusedPass(true)}
                  onBlur={() => setIsFocusedPass(false)}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPass(!showPass)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPass ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.tx4}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Botón Iniciar Sesión ── */}
            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={isLoading}
              style={styles.loginButtonWrapper}
            >
              <LinearGradient
                colors={['#fb7185', '#f59e0b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* ── Olvidé mi contraseña ── */}
            <TouchableOpacity style={styles.forgotButton} activeOpacity={0.6}>
              <Text style={[styles.forgotText, { color: colors.acRose }]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* ── Cuentas de prueba (tocar para auto-rellenar) ── */}
            <View style={[styles.demoDivider, { borderTopColor: colors.bd }]}>
              <Text style={[styles.demoTitle, { color: colors.tx4 }]}>Cuentas de prueba:</Text>

              <TouchableOpacity onPress={() => fillDemo('carlos@email.com')} activeOpacity={0.6}>
                <Text style={styles.demoRow}>
                  <Text style={{ color: colors.acRose }}>Dueño: </Text>
                  <Text style={{ color: colors.tx3 }}>carlos@email.com</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => fillDemo('ana@email.com')} activeOpacity={0.6}>
                <Text style={styles.demoRow}>
                  <Text style={{ color: colors.acAmber }}>Admin: </Text>
                  <Text style={{ color: colors.tx3 }}>ana@email.com</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => fillDemo('luis@email.com')} activeOpacity={0.6}>
                <Text style={styles.demoRow}>
                  <Text style={{ color: colors.acEmerald }}>Empleado: </Text>
                  <Text style={{ color: colors.tx3 }}>luis@email.com</Text>
                </Text>
              </TouchableOpacity>

              <Text style={[styles.demoPass, { color: colors.tx4 }]}>
                Contraseña: admin123
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  themeToggle: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
  },
  cardTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.2)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 50,
  },
  inputIcon: {
    marginLeft: 14,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingRight: 14,
  },
  eyeButton: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
  },
  loginButtonWrapper: {
    marginTop: 4,
    marginBottom: 4,
  },
  loginButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  forgotText: {
    fontSize: 13,
    opacity: 0.7,
  },
  demoDivider: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 8,
  },
  demoTitle: {
    textAlign: 'center',
    fontSize: 11,
    marginBottom: 10,
  },
  demoRow: {
    fontSize: 12,
    marginBottom: 5,
  },
  demoPass: {
    fontSize: 11,
    marginTop: 6,
  },
});