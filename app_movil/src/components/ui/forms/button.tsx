// app_movil/src/components/ui/forms/button.tsx

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils';
 
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';
 
interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}
 
export function Button({ children, variant = 'default', size = 'default', disabled, loading, onPress, style, textStyle }: ButtonProps) {
  const { colors, isDark } = useTheme();
 
  const sizeStyles: Record<ButtonSize, { h: number; px: number; fs: number; iconSize: number }> = {
    sm: { h: 36, px: 12, fs: 13, iconSize: 32 },
    default: { h: 44, px: 16, fs: 14, iconSize: 40 },
    lg: { h: 52, px: 24, fs: 16, iconSize: 48 },
    icon: { h: 40, px: 0, fs: 14, iconSize: 40 },
  };
 
  const s = sizeStyles[size];
 
  const getVariantStyle = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'destructive':
        return { container: { backgroundColor: colors.acRed }, text: { color: '#fff' } };
      case 'outline':
        return { container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.bd2Solid }, text: { color: colors.tx } };
      case 'secondary':
        return { container: { backgroundColor: colors.fiSolid }, text: { color: colors.tx } };
      case 'ghost':
        return { container: { backgroundColor: 'transparent' }, text: { color: colors.tx } };
      case 'link':
        return { container: { backgroundColor: 'transparent' }, text: { color: colors.acRose, textDecorationLine: 'underline' } };
      case 'gradient':
        return { container: {}, text: { color: '#fff' } };
      default:
        return { container: { backgroundColor: colors.acRose }, text: { color: '#fff' } };
    }
  };
 
  const vs = getVariantStyle();
  const isIcon = size === 'icon';
 
  if (variant === 'gradient') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.85} style={style}>
        <LinearGradient
          colors={['#fb7185', '#f59e0b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[{ height: s.h, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: s.px, opacity: disabled ? 0.5 : 1 }]}
        >
          {loading ? <ActivityIndicator color="#fff" size="small" /> : typeof children === 'string' ? <Text style={[{ color: '#fff', fontSize: s.fs, fontWeight: '600' }, textStyle]}>{children}</Text> : children}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
 
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        {
          height: isIcon ? s.iconSize : s.h,
          width: isIcon ? s.iconSize : undefined,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: isIcon ? 0 : s.px,
          opacity: disabled ? 0.5 : 1,
        },
        vs.container,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={vs.text.color as string} size="small" /> : typeof children === 'string' ? <Text style={[{ fontSize: s.fs, fontWeight: '600' }, vs.text, textStyle]}>{children}</Text> : children}
    </TouchableOpacity>
  );
}