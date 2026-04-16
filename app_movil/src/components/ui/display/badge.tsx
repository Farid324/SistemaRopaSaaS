// app_movil/src/components/ui/display/badge.tsx

import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../utils';
 
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
 
interface BadgeProps { children: React.ReactNode; variant?: BadgeVariant; style?: ViewStyle }
 
export function Badge({ children, variant = 'default', style }: BadgeProps) {
  const { colors } = useTheme();
 
  const variants: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
    default: { bg: 'rgba(251,113,133,0.15)', text: colors.acRose, border: 'rgba(251,113,133,0.2)' },
    secondary: { bg: colors.fiSolid, text: colors.tx3, border: colors.bd2Solid },
    destructive: { bg: 'rgba(248,113,113,0.15)', text: colors.acRed, border: 'rgba(248,113,113,0.2)' },
    outline: { bg: 'transparent', text: colors.tx3, border: colors.bd2Solid },
    success: { bg: 'rgba(52,211,153,0.15)', text: colors.acEmerald, border: 'rgba(52,211,153,0.2)' },
    warning: { bg: 'rgba(251,191,36,0.15)', text: colors.acAmber, border: 'rgba(251,191,36,0.2)' },
  };
 
  const v = variants[variant];
  return (
    <View style={[{ backgroundColor: v.bg, borderColor: v.border, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }, style]}>
      <Text style={{ color: v.text, fontSize: 11, fontWeight: '500' }}>{children}</Text>
    </View>
  );
}
