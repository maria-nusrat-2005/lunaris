// Main application sidebar navigation - Collapsible on desktop, overlay on mobile
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
  ChevronLeft,
  ChevronRight,
  Menu,
  ScanLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore, useAuthStore } from '@/lib/stores';
import { useIsMobile, useTranslation } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { localizeNumbers } from '@/lib/utils/helpers';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const isMobile = useIsMobile();
  const { t, language } = useTranslation();

  // Base nav items
  const navItems = [
    { href: '/', icon: LayoutDashboard, label: t('dashboard'), always: true },
    { href: '/transactions', icon: ArrowLeftRight, label: t('transactions'), always: true },
    { href: '/budgets', icon: Wallet, label: t('budgets'), always: true },
    { href: '/goals', icon: Target, label: t('goals'), always: true },
    { href: '/scan', icon: ScanLine, label: t('scan'), always: true },
    { href: '/settings', icon: Settings, label: t('settings'), always: true },
  ];

  // Close sidebar on mobile when navigating
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Desktop sidebar - collapsible
  const DesktopSidebar = () => (
    <motion.aside
      className="hidden md:flex h-screen flex-col fixed left-0 top-0 bg-sidebar border-r border-sidebar-border z-40"
      initial={false}
      animate={{
        width: sidebarCollapsed ? 72 : 256,
      }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <img src="/half-moon.png" alt="Logo" className="w-8 h-8 object-contain shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-bold text-foreground whitespace-nowrap overflow-hidden"
              >
                {t('appName')}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const isActive = item.href === '/' 
              ? pathname === '/' 
              : pathname?.startsWith(item.href);
            const Icon = item.icon;

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  'hover:bg-sidebar-accent',
                  isActive && 'bg-primary/10 text-primary',
                  sidebarCollapsed && 'justify-center px-3'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'font-medium whitespace-nowrap overflow-hidden',
                        isActive ? 'text-primary' : 'text-sidebar-foreground'
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );

            // Show tooltip only when collapsed
            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </TooltipProvider>
      </nav>

      {/* Collapse toggle button */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebarCollapsed}
          className={cn(
            'w-full flex items-center gap-2 justify-center',
            !sidebarCollapsed && 'justify-start px-4'
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">{t('collapse')}</span>
            </>
          )}
        </Button>
      </div>

      {/* Footer - only show when expanded */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 border-t border-sidebar-border"
          >
            <p className="text-xs text-muted-foreground text-center">
              {t('version')} {localizeNumbers('1.0.0', language)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );

  // Mobile sidebar - overlay style with toggle button
  const MobileSidebar = () => (
    <>
      {/* Mobile menu toggle button - fixed position when sidebar is closed */}
      {!sidebarOpen && (
        <motion.div
          className="fixed left-4 top-4 z-50 md:hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="bg-background shadow-lg border-border"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </motion.div>
      )}

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

      {/* Sidebar panel */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 w-72 h-full z-50 flex flex-col bg-sidebar border-r border-sidebar-border md:hidden"
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
              <Link href="/" className="flex items-center gap-3" onClick={handleNavClick}>
                <img src="/half-moon.png" alt="Logo" className="w-8 h-8 object-contain" />
                <span className="text-lg font-bold text-foreground">{t('appName')}</span>
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
                const isActive = item.href === '/' 
                  ? pathname === '/' 
                  : pathname?.startsWith(item.href);
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

            {/* Footer */}
            <div className="p-4 border-t border-sidebar-border">
              <p className="text-xs text-muted-foreground text-center">
                {t('version')} {localizeNumbers('1.0.0', language)}
              </p>
            </div>
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
