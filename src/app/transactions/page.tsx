// Transactions Page
'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, TrendingUp, TrendingDown, Calendar, MoreVertical, Trash2, Edit, Circle, type LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TransactionDialog } from '@/components/transactions';
import { ViewerGuard } from '@/components/auth';
import { cn } from '@/lib/utils';
import { useTransactionStore, useCategoryStore, useSettingsStore, useUIStore, useAuthStore } from '@/lib/stores';
import { useTranslation } from '@/lib/hooks';
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/utils/helpers';

export default function TransactionsPage() {
  const transactions = useTransactionStore((s) => s.transactions);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const categories = useCategoryStore((s) => s.categories);
  const settings = useSettingsStore((s) => s.settings);
  const { openAddTransaction } = useUIStore();
  const { canEdit, canDelete } = useAuthStore();
  const { t, language } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const currency = settings?.currency || 'BDT';

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId);
  };

  const getIcon = (iconName: string): LucideIcon => {
    const icons = LucideIcons as unknown as Record<string, LucideIcon>;
    return icons[iconName] || Circle;
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesTab = activeTab === 'all' || tx.type === activeTab;
      const matchesSearch =
        !searchQuery ||
        tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCategoryInfo(tx.categoryId)?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [transactions, activeTab, searchQuery, categories]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, typeof transactions> = {};
    filteredTransactions.forEach((tx) => {
      const dateKey = formatDate(tx.date, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(tx);
    });
    return groups;
  }, [filteredTransactions]);

  const handleDelete = async (id: string) => {
    if (!canDelete()) return;
    if (confirm(t('deleteTransaction') + '?')) {
      await deleteTransaction(id);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('transactions')}</h1>
            <p className="text-muted-foreground">{t('trackProgress')}</p>
          </div>
          <ViewerGuard fallback={<div />}>
            <div className="flex gap-2">
              <Button
                className="gap-2 bg-emerald hover:bg-emerald/90"
                onClick={() => openAddTransaction('income')}
              >
                <TrendingUp className="w-4 h-4" />
                {t('addIncome')}
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-danger/30 text-danger hover:bg-danger/10"
                onClick={() => openAddTransaction('expense')}
              >
                <TrendingDown className="w-4 h-4" />
                {t('addExpense')}
              </Button>
            </div>
          </ViewerGuard>
        </motion.div>

        {/* Filters */}
        <Card className="shadow-soft">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchTransactions')}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList>
                  <TabsTrigger value="all">{t('all')}</TabsTrigger>
                  <TabsTrigger value="income">{t('income')}</TabsTrigger>
                  <TabsTrigger value="expense">{t('expense')}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Transactions list */}
        <div className="space-y-6">
          {Object.keys(groupedTransactions).length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-2">{t('noTransactionsFound')}</p>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? t('tryAdjusting') : t('startByAdding')}
                  </p>
                  {canEdit() && (
                    <Button onClick={() => openAddTransaction('expense')}>
                      <Plus className="w-4 h-4 mr-2" />
                      {t('addTransaction')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedTransactions)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([dateKey, dayTransactions]) => (
                <motion.div
                  key={dateKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="shadow-soft overflow-hidden">
                    <CardHeader className="py-3 bg-muted/30">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {formatRelativeDate(dateKey, language)} • {formatDate(dateKey)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-border">
                      {dayTransactions.map((transaction, index) => {
                        const category = getCategoryInfo(transaction.categoryId);
                        const Icon = getIcon(category?.icon || 'Circle');
                        const isIncome = transaction.type === 'income';

                        return (
                          <motion.div
                            key={transaction.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                          >
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${category?.color}20` }}
                            >
                              <Icon className="w-6 h-6" style={{ color: category?.color }} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {transaction.description || category?.name || t('transactions')}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{category?.name}</span>
                                {transaction.recurrence !== 'none' && (
                                  <Badge variant="secondary" className="text-xs">
                                    {t(transaction.recurrence)}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <p
                                className={cn(
                                  'font-semibold text-lg',
                                  isIncome ? 'text-emerald' : 'text-foreground'
                                )}
                              >
                                {isIncome ? '+' : '-'}
                                {formatCurrency(transaction.amount, currency as any, language)}
                              </p>
                            </div>

                            {canEdit() && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    {t('edit')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(transaction.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {t('delete')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </motion.div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
          )}
        </div>
      </div>
      <TransactionDialog />
    </AppShell>
  );
}
