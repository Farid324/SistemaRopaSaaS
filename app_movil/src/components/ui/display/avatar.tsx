// app_movil/src/components/ui/display/avatar.tsx

import React from 'react';
import { View, Text, Image, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
 
interface AvatarProps { src?: string; fallback: string; size?: number; style?: ViewStyle; gradientColors?: string[] }
 
export function Avatar({ src, fallback, size = 40, style, gradientColors = ['#fb7185', '#f59e0b'] }: AvatarProps) {
  if (src) {
    return <Image source={{ uri: src }} style={[{ width: size, height: size, borderRadius: size / 2 }, style]} />;
  }
  return (
    <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Text style={{ color: '#fff', fontSize: size * 0.4, fontWeight: '600' }}>{fallback}</Text>
    </LinearGradient>
  );
}