import { useState, useEffect } from 'react';

export type Theme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'theme';
const DEFAULT_THEME: Theme = 'dark';

/**
 * Hook for managing application theme with localStorage persistence
 *
 * On mount, reads theme from localStorage or uses default (dark)
 * When theme changes, updates localStorage and applies theme to document
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Read from localStorage on init
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};
