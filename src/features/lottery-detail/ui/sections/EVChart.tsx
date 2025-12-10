/**
 * EV Chart Section
 * Visual chart showing EV vs Superprice relationship
 */

import { useMemo } from 'react';
import { Card, CardHeader, CardBody } from '@/shared/ui';
import { TrendingUp, Target } from 'lucide-react';
import { calculateEV } from '@/entities/lottery/calculation';
import type { Lottery, PrizeTable } from '@/entities/lottery/types';

interface EVChartProps {
  lottery: Lottery;
  prizeTable: PrizeTable;
  ticketCost: number;
  currentSuperprice: number;
}

/**
 * Calculate breakeven superprice where EV = 0
 */
function findBreakevenSuperprice(
  lottery: Lottery,
  prizeTable: PrizeTable,
  ticketCost: number
): number | null {
  // Binary search for EV = 0 point
  let low = 0;
  let high = 1_000_000_000; // 1 billion
  const tolerance = 1000; // 1000 rubles precision

  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const ev = calculateEV(lottery, mid, prizeTable, ticketCost);

    if (Math.abs(ev.expectedValue) < tolerance) {
      return Math.round(mid);
    }

    if (ev.expectedValue < 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  // If breakeven is beyond reasonable superprice
  const evAtMax = calculateEV(lottery, high, prizeTable, ticketCost);
  if (evAtMax.expectedValue < 0) {
    return null; // Never profitable
  }

  return Math.round((low + high) / 2);
}

/**
 * Format amount for display (compact)
 */
function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}млрд`;
  } else if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(0)}млн`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}к`;
  }
  return amount.toString();
}

/**
 * Generate chart data points - adapt range to current superprice
 */
function generateChartPoints(
  lottery: Lottery,
  prizeTable: PrizeTable,
  ticketCost: number,
  currentSuperprice: number
): { superprice: number; ev: number }[] {
  const points: { superprice: number; ev: number }[] = [];
  
  // Adapt range based on current superprice
  // Show from 10% of current to 10x of current (or min 100k to max 1B)
  const minSp = Math.max(100_000, Math.floor(currentSuperprice * 0.1));
  const maxSp = Math.min(1_000_000_000, Math.max(currentSuperprice * 10, 10_000_000));
  
  // Calculate step to get ~20-30 points
  const range = maxSp - minSp;
  const step = Math.ceil(range / 25 / 100_000) * 100_000; // Round to 100k

  for (let sp = minSp; sp <= maxSp; sp += step) {
    const ev = calculateEV(lottery, sp, prizeTable, ticketCost);
    points.push({ superprice: sp, ev: ev.expectedValue });
  }

  return points;
}

export const EVChart: React.FC<EVChartProps> = ({
  lottery,
  prizeTable,
  ticketCost,
  currentSuperprice,
}) => {
  // Memoize calculations that depend on lottery/prizeTable/ticketCost
  const breakevenSuperprice = useMemo(() => 
    findBreakevenSuperprice(lottery, prizeTable, ticketCost),
    [lottery, prizeTable, ticketCost]
  );

  const currentEV = useMemo(() => 
    calculateEV(lottery, currentSuperprice, prizeTable, ticketCost),
    [lottery, currentSuperprice, prizeTable, ticketCost]
  );

  const chartPoints = useMemo(() => 
    generateChartPoints(lottery, prizeTable, ticketCost, currentSuperprice),
    [lottery, prizeTable, ticketCost, currentSuperprice]
  );

  // Find min/max EV for scaling
  const evValues = chartPoints.map((p) => p.ev);
  const minEV = Math.min(...evValues);
  const maxEV = Math.max(...evValues);
  const evRange = maxEV - minEV || 1;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="size-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            EV по суперпризу
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Как размер суперприза влияет на математическое ожидание
        </p>
      </CardHeader>
      <CardBody>
        {/* Breakeven info */}
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <Target className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm">
            {breakevenSuperprice ? (
              <>
                <p className="font-medium text-amber-800 dark:text-amber-300">
                  Точка безубыточности: {formatAmount(breakevenSuperprice)} ₽
                </p>
                <p className="text-amber-700 dark:text-amber-400">
                  При суперпризе выше этой суммы EV становится положительным
                </p>
              </>
            ) : (
              <p className="text-amber-700 dark:text-amber-400">
                При текущей таблице выигрышей безубыточность недостижима
              </p>
            )}
          </div>
        </div>

        {/* Simple visual chart */}
        <div className="mb-4">
          <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            {/* Zero line */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-gray-400 dark:border-gray-500"
              style={{
                top: `${((maxEV - 0) / evRange) * 100}%`,
              }}
            />

            {/* Chart bars */}
            <div className="flex h-full items-end justify-between gap-0.5 px-1">
              {chartPoints.map((point, index) => {
                const isAboveZero = point.ev >= 0;
                const height = Math.abs(point.ev) / evRange;
                const isCurrent =
                  Math.abs(point.superprice - currentSuperprice) < 15_000_000;

                return (
                  <div
                    key={index}
                    className="relative flex-1"
                    title={`${(point.superprice / 1_000_000).toFixed(0)} млн: ${point.ev.toFixed(2)} ₽`}
                  >
                    {isAboveZero ? (
                      <div
                        className={`absolute bottom-1/2 w-full rounded-t ${
                          isCurrent
                            ? 'bg-amber-500'
                            : 'bg-green-400 dark:bg-green-500'
                        }`}
                        style={{ height: `${height * 50}%` }}
                      />
                    ) : (
                      <div
                        className={`absolute top-1/2 w-full rounded-b ${
                          isCurrent
                            ? 'bg-amber-500'
                            : 'bg-red-400 dark:bg-red-500'
                        }`}
                        style={{ height: `${height * 50}%` }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis labels - show actual range */}
          <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{formatAmount(chartPoints[0]?.superprice || 0)}</span>
            <span>{formatAmount(chartPoints[Math.floor(chartPoints.length / 2)]?.superprice || 0)}</span>
            <span>{formatAmount(chartPoints[chartPoints.length - 1]?.superprice || 0)}</span>
          </div>
        </div>

        {/* Current position */}
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Текущий суперприз
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatAmount(currentSuperprice)} ₽
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Текущий EV
              </p>
              <p
                className={`text-lg font-semibold ${
                  currentEV.isProfitable
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {currentEV.expectedValue >= 0 ? '+' : ''}
                {currentEV.expectedValue.toFixed(2)} ₽
              </p>
            </div>
          </div>

          {breakevenSuperprice && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                До безубыточности
              </p>
              <p
                className={`font-medium ${
                  currentSuperprice >= breakevenSuperprice
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {currentSuperprice >= breakevenSuperprice
                  ? `✓ Суперприз выше на ${formatAmount(currentSuperprice - breakevenSuperprice)}`
                  : `↑ Нужно еще ${formatAmount(breakevenSuperprice - currentSuperprice)}`}
              </p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
