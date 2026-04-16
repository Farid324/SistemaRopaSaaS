// app_movil/src/components/ui/display/card.tsx

import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../utils';
 
interface CardProps { children: React.ReactNode; style?: ViewStyle }
 
export function Card({ children, style }: CardProps) {
  const { colors } = useTheme();
  return (
    <View style={[{ borderRadius: 18, padding: 18, borderWidth: 1, backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }, style]}>
      {children}
    </View>
  );
}
 
export function CardHeader({ children, style }: CardProps) {
  return <View style={[{ marginBottom: 12 }, style]}>{children}</View>;
}
 
export function CardTitle({ children, style }: { children: React.ReactNode; style?: any }) {
  const { colors } = useTheme();
  return <Text style={[{ fontSize: 16, fontWeight: '600', color: colors.tx }, style]}>{children}</Text>;
}
 
export function CardDescription({ children, style }: { children: React.ReactNode; style?: any }) {
  const { colors } = useTheme();
  return <Text style={[{ fontSize: 12, color: colors.tx4, marginTop: 2 }, style]}>{children}</Text>;
}
 
export function CardContent({ children, style }: CardProps) {
  return <View style={style}>{children}</View>;
}
 
export function CardFooter({ children, style }: CardProps) {
  const { colors } = useTheme();
  return <View style={[{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.bd, flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}
