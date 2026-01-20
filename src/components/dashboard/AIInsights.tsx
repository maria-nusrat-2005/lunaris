// AI Insights component for Dashboard
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lightbulb, AlertTriangle, TrendingUp, RefreshCw, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDashboardMetrics, useTranslation } from '@/lib/hooks';
import { useSettingsStore } from '@/lib/stores';
import { generateSpendingInsights, isAPIKeyConfigured } from '@/lib/ai';
import type { SpendingAnalysis, AIInsight } from '@/lib/ai';

const insightIcons = {
  tip: Lightbulb,
  warning: AlertTriangle,
  suggestion: TrendingUp,
  insight: Sparkles,
};

const insightColors = {
  tip: 'bg-blue-500/10 text-blue-500',
  warning: 'bg-amber-500/10 text-amber-500',
  suggestion: 'bg-emerald/10 text-emerald',
  insight: 'bg-cyan-500/10 text-cyan-600',
};

export function AIInsights() {
  const { t, language } = useTranslation();
  const metrics = useDashboardMetrics();
  const settings = useSettingsStore((s) => s.settings);
  const [analysis, setAnalysis] = useState<SpendingAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Derive AI state from settings
  const aiEnabled = settings?.aiEnabled ?? false;
  const isConfigured = isAPIKeyConfigured();
  const aiAvailable = aiEnabled && isConfigured;

  const loadInsights = async () => {
    if (!aiAvailable) return;

    setLoading(true);
    try {
      const result = await generateSpendingInsights(
        metrics.monthlyIncome,
        metrics.monthlyExpense,
        metrics.topCategories.map(c => ({
          name: c.categoryName,
          amount: c.amount,
          percentage: c.percentage,
        })),
        metrics.savingsRate,
        aiEnabled, // Pass aiEnabled as required parameter
        language
      );
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show if AI is not configured or dismissed
  if (!aiAvailable || dismissed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <Card className="shadow-soft border-border/50 bg-gradient-to-br from-secondary/30 to-background">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-600" />
              {t('aiInsights')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-cyan-600 hover:text-cyan-700"
                onClick={loadInsights}
                disabled={loading}
              >
                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                {loading ? t('analyzing') : t('analyze')}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => setDismissed(true)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {analysis ? (
              <motion.div
                key="analysis"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Summary */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.summary}
                </p>

                {/* Insights */}
                {analysis.insights.length > 0 && (
                  <div className="space-y-2">
                    {analysis.insights.map((insight, index) => {
                      const Icon = insightIcons[insight.type] || Sparkles;
                      const colorClass = insightColors[insight.type] || insightColors.insight;

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
                        >
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', colorClass)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{insight.title}</p>
                            <p className="text-xs text-muted-foreground">{insight.message}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {t('recommendations')}
                    </p>
                    <ul className="space-y-1">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-cyan-500">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4"
              >
                <p className="text-sm text-muted-foreground">
                  {t('aiInsightsPlaceholder')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
