// Zustand store for AI chat state
// AI is OPTIONAL and OFF by default - no AI calls without explicit user opt-in

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  sendChatMessage, 
  cancelActiveRequest,
  type ChatMessage,
  type FinancialContext
} from '@/lib/ai/aiService';

interface AIState {
  // Chat state
  chatHistory: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isPanelOpen: boolean;

  // Actions
  sendMessage: (message: string, financialContext: FinancialContext, aiEnabled: boolean) => Promise<void>;
  clearHistory: () => void;
  cancelRequest: () => void;
  setPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
  clearError: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  chatHistory: [],
  isLoading: false,
  error: null,
  isPanelOpen: false,

  sendMessage: async (message: string, financialContext: FinancialContext, aiEnabled: boolean) => {
    // Safety check - never proceed if AI is disabled
    if (!aiEnabled) {
      set({ error: 'AI features are disabled. Enable them in Settings.' });
      return;
    }

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    set((state) => ({
      chatHistory: [...state.chatHistory, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response = await sendChatMessage(
        message,
        get().chatHistory,
        financialContext,
        aiEnabled
      );

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      set((state) => ({
        chatHistory: [...state.chatHistory, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = (error as Error).message;
      
      // Don't show error for cancelled requests
      if (errorMessage === 'Request cancelled') {
        set({ isLoading: false });
        return;
      }

      set({ 
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  clearHistory: () => {
    cancelActiveRequest();
    set({ chatHistory: [], error: null, isLoading: false });
  },

  cancelRequest: () => {
    cancelActiveRequest();
    set({ isLoading: false });
  },

  setPanelOpen: (open: boolean) => set({ isPanelOpen: open }),
  
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

  clearError: () => set({ error: null }),
}));
