// AI service exports - Hugging Face / Qwen2.5 Integration
export { 
  generateSpendingInsights, 
  categorizeTransaction, 
  saveAPIKeyEncrypted,
  getAPIKeyDecrypted,
  removeAPIKey, 
  getMaskedAPIKey,
  isAPIKeyConfigured,
  cancelActiveRequest,
  sendChatMessage,
  getFinancialContext,
} from './aiService';

export type { 
  AIInsight, 
  SpendingAnalysis, 
  ChatMessage,
  FinancialContext,
} from './aiService';
