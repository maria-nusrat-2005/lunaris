// Translation hook for easy access to translations
'use client';

import { useMemo } from 'react';
import { useSettingsStore } from '@/lib/stores';
import { t as translate, getMonthName as getMonth, getShortMonthName as getShortMonth, formatNumber as formatNum } from '@/lib/i18n';
import type { Language } from '@/lib/types';

export function useTranslation() {
  const settings = useSettingsStore((s) => s.settings);
  const language: Language = settings?.language || 'en';

  const helpers = useMemo(() => ({
    t: (key: string) => translate(key, language),
    language,
    getMonthName: (month: number) => getMonth(month, language),
    getShortMonthName: (month: number) => getShortMonth(month, language),
    formatNumber: (num: number) => formatNum(num, language),
  }), [language]);

  return helpers;
}
