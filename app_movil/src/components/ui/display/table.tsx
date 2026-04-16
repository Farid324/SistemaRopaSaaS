// app_movil/src/components/ui/display/table.tsx

import React from 'react';
import { View, Text, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../utils';

export function Table({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={[{ minWidth: '100%' }, style]}>{children}</View></ScrollView>;
}

export function TableHeader({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme();
  return <View style={[{ backgroundColor: colors.fiSolid, borderBottomWidth: 1, borderBottomColor: colors.bd }, style]}>{children}</View>;
}

export function TableBody({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={style}>{children}</View>;
}

export function TableRow({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme();
  return <View style={[{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.bd }, style]}>{children}</View>;
}

export function TableHead({ children, style, flex = 1 }: { children: React.ReactNode; style?: TextStyle; flex?: number }) {
  const { colors } = useTheme();
  return <Text style={[{ flex, paddingHorizontal: 12, paddingVertical: 10, fontSize: 11, fontWeight: '600', color: colors.tx3 }, style]}>{children}</Text>;
}

export function TableCell({ children, style, flex = 1 }: { children: React.ReactNode; style?: TextStyle; flex?: number }) {
  const { colors } = useTheme();
  return <Text style={[{ flex, paddingHorizontal: 12, paddingVertical: 12, fontSize: 13, color: colors.tx }, style]}>{children}</Text>;
}

export function TableFooter({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme();
  return <View style={[{ backgroundColor: colors.fiSolid, borderTopWidth: 1, borderTopColor: colors.bd }, style]}>{children}</View>;
}

export function TableCaption({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={{ fontSize: 12, color: colors.tx4, textAlign: 'center', paddingVertical: 8 }}>{children}</Text>;
}
