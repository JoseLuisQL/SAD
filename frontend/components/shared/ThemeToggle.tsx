'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeStore } from '@/store/themeStore';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'default' | 'icon-only';
  className?: string;
}

export function ThemeToggle({ variant = 'icon-only', className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  if (variant === 'icon-only') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200',
              className
            )}
            aria-label="Cambiar tema"
          >
            <Sun className="h-5 w-5 text-slate-700 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 dark:text-slate-300" />
            <Moon className="absolute h-5 w-5 text-slate-700 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 dark:text-slate-300" />
            <span className="sr-only">Cambiar tema</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => setTheme('light')}
            className={cn(
              'cursor-pointer',
              theme === 'light' && 'bg-slate-100 dark:bg-slate-800'
            )}
          >
            <Sun className="mr-2 h-4 w-4" />
            <span>Claro</span>
            {theme === 'light' && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme('dark')}
            className={cn(
              'cursor-pointer',
              theme === 'dark' && 'bg-slate-100 dark:bg-slate-800'
            )}
          >
            <Moon className="mr-2 h-4 w-4" />
            <span>Oscuro</span>
            {theme === 'dark' && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme('system')}
            className={cn(
              'cursor-pointer',
              theme === 'system' && 'bg-slate-100 dark:bg-slate-800'
            )}
          >
            <Monitor className="mr-2 h-4 w-4" />
            <span>Sistema</span>
            {theme === 'system' && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
      className={cn(
        'flex items-center gap-2 transition-all duration-200',
        className
      )}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="ml-4">{resolvedTheme === 'light' ? 'Modo Claro' : 'Modo Oscuro'}</span>
    </Button>
  );
}
