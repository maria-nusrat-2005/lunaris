// Zustand store for budget management
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db/database';
import type { Budget, Currency } from '@/lib/types';
import { useNotificationStore } from './notificationStore';
import { useCategoryStore } from './categoryStore';

interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadBudgets: () => Promise<void>;
  addBudget: (data: Omit<Budget, 'id' | 'spent' | 'rolloverAmount' | 'createdAt' | 'updatedAt'>) => Promise<Budget>;
  updateBudget: (id: string, data: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetForCategory: (categoryId: string, month: number, year: number) => Budget | undefined;
  calculateRollover: (categoryId: string, month: number, year: number) => Promise<number>;
  getCurrentMonthBudgets: () => Budget[];
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  isLoading: false,
  error: null,

  loadBudgets: async () => {
    set({ isLoading: true, error: null });
    try {
      const budgets = await db.budgets.toArray();
      set({ budgets, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addBudget: async (data) => {
    const now = new Date();
    
    // Calculate rollover from previous month if enabled
    let rolloverAmount = 0;
    if (data.rolloverEnabled) {
      rolloverAmount = await get().calculateRollover(
        data.categoryId,
        data.month,
        data.year
      );
    }

    const budget: Budget = {
      ...data,
      id: uuidv4(),
      spent: 0,
      rolloverAmount,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await db.budgets.add(budget);
      set((state) => ({
        budgets: [...state.budgets, budget],
      }));
      return budget;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateBudget: async (id, data) => {
    try {
      const updatedData = { ...data, updatedAt: new Date() };
      await db.budgets.update(id, updatedData);
      set((state) => ({
        budgets: state.budgets.map((b) =>
          b.id === id ? { ...b, ...updatedData } : b
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteBudget: async (id) => {
    try {
      await db.budgets.delete(id);
      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  getBudgetForCategory: (categoryId, month, year) => {
    return get().budgets.find(
      (b) => b.categoryId === categoryId && b.month === month && b.year === year
    );
  },



  calculateRollover: async (categoryId, month, year) => {
    // Get previous month's budget
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    const prevBudget = get().getBudgetForCategory(categoryId, prevMonth, prevYear);
    if (!prevBudget || !prevBudget.rolloverEnabled) return 0;

    // Calculate unused amount (positive) or overspent amount (negative)
    const unused = prevBudget.amount + prevBudget.rolloverAmount - prevBudget.spent;
    return unused;
  },

  getCurrentMonthBudgets: () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return get().budgets.filter((b) => b.month === month && b.year === year);
  },
}));
