// Auth Provider - wraps the app to handle authentication
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { ViewerBanner } from '@/components/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/welcome'];

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    
    // If not authenticated and not on a public route, redirect to welcome page
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/welcome');
    }
    
    // If authenticated and on login page, redirect to dashboard
    if (isAuthenticated && pathname === '/login') {
      router.push('/');
    }
  }, [isAuthenticated, pathname, isHydrated, router]);

  // Show loading while checking auth state
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // On public routes, just render children
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // For protected routes, render children with viewer banner if applicable
  return (
    <>
      <ViewerBanner />
      {children}
    </>
  );
}
