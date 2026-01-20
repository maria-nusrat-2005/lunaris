// Custom React hooks for Clarity Finance
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTransactionStore, useCategoryStore, useBudgetStore, useGoalStore, useSettingsStore } from '@/lib/stores';
import { initializeDatabase } from '@/lib/db/database';
import type { DashboardMetrics, CategorySpending, CashFlowData } from '@/lib/types';

// Initialize all data on app load
export function useInitializeApp() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const loadBudgets = useBudgetStore((s) => s.loadBudgets);
  const loadGoals = useGoalStore((s) => s.loadGoals);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    async function initialize() {
      try {
        // Initialize database with defaults
        await initializeDatabase();

        // Load all data in parallel
        await Promise.all([
          loadTransactions(),
          loadCategories(),
          loadBudgets(),
          loadGoals(),
          loadSettings(),
        ]);

        setIsInitialized(true);
      } catch (err) {
        setError((err as Error).message);
      }
    }

    initialize();
  }, [loadTransactions, loadCategories, loadBudgets, loadGoals, loadSettings]);

  return { isInitialized, error };
}

// Calculate dashboard metrics
export function useDashboardMetrics(): DashboardMetrics {
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const budgets = useBudgetStore((s) => s.getCurrentMonthBudgets);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Calculate totals
  let totalIncome = 0;
  let totalExpense = 0;
  let monthlyIncome = 0;
  let monthlyExpense = 0;
  const categorySpending: Record<string, number> = {};

  transactions.forEach((t) => {
    const transactionDate = new Date(t.date);
    const isCurrentMonth =
      transactionDate.getMonth() + 1 === currentMonth &&
      transactionDate.getFullYear() === currentYear;

    if (t.type === 'income') {
      totalIncome += t.amount;
      if (isCurrentMonth) monthlyIncome += t.amount;
    } else {
      totalExpense += t.amount;
      if (isCurrentMonth) {
        monthlyExpense += t.amount;
        categorySpending[t.categoryId] = (categorySpending[t.categoryId] || 0) + t.amount;
      }
    }
  });

  // Calculate budget utilization
  const currentBudgets = budgets();
  let totalBudget = 0;
  let totalBudgetSpent = 0;
  currentBudgets.forEach((b) => {
    totalBudget += b.amount + b.rolloverAmount;
    // budget.spent is unreliable, use derived categorySpending instead
    totalBudgetSpent += categorySpending[b.categoryId] || 0;
  });
  const budgetUtilization = totalBudget > 0 ? (totalBudgetSpent / totalBudget) * 100 : 0;

  // Calculate savings rate
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;

  // Get top spending categories
  const topCategories: CategorySpending[] = Object.entries(categorySpending)
    .map(([categoryId, amount]) => {
      const category = categories.find((c) => c.id === categoryId);
      return {
        categoryId,
        categoryName: category?.name || 'Unknown',
        amount,
        percentage: monthlyExpense > 0 ? (amount / monthlyExpense) * 100 : 0,
        color: category?.color || '#6B7280',
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return {
    totalBalance: totalIncome - totalExpense,
    monthlyIncome,
    monthlyExpense,
    budgetUtilization,
    savingsRate,
    topCategories,
  };
}

// Get cash flow data for charts
export function useCashFlowData(months: number = 6): CashFlowData[] {
  const transactions = useTransactionStore((s) => s.transactions);

  const data: CashFlowData[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();
    const monthName = targetDate.toLocaleString('default', { month: 'short' });

    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() + 1 === month && tDate.getFullYear() === year) {
        if (t.type === 'income') {
          income += t.amount;
        } else {
          expense += t.amount;
        }
      }
    });

    data.push({ month: monthName, income, expense });
  }

  return data;
}

// Theme hook with system preference detection
export function useTheme() {
  const settings = useSettingsStore((s) => s.settings);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const theme = settings?.theme || 'system';

    const applyTheme = () => {
      let resolved: 'light' | 'dark' = 'light';

      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        resolved = theme;
      }

      setResolvedTheme(resolved);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(resolved);
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (settings?.theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [settings?.theme]);

  return {
    theme: settings?.theme || 'system',
    resolvedTheme,
    setTheme,
  };
}

// Window size hook
export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// Mobile detection hook
export function useIsMobile() {
  const { width } = useWindowSize();
  return width > 0 && width < 768;
}

// Reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// Helper to get dynamic budget progress
export function useBudgetProgress() {
  const transactions = useTransactionStore((s) => s.transactions);
  
  const getSpentAmount = (categoryId: string, month: number, year: number) => {
    return transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          !t.isDeleted &&
          t.categoryId === categoryId &&
          tDate.getMonth() + 1 === month &&
          tDate.getFullYear() === year
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return { getSpentAmount };
}
