// app_movil/app/(auth)/_layout.tsx  (REEMPLAZA el existente)
 
import { Stack } from 'expo-router';
 
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="cambiar-contrasena" />
    </Stack>
  );
}