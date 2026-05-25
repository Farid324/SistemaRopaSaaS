// app_movil/src/components/ui/forms/input-otp.tsx

import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, ViewStyle, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../utils';

interface InputOTPProps { length?: number; value: string; onChange: (val: string) => void; style?: ViewStyle }

export function InputOTP({ length = 6, value, onChange, style }: InputOTPProps) {
  const { colors, isDark } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={[{ position: 'relative', alignItems: 'center' }, style]}>
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
        {Array.from({ length }).map((_, i) => {
          const isFocused = focused && value.length === i;
          const isFilled = !!value[i];

          return (
            <TouchableOpacity key={i} activeOpacity={1} onPress={handlePress} style={{
              width: 44, height: 52, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
              borderColor: isFocused ? colors.acRose : isFilled ? colors.acRose + '60' : colors.bd2Solid,
              backgroundColor: colors.fiSolid,
            }}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: colors.tx, textAlign: 'center' }}>
                {value[i] || ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => {
          const numericText = text.replace(/[^0-9]/g, '');
          if (numericText.length <= length) {
            onChange(numericText);
          }
        }}
        maxLength={length}
        keyboardType="number-pad"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
        caretHidden
      />
    </View>
  );
}