import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'luxe-theme';

/**
 * ThemeProvider toàn cục — quản lý light/dark mode.
 *
 * Tính năng:
 * - Lưu vào localStorage
 * - Tự động theo system preference lần đầu
 * - Đồng bộ giữa các tab (storage event)
 * - Có transition mượt khi chuyển theme
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    // Lần đầu: theo system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Apply theme to <html>
  useEffect(() => {
    const html = document.documentElement;
    // Disable transition lúc đổi để tránh flash
    const transitionOff = document.createElement('style');
    transitionOff.textContent = '*, *::before, *::after { transition: none !important; }';
    document.head.appendChild(transitionOff);

    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Re-enable transitions sau 1 frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.head.removeChild(transitionOff);
      });
    });
  }, [theme]);

  // Đồng bộ giữa các tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Lắng nghe system preference (chỉ khi user chưa set manually)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      // Chỉ áp dụng nếu user chưa override
      const hasOverride = localStorage.getItem(STORAGE_KEY);
      if (!hasOverride) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const setLight = useCallback(() => setTheme('light'), []);
  const setDark = useCallback(() => setTheme('dark'), []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setLight, setDark, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
