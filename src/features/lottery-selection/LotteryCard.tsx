/**
 * LotteryCard Component
 * Display lottery with visual grid and selection option
 */

import React from 'react';
import { LotteryGrid } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';

export interface LotteryCardProps {
  id: string;
  name: string;
  description: string;
  available: boolean;
  onSelect: (lotteryId: string) => void;
}

export const LotteryCard: React.FC<LotteryCardProps> = ({
  id,
  name,
  description,
  available,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={() => available && onSelect(id)}
      disabled={!available}
      className={cn(
        'w-full rounded-2xl p-5 text-left transition-all',
        'border border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-800 shadow-card',
        available && 'hover:border-amber-400 hover:shadow-lg active:scale-[0.98] cursor-pointer',
        !available && 'opacity-60 cursor-not-allowed'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        {!available && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            Скоро
          </span>
        )}
      </div>

      {/* Visual grid representation */}
      <div className="flex justify-center py-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-4">
        <LotteryGrid lotteryId={id} size="sm" />
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <span className={cn(
          'inline-flex h-2 w-2 rounded-full',
          available ? 'bg-amber-500' : 'bg-gray-400'
        )} />
        <span>{available ? 'Доступна для расчётов' : 'Скоро станет доступна'}</span>
      </div>
    </button>
  );
};
