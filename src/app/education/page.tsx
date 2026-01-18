// Student Education Page with dynamic expense tracking
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Plus,
  Calendar,
  TrendingUp,
  PieChart,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useEducationStore, useSettingsStore, useAuthStore, DEFAULT_EDUCATION_CATEGORIES } from '@/lib/stores';
import { formatCurrency } from '@/lib/utils/format';
import type { EducationCategoryId } from '@/lib/stores';
import { useRouter } from 'next/navigation';

export default function EducationPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const settings = useSettingsStore((s) => s.settings);
  const currency = settings?.currency || 'BDT';
  
  const {
    budgets,
    expenses,
    semesters,
    activeSemesterId,
    setActiveSemester,
    addBudget,
    addExpense,
    deleteExpense,
    getTotalBudget,
    getTotalExpenses,
    getBudgetsByCategory,
    getExpensesByCategory,
  } = useEducationStore();

  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  
  // Form state
  const [selectedCategory, setSelectedCategory] = useState<EducationCategoryId>('books');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetCategory, setBudgetCategory] = useState<EducationCategoryId>('tuition');

  // Redirect non-students
  useEffect(() => {
    if (user && user.occupation !== 'student') {
      router.push('/');
    }
  }, [user, router]);

  // If not a student, show nothing
  if (!user || user.occupation !== 'student') {
    return null;
  }

  const selectedSemester = activeSemesterId || semesters[0]?.id;
  
  // Get category data
  const budgetsByCategory = getBudgetsByCategory(selectedSemester);
  const expensesByCategory = getExpensesByCategory(selectedSemester);
  const totalBudget = getTotalBudget(selectedSemester);
  const totalExpenses = getTotalExpenses(selectedSemester);
  const totalRemaining = totalBudget - totalExpenses;

  // Build category stats
  const categoryStats = DEFAULT_EDUCATION_CATEGORIES.map(cat => {
    const budget = budgetsByCategory.get(cat.id) || 0;
    const spent = expensesByCategory.get(cat.id) || 0;
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    
    return {
      ...cat,
      budget,
      spent,
      percentage: Math.min(percentage, 100),
      remaining: Math.max(budget - spent, 0),
    };
  }).filter(cat => cat.budget > 0 || cat.spent > 0);

  // Handle add expense
  const handleAddExpense = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    addExpense({
      categoryId: selectedCategory,
      amount: parseFloat(amount),
      description: description || DEFAULT_EDUCATION_CATEGORIES.find(c => c.id === selectedCategory)?.name || '',
      date: new Date(),
      semesterId: selectedSemester,
    });
    
    setAmount('');
    setDescription('');
    setExpenseDialogOpen(false);
  };

  // Handle add budget
  const handleAddBudget = () => {
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) return;
    
    addBudget({
      categoryId: budgetCategory,
      amount: parseFloat(budgetAmount),
      semesterId: selectedSemester,
    });
    
    setBudgetAmount('');
    setBudgetDialogOpen(false);
  };

  // Recent expenses for selected semester
  const recentExpenses = expenses
    .filter(e => e.semesterId === selectedSemester)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const tips = [
    "📚 Buy used textbooks or rent digital versions to save money",
    "🚌 Consider a semester bus pass for regular transport savings",
    "🍱 Meal prep on weekends to reduce daily food costs",
    "💡 Use student discounts - many apps and services offer 50% off!",
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              Education Expenses
            </h1>
            <p className="text-muted-foreground">
              Track and manage your educational spending
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Semester Selector */}
            <Select value={selectedSemester} onValueChange={setActiveSemester}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((sem) => (
                  <SelectItem key={sem.id} value={sem.id}>
                    {sem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => setBudgetDialogOpen(true)}>
              Set Budget
            </Button>
            
            <Button className="gap-2" onClick={() => setExpenseDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalBudget, currency)}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-amber-500">
                    {formatCurrency(totalExpenses, currency)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-500" />
                </div>
              </div>
              {totalBudget > 0 && (
                <Progress 
                  value={(totalExpenses / totalBudget) * 100} 
                  className="mt-4 h-2"
                />
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    totalRemaining >= 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {formatCurrency(totalRemaining, currency)}
                  </p>
                </div>
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  totalRemaining >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"
                )}>
                  <GraduationCap className={cn(
                    "w-6 h-6",
                    totalRemaining >= 0 ? "text-emerald-500" : "text-red-500"
                  )} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Breakdown */}
        {categoryStats.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Category Breakdown</CardTitle>
                <CardDescription>Your spending by education category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryStats.map((cat, index) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-xl border border-border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          {cat.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{cat.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(cat.spent, currency)} of {formatCurrency(cat.budget, currency)}
                          </p>
                        </div>
                        <span className={cn(
                          "text-sm font-medium",
                          cat.percentage >= 90 ? "text-red-500" : 
                          cat.percentage >= 70 ? "text-amber-500" : "text-emerald-500"
                        )}>
                          {cat.percentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress 
                        value={cat.percentage} 
                        className="h-2"
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="shadow-soft">
            <CardContent className="p-12 text-center">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-medium mb-2">No budgets set yet</h3>
              <p className="text-muted-foreground mb-4">
                Set up your education budgets to start tracking expenses
              </p>
              <Button onClick={() => setBudgetDialogOpen(true)}>
                Set Your First Budget
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Expenses */}
        {recentExpenses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentExpenses.map((expense) => {
                    const cat = DEFAULT_EDUCATION_CATEGORIES.find(c => c.id === expense.categoryId);
                    return (
                      <div 
                        key={expense.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{cat?.icon}</span>
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(expense.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCurrency(expense.amount, currency)}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => deleteExpense(expense.id)}
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Student Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="shadow-soft bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                💡 Money-Saving Tips for Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tips.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="p-3 rounded-lg bg-background/50 text-sm"
                  >
                    {tip}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Expense Dialog */}
        <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Education Expense</DialogTitle>
              <DialogDescription>Record a new education-related expense</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={(v: EducationCategoryId) => setSelectedCategory(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_EDUCATION_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="e.g., Calculus textbook"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setExpenseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddExpense}>
                  Add Expense
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Set Budget Dialog */}
        <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Category Budget</DialogTitle>
              <DialogDescription>Set a budget for an education category</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={budgetCategory} onValueChange={(v: EducationCategoryId) => setBudgetCategory(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_EDUCATION_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Budget Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter budget amount"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setBudgetDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddBudget}>
                  Set Budget
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
