// Zustand store for savings goals management
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db/database';
import type { Goal, GoalContribution, Currency } from '@/lib/types';

interface GoalState {
  goals: Goal[];
  contributions: GoalContribution[];
  isLoading: boolean;
  error: string | null;
  justCompletedGoalId: string | null; // For confetti celebration

  // Actions
  loadGoals: () => Promise<void>;
  addGoal: (data: Omit<Goal, 'id' | 'currentAmount' | 'isCompleted' | 'completedAt' | 'createdAt' | 'updatedAt'>) => Promise<Goal>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (goalId: string, amount: number, note?: string) => Promise<void>;
  getGoalProgress: (goalId: string) => number;
  getActiveGoals: () => Goal[];
  getCompletedGoals: () => Goal[];
  clearJustCompletedGoal: () => void;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  contributions: [],
  isLoading: false,
  error: null,
  justCompletedGoalId: null,

  loadGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const [goals, contributions] = await Promise.all([
        db.goals.toArray(),
        db.goalContributions.toArray(),
      ]);
      
      // Sort by creation date (newest first for active, oldest first for completed)
      goals.sort((a, b) => {
        if (a.isCompleted === b.isCompleted) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.isCompleted ? 1 : -1;
      });

      set({ goals, contributions, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addGoal: async (data) => {
    const now = new Date();
    const goal: Goal = {
      ...data,
      id: uuidv4(),
      currentAmount: 0,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await db.goals.add(goal);
      set((state) => ({
        goals: [goal, ...state.goals],
      }));
      return goal;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateGoal: async (id, data) => {
    try {
      const updatedData = { ...data, updatedAt: new Date() };
      await db.goals.update(id, updatedData);
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === id ? { ...g, ...updatedData } : g
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteGoal: async (id) => {
    try {
      await db.goals.delete(id);
      await db.goalContributions.where('goalId').equals(id).delete();
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
        contributions: state.contributions.filter((c) => c.goalId !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  addContribution: async (goalId, amount, note) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) return;

    const now = new Date();
    const contribution: GoalContribution = {
      id: uuidv4(),
      goalId,
      amount,
      date: now,
      note,
      createdAt: now,
    };

    try {
      await db.goalContributions.add(contribution);

      const newAmount = goal.currentAmount + amount;
      const isNowCompleted = newAmount >= goal.targetAmount;

      const updatedGoal: Partial<Goal> = {
        currentAmount: newAmount,
        updatedAt: now,
      };

      if (isNowCompleted && !goal.isCompleted) {
        updatedGoal.isCompleted = true;
        updatedGoal.completedAt = now;
        set({ justCompletedGoalId: goalId });
      }

      await db.goals.update(goalId, updatedGoal);

      set((state) => ({
        contributions: [contribution, ...state.contributions],
        goals: state.goals.map((g) =>
          g.id === goalId ? { ...g, ...updatedGoal } : g
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  getGoalProgress: (goalId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal || goal.targetAmount === 0) return 0;
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  },

  getActiveGoals: () => {
    return get().goals.filter((g) => !g.isCompleted);
  },

  getCompletedGoals: () => {
    return get().goals.filter((g) => g.isCompleted);
  },

  clearJustCompletedGoal: () => {
    set({ justCompletedGoalId: null });
  },
}));
