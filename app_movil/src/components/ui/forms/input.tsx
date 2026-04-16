// app_movil/src/components/ui/forms/input.tsx

import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils';
 
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
}
 
export function Input({ label, error, icon, containerStyle, style, ...props }: InputProps) {
  const { colors, isDark } = useTheme();
  const [focused, setFocused] = useState(false);
 
  const borderColor = error
    ? colors.acRed
    : focused
      ? isDark ? 'rgba(251,113,133,0.4)' : 'rgba(225,29,72,0.4)'
      : colors.bd2Solid;
 
  return (
    <View style={containerStyle}>
      {label && <Text style={[styles.label, { color: colors.tx3 }]}>{label}</Text>}
      <View style={[styles.wrapper, { backgroundColor: colors.fiSolid, borderColor }]}>
        {icon && <Ionicons name={icon} size={18} color={colors.tx4} style={styles.icon} />}
        <TextInput
          style={[styles.input, { color: colors.tx, paddingLeft: icon ? 0 : 14 }, style]}
          placeholderTextColor={colors.tx4}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          {...props}
        />
      </View>
      {error && <Text style={[styles.error, { color: colors.acRed }]}>{error}</Text>}
    </View>
  );
}
 
const styles = StyleSheet.create({
  label: { fontSize: 12, marginBottom: 6, fontWeight: '500' },
  wrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, height: 50 },
  icon: { marginLeft: 14, marginRight: 10 },
  input: { flex: 1, fontSize: 15, paddingRight: 14 },
  error: { fontSize: 11, marginTop: 4 },
});
