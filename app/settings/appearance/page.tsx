'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type ThemeChoice = 'light' | 'dark' | 'system';

const THEME_OPTIONS: Array<{
  value: ThemeChoice;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    value: 'light',
    label: 'Light',
    description: 'Use bright mode across the app.',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Use dark mode for low-light environments.',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    description: 'Match your device appearance automatically.',
    icon: Monitor,
  },
];

export default function AppearanceSettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme: ThemeChoice = (theme as ThemeChoice) ?? 'system';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Appearance</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Choose how the interface looks in bright and dark environments.
        </p>
      </div>

      <Card className="p-4 sm:p-6 border-border bg-card">
        <div className="space-y-3">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected = activeTheme === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                variant="outline"
                onClick={() => setTheme(option.value)}
                className={[
                  'h-auto w-full justify-start px-4 py-3 border-border bg-background hover:bg-accent',
                  selected ? 'ring-2 ring-ring border-ring' : '',
                ].join(' ')}
              >
                <span className="inline-flex items-center gap-3 text-left">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                    <span className="block text-xs text-muted-foreground">{option.description}</span>
                  </span>
                </span>
              </Button>
            );
          })}
        </div>

        <div className="mt-6 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
          {!mounted
            ? 'Detecting current display mode...'
            : `Current mode: ${theme === 'system' ? `System (${resolvedTheme ?? 'light'})` : activeTheme}`}
        </div>
      </Card>
    </div>
  );
}
