// AI service exports
export { 
  generateSpendingInsights, 
  categorizeTransaction, 
  isAIEnabled, 
  saveAPIKey, 
  removeAPIKey, 
  getMaskedAPIKey 
} from './aiService';
export type { AIInsight, SpendingAnalysis } from './aiService';
