// app_movil/src/components/ui/feedback/sonner.tsx
 
import React, { useEffect, useRef, createContext, useContext, useState, useCallback } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils';
 
type ToastType = 'default' | 'success' | 'error' | 'warning';
 
interface ToastData { id: string; title: string; description?: string; type: ToastType; duration?: number }
 
interface ToastContextType { toast: (opts: Omit<ToastData, 'id'>) => void; success: (title: string, description?: string) => void; error: (title: string, description?: string) => void; warning: (title: string, description?: string) => void }
 
const ToastContext = createContext<ToastContextType>({} as ToastContextType);
 
export function useToast() { return useContext(ToastContext); }
 
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  let counter = useRef(0);
 
  const addToast = useCallback((opts: Omit<ToastData, 'id'>) => {
    const id = String(++counter.current);
    setToasts((prev) => [...prev, { ...opts, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), opts.duration || 3000);
  }, []);
 
  const ctx: ToastContextType = {
    toast: addToast,
    success: (title, description) => addToast({ title, description, type: 'success' }),
    error: (title, description) => addToast({ title, description, type: 'error' }),
    warning: (title, description) => addToast({ title, description, type: 'warning' }),
  };
 
  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <Toaster toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </ToastContext.Provider>
  );
}
 
function Toaster({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: string) => void }) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((t) => <ToastItem key={t.id} data={t} onDismiss={() => onDismiss(t.id)} />)}
    </View>
  );
}
 
function ToastItem({ data, onDismiss }: { data: ToastData; onDismiss: () => void }) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(-60)).current;
 
  useEffect(() => {
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
  }, []);
 
  const icons: Record<ToastType, keyof typeof Ionicons.glyphMap> = { default: 'information-circle', success: 'checkmark-circle', error: 'close-circle', warning: 'warning' };
  const iconColors: Record<ToastType, string> = { default: colors.acSky, success: colors.acEmerald, error: colors.acRed, warning: colors.acAmber };
 
  return (
    <Animated.View style={[styles.toast, { backgroundColor: colors.cdSolid, borderColor: colors.bd2Solid, transform: [{ translateY }] }]}>
      <Ionicons name={icons[data.type]} size={20} color={iconColors[data.type]} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.tx, fontSize: 13, fontWeight: '600' }}>{data.title}</Text>
        {data.description && <Text style={{ color: colors.tx3, fontSize: 12, marginTop: 2 }}>{data.description}</Text>}
      </View>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="close" size={16} color={colors.tx4} />
      </TouchableOpacity>
    </Animated.View>
  );
}
 
const styles = StyleSheet.create({
  container: { position: 'absolute', top: 60, left: 16, right: 16, zIndex: 9999, gap: 8 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
});