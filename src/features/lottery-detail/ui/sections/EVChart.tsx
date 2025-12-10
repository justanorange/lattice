/**
 * EV Chart Section
 * Visual chart showing EV vs Superprice relationship
 */

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
 * Generate chart data points
 */
function generateChartPoints(
  lottery: Lottery,
  prizeTable: PrizeTable,
  ticketCost: number,
  _currentSuperprice: number
): { superprice: number; ev: number }[] {
  const points: { superprice: number; ev: number }[] = [];
  
  // Generate points from 10M to 500M
  const min = 10_000_000;
  const max = 500_000_000;
  const step = 10_000_000;

  for (let sp = min; sp <= max; sp += step) {
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
  const breakevenSuperprice = findBreakevenSuperprice(
    lottery,
    prizeTable,
    ticketCost
  );

  const currentEV = calculateEV(lottery, currentSuperprice, prizeTable, ticketCost);
  const chartPoints = generateChartPoints(lottery, prizeTable, ticketCost, currentSuperprice);

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
                  Точка безубыточности: {(breakevenSuperprice / 1_000_000).toFixed(0)} млн ₽
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

          {/* X-axis labels */}
          <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>10 млн</span>
            <span>250 млн</span>
            <span>500 млн</span>
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
                {(currentSuperprice / 1_000_000).toFixed(0)} млн ₽
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
                  ? `✓ Суперприз выше на ${((currentSuperprice - breakevenSuperprice) / 1_000_000).toFixed(0)} млн`
                  : `↑ Нужно еще ${((breakevenSuperprice - currentSuperprice) / 1_000_000).toFixed(0)} млн`}
              </p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
