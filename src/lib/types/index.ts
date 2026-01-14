// Core type definitions for Clarity Finance

export type TransactionType = 'income' | 'expense';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ThemeMode = 'light' | 'dark' | 'system';
export type Currency = 'BDT' | 'USD' | 'EUR' | 'GBP' | 'INR';
export type Language = 'en' | 'bn';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  subcategories?: Subcategory[];
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  categoryId: string;
  subcategoryId?: string;
  description: string;
  date: Date;
  recurrence: RecurrenceType;
  recurrenceEndDate?: Date;
  tags?: string[];
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  currency: Currency;
  month: number; // 1-12
  year: number;
  spent: number;
  rolloverEnabled: boolean;
  rolloverAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: Currency;
  deadline?: Date;
  icon: string;
  color: string;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  date: Date;
  note?: string;
  createdAt: Date;
}

export interface Settings {
  id: string;
  theme: ThemeMode;
  language: Language;
  currency: Currency;
  dateFormat: string;
  passcodeEnabled: boolean;
  passcodeHash?: string;
  autoBackupEnabled: boolean;
  lastBackupDate?: Date;
  aiEnabled: boolean;
  aiApiKeyEncrypted?: string;
  dashboardLayout?: DashboardWidget[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'balance' | 'income' | 'expense' | 'budget' | 'goals' | 'chart' | 'recent';
  position: number;
  visible: boolean;
}

export interface RecycleBinItem {
  id: string;
  originalId: string;
  type: 'transaction' | 'budget' | 'goal' | 'category';
  data: string; // Encrypted JSON
  deletedAt: Date;
  expiresAt: Date; // Auto-delete after 30 days
}

// Encryption related types
export interface EncryptedData {
  iv: string;
  data: string;
}

export interface BackupData {
  version: string;
  createdAt: Date;
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  goalContributions: GoalContribution[];
  settings: Omit<Settings, 'passcodeHash' | 'aiApiKeyEncrypted'>;
}

// Dashboard metrics
export interface DashboardMetrics {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  budgetUtilization: number;
  savingsRate: number;
  topCategories: CategorySpending[];
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface CashFlowData {
  month: string;
  income: number;
  expense: number;
}

// Form types for creating/editing
export interface TransactionFormData {
  type: TransactionType;
  amount: number;
  categoryId: string;
  subcategoryId?: string;
  description: string;
  date: Date;
  recurrence: RecurrenceType;
  recurrenceEndDate?: Date;
  tags?: string[];
}

export interface BudgetFormData {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  rolloverEnabled: boolean;
}

export interface GoalFormData {
  name: string;
  targetAmount: number;
  deadline?: Date;
  icon: string;
  color: string;
}

// Auth types
export * from './auth';
