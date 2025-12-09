/**
 * LotteryGrid Component
 * Visual representation of lottery grid layout
 * Shows colored circles in grid pattern matching lottery structure
 */

import React from "react";
import { cn } from "../lib/utils";

export interface LotteryGridProps {
  lotteryId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

interface GridPattern {
  rows: number;
  cols: number;
  field1Count: number;
  field2?: {
    rows: number;
    cols: number;
    count: number;
  };
}

const GRID_PATTERNS: Record<string, GridPattern> = {
  lottery_8_1: {
    rows: 5,
    cols: 5,
    field1Count: 20, // 8 из 20
    field2: { rows: 1, cols: 4, count: 4 }, // 1 из 4
  },
  lottery_4_20_fixed: {
    rows: 5,
    cols: 8,
    field1Count: 20, // 4 из 20 в первом поле
    field2: { rows: 5, cols: 4, count: 20 }, // и 4 из 20 во втором поле
  },
  lottery_4_20_percent: {
    rows: 5,
    cols: 8,
    field1Count: 20,
    field2: { rows: 5, cols: 4, count: 20 },
  },
  lottery_12_24: {
    rows: 4,
    cols: 6,
    field1Count: 24, // 12 из 24
  },
  lottery_5_36_1: {
    rows: 6,
    cols: 6,
    field1Count: 36, // 5 из 36
    field2: { rows: 1, cols: 4, count: 4 }, // 1 из 4
  },
  lottery_6_45: {
    rows: 5,
    cols: 9,
    field1Count: 45, // 6 из 45
  },
  lottery_7_49: {
    rows: 7,
    cols: 7,
    field1Count: 49, // 7 из 49
  },
};

const SIZE_CLASSES = {
  sm: {
    circle: "w-3 h-3",
    gap: "gap-1",
    container: "p-2",
  },
  md: {
    circle: "w-4 h-4",
    gap: "gap-1.5",
    container: "p-3",
  },
  lg: {
    circle: "w-5 h-5",
    gap: "gap-2",
    container: "p-4",
  },
};

/**
 * Get random color for visual variety
 */
function getRandomColor(): string {
  const colors = [
    "bg-red-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-purple-400",
    "bg-pink-400",
    "bg-indigo-400",
    "bg-cyan-400",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Grid component showing lottery layout
 */
export const LotteryGrid: React.FC<LotteryGridProps> = ({
  lotteryId,
  size = "md",
  className,
}) => {
  const pattern = GRID_PATTERNS[lotteryId];
  if (!pattern) {
    return null;
  }

  const sizeClass = SIZE_CLASSES[size];

  return (
    <div className={cn(sizeClass.container, className)}>
      <div className={cn("flex flex-col", sizeClass.gap)}>
        {/* Field 1 */}
        <div className={cn("flex flex-wrap", sizeClass.gap)}>
          {Array.from({ length: pattern.field1Count }).map((_, idx) => (
            <div
              key={`field1-${idx}`}
              className={cn(
                sizeClass.circle,
                "rounded-full",
                idx < Math.ceil(pattern.field1Count * 0.4)
                  ? getRandomColor()
                  : "bg-gray-300 dark:bg-gray-600"
              )}
            />
          ))}
        </div>

        {/* Field 2 (if exists) */}
        {pattern.field2 && (
          <div className={cn("flex flex-wrap", sizeClass.gap, "mt-1")}>
            {Array.from({ length: pattern.field2.count }).map((_, idx) => (
              <div
                key={`field2-${idx}`}
                className={cn(
                  sizeClass.circle,
                  "rounded-full",
                  idx < Math.ceil(pattern.field2!.count * 0.25)
                    ? getRandomColor()
                    : "bg-gray-300 dark:bg-gray-600"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
