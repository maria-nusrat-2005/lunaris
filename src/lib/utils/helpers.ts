// Utility functions for Clarity Finance
import { type Currency, type Language } from '@/lib/types';

// Currency formatting - language-aware
const currencySymbols: Record<Currency, string> = {
  BDT: '৳',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

const currencyPosition: Record<Currency, 'before' | 'after'> = {
  BDT: 'before',
  USD: 'before',
  EUR: 'after',
  GBP: 'before',
  INR: 'before',
};

// Format currency with language awareness - uses English numerals for English language
export function formatCurrency(amount: number, currency: Currency = 'BDT', language: Language = 'en'): string {
  const symbol = currencySymbols[currency];
  const position = currencyPosition[currency];
  
  // Always use English locale for English language, Bangla locale only for Bangla language
  const locale = language === 'bn' ? 'bn-BD' : 'en-US';
  
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return position === 'before'
    ? `${symbol}${formatted}`
    : `${formatted} ${symbol}`;
}

// Compact currency format
export function formatCompactCurrency(amount: number, currency: Currency = 'BDT', language: Language = 'en'): string {
  const symbol = currencySymbols[currency];
  const position = currencyPosition[currency];
  
  let formatted: string;
  if (amount >= 10000000) {
    formatted = `${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    formatted = `${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    formatted = `${(amount / 1000).toFixed(1)}K`;
  } else {
    formatted = amount.toFixed(0);
  }

  return position === 'before'
    ? `${symbol}${formatted}`
    : `${formatted}${symbol}`;
}

// Date formatting
export function formatDate(date: Date | string, format: string = 'dd/MM/yyyy'): string {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year.toString());
}

export function formatRelativeDate(date: Date | string, language: Language = 'en'): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (language === 'bn') {
    if (days === 0) return 'আজ';
    if (days === 1) return 'গতকাল';
    if (days < 7) return `${days} দিন আগে`;
    if (days < 30) return `${Math.floor(days / 7)} সপ্তাহ আগে`;
    if (days < 365) return `${Math.floor(days / 30)} মাস আগে`;
    return `${Math.floor(days / 365)} বছর আগে`;
  }

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
}

export function getShortMonthName(month: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1];
}

// Percentage formatting
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

// Color utilities
export function getProgressColor(percentage: number): string {
  if (percentage <= 50) return '#10B981'; // Green
  if (percentage <= 75) return '#F59E0B'; // Yellow/Warning
  if (percentage <= 90) return '#F97316'; // Orange
  return '#EF4444'; // Red/Danger
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Deep clone
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}
