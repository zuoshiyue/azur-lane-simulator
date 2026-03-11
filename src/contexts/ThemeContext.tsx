import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'auto';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'auto'>('auto');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // 默认检测系统主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes first
    root.classList.remove('light', 'dark');

    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else { // theme === 'light'
      root.classList.add('light');
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'auto';
      return 'light';
    });
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};