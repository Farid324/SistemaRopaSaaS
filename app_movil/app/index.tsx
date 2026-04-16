// app_movil/app/index.tsx  (REEMPLAZA el existente)

import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';

export default function Index() {
  const { currentUser, isRestoring } = useAuth();
  const { colors } = useTheme();

  // Mientras restaura la sesión, mostrar loading
  if (isRestoring) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.pg }}>
        <ActivityIndicator size="large" color={colors.acRose} />
      </View>
    );
  }

  if (!currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  if (currentUser.debeCambiarPass) {
    return <Redirect href="/(auth)/cambiar-contrasena" />;
  }

  return <Redirect href="/(tabs)/inicio" />;
}
