// Dashboard metric card component
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercentage, localizeNumbers } from '@/lib/utils/helpers';
import { useTranslation } from '@/lib/hooks';

interface MetricCardProps {
  title: string;
  value: number;
  currency?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: number;
  delay?: number;
  isPercentage?: boolean;
}

export function MetricCard({
  title,
  value,
  currency,
  icon: Icon,
  iconColor = 'text-muted-foreground/70',
  iconBgColor = 'bg-secondary/30',
  trend,
  delay = 0,
  isPercentage = false,
}: MetricCardProps) {
  const { language } = useTranslation();
  
  const displayValue = isPercentage 
    ? formatPercentage(value, 1, language)
    : formatCurrency(value, (currency || 'BDT') as any, language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="shadow-soft hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {displayValue}
              </p>
              {trend !== undefined && (
                <p className={cn(
                  'text-xs font-medium',
                  trend >= 0 ? 'text-emerald' : 'text-danger'
                )}>
                  {trend >= 0 ? '+' : ''}{localizeNumbers(trend.toFixed(1), language)}%
                </p>
              )}
            </div>
            <div className={cn('p-3 rounded-xl', iconBgColor)}>
              <Icon className={cn('w-6 h-6', iconColor)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface MetricGridProps {
  children: ReactNode;
}

export function MetricGrid({ children }: MetricGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
}
