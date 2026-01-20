// Dexie.js Database Schema for Clarity Finance
// All data is stored locally in IndexedDB

import Dexie, { type Table } from 'dexie';
import type {
  Transaction,
  Category,
  Budget,
  Goal,
  GoalContribution,
  Settings,
  RecycleBinItem,
} from '@/lib/types';

export class ClarityDatabase extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  budgets!: Table<Budget, string>;
  goals!: Table<Goal, string>;
  goalContributions!: Table<GoalContribution, string>;
  settings!: Table<Settings, string>;
  recycleBin!: Table<RecycleBinItem, string>;

  constructor() {
    super('ClarityFinance');

    this.version(1).stores({
      transactions: 'id, type, categoryId, date, isDeleted, createdAt',
      categories: 'id, type, name, isDefault',
      budgets: 'id, categoryId, [month+year], createdAt',
      goals: 'id, isCompleted, createdAt',
      goalContributions: 'id, goalId, date',
      settings: 'id',
      recycleBin: 'id, originalId, type, deletedAt, expiresAt',
    });
  }
}

// Singleton database instance
export const db = new ClarityDatabase();

// Initialize default categories
export async function initializeDefaultCategories(): Promise<void> {
  const existingCategories = await db.categories.count();
  if (existingCategories > 0) return;

  const now = new Date();

  const defaultCategories: Category[] = [
    // Income categories
    {
      id: 'cat_salary',
      name: 'Salary',
      icon: 'Briefcase',
      color: '#10B981',
      type: 'income',
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_freelance',
      name: 'Freelance',
      icon: 'Laptop',
      color: '#3B82F6',
      type: 'income',
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_investment',
      name: 'Investment',
      icon: 'TrendingUp',
      color: '#8B5CF6',
      type: 'income',
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_gift',
      name: 'Gift',
      icon: 'Gift',
      color: '#EC4899',
      type: 'income',
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_other_income',
      name: 'Other Income',
      icon: 'Plus',
      color: '#6B7280',
      type: 'income',
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    },

    // Expense categories
    {
      id: 'cat_food',
      name: 'Food & Dining',
      icon: 'UtensilsCrossed',
      color: '#F59E0B',
      type: 'expense',
      isDefault: true,
      subcategories: [
        { id: 'sub_groceries', name: 'Groceries', categoryId: 'cat_food' },
        { id: 'sub_restaurants', name: 'Restaurants', categoryId: 'cat_food' },
        { id: 'sub_coffee', name: 'Coffee & Tea', categoryId: 'cat_food' },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_transport',
      name: 'Transportation',
      icon: 'Car',
      color: '#3B82F6',
      type: 'expense',
      isDefault: true,
      subcategories: [
        { id: 'sub_fuel', name: 'Fuel', categoryId: 'cat_transport' },
        { id: 'sub_public', name: 'Public Transit', categoryId: 'cat_transport' },
        { id: 'sub_rideshare', name: 'Rideshare', categoryId: 'cat_transport' },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_housing',
      name: 'Housing',
      icon: 'Home',
      color: '#10B981',
      type: 'expense',
      isDefault: true,
      subcategories: [
        { id: 'sub_rent', name: 'Rent', categoryId: 'cat_housing' },
        { id: 'sub_utilities', name: 'Utilities', categoryId: 'cat_housing' },
        { id: 'sub_maintenance', name: 'Maintenance', categoryId: 'cat_housing' },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_shopping',
      name: 'Shopping',
      icon: 'ShoppingBag',
      color: '#EC4899',
      type: 'expense',
      isDefault: true,
      subcategories: [
        { id: 'sub_clothing', name: 'Clothing', categoryId: 'cat_shopping' },
        { id: 'sub_electronics', name: 'Electronics', categoryId: 'cat_shopping' },
        { id: 'sub_household', name: 'Household Items', categoryId: 'cat_shopping' },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_entertainment',
      name: 'Entertainment',
      icon: 'Gamepad2',
      color: '#8B5CF6',
      type: 'expense',
      isDefault: true,
      subcategories: [
        { id: 'sub_movies', name: 'Movies & Shows', categoryId: 'cat_entertainment' },
        { id: 'sub_games', name: 'Games', categoryId: 'cat_entertainment' },
        { id: 'sub_subscriptions', name: 'Subscriptions', categoryId: 'cat_entertainment' },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_health',
      name: 'Health & Wellness',
      icon: 'Heart',
      color: '#EF4444',
      type: 'expense',
      isDefault: true,
      subcategories: [
        { id: 'sub_medical', name: 'Medical', categoryId: 'cat_health' },
        { id: 'sub_pharmacy', name: 'Pharmacy', categoryId: 'cat_health' },
        { id: 'sub_fitness', name: 'Fitness', categoryId: 'cat_health' },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_bills',
      name: 'Bills & Fees',
      icon: 'Receipt',
      color: '#F97316',
      type: 'expense',
      isDefault: true,
      subcategories: [
        { id: 'sub_phone', name: 'Phone', categoryId: 'cat_bills' },
        { id: 'sub_internet', name: 'Internet', categoryId: 'cat_bills' },
        { id: 'sub_insurance', name: 'Insurance', categoryId: 'cat_bills' },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_other',
      name: 'Other',
      icon: 'MoreHorizontal',
      color: '#6B7280',
      type: 'expense',
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.categories.bulkAdd(defaultCategories);
}

// Initialize default settings
export async function initializeDefaultSettings(): Promise<void> {
  const existingSettings = await db.settings.get('main');
  if (existingSettings) return;

  const defaultSettings: Settings = {
    id: 'main',
    theme: 'system',
    language: 'en',
    currency: 'BDT',
    dateFormat: 'dd/MM/yyyy',
    passcodeEnabled: false,
    autoBackupEnabled: true,
    aiEnabled: false,
    dashboardLayout: [
      { id: 'widget_balance', type: 'balance', position: 0, visible: true },
      { id: 'widget_income', type: 'income', position: 1, visible: true },
      { id: 'widget_expense', type: 'expense', position: 2, visible: true },
      { id: 'widget_budget', type: 'budget', position: 3, visible: true },
      { id: 'widget_chart', type: 'chart', position: 4, visible: true },
      { id: 'widget_recent', type: 'recent', position: 5, visible: true },
      { id: 'widget_goals', type: 'goals', position: 6, visible: true },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.settings.add(defaultSettings);
}

// Initialize database
export async function initializeDatabase(): Promise<void> {
  await initializeDefaultCategories();
  await initializeDefaultSettings();
}

// Clean up expired recycle bin items
export async function cleanupRecycleBin(): Promise<void> {
  const now = new Date();
  await db.recycleBin.where('expiresAt').below(now).delete();
}
