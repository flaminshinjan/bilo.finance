'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isLandingPage: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  
  // Check if we're on the landing page (home or about)
  const isLandingPage = pathname === '/' || pathname === '/about';

  useEffect(() => {
    setMounted(true);
    
    // Force light theme for landing page
    if (isLandingPage) {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      return;
    }
    
    // For other pages, use saved theme or system preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (prefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, [isLandingPage]);

  useEffect(() => {
    if (mounted) {
      // Force light theme for landing page
      if (isLandingPage) {
        setTheme('light');
        document.documentElement.classList.remove('dark');
        return;
      }
      
      // For other pages, apply theme normally
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted, isLandingPage]);

  const toggleTheme = () => {
    // Prevent theme toggle on landing page
    if (isLandingPage) return;
    
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLandingPage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 