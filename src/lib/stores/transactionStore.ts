// Zustand store for transaction management
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db/database';
import type { Transaction, TransactionType, Currency, RecurrenceType } from '@/lib/types';
import { useNotificationStore } from './notificationStore';

interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  filters: TransactionFilters;

  // Actions
  loadTransactions: () => Promise<void>;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  permanentlyDeleteTransaction: (id: string) => Promise<void>;
  restoreTransaction: (id: string) => Promise<void>;
  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
  getFilteredTransactions: () => Transaction[];
  getMonthlyStats: (month: number, year: number) => { income: number; expense: number };
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  filters: {},

  loadTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      // Get all transactions and filter out deleted ones in memory
      const allTransactions = await db.transactions.toArray();
      const transactions = allTransactions.filter(t => !t.isDeleted);
      
      // Sort by date descending
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      set({ transactions, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },


  addTransaction: async (data) => {
    const now = new Date();
    const transaction: Transaction = {
      ...data,
      id: uuidv4(),
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await db.transactions.add(transaction);
      set((state) => ({
        transactions: [transaction, ...state.transactions],
      }));
      
      // Add notification for new transaction
      useNotificationStore.getState().addNotification({
        type: 'success',
        title: data.type === 'income' ? '💰 Income Added' : '💸 Expense Recorded',
        message: `${data.description || (data.type === 'income' ? 'Income' : 'Expense')} of ৳${data.amount.toLocaleString()} has been added.`,
        actionUrl: '/transactions',
      });
      
      return transaction;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateTransaction: async (id, data) => {
    try {
      const updatedData = { ...data, updatedAt: new Date() };
      await db.transactions.update(id, updatedData);
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, ...updatedData } : t
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    try {
      const transaction = await db.transactions.get(id);
      if (!transaction) return;

      // Soft delete - move to recycle bin
      await db.transactions.update(id, {
        isDeleted: true,
        deletedAt: new Date(),
      });

      // Add to recycle bin
      await db.recycleBin.add({
        id: uuidv4(),
        originalId: id,
        type: 'transaction',
        data: JSON.stringify(transaction),
        deletedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  permanentlyDeleteTransaction: async (id) => {
    try {
      await db.transactions.delete(id);
      await db.recycleBin.where('originalId').equals(id).delete();
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  restoreTransaction: async (id) => {
    try {
      await db.transactions.update(id, {
        isDeleted: false,
        deletedAt: undefined,
      });
      await db.recycleBin.where('originalId').equals(id).delete();
      await get().loadTransactions();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  getFilteredTransactions: () => {
    const { transactions, filters } = get();
    let filtered = [...transactions];

    if (filters.type) {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    if (filters.categoryId) {
      filtered = filtered.filter((t) => t.categoryId === filters.categoryId);
    }

    if (filters.startDate) {
      filtered = filtered.filter(
        (t) => new Date(t.date) >= filters.startDate!
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (t) => new Date(t.date) <= filters.endDate!
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  },

  getMonthlyStats: (month, year) => {
    const { transactions } = get();
    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      const date = new Date(t.date);
      if (date.getMonth() + 1 === month && date.getFullYear() === year) {
        if (t.type === 'income') {
          income += t.amount;
        } else {
          expense += t.amount;
        }
      }
    });

    return { income, expense };
  },
}));
