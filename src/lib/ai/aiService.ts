// AI Service for Lunaris - Hugging Face Integration
// All AI features are OPTIONAL and OFF by default
// Uses Hugging Face Inference API with Qwen2.5-7B-Instruct
'use client';

import { encrypt, decrypt, initializeEncryption } from '@/lib/encryption/crypto';
import { t, formatNumber } from '@/lib/i18n';
import type { Language } from '@/lib/types';

// Storage keys for encrypted HF token
const API_KEY_STORAGE = 'lunaris_ai_key';
const API_KEY_IV_STORAGE = 'lunaris_ai_key_iv';

// Active request controller for cancellation
let activeController: AbortController | null = null;

// ============ Types ============

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface FinancialContext {
  currency: string;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
  topCategories: { name: string; amount: number; percentage: number }[];
  recentTransactions: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
  }[];
}

export interface AIInsight {
  type: 'tip' | 'warning' | 'suggestion' | 'insight';
  title: string;
  message: string;
}

export interface SpendingAnalysis {
  summary: string;
  insights: AIInsight[];
  recommendations: string[];
}

// ============ Token Management (Encrypted) ============

export async function saveAPIKeyEncrypted(apiKey: string): Promise<void> {
  const masterKey = await initializeEncryption();
  const { iv, encrypted } = await encrypt(apiKey, masterKey);
  
  localStorage.setItem(API_KEY_STORAGE, encrypted);
  localStorage.setItem(API_KEY_IV_STORAGE, iv);
}

export async function getAPIKeyDecrypted(): Promise<string | null> {
  const encrypted = localStorage.getItem(API_KEY_STORAGE);
  const iv = localStorage.getItem(API_KEY_IV_STORAGE);
  
  if (!encrypted || !iv) return null;
  
  try {
    const masterKey = await initializeEncryption();
    return await decrypt(encrypted, iv, masterKey);
  } catch {
    return null;
  }
}

export function removeAPIKey(): void {
  localStorage.removeItem(API_KEY_STORAGE);
  localStorage.removeItem(API_KEY_IV_STORAGE);
}

export function isAPIKeyConfigured(): boolean {
  return !!localStorage.getItem(API_KEY_STORAGE);
}

export function getMaskedAPIKey(): string {
  const encrypted = localStorage.getItem(API_KEY_STORAGE);
  if (!encrypted) return '';
  return 'hf_••••••••';
}

// ============ Request Management ============

export function cancelActiveRequest(): void {
  if (activeController) {
    activeController.abort();
    activeController = null;
  }
}

// ============ Financial Context Builder ============

function buildFinancialContextPrompt(context: FinancialContext): string {
  return `
You are Lunaris AI, a friendly and helpful personal finance assistant. You help users understand their finances and provide actionable advice.

Current Financial Summary:
- Monthly Income: ${context.currency}${context.monthlyIncome.toLocaleString()}
- Monthly Expenses: ${context.currency}${context.monthlyExpense.toLocaleString()}
- Savings Rate: ${context.savingsRate.toFixed(1)}%

Top Spending Categories:
${context.topCategories.map(c => `- ${c.name}: ${context.currency}${c.amount.toLocaleString()} (${c.percentage.toFixed(1)}%)`).join('\n')}

Recent Transactions (last 5):
${context.recentTransactions.slice(0, 5).map(t => `- ${t.description}: ${t.type === 'expense' ? '-' : '+'}${context.currency}${t.amount.toLocaleString()} (${t.category})`).join('\n')}

Guidelines:
- Be concise and helpful
- Use the user's currency (${context.currency})
- Provide actionable advice when relevant
- Be encouraging but realistic
- Never ask for sensitive personal information
- Keep responses under 150 words unless asked for detailed analysis
`.trim();
}

// ============ Chat API using Hugging Face Qwen2.5 ============

export async function sendChatMessage(
  userMessage: string,
  chatHistory: ChatMessage[],
  financialContext: FinancialContext,
  aiEnabled: boolean
): Promise<string> {
  // Safety check - never make API calls if AI is disabled
  if (!aiEnabled) {
    throw new Error('AI features are disabled. Enable them in Settings to use the chat.');
  }

  const apiKey = await getAPIKeyDecrypted();
  if (!apiKey) {
    throw new Error('Hugging Face token not configured. Add your token in Settings.');
  }

  // Cancel any previous request
  cancelActiveRequest();
  activeController = new AbortController();

  const systemPrompt = buildFinancialContextPrompt(financialContext);
  
  // Create messages array for OpenAI-compatible API
  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-6).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];

  try {
    // Call the OpenAI-compatible endpoint on the HF Router directly from the client
    // Since we are using static export, we cannot use local API routes
    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: activeController.signal,
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 503) {
        throw new Error('Model is loading. Please try again in a moment.');
      }
      throw new Error(error.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    let text = '';
    
    // 1. OpenAI format (from direct HF Router call)
    if (data.choices?.[0]?.message?.content) {
      text = data.choices[0].message.content;
    }
    // 2. Old proxy format or HF Inference API format
    else if (Array.isArray(data) && data[0]?.generated_text) {
      text = data[0].generated_text;
    } else if (data.generated_text) {
      text = data.generated_text;
    } 
    // 3. Simple string format
    else if (typeof data === 'string') {
      text = data;
    }
    
    // Clean up response - remove any trailing tokens
    text = text.split('<|im_end|>')[0].trim();
    text = text.split('<|im_start|>')[0].trim();
    
    if (!text) {
      throw new Error('No response from AI');
    }

    return text;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error('Request cancelled');
    }
    throw error;
  } finally {
    activeController = null;
  }
}

