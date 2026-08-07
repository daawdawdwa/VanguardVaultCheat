'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
  className?: string;
}

type Theme = 'light' | 'dark';

function getTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storedTheme = window.localStorage.getItem('theme');

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return document.documentElement.classList.contains('light')
    ? 'light'
    : 'dark';
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;

  html.classList.remove('light', 'dark');
  html.classList.add(theme);

  html.style.colorScheme = theme;

  window.localStorage.setItem('theme', theme);
}

export function ThemeSwitcher({
  className,
}: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const currentTheme = getTheme();

    setTheme(currentTheme);
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const nextTheme: Theme =
      theme === 'dark' ? 'light' : 'dark';

    applyTheme(nextTheme);
    setTheme(nextTheme);
  };

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

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={
        isDark
          ? 'เปลี่ยนเป็นโหมดสว่าง'
          : 'เปลี่ยนเป็นโหมดมืด'
      }
      title={isDark ? 'โหมดสว่าง' : 'โหมดมืด'}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center',
        'overflow-hidden rounded-lg border border-border bg-card/50',
        'text-muted-foreground transition-colors',
        'hover:bg-secondary hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring',
        className,
      )}
    >
      {isDark ? (
        <Sun
          aria-hidden="true"
          className="h-4 w-4"
        />
      ) : (
        <Moon
          aria-hidden="true"
          className="h-4 w-4"
        />
      )}
    </button>
  );
}
