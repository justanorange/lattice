/**
 * useTheme Hook
 * Light/dark theme management
 */

import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../constants';
import { useLocalStorage } from './useLocalStorage';

type ThemeType = 'light' | 'dark';

/**
 * Hook to manage theme
 */
export function useTheme(): {
  theme: ThemeType;
  setTheme: (theme: ThemeType | 'auto') => void;
  isDark: boolean;
} {
  const [theme, setThemeState] = useLocalStorage<ThemeType | 'auto'>(STORAGE_KEYS.theme, 'auto');
  const [isDark, setIsDark] = useState<boolean>(false);

  const setTheme = useCallback(
    (newTheme: ThemeType | 'auto') => {
      setThemeState(newTheme);
    },
    [setThemeState]
  );

  useEffect(() => {
    let prefersDark = false;

    if (theme === 'auto') {
      prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      prefersDark = theme === 'dark';
    }

    setIsDark(prefersDark);

    // Apply theme to document
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return {
    theme: (theme === 'auto' ? (isDark ? 'dark' : 'light') : theme) as ThemeType,
    setTheme,
    isDark,
  };
}
