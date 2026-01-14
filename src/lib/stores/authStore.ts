// Authentication Store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/lib/types';

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
  updateProfile: (updates: Partial<Pick<User, 'name' | 'avatar'>>) => void;
  
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
        set(state => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
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
