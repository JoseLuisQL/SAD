import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'theme-preference';

// Get system preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Get stored theme or default to system
const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
  return stored || 'system';
};

// Resolve theme to light or dark
const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

export const useThemeStore = create<ThemeState>((set, get) => {
  // Initialize with stored or system theme
  const initialTheme = getStoredTheme();
  const initialResolvedTheme = resolveTheme(initialTheme);

  return {
    theme: initialTheme,
    resolvedTheme: initialResolvedTheme,

    setTheme: (theme: Theme) => {
      const resolvedTheme = resolveTheme(theme);
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      }

      // Update state
      set({ theme, resolvedTheme });

      // Apply to document
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolvedTheme);
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute(
            'content',
            resolvedTheme === 'dark' ? '#171717' : '#ffffff'
          );
        }
      }
    },

    toggleTheme: () => {
      const { theme } = get();
      const currentResolved = resolveTheme(theme);
      const newTheme = currentResolved === 'light' ? 'dark' : 'light';
      get().setTheme(newTheme);
    },
  };
});

// Listen to system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme, setTheme } = useThemeStore.getState();
    if (theme === 'system') {
      setTheme('system'); // Re-apply to update resolvedTheme
    }
  });
}
