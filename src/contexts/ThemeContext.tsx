import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PaletteMode } from '@mui/material';
import { useMediaQuery } from '@mui/material';

type ThemeContextType = {
  themeMode: PaletteMode;
  toggleThemeMode: () => void;
  isMobile: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [themeMode, setThemeMode] = useState<PaletteMode>(() => {
    // Try to get theme from localStorage, otherwise use system preference
    const savedTheme = localStorage.getItem('themeMode') as PaletteMode | null;
    return savedTheme || (prefersDarkMode ? 'dark' : 'light');
  });
  
  const [isMobile, setIsMobile] = useState(false);

  // Update theme in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleThemeMode = useCallback(() => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ themeMode, toggleThemeMode, isMobile }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
