// app_movil/src/components/ui/display/calendar.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils';

interface CalendarProps { selected?: Date; onSelect?: (date: Date) => void; style?: ViewStyle }

export function Calendar({ selected, onSelect, style }: CalendarProps) {
  const { colors } = useTheme();
  const [viewing, setViewing] = useState(selected || new Date());

  const year = viewing.getFullYear();
  const month = viewing.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = viewing.toLocaleDateString('es', { month: 'long', year: 'numeric' });

  const prev = () => setViewing(new Date(year, month - 1, 1));
  const next = () => setViewing(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const isSelected = (d: number) => selected && selected.getDate() === d && selected.getMonth() === month && selected.getFullYear() === year;
  const isToday = (d: number) => { const t = new Date(); return t.getDate() === d && t.getMonth() === month && t.getFullYear() === year; };

  return (
    <View style={[{ padding: 12 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <TouchableOpacity onPress={prev} style={{ padding: 6 }}><Ionicons name="chevron-back" size={18} color={colors.tx3} /></TouchableOpacity>
        <Text style={{ color: colors.tx, fontSize: 14, fontWeight: '500', textTransform: 'capitalize' }}>{monthName}</Text>
        <TouchableOpacity onPress={next} style={{ padding: 6 }}><Ionicons name="chevron-forward" size={18} color={colors.tx3} /></TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((d) => (
          <Text key={d} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: colors.tx4, fontWeight: '500' }}>{d}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {days.map((d, i) => (
          <TouchableOpacity key={i} disabled={!d} onPress={() => d && onSelect?.(new Date(year, month, d))} activeOpacity={0.6}
            style={{ width: '14.28%', height: 36, alignItems: 'center', justifyContent: 'center' }}>
            {d && (
              <View style={[{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
                isSelected(d) && { backgroundColor: colors.acRose },
                isToday(d) && !isSelected(d) && { borderWidth: 1, borderColor: colors.acRose + '60' }]}>
                <Text style={{ color: isSelected(d) ? '#fff' : colors.tx, fontSize: 13 }}>{d}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}