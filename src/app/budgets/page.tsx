// Budgets Page
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Wallet, AlertCircle, Circle, MoreVertical, Edit, Trash2, type LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ViewerGuard } from '@/components/auth';
import { cn } from '@/lib/utils';
import { useBudgetStore, useCategoryStore, useSettingsStore, useAuthStore, useUIStore } from '@/lib/stores';
import { useTranslation, useBudgetProgress } from '@/lib/hooks';
import { formatCurrency, formatPercentage, getProgressColor, localizeNumbers } from '@/lib/utils/helpers';

export default function BudgetsPage() {
  const budgets = useBudgetStore((s) => s.budgets);
  const addBudget = useBudgetStore((s) => s.addBudget);
  const updateBudget = useBudgetStore((s) => s.updateBudget);
  const deleteBudget = useBudgetStore((s) => s.deleteBudget);
  const getCurrentMonthBudgets = useBudgetStore((s) => s.getCurrentMonthBudgets);
  const categories = useCategoryStore((s) => s.categories);
  const settings = useSettingsStore((s) => s.settings);
  const { canEdit, canDelete } = useAuthStore();
  const { t, getMonthName, language } = useTranslation();
  const { getSpentAmount } = useBudgetProgress();
  const { 
    activeDialog, 
    openDialog, 
    closeDialog, 
    editingBudgetId,
    editingBudgetData,
    openEditBudget,
    closeEditBudget
  } = useUIStore();

  const isDialogOpen = activeDialog === 'budget';
  const isEdit = !!editingBudgetId;

  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    rolloverEnabled: false,
  });

  const currency = settings?.currency || 'BDT';
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentBudgets = getCurrentMonthBudgets();
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Categories that don't have a budget yet
  const availableCategories = expenseCategories.filter(
    (c) => !currentBudgets.some((b) => b.categoryId === c.id)
  );

  // Effect to populate form for editing
  useEffect(() => {
    if (isDialogOpen) {
      if (editingBudgetId && editingBudgetData) {
        setFormData({
          categoryId: editingBudgetData.categoryId,
          amount: editingBudgetData.amount.toString(),
          rolloverEnabled: editingBudgetData.rolloverEnabled || false,
        });
      } else {
        setFormData({
            categoryId: '',
            amount: '',
            rolloverEnabled: false,
        });
      }
    }
  }, [isDialogOpen, editingBudgetId, editingBudgetData]);

  const getIcon = (iconName: string): LucideIcon => {
    const icons = LucideIcons as unknown as Record<string, LucideIcon>;
    return icons[iconName] || Circle;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.amount) return;

    if (isEdit && editingBudgetId) {
        await updateBudget(editingBudgetId, {
          categoryId: formData.categoryId,
          amount: parseFloat(formData.amount),
          rolloverEnabled: formData.rolloverEnabled,
        });
        closeEditBudget();
    } else {
        await addBudget({
          categoryId: formData.categoryId,
          amount: parseFloat(formData.amount),
          currency,
          month: currentMonth,
          year: currentYear,
          rolloverEnabled: formData.rolloverEnabled,
        });
        // Clear form and close dialog
        setFormData({ categoryId: '', amount: '', rolloverEnabled: false });
        closeDialog();
    }
  };

  const handleOpenAdd = () => {
      // Ensure we clear any previous edit state
      closeEditBudget(); 
      openDialog('budget');
  };

  // Calculate totals
  const totalBudget = currentBudgets.reduce((sum, b) => sum + b.amount + b.rolloverAmount, 0);
  // Calculate total spent dynamically
  const totalSpent = currentBudgets.reduce((sum, b) => sum + getSpentAmount(b.categoryId, b.month, b.year), 0);
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

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
            <h1 className="text-3xl font-bold tracking-tight">{t('budgets')}</h1>
            <p className="text-muted-foreground">
              {getMonthName(currentMonth)} {localizeNumbers(currentYear.toString(), language)}
            </p>
          </div>
          {canEdit() && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeEditBudget()}>
              <DialogTrigger asChild>
                <Button className="gap-2" disabled={availableCategories.length === 0 && !isEdit} onClick={handleOpenAdd}>
                  <Plus className="w-4 h-4" />
                  {t('addBudget')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEdit ? t('editBudget') : t('createNewBudget')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                  <div className="space-y-2">
                    <Label>{t('category')}</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData((f) => ({ ...f, categoryId: value }))}
                      disabled={isEdit} // Disable category change when editing
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('category')} />
                      </SelectTrigger>
                      <SelectContent>
                        {isEdit ? (
                            // Show current category if editing
                             <SelectItem key={formData.categoryId} value={formData.categoryId || 'temp'}>
                                {(() => {
                                    const c = categories.find(cat => cat.id === formData.categoryId);
                                    return c ? t(c.name.toLowerCase().replace(/ & /g, '').replace(/ /g, '')) : t('category');
                                })()}
                             </SelectItem>
                        ) : (
                             availableCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  {t(category.name.toLowerCase().replace(/ & /g, '').replace(/ /g, ''))}
                                </div>
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('monthlyLimit')}</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData((f) => ({ ...f, amount: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => closeEditBudget()}>
                      {t('cancel')}
                    </Button>
                    <Button type="submit" className="flex-1">
                      {isEdit ? t('update') : t('create')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        {/* Overview card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="shadow-soft bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{t('overallBudgetStatus')}</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(totalSpent, currency as any, language)}{' '}
                    <span className="text-lg font-normal text-muted-foreground">
                      / {formatCurrency(totalBudget, currency as any, language)}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(totalBudget - totalSpent, currency as any, language)} {t('remaining')}
                  </p>
                </div>
                <div className="flex-1 max-w-md">
                  <Progress 
                    value={Math.min(overallProgress, 100)} 
                    className="h-4"
                    style={{ 
                      '--progress-color': getProgressColor(overallProgress) 
                    } as React.CSSProperties}
                  />
                  <p className="text-right text-sm text-muted-foreground mt-1">
                    {formatPercentage(overallProgress, 1, language)} {t('used')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget cards grid */}
        {currentBudgets.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-2">{t('noBudgetsSet')}</p>
                <p className="text-muted-foreground mb-4">
                  {t('createBudgetDesc')}
                </p>
                {canEdit() && (
                  <Button onClick={handleOpenAdd}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('createFirstBudget')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentBudgets.map((budget, index) => {
              const category = categories.find((c) => c.id === budget.categoryId);
              const Icon = getIcon(category?.icon || 'Circle');
              const totalAmount = budget.amount + budget.rolloverAmount;
              const spent = getSpentAmount(budget.categoryId, budget.month, budget.year);
              const progress = totalAmount > 0 ? (spent / totalAmount) * 100 : 0;
              const remaining = totalAmount - spent;
              const isOverBudget = remaining < 0;

              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className={cn(
                    'shadow-soft transition-all hover:shadow-lg',
                    isOverBudget && 'border-danger/50'
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${category?.color}20` }}
                          >
                            <Icon className="w-5 h-5" style={{ color: category?.color }} />
                          </div>
                          <CardTitle className="text-base font-semibold">
                            {category ? t(category.name.toLowerCase().replace(/ & /g, '').replace(/ /g, '')) : t('other')}
                          </CardTitle>
                        </div>
                        {canEdit() && (
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="-mr-2">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditBudget(budget.id, budget)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        {t('edit')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => deleteBudget(budget.id)}>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        {t('delete')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                             </DropdownMenu>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">{t('spent')}</span>
                          <span className="font-medium">
                            {formatCurrency(spent, currency as any, language)} / {formatCurrency(totalAmount, currency as any, language)}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(progress, 100)}
                          className="h-2"
                          style={{
                            '--progress-color': getProgressColor(progress),
                          } as React.CSSProperties}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {isOverBudget ? t('overBudget') : t('remaining')}
                        </span>
                        <span className={cn(
                          'font-medium',
                          isOverBudget ? 'text-danger' : 'text-emerald'
                        )}>
                          {isOverBudget ? '-' : ''}{formatCurrency(Math.abs(remaining), currency as any, language)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
