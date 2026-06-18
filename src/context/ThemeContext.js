import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Light palette ────────────────────────────────────────────────────────────
const lightColors = {
  green: '#22c55e',
  greenDark: '#14532d',
  greenLight: '#f0fdf4',
  greenGlow: 'rgba(34, 197, 94, 0.2)',
  amber: '#f59e0b',
  amberDark: '#b45309',
  amberLight: '#fffbeb',
  ink: '#020617',
  inkSoft: '#1e293b',
  inkMute: '#64748b',
  surface: '#ffffff',
  surface2: '#f8fafc',
  surface3: '#f1f5f9',
  border: '#e2e8f0',
  red: '#ef4444',
  blue: '#3b82f6',
  blueLight: '#eff6ff',
  white: '#ffffff',
  black: '#000000',
  darkBg: '#020617',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  glassBg: 'rgba(255, 255, 255, 0.7)',
  cardBg: '#ffffff',
  headerBg: '#0f2318',
  navBg: '#ffffff',
  modalBg: '#ffffff',
  inputBg: '#f8fafc',
};

// ─── Dark palette ─────────────────────────────────────────────────────────────
const darkColors = {
  green: '#4ade80',
  greenDark: '#bbf7d0',
  greenLight: '#052e16',
  greenGlow: 'rgba(74, 222, 128, 0.2)',
  amber: '#fbbf24',
  amberDark: '#fde68a',
  amberLight: '#1c1200',
  ink: '#f1f5f9',
  inkSoft: '#cbd5e1',
  inkMute: '#94a3b8',
  surface: '#0f172a',
  surface2: '#1e293b',
  surface3: '#273549',
  border: '#334155',
  red: '#f87171',
  blue: '#60a5fa',
  blueLight: '#0c1a3a',
  white: '#ffffff',
  black: '#000000',
  darkBg: '#020617',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassBg: 'rgba(15, 23, 42, 0.85)',
  cardBg: '#1e293b',
  headerBg: '#0a1628',
  navBg: '#0f172a',
  modalBg: '#1e293b',
  inputBg: '#1e293b',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('ff_dark_mode').then((val) => {
      if (val === 'true') setIsDark(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem('ff_dark_mode', String(next));
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
