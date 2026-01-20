// User Profile dropdown component
'use client';

import { useRouter } from 'next/navigation';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores';
import { useTranslation } from '@/lib/hooks';

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
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-primary/10 text-primary'
          )}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(user.name)
            )}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium leading-none">{user.name}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium bg-primary/10 text-primary'
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
