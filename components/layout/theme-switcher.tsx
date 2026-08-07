'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          'h-9 w-9 rounded-lg border border-border bg-card/50',
          className,
        )}
      />
    );
  }

  const isDark = theme === 'dark';

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
      title={isDark ? 'โหมดสว่าง' : 'โหมดมืด'}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg',
        'border border-border bg-card/50',
        'text-muted-foreground transition-all duration-200',
        'hover:bg-secondary hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <Sun
        aria-hidden="true"
        className={cn(
          'absolute h-4 w-4 transition-all duration-300',
          isDark
            ? 'rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100',
        )}
      />

      <Moon
        aria-hidden="true"
        className={cn(
          'absolute h-4 w-4 transition-all duration-300',
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0',
        )}
      />
    </button>
  );
}
