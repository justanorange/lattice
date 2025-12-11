/**
 * TicketVisualization Component
 * Display lottery ticket with visual grid of selected numbers
 * Numbers are highlighted in different colors based on their selection
 */

import React from 'react';
import type { Ticket, Lottery } from '@/entities/lottery/types';
import { cn } from '@/shared/lib/utils';

export interface TicketVisualizationProps {
  ticket: Ticket;
  lottery: Lottery;
  className?: string;
}

interface GridConfig {
  totalNumbers: number;
  selected: number;
  columns: number;
}

const GRID_LAYOUTS: Record<string, GridConfig[]> = {
  lottery_8_1: [
    { totalNumbers: 20, selected: 8, columns: 5 },
    { totalNumbers: 4, selected: 1, columns: 4 },
  ],
  lottery_4_20: [
    { totalNumbers: 20, selected: 4, columns: 4 },
    { totalNumbers: 20, selected: 4, columns: 4 },
  ],
  lottery_12_24: [
    { totalNumbers: 24, selected: 12, columns: 6 },
  ],
  lottery_5_36_1: [
    { totalNumbers: 36, selected: 5, columns: 6 },
    { totalNumbers: 4, selected: 1, columns: 4 },
  ],
  lottery_6_45: [
    { totalNumbers: 45, selected: 6, columns: 9 },
  ],
  lottery_7_49: [
    { totalNumbers: 49, selected: 7, columns: 7 },
  ],
};

/**
 * Visualize a single lottery ticket with numbered grid
 */
export const TicketVisualization: React.FC<TicketVisualizationProps> = ({
  ticket,
  lottery,
  className,
}) => {
  const layouts = GRID_LAYOUTS[lottery.id] || [];
  if (layouts.length === 0) {
    return <div className="p-4 text-sm text-gray-600">Макет билета не поддерживается</div>;
  }

  // Determine layout direction: 4из20 has fields side-by-side, others top-to-bottom
  const isSideBySide = lottery.id === 'lottery_4_20' && layouts.length === 2;

  return (
    <div className={cn('p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-x-auto', className)}>
      <div className={cn('min-w-min', isSideBySide ? 'flex gap-8' : 'space-y-4')}>
        {/* Field 1 */}
        {layouts[0] && (
          <div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Поле 1: {layouts[0].selected} из {layouts[0].totalNumbers}
            </div>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${layouts[0].columns}, minmax(2rem, 1fr))`,
                width: `${Math.min(layouts[0].columns * 40, 100)}%`,
              }}
            >
              {Array.from({ length: layouts[0].totalNumbers }, (_, i) => {
                const num = i + 1;
                const isSelected = ticket.field1?.includes(num);
                return (
                  <div
                    key={`f1-${i}`}
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold border',
                      isSelected
                        ? 'bg-amber-500 dark:bg-amber-600 text-white border-amber-600 dark:border-amber-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                    )}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Field 2 (if exists) */}
        {layouts[1] && ticket.field2 && (
          <div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Поле 2: {layouts[1].selected} из {layouts[1].totalNumbers}
            </div>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${layouts[1].columns}, minmax(2rem, 1fr))`,
                width: `${Math.min(layouts[1].columns * 40, 100)}%`,
              }}
            >
              {Array.from({ length: layouts[1].totalNumbers }, (_, i) => {
                const num = i + 1;
                const isSelected = ticket.field2?.includes(num);
                return (
                  <div
                    key={`f2-${i}`}
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold border',
                      isSelected
                        ? 'bg-amber-500 dark:bg-amber-600 text-white border-amber-600 dark:border-amber-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                    )}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
