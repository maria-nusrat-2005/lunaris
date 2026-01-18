// Authentication Store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/lib/types';
import { createWelcomeNotification } from './notificationStore';

// Default demo users
const DEFAULT_USERS: User[] = [
  {
    id: 'admin-001',
    email: 'admin@clarity.com',
    name: 'Admin User',
    role: 'admin',
    avatar: '',
    createdAt: new Date(),
  },
  {
    id: 'user-001',
    email: 'user@clarity.com',
    name: 'Demo User',
    role: 'user',
    avatar: '',
    createdAt: new Date(),
  },
  {
    id: 'viewer-001',
    email: 'viewer@clarity.com',
    name: 'Demo Viewer',
    role: 'viewer',
    avatar: '',
    createdAt: new Date(),
  },
];

// Default passwords (in real app, these would be hashed)
const DEFAULT_PASSWORDS: Record<string, string> = {
  'admin@clarity.com': 'admin123',
  'user@clarity.com': 'user123',
  'viewer@clarity.com': 'viewer123',
};

interface RegisteredUser extends User {
  password: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  registeredUsers: RegisteredUser[];
  
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'avatar' | 'occupation'>>) => void;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  
  // Permission helpers
  canEdit: () => boolean;
  canDelete: () => boolean;
  canManageData: () => boolean;
  isViewer: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      registeredUsers: [],

      login: async (email, password) => {
        set({ isLoading: true });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const normalizedEmail = email.toLowerCase().trim();
        
        // Check default users first
        if (DEFAULT_PASSWORDS[normalizedEmail] === password) {
          const user = DEFAULT_USERS.find(u => u.email === normalizedEmail);
          if (user) {
            set({ isAuthenticated: true, user, isLoading: false });
            // Send welcome notification
            setTimeout(() => createWelcomeNotification(), 500);
            return { success: true };
          }
        }
        
        // Check registered users
        const registeredUser = get().registeredUsers.find(
          u => u.email === normalizedEmail && u.password === password
        );
        
        if (registeredUser) {
          const { password: _, ...user } = registeredUser;
          set({ isAuthenticated: true, user, isLoading: false });
          // Send welcome notification
          setTimeout(() => createWelcomeNotification(), 500);
          return { success: true };
        }
        
        set({ isLoading: false });
        return { success: false, error: 'Invalid email or password' };
      },

      register: async (name, email, password, role = 'user') => {
        set({ isLoading: true });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const normalizedEmail = email.toLowerCase().trim();
        
        // Check if email already exists
        if (DEFAULT_USERS.some(u => u.email === normalizedEmail)) {
          set({ isLoading: false });
          return { success: false, error: 'Email already registered' };
        }
        
        if (get().registeredUsers.some(u => u.email === normalizedEmail)) {
          set({ isLoading: false });
          return { success: false, error: 'Email already registered' };
        }
        
        const newUser: RegisteredUser = {
          id: crypto.randomUUID(),
          email: normalizedEmail,
          name: name.trim(),
          role,
          avatar: '',
          password,
          createdAt: new Date(),
        };
        
        const { password: _, ...user } = newUser;
        
        set(state => ({
          registeredUsers: [...state.registeredUsers, newUser],
          isAuthenticated: true,
          user,
          isLoading: false,
        }));
        
        return { success: true };
      },

      logout: () => {
        set({ isAuthenticated: false, user: null });
      },

      updateProfile: (updates) => {
        const { user, registeredUsers } = get();
        if (!user) return;
        
        // Update user state
        set(state => ({
          user: state.user ? { ...state.user, ...updates } : null,
          // Also update in registeredUsers if exists
          registeredUsers: state.registeredUsers.map(u => 
            u.id === user.id ? { ...u, ...updates } : u
          ),
        }));
      },

      updatePassword: async (oldPassword, newPassword) => {
        const { user, registeredUsers } = get();
        if (!user) return { success: false, error: 'Not logged in' };
        
        // Check if it's a default user
        if (DEFAULT_PASSWORDS[user.email] !== undefined) {
          // For default users, verify old password matches
          if (DEFAULT_PASSWORDS[user.email] !== oldPassword) {
            return { success: false, error: 'Current password is incorrect' };
          }
          // Note: Default users can't actually change password in this demo
          // Create a new registered user entry instead
          const registeredUser = registeredUsers.find(u => u.email === user.email);
          if (registeredUser) {
            if (registeredUser.password !== oldPassword) {
              return { success: false, error: 'Current password is incorrect' };
            }
            set(state => ({
              registeredUsers: state.registeredUsers.map(u =>
                u.id === user.id ? { ...u, password: newPassword } : u
              ),
            }));
          } else {
            // Convert default user to registered user with new password
            const newUser: RegisteredUser = {
              ...user,
              password: newPassword,
            };
            set(state => ({
              registeredUsers: [...state.registeredUsers, newUser],
            }));
          }
          return { success: true };
        }
        
        // For registered users
        const registeredUser = registeredUsers.find(u => u.id === user.id);
        if (!registeredUser) {
          return { success: false, error: 'User not found' };
        }
        
        if (registeredUser.password !== oldPassword) {
          return { success: false, error: 'Current password is incorrect' };
        }
        
        set(state => ({
          registeredUsers: state.registeredUsers.map(u =>
            u.id === user.id ? { ...u, password: newPassword } : u
          ),
        }));
        
        return { success: true };
      },

      // Permission helpers
      canEdit: () => {
        const { user } = get();
        return user?.role === 'admin' || user?.role === 'user';
      },

      canDelete: () => {
        const { user } = get();
        return user?.role === 'admin' || user?.role === 'user';
      },

      canManageData: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      isViewer: () => {
        const { user } = get();
        return user?.role === 'viewer';
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },
    }),
    {
      name: 'clarity-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        registeredUsers: state.registeredUsers,
      }),
    }
  )
);
