// app_movil/src/context/ThemeContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Boutique Theme Tokens ──
export const themes = {
  dark: {
    pg: '#0c0c10',
    cd: 'rgba(22, 22, 29, 0.8)',
    cdSolid: '#16161d',
    el: 'rgba(18, 18, 26, 0.95)',
    fi: 'rgba(255,255,255,0.05)',
    fiSolid: '#1a1a22',
    fiH: 'rgba(255,255,255,0.07)',
    fiHSolid: '#1e1e27',
    bd: 'rgba(255,255,255,0.06)',
    bd2: 'rgba(255,255,255,0.1)',
    bd2Solid: '#2a2a35',
    tx: '#ffffff',
    tx2: '#c9cdd4',
    tx3: '#8b8fa4',
    tx4: '#555770',
    ov: 'rgba(0,0,0,0.7)',
    acRose: '#fb7185',
    acAmber: '#fbbf24',
    acEmerald: '#34d399',
    acSky: '#38bdf8',
    acViolet: '#a78bfa',
    acRed: '#f87171',
    glowColor: 'rgba(244,63,94,0.25)',
    cardShadow: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  },
  light: {
    pg: '#f6f5f2',
    cd: 'rgba(255,255,255,0.92)',
    cdSolid: '#ffffff',
    el: 'rgba(255,255,255,0.97)',
    fi: '#efeee9',
    fiSolid: '#efeee9',
    fiH: '#e8e7e2',
    fiHSolid: '#e8e7e2',
    bd: 'rgba(0,0,0,0.07)',
    bd2: 'rgba(0,0,0,0.12)',
    bd2Solid: '#e0e0e0',
    tx: '#1a1a2e',
    tx2: '#3d3d56',
    tx3: '#6e6e87',
    tx4: '#a5a5ba',
    ov: 'rgba(0,0,0,0.4)',
    acRose: '#e11d48',
    acAmber: '#b45309',
    acEmerald: '#047857',
    acSky: '#0369a1',
    acViolet: '#6d28d9',
    acRed: '#dc2626',
    glowColor: 'rgba(244,63,94,0.1)',
    cardShadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
  },
};

// CAMBIO: Tipo que acepta ambos temas
export type ThemeColors = typeof themes.dark | typeof themes.light;

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  colors: themes.dark,
});

const THEME_KEY = 'boutique-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved !== null) {
        setIsDark(saved === 'dark');
      }
    });
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  const colors = isDark ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);