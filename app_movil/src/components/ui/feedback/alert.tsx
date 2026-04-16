// app_movil/src/components/ui/feedback/alert.tsx

import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils';
 
type AlertVariant = 'default' | 'destructive' | 'success' | 'warning';
 
interface AlertProps { children: React.ReactNode; variant?: AlertVariant; icon?: keyof typeof Ionicons.glyphMap; style?: ViewStyle }
 
export function Alert({ children, variant = 'default', icon, style }: AlertProps) {
  const { colors } = useTheme();
  const variants: Record<AlertVariant, { bg: string; border: string; iconColor: string }> = {
    default: { bg: colors.fiSolid, border: colors.bd2Solid, iconColor: colors.tx3 },
    destructive: { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', iconColor: colors.acRed },
    success: { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', iconColor: colors.acEmerald },
    warning: { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', iconColor: colors.acAmber },
  };
  const v = variants[variant];
  const defaultIcons: Record<AlertVariant, keyof typeof Ionicons.glyphMap> = { default: 'information-circle-outline', destructive: 'alert-circle-outline', success: 'checkmark-circle-outline', warning: 'warning-outline' };
 
  return (
    <View style={[{ backgroundColor: v.bg, borderColor: v.border, borderWidth: 1, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 10 }, style]}>
      <Ionicons name={icon || defaultIcons[variant]} size={18} color={v.iconColor} style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
 
export function AlertTitle({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={{ color: colors.tx, fontSize: 14, fontWeight: '600', marginBottom: 2 }}>{children}</Text>;
}
 
export function AlertDescription({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={{ color: colors.tx3, fontSize: 13 }}>{children}</Text>;
}
