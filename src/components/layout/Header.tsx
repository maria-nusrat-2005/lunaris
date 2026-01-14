// Top header with user profile
'use client';

import { motion } from 'framer-motion';
import { Menu, Sun, Moon, Monitor, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores';
import { useTheme, useIsMobile, useTranslation } from '@/lib/hooks';
import { UserProfile } from '@/components/auth';
import type { ThemeMode } from '@/lib/types';

export function Header() {
  const { setSidebarOpen } = useUIStore();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
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
        {/* Left side - Mobile menu only */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full" />
          </Button>

          {/* User Profile */}
          <UserProfile />
        </div>
      </div>
    </header>
  );
}
