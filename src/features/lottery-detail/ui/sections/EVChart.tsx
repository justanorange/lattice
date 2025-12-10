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
 * Returns: number (breakeven point), 0 (already profitable at 0), or null (never profitable)
 */
function findBreakevenSuperprice(
  lottery: Lottery,
  prizeTable: PrizeTable,
  ticketCost: number
): number | null {
  // First check if already profitable at superprice = 0
  const evAtZero = calculateEV(lottery, 0, prizeTable, ticketCost);
  if (evAtZero.expectedValue >= 0) {
    return 0; // Already profitable without superprice
  }

  // Binary search for EV = 0 point
  let low = 0;
  let high = 500_000_000;
  const tolerance = Math.max(0.1, ticketCost * 0.001); // 0.1% of ticket cost or 0.1₽

  // Check if profitable at high bound
  let evAtHigh = calculateEV(lottery, high, prizeTable, ticketCost);
  
  // If still not profitable at 500M, expand range
  while (evAtHigh.expectedValue < 0 && high < 10_000_000_000) {
    high *= 2;
    evAtHigh = calculateEV(lottery, high, prizeTable, ticketCost);
  }
  
  if (evAtHigh.expectedValue < 0) {
    return null; // Never profitable
  }

  // Binary search with more iterations for precision
  for (let i = 0; i < 100; i++) {
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
    
    // Extra precision check
    if (high - low < 1000) {
      return Math.round((low + high) / 2);
    }
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
 * Generate chart data points - show range around current superprice
 * If breakeven is within 5x of current, include it. Otherwise focus on current.
 */
function generateChartPoints(
  lottery: Lottery,
  prizeTable: PrizeTable,
  ticketCost: number,
  currentSuperprice: number,
  breakevenSuperprice: number | null
): { superprice: number; ev: number }[] {
  const points: { superprice: number; ev: number }[] = [];
  
  // Base range on current superprice
  const current = Math.max(currentSuperprice, 1_000_000); // At least 1M for reasonable scale
  
  // Include breakeven only if it's within reasonable range (5x of current)
  let maxSp = current * 3; // Default: show up to 3x current
  if (breakevenSuperprice && breakevenSuperprice > 0 && breakevenSuperprice <= current * 5) {
    maxSp = Math.max(maxSp, breakevenSuperprice * 1.5);
  }
  
  const minSp = Math.max(0, Math.floor(current * 0.1));
  maxSp = Math.min(1_000_000_000, Math.ceil(maxSp));
  
  // Calculate step to get ~20-25 points
  const range = maxSp - minSp;
  const step = Math.max(100_000, Math.ceil(range / 25 / 100_000) * 100_000);

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
    generateChartPoints(lottery, prizeTable, ticketCost, currentSuperprice, breakevenSuperprice),
    [lottery, prizeTable, ticketCost, currentSuperprice, breakevenSuperprice]
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
        <div className={`mb-4 flex items-start gap-3 rounded-lg border p-3 ${
          breakevenSuperprice === 0
            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
            : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
        }`}>
          <Target className={`mt-0.5 size-5 shrink-0 ${
            breakevenSuperprice === 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-amber-600 dark:text-amber-400'
          }`} />
          <div className="text-sm">
            {breakevenSuperprice === 0 ? (
              <>
                <p className="font-medium text-green-800 dark:text-green-300">
                  ✓ Уже выгодно играть!
                </p>
                <p className="text-green-700 dark:text-green-400">
                  EV положительный даже без учёта суперприза
                </p>
              </>
            ) : breakevenSuperprice ? (
              <>
                <p className="font-medium text-amber-800 dark:text-amber-300">
                  Точка безубыточности: {formatAmount(breakevenSuperprice)}
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
          <div className="relative h-40 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            {/* Y-axis label */}
            <div className="absolute left-1 top-1 text-xs text-gray-500 dark:text-gray-400">
              EV
            </div>
            
            {/* Zero line with label */}
            {minEV < 0 && maxEV > 0 && (
              <>
                <div
                  className="absolute left-0 right-0 z-10 border-t-2 border-gray-500 dark:border-gray-400"
                  style={{
                    top: `${(maxEV / evRange) * 100}%`,
                  }}
                />
                <span 
                  className="absolute left-1 z-10 -translate-y-1/2 rounded bg-gray-500 px-1 text-xs text-white"
                  style={{ top: `${(maxEV / evRange) * 100}%` }}
                >
                  0
                </span>
              </>
            )}

            {/* Breakeven marker */}
            {breakevenSuperprice && chartPoints.length > 0 && (
              (() => {
                const minSp = chartPoints[0].superprice;
                const maxSp = chartPoints[chartPoints.length - 1].superprice;
                if (breakevenSuperprice >= minSp && breakevenSuperprice <= maxSp) {
                  const position = ((breakevenSuperprice - minSp) / (maxSp - minSp)) * 100;
                  return (
                    <div
                      className="absolute top-0 bottom-0 z-20 w-0.5 bg-amber-500"
                      style={{ left: `${position}%` }}
                    >
                      <div className="absolute top-0 left-1 whitespace-nowrap rounded bg-amber-500 px-1 text-xs text-white">
                        BE
                      </div>
                    </div>
                  );
                }
                return null;
              })()
            )}

            {/* Chart bars */}
            <div className="flex h-full items-end px-1 pt-4">
              {chartPoints.map((point, index) => {
                const isAboveZero = point.ev >= 0;
                // Calculate height relative to max absolute value
                const maxAbsEV = Math.max(Math.abs(maxEV), Math.abs(minEV));
                const normalizedHeight = Math.abs(point.ev) / maxAbsEV;
                const heightPercent = normalizedHeight * 45; // 45% max height each direction
                
                const isCurrent =
                  Math.abs(point.superprice - currentSuperprice) < 
                  (chartPoints[1]?.superprice - chartPoints[0]?.superprice || 10_000_000) / 2;

                // Zero position in the chart (where negative bars start from)
                const zeroPosition = maxEV >= 0 && minEV < 0 
                  ? (maxEV / evRange) * 100 
                  : (maxEV >= 0 ? 100 : 0);

                return (
                  <div
                    key={index}
                    className="group relative flex-1 mx-px cursor-pointer"
                    style={{ height: '100%' }}
                    title={`${formatAmount(point.superprice)}: ${point.ev >= 0 ? '+' : ''}${point.ev.toFixed(2)} ₽`}
                  >
                    {isAboveZero ? (
                      <div
                        className={`absolute w-full transition-all ${
                          isCurrent
                            ? 'bg-amber-500 ring-2 ring-amber-300'
                            : 'bg-green-400 hover:bg-green-500 dark:bg-green-500 dark:hover:bg-green-400'
                        }`}
                        style={{ 
                          bottom: `${100 - zeroPosition}%`,
                          height: `${heightPercent}%`,
                          minHeight: '2px'
                        }}
                      />
                    ) : (
                      <div
                        className={`absolute w-full transition-all ${
                          isCurrent
                            ? 'bg-amber-500 ring-2 ring-amber-300'
                            : 'bg-red-400 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400'
                        }`}
                        style={{ 
                          top: `${zeroPosition}%`,
                          height: `${heightPercent}%`,
                          minHeight: '2px'
                        }}
                      />
                    )}
                    
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block dark:bg-gray-700">
                      {formatAmount(point.superprice)}: {point.ev >= 0 ? '+' : ''}{point.ev.toFixed(2)}
                    </div>
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
