// AI Chat Panel - Calm, Apple-inspired chat interface
// AI is OPTIONAL - shows disabled state when AI is OFF

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  AlertCircle,
  Trash2,
  ShieldOff,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAIStore, useSettingsStore, useTransactionStore, useCategoryStore } from '@/lib/stores';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/hooks';
import { isAPIKeyConfigured } from '@/lib/ai/aiService';

interface AIChatPanelProps {
  className?: string;
}

export function AIChatPanel({ className }: AIChatPanelProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const settings = useSettingsStore((s) => s.settings);
  const aiEnabled = settings?.aiEnabled ?? false;
  const isConfigured = isAPIKeyConfigured();

  const {
    chatHistory,
    isLoading,
    error,
    isPanelOpen,
    sendMessage,
    clearHistory,
    clearError,
    setPanelOpen,
  } = useAIStore();

  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Focus input when panel opens
  useEffect(() => {
    if (isPanelOpen && aiEnabled && isConfigured) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isPanelOpen, aiEnabled, isConfigured]);

  // Build financial context from current data
  const getFinancialContext = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyTransactions = transactions.filter(
      (t) => new Date(t.date) >= startOfMonth && !t.isDeleted
    );

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = monthlyIncome > 0 
      ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 
      : 0;

    // Calculate top categories
    const categorySpending: Record<string, number> = {};
    monthlyTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categorySpending[t.categoryId] = (categorySpending[t.categoryId] || 0) + t.amount;
      });

    const topCategories = Object.entries(categorySpending)
      .map(([catId, amount]) => {
        const category = categories.find((c) => c.id === catId);
        return {
          name: category?.name || 'Unknown',
          amount,
          percentage: monthlyExpense > 0 ? (amount / monthlyExpense) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Recent transactions
    const recentTransactions = transactions
      .filter((t) => !t.isDeleted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((t) => ({
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: categories.find((c) => c.id === t.categoryId)?.name || 'Unknown',
      }));

    const currencySymbol = settings?.currency === 'BDT' ? '৳' : 
                          settings?.currency === 'USD' ? '$' :
                          settings?.currency === 'EUR' ? '€' :
                          settings?.currency === 'GBP' ? '£' :
                          settings?.currency === 'INR' ? '₹' : '$';

    return {
      monthlyIncome,
      monthlyExpense,
      savingsRate,
      topCategories,
      recentTransactions,
      currency: currencySymbol,
    };
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading || !aiEnabled) return;
    
    const userMessage = message.trim();
    setMessage('');
    
    await sendMessage(userMessage, getFinancialContext(), aiEnabled);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Don't render the button if AI is disabled
  if (!aiEnabled) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          size="lg"
          className={cn(
            'h-14 w-14 rounded-full shadow-lg',
            'bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
            isPanelOpen && 'hidden'
          )}
          onClick={() => setPanelOpen(true)}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </Button>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed bottom-6 right-6 z-50',
              'w-[380px] h-[520px] max-h-[80vh]',
              'bg-card border border-border rounded-2xl shadow-2xl',
              'flex flex-col overflow-hidden',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t('aiAssistant')}</h3>
                  <p className="text-xs text-muted-foreground">{t('aiAssistantDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {chatHistory.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={clearHistory}
                    title={t('clearChat')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPanelOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content Area */}
            {!isConfigured ? (
              // Not configured state
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ShieldOff className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="font-medium mb-2">{t('tokenRequired')}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('tokenRequiredDesc')}
                </p>
                <Button variant="outline" size="sm" onClick={() => setPanelOpen(false)}>
                  {t('goToSettings')}
                </Button>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {t('askFinances')}
                      </p>
                      <div className="mt-4 space-y-2">
                        <p className="text-xs text-muted-foreground">{t('tryAsking')}</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {[
                            t('topExpensesQuery'),
                            t('saveMoreQuery'),
                            t('analyzeSpendingQuery'),
                          ].map((suggestion) => (
                            <button
                              key={suggestion}
                              className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                              onClick={() => setMessage(suggestion)}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    chatHistory.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'flex',
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          )}
                        >
                          {msg.role === 'user' ? (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                  strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                  li: ({ children }) => <li className="mb-0">{children}</li>,
                                  h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>,
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}

                  {/* Loading indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    </motion.div>
                  )}

                  {/* Error message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p>{error}</p>
                        <button
                          className="text-xs underline mt-1"
                          onClick={clearError}
                        >
                          {t('dismiss')}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border bg-background/50">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t('chatPlaceholder')}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={!message.trim() || isLoading}
                      className="shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {t('aiDataNote')}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AIChatPanel;
