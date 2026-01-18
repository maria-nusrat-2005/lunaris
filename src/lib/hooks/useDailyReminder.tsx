// Daily Reminder Hook - Shows notification prompting user to track daily expenses
'use client';

import { useEffect, useRef } from 'react';
import { useNotificationStore, useTransactionStore, useAuthStore } from '@/lib/stores';

const REMINDER_STORAGE_KEY = 'lunaris-last-reminder-date';

export function useDailyReminder() {
  const hasChecked = useRef(false);
  const { isAuthenticated } = useAuthStore();
  const { transactions } = useTransactionStore();
  const { addNotification, notifications } = useNotificationStore();

  useEffect(() => {
    // Only check once per mount and only if authenticated
    if (hasChecked.current || !isAuthenticated) return;
    hasChecked.current = true;

    // Check if we already showed a reminder today
    const lastReminderDate = localStorage.getItem(REMINDER_STORAGE_KEY);
    const today = new Date().toDateString();
    
    if (lastReminderDate === today) {
      return; // Already reminded today
    }

    // Check if there's already a daily reminder notification pending
    const hasPendingReminder = notifications.some(
      n => n.title.includes('Daily Reminder') && !n.read
    );
    if (hasPendingReminder) return;

    // Check if user has logged any transactions today
    const todayTransactions = transactions.filter(t => {
      const txDate = new Date(t.date).toDateString();
      return txDate === today;
    });

    // Show reminder if no transactions logged today (after 9 AM)
    const currentHour = new Date().getHours();
    if (todayTransactions.length === 0 && currentHour >= 9) {
      addNotification({
        type: 'reminder',
        title: '📝 Daily Reminder',
        message: "Don't forget to log today's expenses! Tracking daily helps you stay on budget.",
        actionUrl: '/',
      });
      
      // Mark that we showed reminder today
      localStorage.setItem(REMINDER_STORAGE_KEY, today);
    }
  }, [isAuthenticated, transactions, notifications, addNotification]);
}

// DailyReminderProvider component to use in app
export function DailyReminderProvider({ children }: { children: React.ReactNode }) {
  useDailyReminder();
  return <>{children}</>;
}
