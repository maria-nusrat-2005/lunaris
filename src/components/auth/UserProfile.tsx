// User Profile dropdown component
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Users, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores';
import { useTranslation } from '@/lib/hooks';
import type { UserRole } from '@/lib/types';

const roleConfig: Record<UserRole, { icon: typeof User; color: string; bgColor: string; label: string }> = {
  admin: { icon: Shield, color: 'text-purple-500', bgColor: 'bg-purple-500/10', label: 'Admin' },
  user: { icon: User, color: 'text-primary', bgColor: 'bg-primary/10', label: 'User' },
  viewer: { icon: Users, color: 'text-muted-foreground', bgColor: 'bg-muted', label: 'Viewer' },
};

export function UserProfile() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();

  if (!isAuthenticated || !user) {
    return (
      <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
        {t('login') || 'Login'}
      </Button>
    );
  }

  const roleInfo = roleConfig[user.role];
  const RoleIcon = roleInfo.icon;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          {/* Avatar */}
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
            roleInfo.bgColor, roleInfo.color
          )}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(user.name)
            )}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs text-muted-foreground">{roleInfo.label}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
              roleInfo.bgColor, roleInfo.color
            )}>
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" disabled>
          <RoleIcon className={cn('w-4 h-4', roleInfo.color)} />
          <span>Role: </span>
          <Badge variant="secondary" className="text-xs">
            {roleInfo.label}
          </Badge>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" onClick={() => router.push('/settings')}>
          <Settings className="w-4 h-4" />
          {t('settings') || 'Settings'}
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-destructive" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          {t('logout') || 'Logout'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
