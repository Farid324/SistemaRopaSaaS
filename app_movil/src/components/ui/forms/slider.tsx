// app_movil/src/components/ui/forms/slider.tsx

import React from 'react';
import { View, ViewStyle } from 'react-native';
import RNSlider from '@react-native-community/slider';
import { useTheme } from '../utils';
 
interface SliderProps { value: number; onValueChange: (val: number) => void; min?: number; max?: number; step?: number; disabled?: boolean; style?: ViewStyle }
 
export function Slider({ value, onValueChange, min = 0, max = 100, step = 1, disabled, style }: SliderProps) {
  const { colors } = useTheme();
  return (
    <View style={style}>
      <RNSlider
        value={value}
        onValueChange={onValueChange}
        minimumValue={min}
        maximumValue={max}
        step={step}
        disabled={disabled}
        minimumTrackTintColor="#fb7185"
        maximumTrackTintColor={colors.fiSolid}
        thumbTintColor="#fb7185"
      />
    </View>
  );
}
