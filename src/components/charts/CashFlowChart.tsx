// Cash flow chart using Recharts
'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCashFlowData, useTranslation } from '@/lib/hooks';
import { useSettingsStore } from '@/lib/stores';
import { formatCompactCurrency } from '@/lib/utils/helpers';

export function CashFlowChart() {
  const { t, getShortMonthName, language } = useTranslation();
  const settings = useSettingsStore((s) => s.settings);
  const currency = settings?.currency || 'BDT';
  
  // Get raw data and translate month names
  const rawData = useCashFlowData(6);
  const data = rawData.map((item, index) => {
    const now = new Date();
    const monthIndex = (now.getMonth() - (5 - index) + 12) % 12;
    return {
      ...item,
      month: getShortMonthName(monthIndex + 1),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald" />
              <span className="text-muted-foreground">{t('chartIncome')}:</span>
              <span className="font-medium">{formatCompactCurrency(payload[0]?.value || 0, currency as any, language)}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-danger" />
              <span className="text-muted-foreground">{t('chartExpense')}:</span>
              <span className="font-medium">{formatCompactCurrency(payload[1]?.value || 0, currency as any, language)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('cashFlowOverview')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={(value) => formatCompactCurrency(value, currency as any, language)}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm text-muted-foreground">
                      {value === 'income' ? t('chartIncome') : t('chartExpense')}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#incomeGradient)"
                  name="income"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fill="url(#expenseGradient)"
                  name="expense"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
