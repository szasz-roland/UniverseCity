import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadThemePreference, saveThemePreference } from '@/lib/storage';
import { DEFAULT_THEME_MODE, DEFAULT_THEME_NAME, type ThemeMode, type ThemeName } from './themes';

interface ThemeContextValue {
  themeName: ThemeName;
  mode: ThemeMode;
  /** 'system' resolved against the live OS preference — what's actually applied. */
  resolvedMode: 'light' | 'dark';
  setThemeName: (name: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => loadThemePreference(), []);
  const [themeName, setThemeName] = useState<ThemeName>(initial.name ?? DEFAULT_THEME_NAME);
  const [mode, setMode] = useState<ThemeMode>(initial.mode ?? DEFAULT_THEME_MODE);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const resolvedMode: 'light' | 'dark' = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', `${themeName}-${resolvedMode}`);
  }, [themeName, resolvedMode]);

  useEffect(() => {
    saveThemePreference({ name: themeName, mode });
  }, [themeName, mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ themeName, mode, resolvedMode, setThemeName, setMode }),
    [themeName, mode, resolvedMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
