/**
 * LotteryGrid Component
 * Visual representation of lottery grid layout
 * Shows colored circles in grid pattern matching lottery structure
 * Each lottery has its own deterministic pattern based on field configuration
 */

import React, { useMemo } from 'react';
import { cn } from '@/shared/lib/utils';

export interface LotteryGridProps {
  lotteryId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface FieldConfig {
  from: number;      // Total numbers in field
  pick: number;      // Numbers to pick
  rows: number;      // Display rows
  cols: number;      // Display cols
}

interface GridPattern {
  field1: FieldConfig;
  field2?: FieldConfig;
}

// Grid patterns based on actual lottery configurations
const GRID_PATTERNS: Record<string, GridPattern> = {
  lottery_8_1: {
    // 8 из 20 + 1 из 4
    field1: { from: 20, pick: 8, rows: 4, cols: 5 },
    field2: { from: 4, pick: 1, rows: 1, cols: 4 },
  },
  lottery_4_20: {
    // 4 из 20 + 4 из 20
    field1: { from: 20, pick: 4, rows: 4, cols: 5 },
    field2: { from: 20, pick: 4, rows: 4, cols: 5 },
  },
  lottery_12_24: {
    // 12 из 24
    field1: { from: 24, pick: 12, rows: 4, cols: 6 },
  },
  lottery_5_36_1: {
    // 5 из 36 + 1 из 4
    field1: { from: 36, pick: 5, rows: 6, cols: 6 },
    field2: { from: 4, pick: 1, rows: 1, cols: 4 },
  },
  lottery_6_45: {
    // 6 из 45
    field1: { from: 45, pick: 6, rows: 5, cols: 9 },
  },
  lottery_7_49: {
    // 7 из 49
    field1: { from: 49, pick: 7, rows: 7, cols: 7 },
  },
};

const SIZE_CLASSES = {
  sm: {
    circle: 'w-2.5 h-2.5',
    gap: 'gap-0.5',
    fieldGap: 'gap-2',
    container: 'p-2',
  },
  md: {
    circle: 'w-3.5 h-3.5',
    gap: 'gap-1',
    fieldGap: 'gap-3',
    container: 'p-3',
  },
  lg: {
    circle: 'w-5 h-5',
    gap: 'gap-1.5',
    fieldGap: 'gap-4',
    container: 'p-4',
  },
};

/**
 * Generate deterministic "random" selected indices based on seed
 * Uses simple hash-based selection for consistent display
 */
function generateSelectedIndices(seed: string, total: number, pick: number): Set<number> {
  const selected = new Set<number>();
  let hash = 0;
  
  // Simple hash from seed
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  
  // Select indices using hash
  const indices = Array.from({ length: total }, (_, i) => i);
  for (let i = 0; i < pick && i < total; i++) {
    const idx = Math.abs(hash + i * 7919) % (total - i);
    selected.add(indices[idx]);
    indices.splice(idx, 1);
  }
  
  return selected;
}

/**
 * Render a single field grid
 */
const FieldGrid: React.FC<{
  field: FieldConfig;
  seed: string;
  sizeClass: typeof SIZE_CLASSES['sm'];
  isSecondField?: boolean;
}> = ({ field, seed, sizeClass, isSecondField }) => {
  const selectedIndices = useMemo(
    () => generateSelectedIndices(seed, field.from, field.pick),
    [seed, field.from, field.pick]
  );

  const circles = [];
  let idx = 0;
  
  for (let row = 0; row < field.rows; row++) {
    const rowCircles = [];
    for (let col = 0; col < field.cols && idx < field.from; col++) {
      const isSelected = selectedIndices.has(idx);
      rowCircles.push(
        <div
          key={idx}
          className={cn(
            sizeClass.circle,
            'rounded-full transition-colors',
            isSelected
              ? isSecondField
                ? 'bg-purple-500'
                : 'bg-amber-500'
              : 'bg-gray-300 dark:bg-gray-600'
          )}
        />
      );
      idx++;
    }
    circles.push(
      <div key={`row-${row}`} className={cn('flex', sizeClass.gap)}>
        {rowCircles}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', sizeClass.gap)}>
      {circles}
    </div>
  );
};

/**
 * Grid component showing lottery layout
 */
export const LotteryGrid: React.FC<LotteryGridProps> = ({
  lotteryId,
  size = 'md',
  className,
}) => {
  const pattern = GRID_PATTERNS[lotteryId];
  if (!pattern) {
    return null;
  }

  const sizeClass = SIZE_CLASSES[size];

  return (
    <div className={cn('flex', sizeClass.fieldGap, sizeClass.container, className)}>
      <FieldGrid
        field={pattern.field1}
        seed={`${lotteryId}-field1`}
        sizeClass={sizeClass}
      />
      {pattern.field2 && (
        <>
          <div className="w-px bg-gray-300 dark:bg-gray-600" />
          <FieldGrid
            field={pattern.field2}
            seed={`${lotteryId}-field2`}
            sizeClass={sizeClass}
            isSecondField
          />
        </>
      )}
    </div>
  );
};
