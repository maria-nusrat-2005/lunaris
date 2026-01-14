// Add/Edit Transaction Dialog
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useTransactionStore, useCategoryStore, useSettingsStore, useUIStore, useBudgetStore } from '@/lib/stores';
import { useTranslation } from '@/lib/hooks';
import type { RecurrenceType } from '@/lib/types';

export function TransactionDialog() {
  const { isAddingTransaction, transactionTypeToAdd, closeAddTransaction } = useUIStore();
  const { addTransaction } = useTransactionStore();
  const { updateBudgetSpending } = useBudgetStore();
  const categories = useCategoryStore((s) => s.categories);
  const settings = useSettingsStore((s) => s.settings);
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    recurrence: 'none' as RecurrenceType,
  });

  const type = transactionTypeToAdd || 'expense';
  const currency = settings?.currency || 'BDT';
  const filteredCategories = categories.filter((c) => c.type === type);

  const recurrenceOptions: { value: RecurrenceType; labelKey: string }[] = [
    { value: 'none', labelKey: 'oneTime' },
    { value: 'daily', labelKey: 'daily' },
    { value: 'weekly', labelKey: 'weekly' },
    { value: 'monthly', labelKey: 'monthly' },
    { value: 'yearly', labelKey: 'yearly' },
  ];

  // Reset form when dialog opens
  useEffect(() => {
    if (isAddingTransaction) {
      setFormData({
        amount: '',
        categoryId: filteredCategories[0]?.id || '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        recurrence: 'none',
      });
    }
  }, [isAddingTransaction, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.categoryId) return;

    setIsSubmitting(true);
    try {
      const amount = parseFloat(formData.amount);
      
      await addTransaction({
        type,
        amount,
        currency,
        categoryId: formData.categoryId,
        description: formData.description,
        date: new Date(formData.date),
        recurrence: formData.recurrence,
      });

      // Update budget spending if it's an expense
      if (type === 'expense') {
        const date = new Date(formData.date);
        await updateBudgetSpending(
          formData.categoryId,
          date.getMonth() + 1,
          date.getFullYear(),
          amount
        );
      }

      closeAddTransaction();
    } catch (error) {
      console.error('Failed to add transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isAddingTransaction} onOpenChange={(open) => !open && closeAddTransaction()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={cn(
            'text-xl font-semibold',
            type === 'income' ? 'text-emerald' : 'text-foreground'
          )}>
            {type === 'income' ? t('addIncome') : t('addExpense')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t('amount')}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : '€'}
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-8 text-lg font-semibold"
                value={formData.amount}
                onChange={(e) => setFormData((f) => ({ ...f, amount: e.target.value }))}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>{t('category')}</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData((f) => ({ ...f, categoryId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('category')} />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')} ({t('optional')})</Label>
            <Input
              id="description"
              placeholder={t('description')}
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">{t('date')}</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                className="pl-10"
                value={formData.date}
                onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-2">
            <Label>{t('repeat')}</Label>
            <Select
              value={formData.recurrence}
              onValueChange={(value: RecurrenceType) =>
                setFormData((f) => ({ ...f, recurrence: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {recurrenceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      {t(option.labelKey)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={closeAddTransaction}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              className={cn(
                'flex-1',
                type === 'income'
                  ? 'bg-emerald hover:bg-emerald/90'
                  : 'bg-primary hover:bg-primary/90'
              )}
              disabled={isSubmitting || !formData.amount || !formData.categoryId}
            >
              {isSubmitting ? t('loading') : t('addTransaction')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