// ============ Spending Insights (Simplified - No External API) ============
// These functions provide basic insights without external API calls
// The main AI functionality is in the chat feature

export async function generateSpendingInsights(
  monthlyIncome: number,
  monthlyExpense: number,
  topCategories: { name: string; amount: number; percentage: number }[],
  savingsRate: number,
  aiEnabled: boolean,
  language: Language = 'en'
): Promise<SpendingAnalysis | null> {
  // If AI is disabled, return null (no insights)
  if (!aiEnabled) return null;

  // Generate basic insights locally without API call
  const insights: AIInsight[] = [];
  const recommendations: string[] = [];

  // Analyze savings rate
  const rateStr = formatNumber(Math.abs(Number(savingsRate.toFixed(1))), language);
  
  if (savingsRate >= 20) {
    insights.push({
      type: 'tip',
      title: t('greatSavings', language),
      message: t('greatSavingsMsg', language).replace('{rate}', rateStr)
    });
  } else if (savingsRate >= 10) {
    insights.push({
      type: 'suggestion',
      title: t('goodProgress', language),
      message: t('goodProgressMsg', language).replace('{rate}', rateStr)
    });
  } else if (savingsRate > 0) {
    insights.push({
      type: 'warning',
      title: t('increaseSavings', language),
      message: t('increaseSavingsMsg', language).replace('{rate}', rateStr)
    });
    recommendations.push(t('reviewExpensesRec', language));
  } else {
    insights.push({
      type: 'warning',
      title: t('negativeSavings', language),
      message: t('negativeSavingsMsg', language)
    });
    recommendations.push(t('createBudgetRec', language));
    recommendations.push(t('lookForWaysRec', language));
  }

  // Analyze top spending category
  if (topCategories.length > 0) {
    const topCategory = topCategories[0];
    const catName = t(topCategory.name.toLowerCase().replace(/ & /g, '').replace(/ /g, ''), language);
    const catPercentage = formatNumber(Math.abs(Number(topCategory.percentage.toFixed(1))), language);

    if (topCategory.percentage > 40) {
      insights.push({
        type: 'insight',
        title: t('highSpending', language).replace('{category}', catName),
        message: t('highSpendingMsg', language)
          .replace('{category}', catName)
          .replace('{percentage}', catPercentage)
      });
      recommendations.push(t('reviewCategoryRec', language).replace('{category}', catName.toLowerCase()));
    }
  }

  const summaryKey = savingsRate >= 0 ? 'insightSummaryPositive' : 'insightSummaryNegative';
  return {
    summary: t(summaryKey, language).replace('{rate}', rateStr),
    insights,
    recommendations
  };
}

// ============ Category Suggestion (Simplified - No External API) ============
// Basic keyword matching without AI API call

export async function categorizeTransaction(
  description: string,
  transactionType: 'income' | 'expense',
  categories: { id: string; name: string; type: 'income' | 'expense' }[],
  aiEnabled: boolean
): Promise<string | null> {
  if (!aiEnabled) return null;

  const lowerDesc = description.toLowerCase();
  const relevantCategories = categories.filter(c => c.type === transactionType);

  // Simple keyword matching
  const keywordMap: Record<string, string[]> = {
    'Food & Dining': ['restaurant', 'food', 'lunch', 'dinner', 'breakfast', 'cafe', 'coffee', 'pizza', 'burger'],
    'Transportation': ['uber', 'lyft', 'taxi', 'bus', 'metro', 'fuel', 'gas', 'parking', 'train'],
    'Shopping': ['amazon', 'shop', 'store', 'mall', 'purchase', 'buy'],
    'Entertainment': ['movie', 'netflix', 'spotify', 'game', 'concert', 'show'],
    'Utilities': ['electric', 'water', 'internet', 'phone', 'bill'],
    'Salary': ['salary', 'paycheck', 'wage', 'income'],
    'Freelance': ['freelance', 'contract', 'project', 'client'],
  };

  for (const category of relevantCategories) {
    const keywords = keywordMap[category.name] || [category.name.toLowerCase()];
    if (keywords.some(kw => lowerDesc.includes(kw))) {
      return category.id;
    }
  }

  return null;
}

// ============ Get Financial Context Helper ============

export function getFinancialContext(): FinancialContext {
  // This would normally pull from stores, but we return defaults
  // The actual implementation uses the stores in the calling component
  return {
    currency: 'BDT',
    monthlyIncome: 0,
    monthlyExpense: 0,
    savingsRate: 0,
    topCategories: [],
    recentTransactions: [],
  };
}
