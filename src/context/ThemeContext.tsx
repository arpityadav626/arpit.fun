import React, { useEffect } from 'react';
import { ThemeContext, type Theme } from './themeContextCore';
export { useTheme } from './themeContextCore';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme: Theme = 'dark';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    try {
      localStorage.setItem('webhub_theme', 'dark');
    } catch {
      // Ignore
    }
  }, []);

  const toggleTheme = () => {
    // Light mode disabled by design: permanent dark luxury aesthetic
  };

  const setTheme = () => {
    // Locked to dark
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

