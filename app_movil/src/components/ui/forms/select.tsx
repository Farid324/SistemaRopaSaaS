// app_movil/src/components/ui/forms/select.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils';
 
interface SelectOption { label: string; value: string }
 
interface SelectProps {
  value: string;
  onValueChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
}
 
export function Select({ value, onValueChange, options, placeholder = 'Seleccionar...', label, disabled, style }: SelectProps) {
  const { colors, isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
 
  return (
    <View style={style}>
      {label && <Text style={{ fontSize: 12, fontWeight: '500', color: colors.tx3, marginBottom: 6 }}>{label}</Text>}
      <TouchableOpacity
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.7}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.fiSolid, borderWidth: 1, borderColor: colors.bd2Solid, borderRadius: 14, height: 50, paddingHorizontal: 14, opacity: disabled ? 0.5 : 1 }}
      >
        <Text style={{ color: selected ? colors.tx : colors.tx4, fontSize: 15 }}>{selected?.label || placeholder}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.tx4} />
      </TouchableOpacity>
 
      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity style={{ flex: 1, backgroundColor: colors.ov }} onPress={() => setOpen(false)} activeOpacity={1}>
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.cdSolid, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%', borderWidth: 1, borderColor: colors.bd2Solid }}>
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.tx4 + '4D' }} />
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { onValueChange(item.value); setOpen(false); }}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.bd }}
                >
                  <Text style={{ color: colors.tx, fontSize: 15 }}>{item.label}</Text>
                  {item.value === value && <Ionicons name="checkmark" size={20} color={colors.acRose} />}
                </TouchableOpacity>
              )}
              style={{ paddingBottom: 40 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}