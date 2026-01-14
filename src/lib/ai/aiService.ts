// AI Service for Clarity Finance using Gemini API
'use client';

import { useSettingsStore } from '@/lib/stores';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

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

// Generate spending insights using Gemini AI
export async function generateSpendingInsights(
  monthlyIncome: number,
  monthlyExpense: number,
  topCategories: { name: string; amount: number; percentage: number }[],
  savingsRate: number,
  language: 'en' | 'bn' = 'en'
): Promise<SpendingAnalysis | null> {
  const apiKey = localStorage.getItem('gemini_api_key');
  
  if (!apiKey) {
    return null;
  }

  const languagePrompt = language === 'bn' 
    ? 'Respond in Bengali (Bangla) language only.' 
    : 'Respond in English.';

  const prompt = `
You are a financial advisor AI assistant. Analyze the following monthly financial data and provide helpful insights.

${languagePrompt}

Monthly Financial Summary:
- Total Income: ${monthlyIncome}
- Total Expenses: ${monthlyExpense}
- Savings Rate: ${savingsRate}%

Top Spending Categories:
${topCategories.map(c => `- ${c.name}: ${c.amount} (${c.percentage.toFixed(1)}%)`).join('\n')}

Please provide:
1. A brief summary (2-3 sentences) of the financial health
2. 2-3 specific insights or observations
3. 2-3 actionable recommendations to improve finances

Format your response as JSON:
{
  "summary": "...",
  "insights": [
    {"type": "tip|warning|suggestion|insight", "title": "...", "message": "..."}
  ],
  "recommendations": ["...", "..."]
}
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) return null;

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]) as SpendingAnalysis;
  } catch (error) {
    console.error('AI insights error:', error);
    return null;
  }
}

// Auto-categorize a transaction description
export async function categorizeTransaction(
  description: string,
  categories: { id: string; name: string; type: string }[],
  transactionType: 'income' | 'expense'
): Promise<string | null> {
  const apiKey = localStorage.getItem('gemini_api_key');
  
  if (!apiKey || !description) {
    return null;
  }

  const relevantCategories = categories.filter(c => c.type === transactionType);
  
  const prompt = `
You are a transaction categorization AI. Given this transaction description, identify the most appropriate category.

Transaction: "${description}"
Type: ${transactionType}

Available categories:
${relevantCategories.map(c => `- ${c.name} (ID: ${c.id})`).join('\n')}

Respond with ONLY the category ID that best matches this transaction. No explanation needed.
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100,
        }
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    // Validate the returned ID
    if (text && relevantCategories.some(c => c.id === text)) {
      return text;
    }
    
    return null;
  } catch (error) {
    console.error('Categorization error:', error);
    return null;
  }
}

// Check if AI is enabled and configured
export function isAIEnabled(): boolean {
  const apiKey = localStorage.getItem('gemini_api_key');
  return !!apiKey;
}

// Save API key
export function saveAPIKey(key: string): void {
  localStorage.setItem('gemini_api_key', key);
}

// Remove API key
export function removeAPIKey(): void {
  localStorage.removeItem('gemini_api_key');
}

// Get API key (for display, masked)
export function getMaskedAPIKey(): string | null {
  const key = localStorage.getItem('gemini_api_key');
  if (!key) return null;
  return key.slice(0, 8) + '...' + key.slice(-4);
}
