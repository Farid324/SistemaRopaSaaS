// app_movil/src/components/ui/navigation/pagination.tsx

import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils';

interface PaginationProps { currentPage: number; totalPages: number; onPageChange: (page: number) => void; style?: ViewStyle }

export function Pagination({ currentPage, totalPages, onPageChange, style }: PaginationProps) {
  const { colors } = useTheme();
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, style]}>
      <TouchableOpacity onPress={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={{ opacity: currentPage === 1 ? 0.3 : 1, padding: 8 }}>
        <Ionicons name="chevron-back" size={18} color={colors.tx3} />
      </TouchableOpacity>
      {pages.map((p) => (
        <TouchableOpacity key={p} onPress={() => onPageChange(p)} activeOpacity={0.7}
          style={{ width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: p === currentPage ? colors.acRose : 'transparent' }}>
          <Text style={{ color: p === currentPage ? '#fff' : colors.tx3, fontSize: 13, fontWeight: '500' }}>{p}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} style={{ opacity: currentPage === totalPages ? 0.3 : 1, padding: 8 }}>
        <Ionicons name="chevron-forward" size={18} color={colors.tx3} />
      </TouchableOpacity>
    </View>
  );
}