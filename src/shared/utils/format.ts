/**
 * Format Utilities
 * Number, currency, date formatting
 */

import { CURRENCY } from '../constants';

/**
 * Format number as currency
 */
export function formatCurrency(amount: number, decimals = 2): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: CURRENCY.code,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format probability as percentage
 */
export function formatProbability(probability: number): string {
  if (probability < 0.00001) {
    return '< 0.001%';
  }
  if (probability > 0.9999) {
    return '> 99.99%';
  }
  return `${(probability * 100).toFixed(3)}%`;
}

/**
 * Format very large numbers in scientific or short notation
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return `${num}`;
}

/**
 * Format odds in 1:X notation
 */
export function formatOdds(probability: number): string {
  if (probability === 0) return '∞:1';
  if (probability === 1) return '1:1';
  const odds = 1 / probability;
  return `1:${Math.round(odds).toLocaleString('ru-RU')}`;
}

/**
 * Format date
 */
export function formatDate(date: Date, format = 'short'): string {
  const options: Intl.DateTimeFormatOptions =
    format === 'short'
      ? { day: '2-digit', month: '2-digit', year: '2-digit' }
      : { year: 'numeric', month: 'long', day: 'numeric' };

  return new Intl.DateTimeFormat('ru-RU', options).format(date);
}

/**
 * Format time duration
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}
