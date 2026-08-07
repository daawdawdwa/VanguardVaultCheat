'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={cn('h-9 w-9', className)} />;
  }

  const options = [
    { value: 'light', icon: Sun },
    { value: 'dark', icon: Moon },
    { value: 'system', icon: Monitor },
  ];

  return (
    <div className={cn('flex items-center gap-0.5 rounded-lg border border-border bg-card/50 p-0.5', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setTheme(opt.value)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
            theme === opt.value ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label={opt.value}
        >
          <opt.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
