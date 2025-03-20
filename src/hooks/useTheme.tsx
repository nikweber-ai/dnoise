
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  applyHighlightColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // Get initial theme from localStorage or default to system preference
  const getInitialTheme = (): Theme => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        return savedTheme;
      }
      
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      
      return 'light';
    } catch (error) {
      console.error('Error reading theme from localStorage', error);
      return 'light';
    }
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const { user } = useAuth();

  // Update theme when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Error saving theme to localStorage', error);
    }
  }, [theme]);

  // Sync with system changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!localStorage.getItem('theme')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply user's preferred highlight color if available
  useEffect(() => {
    if (user?.highlightColor) {
      applyHighlightColor(user.highlightColor);
    }
  }, [user?.highlightColor]);
  
  // Function to apply highlight color
  const applyHighlightColor = (color: string) => {
    // Convert hex to hsl
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      
      h = Math.round(h * 60);
      if (h < 0) h += 360;
    }
    
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    // Set the CSS variables
    document.documentElement.style.setProperty('--primary', `${h} ${s}% ${l}%`);
    // We also set the sidebar-primary to maintain color consistency
    document.documentElement.style.setProperty('--sidebar-primary', `${h} ${s}% ${l}%`);
    
    // Store the current highlighted color in localStorage
    localStorage.setItem('userHighlightColor', color);
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = {
    theme,
    toggleTheme,
    setTheme,
    applyHighlightColor,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
