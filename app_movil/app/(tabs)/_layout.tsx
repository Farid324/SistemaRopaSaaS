// app_movil/app/(tabs)/_layout.tsx  (REEMPLAZA el existente)

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth, Rol } from '../../src/context/AuthContext';

// ── Configuración de tabs por rol ──
// Orden exacto confirmado:
//   Owner:    Inicio, Inventario, Ventas, ESCÁNER, Personal, Sucursales, Perfil  (7)
//   Admin:    Inicio, Inventario, ESCÁNER, Ventas, Personal, Perfil              (6)
//   Empleado: Inicio, Inventario, ESCÁNER, Ventas, Perfil                        (5)

type TabName = 'inicio' | 'inventario' | 'ventas' | 'scanner' | 'personal' | 'sucursales' | 'perfil';

const TABS_BY_ROLE: Record<string, TabName[]> = {
  OWNER:      ['inicio', 'inventario', 'ventas', 'scanner', 'personal', 'sucursales', 'perfil'],
  ADMIN:      ['inicio', 'inventario', 'scanner', 'ventas', 'personal', 'perfil'],
  EMPLOYEE:   ['inicio', 'inventario', 'scanner', 'ventas', 'perfil'],
};

function getRolGroup(rol: Rol): string {
  if (rol === 'OWNER_PRINCIPAL' || rol === 'CO_OWNER' || rol === 'SUPER_ADMIN') return 'OWNER';
  if (rol === 'ADMINISTRADOR') return 'ADMIN';
  return 'EMPLOYEE';
}

function getRolLabel(rol: Rol): string {
  if (rol === 'OWNER_PRINCIPAL' || rol === 'CO_OWNER' || rol === 'SUPER_ADMIN') return 'Dueño';
  if (rol === 'ADMINISTRADOR') return 'Admin';
  return 'Empleado';
}

function getRolColor(rol: Rol, colors: any): string {
  if (rol === 'OWNER_PRINCIPAL' || rol === 'CO_OWNER' || rol === 'SUPER_ADMIN') return colors.acRose;
  if (rol === 'ADMINISTRADOR') return colors.acAmber;
  return colors.acEmerald;
}

// Todos los tabs posibles con su config
const ALL_TABS: { name: TabName; title: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'inicio',       title: 'Inicio',      icon: 'home-outline' },
  { name: 'inventario',  title: 'Inventario',   icon: 'cube-outline' },
  { name: 'ventas',      title: 'Ventas',       icon: 'cart-outline' },
  { name: 'scanner',     title: 'Escáner',      icon: 'scan-outline' },
  { name: 'personal',    title: 'Personal',     icon: 'people-outline' },
  { name: 'sucursales',  title: 'Sucursales',   icon: 'storefront-outline' },
  { name: 'perfil',      title: 'Perfil',       icon: 'person-outline' },
];

export default function TabsLayout() {
  const { colors, isDark } = useTheme();
  const { currentUser } = useAuth();

  // Guards
  if (!currentUser) return <Redirect href="/(auth)/login" />;
  if (currentUser.debeCambiarPass) return <Redirect href="/(auth)/cambiar-contrasena" />;

  const rolGroup = getRolGroup(currentUser.rol);
  const rolLabel = getRolLabel(currentUser.rol);
  const rolColor = getRolColor(currentUser.rol, colors);
  const visibleTabs = TABS_BY_ROLE[rolGroup];

  return (
    <Tabs
      screenOptions={{
        // ── Top Bar ──
        headerStyle: {
          backgroundColor: isDark ? 'rgba(18,18,26,0.95)' : 'rgba(255,255,255,0.97)',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
        },
        headerTitle: '',
        headerLeft: () => (
          <View style={styles.headerLeft}>
            <Text style={[styles.headerGreeting, { color: colors.tx4 }]}>
              Hola, {currentUser.nombreCompleto.split(' ')[0]}
            </Text>
            <Text style={[styles.headerRol, { color: rolColor }]}>{rolLabel}</Text>
          </View>
        ),
        headerRight: () => (
          <View style={styles.headerRight}>
            <LinearGradient
              colors={['#fb7185', '#f59e0b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{currentUser.nombreCompleto.charAt(0)}</Text>
            </LinearGradient>
          </View>
        ),
        // ── Bottom Tab Bar ──
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(18,18,26,0.95)' : 'rgba(255,255,255,0.97)',
          borderTopWidth: 1,
          borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 6,
          paddingHorizontal: 2,
        },
        tabBarActiveTintColor: colors.acRose,
        tabBarInactiveTintColor: colors.tx4,
        tabBarLabelStyle: { fontSize: 9, marginTop: 2 },
      }}
    >
      {/* 1. OCULTAMOS EL ARCHIVO REDIRECCIONADOR PARA QUE NO SEA UN TAB */}
      <Tabs.Screen name="index" options={{ href: null }} />

      {/* 2. CONFIGURAMOS NUESTRAS 7 CARPETAS (TABS REALES) */}
      {ALL_TABS.map((tab) => {
        const isVisible = visibleTabs.includes(tab.name);
        const isScanner = tab.name === 'scanner';
        
        // EL TRUCO: Le decimos a Expo que el archivo exacto es la carpeta + /index
        const routeName = `${tab.name}/index`;

        // Tab oculto para este rol
        if (!isVisible) {
          return (
            <Tabs.Screen
              key={tab.name}
              name={routeName}
              options={{ href: null }}
            />
          );
        }

        // Tab del escáner (botón elevado centrado)
        if (isScanner) {
          return (
            <Tabs.Screen
              key={tab.name}
              name={routeName}
              options={{
                title: tab.title,
                tabBarIcon: ({ focused }) => (
                  <View style={styles.scannerOuter}>
                    <LinearGradient
                      colors={focused ? ['#fb7185', '#f59e0b'] : ['#e11d48', '#b45309']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.scannerBtn, focused && styles.scannerBtnActive]}
                    >
                      <Ionicons name="scan-outline" size={26} color="#fff" />
                    </LinearGradient>
                  </View>
                ),
                tabBarLabel: ({ focused }) => (
                  <Text style={[styles.scannerLabel, { color: focused ? colors.acRose : colors.tx4 }]}>
                    Escáner
                  </Text>
                ),
              }}
            />
          );
        }

        // Tab normal
        return (
          <Tabs.Screen
            key={tab.name}
            name={routeName}
            options={{
              title: tab.title,
              tabBarIcon: ({ color }) => (
                <Ionicons name={tab.icon} size={20} color={color} />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerLeft: { marginLeft: 16 },
  headerGreeting: { fontSize: 11 },
  headerRol: { fontSize: 13, fontWeight: '600' },
  headerRight: { marginRight: 16 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  scannerOuter: { alignItems: 'center', justifyContent: 'center', marginTop: -28 },
  scannerBtn: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  scannerBtnActive: { transform: [{ scale: 1.05 }] },
  scannerLabel: { fontSize: 9, marginTop: 2 },
});
