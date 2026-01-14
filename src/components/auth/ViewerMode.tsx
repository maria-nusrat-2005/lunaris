// Viewer mode banner and feature restriction overlay
'use client';

import { AlertCircle, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { useTranslation } from '@/lib/hooks';

export function ViewerBanner() {
  const { isViewer } = useAuthStore();
  const router = useRouter();
  const { t } = useTranslation();

  if (!isViewer()) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
      <div className="flex items-center justify-center gap-2 text-sm">
        <Eye className="w-4 h-4 text-amber-500" />
        <span className="text-amber-600 dark:text-amber-400 font-medium">
          Demo Mode
        </span>
        <span className="text-muted-foreground">
          - You are viewing as a guest. Create an account to save your data.
        </span>
        <Button 
          size="sm" 
          variant="outline" 
          className="ml-2 h-7 text-xs"
          onClick={() => router.push('/login')}
        >
          Sign Up
        </Button>
      </div>
    </div>
  );
}

interface ViewerGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ViewerGuard({ children, fallback }: ViewerGuardProps) {
  const { isViewer } = useAuthStore();

  if (isViewer()) {
    return fallback || (
      <div className="relative">
        <div className="opacity-50 pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
          <div className="text-center p-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Login as User or Admin to use this feature
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Tutorial tooltip for viewers
interface TutorialTooltipProps {
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

export function TutorialTooltip({ title, description, position = 'top', children }: TutorialTooltipProps) {
  const { isViewer } = useAuthStore();

  if (!isViewer()) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      {children}
      <div className={`
        absolute z-50 invisible group-hover:visible
        bg-popover border border-border rounded-lg shadow-lg
        p-3 w-64 text-sm
        ${position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' : ''}
        ${position === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' : ''}
        ${position === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' : ''}
        ${position === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2' : ''}
      `}>
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground">{title}</p>
            <p className="text-muted-foreground text-xs mt-1">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
