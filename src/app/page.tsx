// Main Dashboard Page
'use client';

import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { MetricCard, MetricGrid, QuickActions, RecentTransactions, AIInsights } from '@/components/dashboard';
import { CashFlowChart, SpendingPieChart } from '@/components/charts';
import { TransactionDialog } from '@/components/transactions';
import { useDashboardMetrics, useTranslation } from '@/lib/hooks';
import { useSettingsStore, useAuthStore } from '@/lib/stores';
import { ViewerGuard } from '@/components/auth';

export default function DashboardPage() {
  const metrics = useDashboardMetrics();
  const settings = useSettingsStore((s) => s.settings);
  const { t } = useTranslation();
  const currency = settings?.currency || 'BDT';

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

        {/* Quick actions - protected for viewers */}
        <ViewerGuard>
          <QuickActions />
        </ViewerGuard>

        {/* Metric cards */}
        <MetricGrid>
          <MetricCard
            title={t('totalBalance')}
            value={metrics.totalBalance}
            currency={currency}
            icon={Wallet}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
            delay={0}
          />
          <MetricCard
            title={t('monthlyIncome')}
            value={metrics.monthlyIncome}
            currency={currency}
            icon={TrendingUp}
            iconColor="text-emerald"
            iconBgColor="bg-emerald/10"
            delay={0.05}
          />
          <MetricCard
            title={t('monthlyExpenses')}
            value={metrics.monthlyExpense}
            currency={currency}
            icon={TrendingDown}
            iconColor="text-danger"
            iconBgColor="bg-danger/10"
            delay={0.1}
          />
          <MetricCard
            title={t('savingsRate')}
            value={metrics.savingsRate}
            icon={PiggyBank}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
            delay={0.15}
            isPercentage
          />
        </MetricGrid>

        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CashFlowChart />
          <SpendingPieChart />
        </div>

        {/* AI Insights */}
        <AIInsights />

        {/* Recent transactions */}
        <RecentTransactions />
      </div>
      <TransactionDialog />
    </AppShell>
  );
}
