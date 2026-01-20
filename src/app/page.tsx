// Main Dashboard Page
'use client';

import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Info } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { MetricCard, MetricGrid, QuickActions, RecentTransactions, AIInsights } from '@/components/dashboard';
import { CashFlowChart, SpendingPieChart } from '@/components/charts';
import { TransactionDialog } from '@/components/transactions';
import { AIChatPanel } from '@/components/ai';
import { useDashboardMetrics, useTranslation } from '@/lib/hooks';
import { useSettingsStore, useAuthStore } from '@/lib/stores';
import { ViewerGuard } from '@/components/auth';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const metrics = useDashboardMetrics();
  const settings = useSettingsStore((s) => s.settings);
  const { t } = useTranslation();
  const currency = settings?.currency || 'BDT';

  const showExpenseAlert = metrics.monthlyExpense > metrics.monthlyIncome;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard')}</h1>
          <p className="text-muted-foreground">
            {t('welcomeBack')}
          </p>
        </motion.div>

        {showExpenseAlert && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-4 rounded-xl bg-danger/5 border border-danger/10 flex items-start gap-4"
          >
            <div className="p-2 rounded-full bg-background text-danger shadow-sm">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-medium text-danger/90 text-sm">
                {t('expenseAlertTitle')}
              </h3>
              <p className="text-sm text-danger/70 mt-0.5">
                {t('expenseAlertDesc')}
              </p>
            </div>
          </motion.div>
        )}

        {/* Quick actions - protected for viewers */}
        <ViewerGuard>
          <QuickActions />
        </ViewerGuard>

        <MetricGrid>
          <MetricCard
            title={t('totalBalance')}
            value={metrics.totalBalance}
            currency={currency}
            icon={Wallet}
            delay={0}
          />
          <MetricCard
            title={t('monthlyIncome')}
            value={metrics.monthlyIncome}
            currency={currency}
            icon={TrendingUp}
            delay={0.05}
          />
          <MetricCard
            title={t('monthlyExpenses')}
            value={metrics.monthlyExpense}
            currency={currency}
            icon={TrendingDown}
            delay={0.1}
          />
          <MetricCard
            title={t('savingsRate')}
            value={metrics.savingsRate}
            icon={PiggyBank}
            delay={0.15}
            isPercentage
          />
        </MetricGrid>

        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CashFlowChart />
          <SpendingPieChart />
        </div>

        {/* AI Insights - kept for potential future use */}
        <AIInsights />

        {/* Recent transactions */}
        <RecentTransactions />
      </div>
      <TransactionDialog />
      
      {/* AI Chat Panel - Ready for Qwen2.5-7B-Instruct integration */}
      <AIChatPanel />
    </AppShell>
  );
}


