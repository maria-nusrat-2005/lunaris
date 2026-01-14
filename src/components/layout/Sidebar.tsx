// Main application sidebar navigation - Full height, fixed width
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  Settings,
  Diamond,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores';
import { useIsMobile, useTranslation } from '@/lib/hooks';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/transactions', icon: ArrowLeftRight, label: t('transactions') },
    { href: '/budgets', icon: Wallet, label: t('budgets') },
    { href: '/goals', icon: Target, label: t('goals') },
    { href: '/settings', icon: Settings, label: t('settings') },
  ];

  // Close sidebar on mobile when navigating
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Desktop sidebar - always visible, fixed width
  const DesktopSidebar = () => (
    <aside className="hidden md:flex w-64 h-screen flex-col fixed left-0 top-0 bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-3xl">💎</span>
          <span className="text-lg font-bold text-foreground">Lunaris</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                'hover:bg-sidebar-accent',
                isActive && 'bg-primary/10 text-primary'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'font-medium',
                  isActive ? 'text-primary' : 'text-sidebar-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">
          {t('version')} 1.0.0
        </p>
      </div>
    </aside>
  );

  // Mobile sidebar - overlay style
  const MobileSidebar = () => (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 w-72 h-full z-50 flex flex-col bg-sidebar border-r border-sidebar-border md:hidden"
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
              <Link href="/" className="flex items-center gap-3" onClick={handleNavClick}>
                <span className="text-3xl">💎</span>
                <span className="text-lg font-bold text-foreground">Lunaris</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                      'hover:bg-sidebar-accent',
                      isActive && 'bg-primary/10 text-primary'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 shrink-0 transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    <span
                      className={cn(
                        'font-medium',
                        isActive ? 'text-primary' : 'text-sidebar-foreground'
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
