// Zustand store for app settings
import { create } from 'zustand';
import { db } from '@/lib/db/database';
import type { Settings, ThemeMode, Language, Currency, DashboardWidget } from '@/lib/types';

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (data: Partial<Settings>) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setCurrency: (currency: Currency) => Promise<void>;
  enablePasscode: (passcodeHash: string) => Promise<void>;
  disablePasscode: () => Promise<void>;
  enableAI: (encryptedApiKey: string) => Promise<void>;
  disableAI: () => Promise<void>;
  updateDashboardLayout: (widgets: DashboardWidget[]) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await db.settings.get('main');
      set({ settings: settings || null, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateSettings: async (data) => {
    try {
      const updatedData = { ...data, updatedAt: new Date() };
      await db.settings.update('main', updatedData);
      set((state) => ({
        settings: state.settings ? { ...state.settings, ...updatedData } : null,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  setTheme: async (theme) => {
    await get().updateSettings({ theme });
    
    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(systemDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  },

  setLanguage: async (language) => {
    await get().updateSettings({ language });
  },

  setCurrency: async (currency) => {
    await get().updateSettings({ currency });
  },

  enablePasscode: async (passcodeHash) => {
    await get().updateSettings({
      passcodeEnabled: true,
      passcodeHash,
    });
  },

  disablePasscode: async () => {
    await get().updateSettings({
      passcodeEnabled: false,
      passcodeHash: undefined,
    });
  },

  enableAI: async (encryptedApiKey) => {
    await get().updateSettings({
      aiEnabled: true,
      aiApiKeyEncrypted: encryptedApiKey,
    });
  },

  disableAI: async () => {
    await get().updateSettings({
      aiEnabled: false,
      aiApiKeyEncrypted: undefined,
    });
  },

  updateDashboardLayout: async (widgets) => {
    await get().updateSettings({ dashboardLayout: widgets });
  },
}));

// UI-specific store for transient state
interface UIState {
  sidebarOpen: boolean;
  activeDialog: string | null;
  isAddingTransaction: boolean;
  transactionTypeToAdd: 'income' | 'expense' | null;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openDialog: (dialogId: string) => void;
  closeDialog: () => void;
  openAddTransaction: (type: 'income' | 'expense') => void;
  closeAddTransaction: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeDialog: null,
  isAddingTransaction: false,
  transactionTypeToAdd: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openDialog: (dialogId) => set({ activeDialog: dialogId }),
  closeDialog: () => set({ activeDialog: null }),
  openAddTransaction: (type) => set({ isAddingTransaction: true, transactionTypeToAdd: type }),
  closeAddTransaction: () => set({ isAddingTransaction: false, transactionTypeToAdd: null }),
}));
