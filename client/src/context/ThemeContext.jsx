import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const THEME_STORAGE_KEY = 'raadiye-theme';
const LEGACY_THEME_STORAGE_KEY = 'baafiye-theme';

function readStoredTheme() {
  try {
    const saved =
      localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function applyThemeClass(theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#0c1612' : '#0f7a62';
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() =>
    typeof window === 'undefined' ? 'light' : readStoredTheme()
  );

  useEffect(() => {
    applyThemeClass(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    root.classList.add('theme-animate');
    window.setTimeout(() => root.classList.remove('theme-animate'), 350);
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
