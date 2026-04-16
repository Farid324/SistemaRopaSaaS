// app_movil/src/components/ui/feedback/skeleton.tsx

import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { useTheme } from '../utils';
 
interface SkeletonProps { width?: number | string; height?: number; borderRadius?: number; style?: ViewStyle }
 
export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;
 
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
 
  return <Animated.View style={[{ width: width as any, height, borderRadius, backgroundColor: colors.fiSolid, opacity }, style]} />;
}
