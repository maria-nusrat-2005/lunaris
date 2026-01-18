// Notification Store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'reminder';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          read: false,
          createdAt: new Date(),
        };
        
        set(state => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          if (!notification || notification.read) return state;
          
          return {
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        });
      },

      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          const wasUnread = notification && !notification.read;
          
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: 'lunaris-notifications',
    }
  )
);

// Helper to create common notifications
export const createBudgetAlert = (categoryName: string, percentage: number) => {
  const store = useNotificationStore.getState();
  store.addNotification({
    type: percentage >= 100 ? 'error' : 'warning',
    title: percentage >= 100 ? 'Budget Exceeded!' : 'Budget Alert',
    message: `You've used ${percentage.toFixed(0)}% of your ${categoryName} budget.`,
    actionUrl: '/budgets',
  });
};

export const createGoalComplete = (goalName: string) => {
  const store = useNotificationStore.getState();
  store.addNotification({
    type: 'success',
    title: '🎉 Goal Achieved!',
    message: `Congratulations! You've reached your ${goalName} goal.`,
    actionUrl: '/goals',
  });
};

export const createWelcomeNotification = () => {
  const store = useNotificationStore.getState();
  store.addNotification({
    type: 'info',
    title: 'Welcome to Lunaris! 💎',
    message: 'Start by adding your first transaction or setting up a budget.',
  });
};
