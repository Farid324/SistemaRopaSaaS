//app_movil/src/components/inicio/ChartsCard.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Periodo, ChartData } from '../../types/inicio/types';

interface Props {
  colors: any;
  periodos: { key: Periodo; label: string }[];
  periodoStats: Periodo;
  setPeriodoStats: (p: Periodo) => void;
  baseData: ChartData[];
}

export function ChartsCard({ colors, periodos, periodoStats, setPeriodoStats, baseData }: Props) {
  return (
    <View style={[styles.chartCard, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, ...colors.cardShadow }]}>
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { color: colors.tx }]}>Estadísticas de Ventas</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodTabs}>
        {periodos.map((p) => (
          <TouchableOpacity
            key={p.key}
            onPress={() => setPeriodoStats(p.key)}
            activeOpacity={0.7}
            style={[
              styles.periodTab,
              {
                backgroundColor: periodoStats === p.key ? 'rgba(251,113,133,0.15)' : colors.fiSolid,
                borderColor: periodoStats === p.key ? 'rgba(251,113,133,0.25)' : 'transparent',
              },
            ]}
          >
            <Text style={{ color: periodoStats === p.key ? colors.acRose : colors.tx4, fontSize: 11, fontWeight: '500' }}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bar Chart - Prendas vendidas */}
      <View style={styles.chartSection}>
        <Text style={[styles.chartSectionLabel, { color: colors.tx4 }]}>Prendas vendidas</Text>
        <View style={styles.barChart}>
          {baseData.map((d, i) => {
            const mx = Math.max(...baseData.map((b) => b.ventas), 1);
            const heightPct = (d.ventas / mx) * 100;
            return (
              <View key={i} style={styles.barCol}>
                <Text style={[styles.barValue, { color: colors.tx4 }]}>{d.ventas}</Text>
                <View style={[styles.barBg, { backgroundColor: colors.fiSolid }]}>
                  <LinearGradient
                    colors={['rgba(251,113,133,0.6)', '#fb7185']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.barFill, { height: `${Math.max(heightPct, 4)}%` }]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.tx4 }]} numberOfLines={1}>{d.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Horizontal Bars - Ingresos */}
      <View style={[styles.chartSection, { marginTop: 12 }]}>
        <Text style={[styles.chartSectionLabel, { color: colors.tx4 }]}>Ingresos (Bs)</Text>
        <View style={{ gap: 6 }}>
          {baseData.map((d, i) => {
            const mx = Math.max(...baseData.map((l) => l.ingresos), 1);
            const widthPct = (d.ingresos / mx) * 100;
            return (
              <View key={i} style={styles.hBarRow}>
                <Text style={[styles.hBarLabel, { color: colors.tx4 }]} numberOfLines={1}>{d.label}</Text>
                <View style={[styles.hBarBg, { backgroundColor: colors.fiSolid }]}>
                  <LinearGradient
                    colors={['#f59e0b', 'rgba(251,191,36,0.6)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.hBarFill, { width: `${Math.max(widthPct, 3)}%` }]}
                  />
                </View>
                <Text style={[styles.hBarValue, { color: colors.tx3 }]}>Bs {d.ingresos}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  chartHeader: { padding: 16, paddingBottom: 8 },
  chartTitle: { fontSize: 15, fontWeight: '500' },
  periodTabs: { paddingHorizontal: 16, paddingBottom: 12, gap: 6 },
  periodTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  chartSection: { paddingHorizontal: 16, paddingBottom: 14 },
  chartSectionLabel: { fontSize: 11, marginBottom: 8 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 130 },
  barCol: { flex: 1, alignItems: 'center', gap: 3 },
  barValue: { fontSize: 9 },
  barBg: { width: '100%', flex: 1, borderTopLeftRadius: 4, borderTopRightRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barLabel: { fontSize: 8 },
  hBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hBarLabel: { fontSize: 10, width: 36, textAlign: 'right' },
  hBarBg: { flex: 1, height: 16, borderRadius: 8, overflow: 'hidden' },
  hBarFill: { height: '100%', borderRadius: 8 },
  hBarValue: { fontSize: 10, width: 56, textAlign: 'right' },
});