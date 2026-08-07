```tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const themeContext = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('[ThemeSwitcher] mounted:', mounted);
    console.log('[ThemeSwitcher] context:', {
      theme: themeContext.theme,
      resolvedTheme: themeContext.resolvedTheme,
      forcedTheme: themeContext.forcedTheme,
      themes: themeContext.themes,
      setTheme: typeof themeContext.setTheme,
    });
  }, [
    mounted,
    themeContext.theme,
    themeContext.resolvedTheme,
    themeContext.forcedTheme,
    themeContext.themes,
    themeContext.setTheme,
  ]);

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

  const isDark = themeContext.theme === 'dark';

  const handleToggle = () => {
    console.log('[ThemeSwitcher] CLICK');

    console.log('[ThemeSwitcher] BEFORE:', {
      theme: themeContext.theme,
      resolvedTheme: themeContext.resolvedTheme,
      setTheme: typeof themeContext.setTheme,
    });

    if (typeof themeContext.setTheme !== 'function') {
      console.error('[ThemeSwitcher] setTheme is not available');
      return;
    }

    const nextTheme = isDark ? 'light' : 'dark';

    console.log('[ThemeSwitcher] SET:', nextTheme);

    themeContext.setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
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
```
