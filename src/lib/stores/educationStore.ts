// Education Expense Store - For students to track education-related expenses
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Currency } from '@/lib/types';
import { useNotificationStore } from './notificationStore';

// Education expense categories
export type EducationCategoryId = 'tuition' | 'books' | 'supplies' | 'transport' | 'food' | 'hostel' | 'tech' | 'exam' | 'other';

export interface EducationCategory {
  id: EducationCategoryId;
  name: string;
  icon: string;
  color: string;
}

export interface EducationBudget {
  id: string;
  categoryId: EducationCategoryId;
  amount: number;
  semesterId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EducationExpense {
  id: string;
  categoryId: EducationCategoryId;
  amount: number;
  description: string;
  date: Date;
  semesterId: string;
  createdAt: Date;
}

export interface Semester {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

// Default categories
export const DEFAULT_EDUCATION_CATEGORIES: EducationCategory[] = [
  { id: 'tuition', name: 'Tuition Fees', icon: '🎓', color: '#3B82F6' },
  { id: 'books', name: 'Books & Materials', icon: '📚', color: '#10B981' },
  { id: 'supplies', name: 'Stationery & Supplies', icon: '✏️', color: '#F59E0B' },
  { id: 'transport', name: 'Transport', icon: '🚌', color: '#8B5CF6' },
  { id: 'food', name: 'Food & Meals', icon: '🍱', color: '#EC4899' },
  { id: 'hostel', name: 'Hostel/Rent', icon: '🏠', color: '#06B6D4' },
  { id: 'tech', name: 'Technology', icon: '💻', color: '#EF4444' },
  { id: 'exam', name: 'Exam Fees', icon: '📝', color: '#14B8A6' },
  { id: 'other', name: 'Other', icon: '📦', color: '#6B7280' },
];

interface EducationStore {
  budgets: EducationBudget[];
  expenses: EducationExpense[];
  semesters: Semester[];
  activeSemesterId: string | null;
  
  // Budget actions
  addBudget: (budget: Omit<EducationBudget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (id: string, updates: Partial<EducationBudget>) => void;
  deleteBudget: (id: string) => void;
  
  // Expense actions
  addExpense: (expense: Omit<EducationExpense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updates: Partial<EducationExpense>) => void;
  deleteExpense: (id: string) => void;
  
  // Semester actions
  addSemester: (semester: Omit<Semester, 'id'>) => void;
  setActiveSemester: (id: string) => void;
  
  // Computed helpers
  getBudgetsByCategory: (semesterId: string) => Map<EducationCategoryId, number>;
  getExpensesByCategory: (semesterId: string) => Map<EducationCategoryId, number>;
  getTotalBudget: (semesterId: string) => number;
  getTotalExpenses: (semesterId: string) => number;
}

// Generate default semesters
const generateDefaultSemesters = (): Semester[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  return [
    {
      id: `${currentYear}-spring`,
      name: `Spring ${currentYear}`,
      startDate: new Date(currentYear, 0, 1),
      endDate: new Date(currentYear, 5, 30),
      isActive: now.getMonth() < 6,
    },
    {
      id: `${currentYear}-fall`,
      name: `Fall ${currentYear}`,
      startDate: new Date(currentYear, 6, 1),
      endDate: new Date(currentYear, 11, 31),
      isActive: now.getMonth() >= 6,
    },
  ];
};

export const useEducationStore = create<EducationStore>()(
  persist(
    (set, get) => ({
      budgets: [],
      expenses: [],
      semesters: generateDefaultSemesters(),
      activeSemesterId: generateDefaultSemesters().find(s => s.isActive)?.id || null,
      
      addBudget: (budget) => {
        const newBudget: EducationBudget = {
          ...budget,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set(state => ({ budgets: [...state.budgets, newBudget] }));
      },
      
      updateBudget: (id, updates) => {
        set(state => ({
          budgets: state.budgets.map(b =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date() } : b
          ),
        }));
      },
      
      deleteBudget: (id) => {
        set(state => ({ budgets: state.budgets.filter(b => b.id !== id) }));
      },
      
      addExpense: (expense) => {
        const newExpense: EducationExpense = {
          ...expense,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        set(state => ({ expenses: [...state.expenses, newExpense] }));
        
        // Get category name for notification
        const category = DEFAULT_EDUCATION_CATEGORIES.find(c => c.id === expense.categoryId);
        const categoryName = category?.name || 'Education';
        
        // Add expense notification
        useNotificationStore.getState().addNotification({
          type: 'success',
          title: '🎓 Education Expense Added',
          message: `${expense.description || categoryName} expense of ৳${expense.amount.toLocaleString()} recorded.`,
          actionUrl: '/education',
        });
        
        // Check budget threshold for this category
        const { budgets, expenses } = get();
        const categoryBudget = budgets.find(
          b => b.categoryId === expense.categoryId && b.semesterId === expense.semesterId
        );
        
        if (categoryBudget) {
          const totalSpent = expenses
            .filter(e => e.categoryId === expense.categoryId && e.semesterId === expense.semesterId)
            .reduce((sum, e) => sum + e.amount, 0);
          
          const percentage = (totalSpent / categoryBudget.amount) * 100;
          const oldSpent = totalSpent - expense.amount;
          const oldPercentage = (oldSpent / categoryBudget.amount) * 100;
          
          if (percentage >= 100 && oldPercentage < 100) {
            useNotificationStore.getState().addNotification({
              type: 'error',
              title: '🚨 Education Budget Exceeded!',
              message: `You've exceeded your ${categoryName} education budget.`,
              actionUrl: '/education',
            });
          } else if (percentage >= 80 && oldPercentage < 80) {
            useNotificationStore.getState().addNotification({
              type: 'warning',
              title: '⚠️ Education Budget Alert',
              message: `You've used ${percentage.toFixed(0)}% of your ${categoryName} education budget.`,
              actionUrl: '/education',
            });
          }
        }
      },
      
      updateExpense: (id, updates) => {
        set(state => ({
          expenses: state.expenses.map(e =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));
      },
      
      deleteExpense: (id) => {
        set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }));
      },
      
      addSemester: (semester) => {
        const newSemester: Semester = {
          ...semester,
          id: crypto.randomUUID(),
        };
        set(state => ({ semesters: [...state.semesters, newSemester] }));
      },
      
      setActiveSemester: (id) => {
        set({ activeSemesterId: id });
      },
      
      getBudgetsByCategory: (semesterId) => {
        const { budgets } = get();
        const map = new Map<EducationCategoryId, number>();
        budgets
          .filter(b => b.semesterId === semesterId)
          .forEach(b => map.set(b.categoryId, (map.get(b.categoryId) || 0) + b.amount));
        return map;
      },
      
      getExpensesByCategory: (semesterId) => {
        const { expenses } = get();
        const map = new Map<EducationCategoryId, number>();
        expenses
          .filter(e => e.semesterId === semesterId)
          .forEach(e => map.set(e.categoryId, (map.get(e.categoryId) || 0) + e.amount));
        return map;
      },
      
      getTotalBudget: (semesterId) => {
        const { budgets } = get();
        return budgets
          .filter(b => b.semesterId === semesterId)
          .reduce((sum, b) => sum + b.amount, 0);
      },
      
      getTotalExpenses: (semesterId) => {
        const { expenses } = get();
        return expenses
          .filter(e => e.semesterId === semesterId)
          .reduce((sum, e) => sum + e.amount, 0);
      },
    }),
    {
      name: 'lunaris-education',
    }
  )
);
