// app_movil/src/components/ui/layout/scroll-area.tsx

import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';
 
export function ScrollArea({ children, style, ...props }: ScrollViewProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} style={style} {...props}>
      {children}
    </ScrollView>
  );
}
 
export function ScrollBar() {
  return null; // RN handles scrollbars natively
}
