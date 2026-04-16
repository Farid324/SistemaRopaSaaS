// app_movil/src/components/ui/display/chart.tsx

import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../utils';

// Chart wrapper - uses react-native-chart-kit or victory-native
// Install: npx expo install react-native-chart-kit react-native-svg

interface ChartContainerProps { children: React.ReactNode; title?: string; description?: string; style?: ViewStyle }

export function ChartContainer({ children, title, description, style }: ChartContainerProps) {
  const { colors } = useTheme();
  return (
    <View style={[{ borderRadius: 18, padding: 16, borderWidth: 1, backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid }, style]}>
      {title && <Text style={{ color: colors.tx, fontSize: 14, fontWeight: '500', marginBottom: 2 }}>{title}</Text>}
      {description && <Text style={{ color: colors.tx4, fontSize: 11, marginBottom: 12 }}>{description}</Text>}
      {children}
    </View>
  );
}

// Simple bar chart built with Views (no external lib needed)
interface SimpleBarChartProps { data: { label: string; value: number }[]; height?: number; barColor?: string }

export function SimpleBarChart({ data, height = 130, barColor }: SimpleBarChartProps) {
  const { colors } = useTheme();
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 9, color: colors.tx4 }}>{d.value}</Text>
            <View style={{ width: '100%', backgroundColor: colors.fiSolid, borderTopLeftRadius: 4, borderTopRightRadius: 4, flex: 1, justifyContent: 'flex-end' }}>
              <View style={{ width: '100%', height: `${Math.max(pct, 4)}%`, backgroundColor: barColor || colors.acRose, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
            </View>
            <Text style={{ fontSize: 8, color: colors.tx4 }} numberOfLines={1}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}