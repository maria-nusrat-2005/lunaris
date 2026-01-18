// Recent transactions list for dashboard
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Circle, type LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTransactionStore, useCategoryStore, useSettingsStore } from '@/lib/stores';
import { useTranslation } from '@/lib/hooks';
import { formatCurrency, formatRelativeDate } from '@/lib/utils/helpers';

export function RecentTransactions() {
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const settings = useSettingsStore((s) => s.settings);
  const { t, language } = useTranslation();

  const recentTransactions = transactions.slice(0, 5);
  const currency = settings?.currency || 'BDT';

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId);
  };

  const getIcon = (iconName: string): LucideIcon => {
    const icons = LucideIcons as unknown as Record<string, LucideIcon>;
    return icons[iconName] || Circle;
  };

  if (recentTransactions.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('recentTransactions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              {t('noTransactionsYet')}
            </p>
            <Button variant="outline">{t('addTransaction')}</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">{t('recentTransactions')}</CardTitle>
          <Link href="/transactions">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
              {t('viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-1">
          {recentTransactions.map((transaction, index) => {
            const category = getCategoryInfo(transaction.categoryId);
            const Icon = getIcon(category?.icon || 'Circle');
            const isIncome = transaction.type === 'income';

            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                {/* Category icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${category?.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: category?.color }} />
                </div>

                {/* Transaction info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {transaction.description || category?.name || t('transactions')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {category?.name} • {formatRelativeDate(transaction.date, language)}
                  </p>
                </div>

                {/* Amount */}
                <div className={cn(
                  'font-semibold',
                  isIncome ? 'text-emerald' : 'text-foreground'
                )}>
                  {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, currency as any, language)}
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
