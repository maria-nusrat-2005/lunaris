// Main app shell layout
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/lib/stores';
import { useIsMobile } from '@/lib/hooks';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { sidebarCollapsed } = useUIStore();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main content area - offset for fixed sidebar on desktop */}
      <motion.div
        className="flex flex-col min-h-screen"
        initial={false}
        animate={{
          marginLeft: isMobile ? 0 : sidebarCollapsed ? 72 : 256,
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </motion.div>
    </div>
  );
}
