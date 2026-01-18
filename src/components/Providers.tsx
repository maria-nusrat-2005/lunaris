// App initialization and providers
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useInitializeApp, useTheme, useDailyReminder } from '@/lib/hooks';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const { isInitialized, error } = useInitializeApp();
  const { resolvedTheme } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      // Short delay to ensure smooth transition
      const timer = setTimeout(() => setShowSplash(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Initialization Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-xl">
                <Sparkles className="w-10 h-10 text-white" />
                <motion.div
                  className="absolute inset-0 rounded-2xl gradient-primary"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold">Lunaris</h1>
                <p className="text-sm text-muted-foreground">Your Calm, Clear Finance Companion</p>
              </div>
              <motion.div
                className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isInitialized && <DailyReminderWrapper>{children}</DailyReminderWrapper>}
    </>
  );
}

// Separate component to use the hook after initialization
function DailyReminderWrapper({ children }: { children: ReactNode }) {
  useDailyReminder();
  return <>{children}</>;
}
