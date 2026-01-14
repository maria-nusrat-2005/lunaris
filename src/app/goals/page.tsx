// Goals Page
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, CheckCircle2, Sparkles, TrendingUp, Calendar, MoreVertical, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useGoalStore, useSettingsStore } from '@/lib/stores';
import { useTranslation } from '@/lib/hooks';
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils/helpers';

// Simple confetti effect
function Confetti() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; color: string }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'][Math.floor(Math.random() * 5)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full"
          style={{ backgroundColor: particle.color, left: `${particle.x}%` }}
          initial={{ y: -20, opacity: 1, scale: 1 }}
          animate={{
            y: window.innerHeight + 20,
            opacity: 0,
            rotate: 360 * 3,
            scale: 0,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

const goalColors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444', '#0EA5E9', '#6366F1'];

export default function GoalsPage() {
  const goals = useGoalStore((s) => s.goals);
  const addGoal = useGoalStore((s) => s.addGoal);
  const addContribution = useGoalStore((s) => s.addContribution);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);
  const getGoalProgress = useGoalStore((s) => s.getGoalProgress);
  const justCompletedGoalId = useGoalStore((s) => s.justCompletedGoalId);
  const clearJustCompletedGoal = useGoalStore((s) => s.clearJustCompletedGoal);
  const settings = useSettingsStore((s) => s.settings);
  const { t, language } = useTranslation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contributionDialogGoalId, setContributionDialogGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    icon: 'Target',
    color: '#3B82F6',
  });
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const currency = settings?.currency || 'BDT';
  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  // Clear confetti after showing
  useEffect(() => {
    if (justCompletedGoalId) {
      const timer = setTimeout(() => clearJustCompletedGoal(), 3000);
      return () => clearTimeout(timer);
    }
  }, [justCompletedGoalId, clearJustCompletedGoal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) return;

    await addGoal({
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currency,
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
      icon: formData.icon,
      color: formData.color,
    });

    setFormData({ name: '', targetAmount: '', deadline: '', icon: 'Target', color: '#3B82F6' });
    setIsDialogOpen(false);
  };

  const handleContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributionDialogGoalId || !contributionAmount) return;

    await addContribution(contributionDialogGoalId, parseFloat(contributionAmount));
    setContributionAmount('');
    setContributionDialogGoalId(null);
  };

  const renderGoalCard = (goal: typeof goals[0], index: number) => {
    const progress = getGoalProgress(goal.id);
    const remaining = goal.targetAmount - goal.currentAmount;

    return (
      <motion.div
        key={goal.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card className={cn(
          'shadow-soft transition-all hover:shadow-lg',
          goal.isCompleted && 'border-emerald/50 bg-emerald/5'
        )}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: goal.color }}
                >
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">{goal.name}</CardTitle>
                  {goal.deadline && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(goal.deadline)}
                    </p>
                  )}
                </div>
              </div>
              {goal.isCompleted ? (
                <Badge className="gap-1 bg-emerald text-white">
                  <CheckCircle2 className="w-3 h-3" />
                  {t('completed')}
                </Badge>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setContributionDialogGoalId(goal.id)}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {t('addSavings')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => deleteGoal(goal.id)}>
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
                <span className="text-muted-foreground">{t('progress')}</span>
                <span className="font-medium">
                  {formatCurrency(goal.currentAmount, currency as any, language)} / {formatCurrency(goal.targetAmount, currency as any, language)}
                </span>
              </div>
              <Progress
                value={progress}
                className="h-3"
                style={{
                  '--progress-color': goal.isCompleted ? '#10B981' : goal.color,
                } as React.CSSProperties}
              />
              <p className="text-right text-sm text-muted-foreground mt-1">
                {formatPercentage(progress)}
              </p>
            </div>
            
            {!goal.isCompleted && (
              <div className="flex justify-between items-center pt-2">
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(remaining, currency as any, language)} {t('toGo')}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setContributionDialogGoalId(goal.id)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('addSavings')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <AppShell>
    <div className="space-y-6">
      {/* Confetti celebration */}
      <AnimatePresence>
        {justCompletedGoalId && <Confetti />}
      </AnimatePresence>

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('savingsGoals')}</h1>
          <p className="text-muted-foreground">{t('trackProgress')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t('newGoal')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('createSavingsGoal')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label>{t('goalName')}</Label>
                <Input
                  placeholder={t('goalName')}
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t('targetAmount')}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData((f) => ({ ...f, targetAmount: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t('targetDate')} ({t('optional')})</Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData((f) => ({ ...f, deadline: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('color')}</Label>
                <div className="flex gap-2 flex-wrap">
                  {goalColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        'w-8 h-8 rounded-full transition-all',
                        formData.color === color && 'ring-2 ring-offset-2 ring-primary'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData((f) => ({ ...f, color }))}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" className="flex-1">
                  {t('createGoal')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Add savings dialog */}
      <Dialog open={!!contributionDialogGoalId} onOpenChange={(open) => !open && setContributionDialogGoalId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addSavings')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleContribution} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label>{t('amount')}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setContributionDialogGoalId(null)}>
                {t('cancel')}
              </Button>
              <Button type="submit" className="flex-1 bg-emerald hover:bg-emerald/90">
                {t('addSavings')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <Target className="w-4 h-4" />
            {t('active')} ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {t('completed')} ({completedGoals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeGoals.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-2">{t('noActiveGoals')}</p>
                  <p className="text-muted-foreground mb-4">
                    {t('setGoalDesc')}
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('createFirstGoal')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGoals.map((goal, index) => renderGoalCard(goal, index))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedGoals.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-2">{t('noCompletedGoals')}</p>
                  <p className="text-muted-foreground">
                    {t('keepSaving')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedGoals.map((goal, index) => renderGoalCard(goal, index))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </AppShell>
  );
}
