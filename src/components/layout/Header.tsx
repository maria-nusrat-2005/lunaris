// Top header with user profile
'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useTheme, useTranslation } from '@/lib/hooks';
import { UserProfile } from '@/components/auth';
import { NotificationPanel } from '@/components/notifications';
import type { ThemeMode } from '@/lib/types';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const themeOptions: { value: ThemeMode; icon: typeof Sun; labelKey: string }[] = [
    { value: 'light', icon: Sun, labelKey: 'light' },
    { value: 'dark', icon: Moon, labelKey: 'dark' },
    { value: 'system', icon: Monitor, labelKey: 'system' },
  ];

  const currentThemeIcon = themeOptions.find((o) => o.value === theme)?.icon || Sun;
  const ThemeIcon = currentThemeIcon;

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left side - spacer for mobile menu button area */}
        <div className="flex items-center gap-4 w-10 md:w-0" />

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Theme toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <ThemeIcon className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'gap-2',
                      theme === option.value && 'bg-accent'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {t(option.labelKey)}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <NotificationPanel />

          {/* User Profile */}
          <UserProfile />
        </div>
      </div>
    </header>
  );
}
