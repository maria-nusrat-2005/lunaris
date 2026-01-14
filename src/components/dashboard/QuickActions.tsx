// Quick action buttons for adding transactions
'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/stores';
import { useTranslation } from '@/lib/hooks';

export function QuickActions() {
  const { openAddTransaction } = useUIStore();
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex flex-wrap gap-3"
    >
      <Button
        size="lg"
        className="gap-2 bg-emerald hover:bg-emerald/90 text-white shadow-lg shadow-emerald/25"
        onClick={() => openAddTransaction('income')}
      >
        <TrendingUp className="w-5 h-5" />
        {t('addIncome')}
      </Button>
      
      <Button
        size="lg"
        variant="outline"
        className="gap-2 border-danger/30 text-danger hover:bg-danger/10 hover:text-danger"
        onClick={() => openAddTransaction('expense')}
      >
        <TrendingDown className="w-5 h-5" />
        {t('addExpense')}
      </Button>
    </motion.div>
  );
}
