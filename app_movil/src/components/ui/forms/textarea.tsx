// app_movil/src/components/ui/forms/textarea.tsx

import React, { useState } from 'react';
import { View, TextInput, Text, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '../utils';
 
interface TextareaProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}
 
export function Textarea({ label, error, containerStyle, style, ...props }: TextareaProps) {
  const { colors, isDark } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.acRed : focused ? (isDark ? 'rgba(251,113,133,0.4)' : 'rgba(225,29,72,0.4)') : colors.bd2Solid;
 
  return (
    <View style={containerStyle}>
      {label && <Text style={{ fontSize: 12, fontWeight: '500', color: colors.tx3, marginBottom: 6 }}>{label}</Text>}
      <TextInput
        multiline
        textAlignVertical="top"
        style={[{ backgroundColor: colors.fiSolid, borderColor, borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 14, color: colors.tx, minHeight: 80 }, style]}
        placeholderTextColor={colors.tx4}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        {...props}
      />
      {error && <Text style={{ fontSize: 11, color: colors.acRed, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}
