'use client';

import { useEffect, useRef } from 'react';
import { useThemeStore } from '@/store/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme, setTheme } = useThemeStore();
  const metaThemeColorRef = useRef<HTMLMetaElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Apply theme on mount
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);

      // Add or update meta theme-color safely
      let metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.setAttribute('name', 'theme-color');
        if (document.head) {
          document.head.appendChild(metaThemeColor);
          metaThemeColorRef.current = metaThemeColor;
        }
      } else {
        metaThemeColorRef.current = metaThemeColor;
      }

      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content',
          resolvedTheme === 'dark' ? '#171717' : '#ffffff'
        );
      }

      // Re-apply theme on change
      setTheme(theme);
    } catch (error) {
      console.error('Error applying theme:', error);
    }

    // Cleanup function
    return () => {
      // Don't remove meta tag on unmount as it should persist
      metaThemeColorRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
