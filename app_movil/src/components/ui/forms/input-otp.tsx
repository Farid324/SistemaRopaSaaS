// app_movil/src/components/ui/forms/input-otp.tsx

import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../utils';

interface InputOTPProps { length?: number; value: string; onChange: (val: string) => void; style?: ViewStyle }

export function InputOTP({ length = 6, value, onChange, style }: InputOTPProps) {
  const { colors, isDark } = useTheme();
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={[{ flexDirection: 'row', gap: 8, justifyContent: 'center' }, style]}>
      {Array.from({ length }).map((_, i) => (
        <View key={i} style={{
          width: 44, height: 52, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
          borderColor: value.length === i ? colors.acRose : value[i] ? colors.acRose + '60' : colors.bd2Solid,
          backgroundColor: colors.fiSolid,
        }}>
          <TextInput
            ref={i === 0 ? inputRef : undefined}
            style={{ fontSize: 20, fontWeight: '600', color: colors.tx, textAlign: 'center', width: '100%', height: '100%' }}
            value={value[i] || ''}
            maxLength={1}
            keyboardType="number-pad"
            onChangeText={(t) => {
              const newVal = value.substring(0, i) + t + value.substring(i + 1);
              onChange(newVal.substring(0, length));
            }}
            caretHidden
          />
        </View>
      ))}
    </View>
  );
}