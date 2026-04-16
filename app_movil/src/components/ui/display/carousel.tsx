// app_movil/src/components/ui/display/carousel.tsx

import React, { useRef, useState } from 'react';
import { View, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, ViewStyle } from 'react-native';
import { useTheme } from '../utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CarouselProps { children: React.ReactNode; itemWidth?: number; gap?: number; style?: ViewStyle; showDots?: boolean }

export function Carousel({ children, itemWidth = SCREEN_WIDTH - 64, gap = 12, style, showDots = true }: CarouselProps) {
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const count = React.Children.count(children);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (itemWidth + gap));
    setActiveIndex(idx);
  };

  return (
    <View style={style}>
      <ScrollView
        horizontal
        pagingEnabled={false}
        snapToInterval={itemWidth + gap}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ gap, paddingHorizontal: 16 }}
      >
        {React.Children.map(children, (child) => (
          <View style={{ width: itemWidth }}>{child}</View>
        ))}
      </ScrollView>
      {showDots && count > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 }}>
          {Array.from({ length: count }).map((_, i) => (
            <View key={i} style={{ width: i === activeIndex ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === activeIndex ? colors.acRose : colors.tx4 + '4D' }} />
          ))}
        </View>
      )}
    </View>
  );
}

export function CarouselItem({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={style}>{children}</View>;
}