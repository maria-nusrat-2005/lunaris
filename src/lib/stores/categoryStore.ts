// Zustand store for category management
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db/database';
import type { Category, TransactionType, Subcategory } from '@/lib/types';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadCategories: () => Promise<void>;
  addCategory: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (categoryId: string, subcategory: Omit<Subcategory, 'id' | 'categoryId'>) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  getCategoriesByType: (type: TransactionType) => Category[];
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  loadCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await db.categories.toArray();
      set({ categories, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addCategory: async (data) => {
    const now = new Date();
    const category: Category = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    try {
      await db.categories.add(category);
      set((state) => ({
        categories: [...state.categories, category],
      }));
      return category;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const updatedData = { ...data, updatedAt: new Date() };
      await db.categories.update(id, updatedData);
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === id ? { ...c, ...updatedData } : c
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const category = get().categories.find((c) => c.id === id);
      if (category?.isDefault) {
        throw new Error('Cannot delete default categories');
      }
      await db.categories.delete(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  addSubcategory: async (categoryId, subcategoryData) => {
    try {
      const category = await db.categories.get(categoryId);
      if (!category) return;

      const subcategory: Subcategory = {
        ...subcategoryData,
        id: uuidv4(),
        categoryId,
      };

      const updatedSubcategories = [
        ...(category.subcategories || []),
        subcategory,
      ];

      await db.categories.update(categoryId, {
        subcategories: updatedSubcategories,
        updatedAt: new Date(),
      });

      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === categoryId
            ? { ...c, subcategories: updatedSubcategories, updatedAt: new Date() }
            : c
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  getCategoryById: (id) => {
    return get().categories.find((c) => c.id === id);
  },

  getCategoriesByType: (type) => {
    return get().categories.filter((c) => c.type === type);
  },
}));
